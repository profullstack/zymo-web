#!/bin/bash

cd "$(dirname "$0")/.."
. $HOME/.bashrc
. .env
. .env.local

host=$HOST_DOMAIN
name=$HOST_PATH
project=$HOST_PROJECT
crawler=$1

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
		npm i -g pnpm
    #pnpm cache clean --force
    #pnpm cache verify
    pnpm i
		# curl --proto '=https' --tlsv1.2 -sSf https://install.surrealdb.com | sh -s -- --nightl
    # sudo systemctl stop ${META_SERVICE}
    # sudo systemctl stop surrealdb
    # surreal upgrade --nightly
    # surreal upgrade
    pnpm run build
    sudo /etc/init.d/nginx reload
    sudo systemctl daemon-reload
    sudo systemctl start ${META_SERVICE}

    if [ -n "$crawler" ] && [ "$migrate" == "crawlers" ]; then
      # The variable is defined and its value is 'migrate'
      echo "Restarting crawler..."
      sudo systemctl restart ${META_CRAWLER_SERVICE}
    else
        echo "Crawler not required or variable not set to 'crawler'."
    fi

    # sudo systemctl start surrealdb

    # run migrations
    chmod 755 ./migrations/*.sh;
    for f in ./migrations/*.sh; do ./$f; done;
  else
    echo "One or both directories do not exist"
fi


