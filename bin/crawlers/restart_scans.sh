#!/bin/bash

cd "$(dirname "$0")/../.."

pwd

. $HOME/.bashrc
. .env
. .env.local

port=${CRAWLER_PORT:-3001}

curl -X POST "http://localhost:${port}/stop-all"
echo "Called http://localhost:${port}/stop-all"

curl -X POST "http://localhost:${port}/start-all"
echo "Called http://localhost:${port}/start-all"