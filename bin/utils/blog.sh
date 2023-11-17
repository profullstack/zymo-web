#!/usr/bin/env bash

cd "$(dirname "$0")/../.."

. $HOME/.bashrc
. .env
. .env.local

node ./bin/utils/blog.js --total 10
sudo systemctl restart ${META_SERVICE}
