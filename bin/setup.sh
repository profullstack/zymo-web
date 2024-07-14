#!/bin/bash

. $HOME/.bashrc
. .env
. .env.local

# Check if the user provided the domain name and project name
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <domain_name> <project_name>"
  exit 1
fi

# Variables
DOMAIN_NAME="$1"
PROJECT_NAME="$2"
TARGET_PATH="$HOME/www/$DOMAIN_NAME/$PROJECT_NAME"
NGINX_CONF="$TARGET_PATH/etc/$DOMAIN_NAME.conf"
SYSTEMD_SERVICE="$TARGET_PATH/etc/$PROJECT_NAME.service"
NGINX_SYMLINK="/etc/nginx/sites-available/$DOMAIN_NAME.com.conf"
SYSTEMD_SYMLINK="/etc/systemd/system/$PROJECT_NAME.service"

# Create the directory if it does not exist
ssh ubuntu@profullstacknew "mkdir -p $TARGET_PATH"

# Symlink the Nginx configuration
ssh ubuntu@profullstacknew "if [ -f $NGINX_CONF ]; then sudo ln -sf $NGINX_CONF $NGINX_SYMLINK && sudo ln -sf $NGINX_SYMLINK /etc/nginx/sites-enabled/; else echo 'Nginx configuration file not found at $NGINX_CONF'; exit 1; fi"

# Symlink the systemd service
ssh ubuntu@profullstacknewE "if [ -f $SYSTEMD_SERVICE ]; then sudo ln -sf $SYSTEMD_SERVICE $SYSTEMD_SYMLINK; else echo 'Systemd service file not found at $SYSTEMD_SERVICE'; exit 1; fi"

# Enable and start the systemd service
ssh ubuntu@profullstacknew "sudo systemctl enable $(basename $SYSTEMD_SERVICE) --now"

echo "Setup completed successfully!"

version=$(jq -r .version package.json)
say "$HOST_PROJECT is setup!"
exit