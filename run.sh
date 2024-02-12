#!/usr/bin/with-contenv bashio
set -e

ORVIBO_KEY=$(bashio::config 'orvibo_key')
ORVIBO_DEVICE_UID=$(bashio::config 'device_uid')
ORVIBO_DEVICE_NAME=$(bashio::config 'device_name')
PORT=3000

node -v
npm -v
npm install
ORVIBO_KEY=$ORVIBO_KEY ORVIBO_DEVICE_UID=$ORVIBO_DEVICE_UID ORVIBO_DEVICE_NAME=$ORVIBO_DEVICE_NAME PORT=$PORT node index.js