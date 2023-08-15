#!/usr/bin/env bash

#cd "$(dirname "$0")/.."
. $HOME/.bashrc
. "$NVM_DIR/nvm.sh" && nvm use v18
. .env
. .env.local


npm run db:start &
PORT=${PORT} NODE_ENV=${NODE_ENV} npm start
