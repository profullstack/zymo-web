#!/bin/bash

cd "$(dirname "$0")/../.."

pwd

. $HOME/.bashrc
. .env
. .env.local

node ./bin/crawlers/server.js
