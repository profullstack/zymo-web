#!/usr/bin/env bash

#cd "$(dirname "$0")/.."
. $HOME/.bashrc
. "$NVM_DIR/nvm.sh" && nvm use v20
. .env
. .env.local


npm run db:start &
sleep 10
PORT=$PORT NODE_ENV=$NODE_ENV npm start

