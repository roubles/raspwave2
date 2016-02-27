#!/usr/bin/env python
# @author rouble matta

import os
import sys
import signal
import datetime
import socket
import time
from time import sleep
import logging
import threading
import pickle
import subprocess
from LoggerUtils import setupNotificationHandlerLogger, getNotificationHandlerLogger
from Notification import Notification, ValueNotification, BatteryValueNotification, NodeEventNotification, ValueChangeNotification, WakeupNotification
from Utils import get_absolute_path
from EnvUtils import isTestEnvironment
from ConfUtils import getNodeName,isSiren,isMotion,isDoorWindow,getUserId,setLocalIp
from SensorUtils import getSensorState
from SirenUtils import getSirenState
from CacheUtils import CacheListener
import traceback
from pymongo import MongoClient
from Notification import fromDict

logger = setupNotificationHandlerLogger()

ListenerPort = 55555

userid = getUserId()
if userid == None:
    usrHomeFolder = get_absolute_path('~/.raspwave')
else:
    usrHomeFolder = os.path.join('/home', userid, '.raspwave')
usrHomeRobotsFolder = os.path.join(usrHomeFolder, 'robots')
usrHomeScriptsFolder = os.path.join(usrHomeFolder, 'scripts')

if isTestEnvironment():
    raspscptLocation = get_absolute_path('~/raspwave/sh/raspscpt')
    etcRobotsFolder = get_absolute_path('~/raspwave/robots')
else:
    raspscptLocation = '/usr/local/bin/raspscpt'
    etcRobotsFolder = '/etc/raspwave/robots'

class Node:
    def __init__(self, nodeId = None):
        self.nodeId = nodeId
        self.value = None
        self.state = None
        self.batteryValue = None
        self.lastWakeupTime = None
        self.wakeupInterval = None
    def setValue(self, value):
        self.value = value
        self.state = getNodeState(self.nodeId, self.value)

def getNodeState (nodeId, value):
    if isSiren(nodeId):
        return getSirenState(value)
    if isDoorWindow(nodeId):
        return getSensorState(value)
    if isMotion(nodeId):
        return "Unsupported motion sensor"
    return "Unsupported node type"

class RobotLauncher(threading.Thread):
    def __init__ (self, type, current, previous):
        super(RobotLauncher, self).__init__()
        self.type = type
        self.current = current
        self.previous = previous
    def launchRobots(self, folder, current, previous):
        logger.info("Launching all robots in folder: " + folder)
        folder = folder
        if os.path.isdir(folder):
            for filename in os.listdir(folder):
                if filename.endswith(".py"):
                    raspscpt = raspscptLocation
                    cmd = raspscpt + " " + folder + '/' + filename + " " + self.type + " "+ current.nodeId + " " + current.nid + " " + (previous.nid if previous else "")
                    logger.info(cmd)
                    subprocess.Popen(cmd, shell=True)
        else:
            logger.info("Folder does not exist: " + folder)
    def launchEtcRobots(self, current, previous):
        self.launchRobots(etcRobotsFolder, current, previous)
    def launchUsrHomeRobots(self, current, previous):
        self.launchRobots(usrHomeRobotsFolder, current, previous)
    def launchAllRobots(self, current, previous):
        self.launchEtcRobots(current, previous)
        self.launchUsrHomeRobots(current, previous)
    def run(self):
        logger.info("Starting robot launcher thread: " + self.name)
        self.launchAllRobots(self.current, self.previous)
        logger.info("Stopping robot launcher thread: " + self.name)

class ClientListener(threading.Thread):
    def __init__ (self, nh, nl, conn):
        super(ClientListener, self).__init__()
        self.nh = nh
        self.nl = nl
        self.conn = conn
    def run (self):
        try:
            logger.info ("Starting client thread: " + self.name)
            self.conn.settimeout(5.0)
            reply = 'OK'
            data = self.conn.recv(1024)
            if data:
                logger.info("Got data: " + str(data))
                dataList = data.split(",")
                if dataList[0] == "postValueNotification":
                    self.nh.postValueNotification(dataList[1], dataList[2], dataList[3], dataList[4])
                if dataList[0] == "postBatteryValueNotification":
                    self.nh.postBatteryValueNotification(dataList[1], dataList[2], dataList[3], dataList[4])
                if dataList[0] == "postWakeupNotification":
                    self.nh.postWakeupNotification(dataList[1], dataList[2], dataList[3], dataList[4])
                if dataList[0] == "postNodeEventNotification":
                    self.nh.postNodeEventNotification(dataList[1], dataList[2], dataList[3], dataList[4])
                if dataList[0] == "postValueChangeNotification":
                    self.nh.postValueChangeNotification(dataList[1], dataList[2], dataList[3], dataList[4], dataList[5])
                if dataList[0] == "getNotificationFromNodeByIndex":
                    n = self.nh.getNotificationFromNodeByIndex(dataList[1], dataList[2], dataList[3])
                    reply = pickle.dumps(n)
                if dataList[0] == "getEarliestNotificationOfCurrentState":
                    n = self.nh.getEarliestNotificationOfCurrentState(dataList[1], dataList[2])
                    reply = pickle.dumps(n)
                if dataList[0] == "getNotificationFromNodeById":
                    n = self.nh.getNotificationFromNodeById(dataList[1], dataList[2], dataList[3])
                    logger.info("Got notification by ID: " + str(n))
                    reply = pickle.dumps(n)
                if dataList[0] == "getNCB":
                    logger.info("Getting NCB: " + dataList[1])
                    ncb = self.nh.getNCB(dataList[1])
                    reply = pickle.dumps(ncb)
                if dataList[0] == "getNodeReport":
                    reply = self.nh.getNodeReport(dataList[1])
                    # This can get rather large.
                    logger.info("Got Node Report " + str(reply))
                if dataList[0] == "die":
                    self.nl.stop()
                if dataList[0] == "dump":
                    report = self.nh.dump()
                    # We do not send this back over tcp
                    logger.info(report)
            else:
                logger.info("Got no data")
        finally:
            self.conn.send(reply)
            self.conn.close()
            logger.info("Client Thread dying: " + self.name)
    def stop(self):
        self.conn.close()

class NotificationListener(threading.Thread):
    def __init__ (self, nh, port):
        super(NotificationListener, self).__init__()
        self.nh = nh
        self.PORT = port 
        self.s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.kill_received = False
        self.children = []

    def run(self):
        logger.info( "Starting listener thread: " + self.name)
        HOST = ''   # Symbolic name meaning all available interfaces
        #Bind socket to local host and port
        try:
            logger.info( "Binding on port: " + str(self.PORT))
            self.s.bind((HOST, self.PORT))
        except socket.error as msg:
            logger.info( 'Bind failed. Error Code : ' + str(msg[0]) + ' Message ' + msg[1])
            print( 'Bind failed. Error Code : ' + str(msg[0]) + ' Message ' + msg[1])
            return
        print( 'Socket bind for notification handler complete')
        logger.info( 'Socket bind for notification handler complete')

        #Start listening on socket
        self.s.listen(10)
        logger.info('Socket now listening')
        while not self.kill_received:
            try:
                #wait to accept a connection - blocking call
                conn, addr = self.s.accept()
                logger.info( 'Connected with ' + addr[0] + ':' + str(addr[1]))
                cl = ClientListener(self.nh, self, conn)
                cl.daemon = True
                cl.start()
                self.children.append(cl)
            except Exception as e:
                logger.info( 'Socket no longer listening: ' + str(e))
                break
        logger.info( "NotificationListener is dead: " + self.name)
    def stop(self):
        logger.info( "Closing NotificationListener")
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
    def waitForChildren(self):
        logger.info("Waiting on any children")
        [child.join() for child in self.children]
        logger.info("All children dead!")

class NotificationHandler:
    def __init__ (self):
        self.lock = threading.RLock() 
        self.PORT = ListenerPort
        self.ignoreSeconds = 5
        self.maxNotifcationsPerNode = 20
        self.mainNotificationListenerThread = None
        self.cacheListenerThread = None
        self.robotLaunchers = []
        self.client = MongoClient('mongodb://localhost:27017/')
        self.nodes = self.client.nodesdb.nodes
        self.notifications = self.client.notificationsdb.notifications
    def getNCB(self, nodeId):
        nodes = self.nodes.find({"nodeId": str(nodeId)})
        if nodes.count() > 0:
            ncbdict = nodes[0]
            ncb = Node()
            ncb.__dict__.update(ncbdict)
        else:
            ncb = Node(str(nodeId))
            self.nodes.insert_one(ncb.__dict__)
        return ncb
    def dump(self):
        report = ""
        report += "Notifications:\n"
        for notification in self.notifications.find():
            report += str(notification)
            report += "\n"
        report += "Nodes:\n"
        for node in self.nodes.find():
            report += str(node)
            report += "\n"
        return report
    def getNodeReport(self, nodeId):
        report = "EMPTY"
        return report 
    def postBatteryValueNotification (self, nodeId, commandClass, fullHex, value):
        with self.lock:
            nodeIdStr = str(nodeId)
            notification = BatteryValueNotification(nodeId, commandClass, fullHex, value)
            logger.info("Created " + str(notification))
            ncb = self.getNCB(nodeId)
            ncb.batteryValue = value
            self.nodes.replace_one({"_id": ncb._id}, ncb.__dict__)
        self.callRobots('battery', notification, None)
    def postWakeupNotification (self, nodeId, commandClass, fullHex, value):
        with self.lock:
            nodeIdStr = str(nodeId)
            notification = WakeupNotification(nodeId, commandClass, fullHex, value)
            logger.info("Created " + str(notification))
            ncb = self.getNCB(nodeId)
            ncb.lastWakeupTime = notification.time
            ncb.wakeupInterval = value
            self.nodes.replace_one({"_id": ncb._id}, ncb.__dict__)
        self.callRobots('wakeup', notification, None)
    def postValueNotification (self, nodeId, commandClass, fullHex, value):
        notification = ValueNotification(nodeId, commandClass, fullHex, value)
        logger.info("Created " + str(notification))
        self.postControlNotification(nodeId, notification)
    def postValueChangeNotification (self, nodeId, commandClass, fullHex, value, previousValue):
        notification = ValueChangeNotification(nodeId, commandClass, fullHex, value, previousValue)
        logger.info("Created " + str(notification))
        self.postControlNotification(nodeId, notification)
    def postNodeEventNotification (self, nodeId, commandClass, fullHex, event):
        notification = NodeEventNotification(nodeId, commandClass, fullHex, event)
        logger.info("Created " + str(notification))
        self.postControlNotification(nodeId, notification)
    def postControlNotification (self, nodeId, notification):
        with self.lock:
            nodeIdStr = str(nodeId)
            previous = self.getLatestNotificationFromNode (nodeIdStr)
            logger.info("Got latest notification to be: " + str(previous))

            if previous is not None:
                diff = notification.time - previous.time
                diffSeconds = diff.total_seconds()
                logger.info("Last notification arrived " + str(diffSeconds) + " seconds ago")

                if (diffSeconds <= self.ignoreSeconds):
                    if (notification.value == previous.value) :
                        logger.info("Ignoring notification: " + str(notification.nid) + " since previous notification with same value came " + str(diffSeconds) + " seconds ago.")
                        notification.ignore = True

                if notification.value == 'False':
                    if previous.value == 'False':
                        # If a sensor is closed, and it is still closed, we
                        # do not really care about it.
                        # However, if a sensor is open, we care about it no
                        # matter what the previous state was.
                        logger.info("Ignoring notification: " + str(notification.nid) + " since previous notification was false and current notification is false")
                        notification.ignore = True
            else:
                logger.info("Making a dummy previous")
                previous = ValueNotification(notification.nodeId, notification.commandClass, notification.fullHex, "False")
                previous.time = datetime.datetime(1970, 1, 1)
                #Insert dummy notification
                self.notifications.insert_one(previous.__dict__)
            print "inserting one: " + str(notification.__dict__)
            self.notifications.insert_one(notification.__dict__)
            ncb = self.getNCB(nodeId)
            ncb.setValue(notification.value)
            self.nodes.replace_one({"_id": ncb._id}, ncb.__dict__)
        #self.callRobots('control', notification, previous)
    def callRobots(self, type, notification, previous):
        # The following code cannot be in the critical section, because it
        # dump and getNodeReport (or any robot apis) can lock.
        if notification.ignore is False:
            r = RobotLauncher(type, notification, previous)
            r.daemon = True
            r.start()
            self.robotLaunchers.append(r)
    def getNotificationFromNodeByIndex (self, nodeId, index, queue = "control"):
        indexInt = int(index)
        nodeIdStr = str(nodeId)
        logger.info("From node(" + nodeIdStr + ") getting notification at index[" + str(index) + "]")
        notifications = self.notifications.find({"nodeId": str(nodeId), "queue": queue})
        notificationdict = notifications.get(indexInt)
        return fromDict(**notificationdict)
    def getNotificationFromNodeById (self, nodeId, notificationId, queue = "control"):
        nodeIdStr = str(nodeId)
        logger.info("From node(" + nodeIdStr + ") getting notification with nid[" + str(notificationId) + "]")
        notifications = self.notifications.find({"nodeId": str(nodeId), "queue": queue, "nid": notificationId})
        notificationdict = notifications.get(0) #There should be exactly one
        return fromDict(**notificationdict)
    def getEarliestNotificationOfCurrentState (self, nodeId, queue = "control"):
        nodeIdStr = str(nodeId)
        logger.info("From node(" + nodeIdStr + ") getting earliest notification of current state")
        topnotification = self.notifications.findOne({"nodeId": str(nodeId), "queue": queue}) # make sure this gets the first one.
        notifications = self.notifications.find({"nodeId": str(nodeId), "queue": queue})
        for n in notifications:
            if n.value == topnotification.value:
                topnotification = n
        return fromDict(**topnotification)
    def getLatestNotificationFromNode (self, nodeId, queue = "control"):
        # Need to reverse sort on time
        notifications = self.notifications.find({"nodeId": str(nodeId), "queue": queue})
        for notification in notifications:
            if (notification["ignore"] == False):
                print str(notification)
                return fromDict(**notification)
        return None
    def getAllNotificationsFromNode(self, nodeId, queue = "control"):
        return list(self.notifications.find({"nodeId": str(nodeId), "queue": queue}))
    def waitForRobotLaunchers (self):
        logger.info("Waiting on any robot launchers")
        [robotLauncher.join() for robotLauncher in self.robotLaunchers]
        logger.info("All robotLaunchers dead!")
    def start (self):
        self.mainNotificationListenerThread = NotificationListener(self, self.PORT)
        self.mainNotificationListenerThread.daemon = True
        self.mainNotificationListenerThread.start()

        self.cacheListenerThread = CacheListener()
        self.cacheListenerThread.daemon = True
        self.cacheListenerThread.start()

    def stop(self):
        logger.info("Stopping NotificationHandler")
        self.waitForRobotLaunchers()

        if self.mainNotificationListenerThread is not None:
            self.mainNotificationListenerThread.stop()
            self.mainNotificationListenerThread.waitForChildren()
            self.mainNotificationListenerThread.join()

        if self.cacheListenerThread is not None:
            self.cacheListenerThread.stop()
            self.cacheListenerThread.join()
        logger.info("NotificationHandler dead.")

def getNotificationFromNodeByIndex(nodeId, index, queue = 'control', logger=getNotificationHandlerLogger()):
    s = None
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('localhost', ListenerPort))
        msg = "getNotificationFromNodeByIndex," + str(nodeId) + "," + str(index) + "," + str(queue)
        logger.info("sending msg: " + msg)
        s.send(msg)
        n = s.recv(1024)
        return pickle.loads(n)
    finally:
        s.close()

def getNotificationFromNodeById(nodeId, id, queue = 'control', logger=getNotificationHandlerLogger()):
    s = None
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('localhost', ListenerPort))
        msg = "getNotificationFromNodeById," + str(nodeId) + "," + id + "," + queue
        logger.info("sending msg: " + msg)
        s.send(msg)
        n = s.recv(1024)
        return pickle.loads(n)
    finally:
        s.close()

def getLatestNotification(nodeId, queue = 'control', logger=getNotificationHandlerLogger()):
    s = None
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('localhost', ListenerPort))
        msg = "getNotificationFromNodeByIndex," + str(nodeId) + ",0," + queue
        logger.info("sending msg: " + msg)
        s.send(msg)
        n = s.recv(1024)
        return pickle.loads(n)
    finally:
        s.close()

def getEarliestNotificationOfCurrentState(nodeId, queue = 'control', logger=getNotificationHandlerLogger()):
    s = None
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('localhost', ListenerPort))
        msg = "getEarliestNotificationOfCurrentState," + str(nodeId) + "," + queue
        logger.info("sending msg: " + msg)
        s.send(msg)
        n = s.recv(1024)
        return pickle.loads(n)
    finally:
        s.close()

def getNodeReport(nodeId, logger=getNotificationHandlerLogger()):
    s = None
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('localhost', ListenerPort))
        msg = "getNodeReport," + str(nodeId)
        logger.info("sending msg: " + msg)
        s.send(msg)
        report = s.recv(10240)
        return report 
    finally:
        s.close()

def getNCB(nodeId, logger=getNotificationHandlerLogger()):
    s = None
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('localhost', ListenerPort))
        msg = "getNCB," + str(nodeId)
        logger.info("sending msg: " + msg)
        s.send(msg)
        ncb = s.recv(10240)
        return pickle.loads(ncb) 
    finally:
        s.close()

def sendMsg (*args):
    logger = setupNotificationHandlerLogger()
    s = None
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('localhost', ListenerPort))
        msg = ",".join(args)
        print "m=" + msg
        logger.info("Sending msg: " + msg)
        s.send(msg)
        reply = s.recv(1024)
        logger.info("Rxd reply: " + reply)
        print "r" + reply
    finally:
        s.close()

def quit_gracefully(signal, frame):
    print('Caught signal: ' + str(signal))
    logger.info('Caught signal: ' + str(signal))
    if nh:
        nh.stop()
    sys.exit(0)

nh = None
def main():
    global logger
    global nh

    signal.signal(signal.SIGINT, quit_gracefully)
    signal.signal(signal.SIGTERM, quit_gracefully)
    signal.signal(signal.SIGQUIT, quit_gracefully)

    try:
        print("Starting NotificationHandler on this beautiful day " + str(datetime.datetime.now()))
        logger.info("Starting NotificationHandler on this beautiful day " + str(datetime.datetime.now()))
        nh = NotificationHandler()
        nh.start()
        sleep(2)
        # Some init stuff
        setLocalIp()
        while True: 
            sleep(1)
    except KeyboardInterrupt as e:
        print("Keyboard interrupt:" + str(e))
        logger.info("Keyboard interrupt:" + str(e))
        if nh is not None:
            nh.stop()
    except Exception as e:
        traceback.print_exc()
        print str(e)
        print(sys.exc_info()[0])
        logger.info( "Unexpected error:" + str(e) )
        if nh is not None:
            nh.stop()

if __name__ == '__main__':
    main()
