#!/bin/bash

#cd "$(dirname "$0")/.."
. $HOME/.bashrc
. "$NVM_DIR/nvm.sh" && nvm use v20
. .env
. .env.local

pnpm run db:start

