#!/bin/bash

cd "$(dirname "$0")/.."
. $HOME/.bashrc
. .env
. .env.local

host=$HOST_DOMAIN
name=$HOST_PATH
project=$HOST_PROJECT

echo "current name: $name"

if [ -d "$HOME/www/${name}/${project}" ]; then
    # If both directories exist, run your command here
    echo "Both directories exist"
    cd $HOME/www/${name}/${project}
    nvm install v20
    node -v
    pnpm -v
    rm -f package-lock.json
    rm -f pnpm-lock.yaml
    rm -rf ./node_modules
    pnpm cache clean --force
    pnpm cache verify
    pnpm i
		# curl --proto '=https' --tlsv1.2 -sSf https://install.surrealdb.com | sh -s -- --nightl
    sudo systemctl stop ${META_SERVICE}
    sudo systemctl stop surrealdb
    # surreal upgrade --nightly
    surreal upgrade
    sudo /etc/init.d/nginx reload
    sudo systemctl daemon-reload
    sudo systemctl start ${META_SERVICE}
    sudo systemctl start surrealdb
    # run migrations
    ./migrations/users.sh
    # ./migrations/comments.sh
    ./migrations/links.sh
    ./migrations/apikeys.sh
    ./migrations/products.sh
    ./migrations/send_email.sh
    ./migrations/nostrusers.sh

  else
    echo "One or both directories do not exist"
fi


