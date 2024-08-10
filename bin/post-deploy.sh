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
    pnpm i
    pnpm run build
    sudo /etc/init.d/nginx reload
    sudo systemctl daemon-reload
    sudo systemctl start ${META_SERVICE}

    if [ -n "$crawler" ] && [ "$crawler" == "crawler" ]; then
      # The variable is defined and its value is 'crawler'
      echo "Restarting crawler..."
      sudo systemctl restart ${META_CRAWLER_SERVICE}
      
      sleep 5;
      # Make the curl call to start all
      port=${CRAWLER_PORT:-3001}
      curl -X POST "http://localhost:${port}/start-all"
      echo "Called http://localhost:${port}/start-all"
    else
        echo "Crawler not required or variable not set to 'crawler'."
    fi

    # run migrations
    chmod 755 ./migrations/*.sh
    for f in ./migrations/*.sh; do ./$f; done
else
    echo "One or both directories do not exist"
fi
