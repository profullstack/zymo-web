#!/bin/bash

#cd "$(dirname "$0")/.."
. $HOME/.bashrc
. "$NVM_DIR/nvm.sh" && nvm use v22
. .env
. .env.local

PORT=$PORT NODE_ENV=$NODE_ENV pnpm start

