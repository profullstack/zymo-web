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
    sudo systemctl stop ${META_SERVICE}
    
    # Check if crawler is set to 'crawler'
    if [ "$crawler" == "crawler" ]; then
        # Determine the port to use, defaulting to 3001 if CRAWLER_PORT is not set
        port=${CRAWLER_PORT:-3001}
        
        # Make the curl call to stop all
        curl -X POST "http://localhost:${port}/stop-all"
        echo "Called http://localhost:${port}/stop-all"

        sleep 5;
        sudo systemctl stop ${META_CRAWLER_SERVICE}
    fi
else
    echo "One or both directories do not exist"
fi
