#!/usr/bin/env python
# @author rouble matta

import anydbm
import shelve
import threading
import socket
import logging
from Utils import get_absolute_path
from EnvUtils import isTestEnvironment
from LoggerUtils import setupNotificationHandlerLogger

logger = setupNotificationHandlerLogger()

if isTestEnvironment():
    defaultCacheLocation = "~/raspwave/db/cache.shelf"
    stringsCacheFile = "~/raspwave/db/strings.cache.db"
else:
    defaultCacheLocation = "/etc/raspwave/db/cache.shelf"
    stringsCacheFile = "/etc/raspwave/db/strings.cache.db"

defaultCacheListenerPort = 55557

def readStringValue (key):
    return readCacheValue(key)
    #strings = anydbm.open(get_absolute_path(stringsCacheFile), 'c')
    #value = strings[key]
    #strings.close()
    #return value

def writeStringValue (key, value):
    return writeCacheValue(key, value)
    #strings = anydbm.open(get_absolute_path(stringsCacheFile), 'c')
    #strings[key] = value
    #strings.close()

def readCacheValue (key):
    s = None
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('localhost', defaultCacheListenerPort))
        msg = "read," + key 
        logger.info("sending msg: " + msg)
        s.send(msg)
        value = s.recv(1024)
        if value == "KeyError":
            raise KeyError("key " + key + " not found")
        logger.info("got response: " + value)
        return value
    finally:
        s.close()

def writeCacheValue (key, value):
    s = None
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('localhost', defaultCacheListenerPort))
        msg = "write," + key + "," + value
        logger.info("sending msg: " + msg)
        s.send(msg)
        value = s.recv(1024)
        logger.info("got response: " + value)
        return value
    finally:
        s.close()

class CacheClientListener(threading.Thread):
    def __init__ (self, conn, cache):
        super(CacheClientListener, self).__init__()
        self.conn = conn
        self.cache = cache
    def run (self):
        try:
            logger.info ("Starting cache client thread: " + self.name)
            self.conn.settimeout(5.0)
            reply = 'OK'
            data = self.conn.recv(1024)
            if data:
                logger.info("Got data: " + str(data))
                dataList = data.split(",")
                if dataList[0] == "read":
                    try:
                        reply = self.cache[dataList[1]]
                    except:
                        reply = "KeyError"
                if dataList[0] == "write":
                    self.cache[dataList[1]] = dataList[2]
                    reply = 'OK'
                if dataList[0] == "dump":
                    pass
            else:
                logger.info("Got no data")
        except Exception as e:
            logger.error(str(e))
        finally:
            self.conn.send(reply)
            self.conn.close()
            logger.info("Client Thread dying: " + self.name)
    def stop(self):
        self.conn.close()

class CacheListener(threading.Thread):
    def __init__ (self, port=defaultCacheListenerPort, cacheLocation=defaultCacheLocation):
        super(CacheListener, self).__init__()
        self.PORT = port 
        self.cacheLocation = cacheLocation
        self.s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.kill_received = False
        self.children = []
        self.cache = shelve.open(get_absolute_path(cacheLocation))
        logger.info("Cache at " + self.cacheLocation + ":" + str(self.PORT) + " opened.")

    def run(self):
        logger.info( "Starting cache listener thread: " + self.name)
        HOST = ''   # Symbolic name meaning all available interfaces
        #Bind socket to local host and port
        try:
            logger.info( "Binding on port: " + str(self.PORT))
            self.s.bind((HOST, self.PORT))
        except socket.error as msg:
            logger.info( 'Bind failed. Error Code : ' + str(msg[0]) + ' Message ' + msg[1])
            print( 'Bind failed. Error Code : ' + str(msg[0]) + ' Message ' + msg[1])
            return
        print( 'Socket bind for cache listener complete')
        logger.info( 'Socket bind for cache listener complete')

        #Start listening on socket
        self.s.listen(10)
        logger.info('Socket now listening')
        while not self.kill_received:
            try:
                #wait to accept a connection - blocking call
                conn, addr = self.s.accept()
                logger.info( 'Connected with Cache Client' + addr[0] + ':' + str(addr[1]))
                cl = CacheClientListener(conn, self.cache)
                cl.daemon = True
                cl.start()
                self.children.append(cl)
            except Exception as e:
                logger.info( 'Socket no longer listening: ' + str(e))
                break
        logger.info( "CacheListener is dead: " + self.name)
    def stop(self):
        logger.info( "Closing CacheListener")
        for child in self.children:
            child.stop()
        self.kill_received = True
        #Interrupt thread.
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.connect(('localhost', self.PORT))
            msg = "interrupt"
            s.send(msg)
            s.close()
        except:
            pass
        finally:
            logger.info("Closing main socket on port " + str(self.PORT))
            self.s.close()
        logger.info("Waiting on any children")
        [child.join() for child in self.children]
        logger.info("All children dead!")
        self.cache.close()
        logger.info("Cache at " + self.cacheLocation + ":" + str(self.PORT) + " closed.")
