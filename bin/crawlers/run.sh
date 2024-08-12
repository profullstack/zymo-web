#!/bin/bash

cd "$(dirname "$0")/../.."

pwd

. $HOME/.bashrc
. .env
. .env.local

port=${CRAWLER_PORT:-3001}

node ./bin/crawlers/server.js
