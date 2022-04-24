#!/bin/sh

set -e

npm install --production
npm run register-commands:production
npm run start:production
