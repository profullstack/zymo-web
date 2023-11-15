#!/usr/bin/env bash

. $HOME/.bashrc
. .env
. .env.local

node ./bin/utils/blog.js --total 10