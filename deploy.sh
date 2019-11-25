#!/bin/bash

set -e

argc=$#

if [ $argc -eq 0 ]; then
  user="$USER"
else
  user="$1"
fi


docker build -t refruity/ezbot:master .
docker push refruity/ezbot:master
ssh "$user"@89.178.174.96 "cd /srv/docker/ezbot && docker-compose pull && docker-compose up -d ezbot"