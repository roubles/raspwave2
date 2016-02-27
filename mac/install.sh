#!/usr/bin/env bash

cd ../open-zwave
make

cd ../mac

# Clean any old installations
mkdir -p "/usr/local/bin"
mkdir -p "/etc/raspwave"
mkdir -p "/etc/raspwave/db"
mkdir -p "/etc/raspwave/openzwave"
mkdir -p "/etc/raspwave/openzwave/config"
mkdir -p "/usr/local/lib/raspwave"
mkdir -p "/var/log/raspwave"

cp -aR ../conf /etc/raspwave
cp -aR ../cronbots /etc/raspwave
cp -aR ../db /etc/raspwave
cp -aR ../robots /etc/raspwave
cp -aR ../scripts /etc/raspwave
cp -aR ../www /etc/raspwave
cp -aR ../pylib /etc/raspwave

cp -a ../sh/raspwave /usr/local/bin
cp -a ../sh/raspscpt /usr/local/bin

cp -a ../open-zwave/.lib/MinOZW /usr/local/bin
cp -a ../open-zwave/libopenzwave.* /usr/local/lib/raspwave

cp -aR ../open-zwave/config /etc/raspwave/openzwave/config
