#!/bin/sh

docker build -t daviestobialex/shovel:whatsapp-server .
docker tag daviestobialex/shovel:whatsapp-server daviestobialex/shovel:whatsapp-server
docker push daviestobialex/shovel:whatsapp-server
