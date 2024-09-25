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
TARGET_PATH="~/www/$DOMAIN_NAME/$PROJECT_NAME"
NGINX_CONF="$TARGET_PATH/etc/$DOMAIN_NAME.conf"
SYSTEMD_SERVICE="$TARGET_PATH/etc/$PROJECT_NAME.service"
NGINX_SYMLINK="/etc/nginx/sites-available/$DOMAIN_NAME.conf"
SYSTEMD_SYMLINK="/etc/systemd/system/$PROJECT_NAME.service"
user=$HOST_USER


# Copy the files first
cp ./etc/hynt.us.conf ./etc/${DOMAIN_NAME}.conf
cp ./etc/hynt-web.service ./etc/${PROJECT_NAME}.service
cp ./.env.local.sample ./.env.dev
sed -i '/# windows (copy to .env.local.bat)/q' .env.dev


# Replace occurrences of hynt-web and hynt.us in the new files
sed -i "s/hynt-web/${PROJECT_NAME}/g" ./etc/${PROJECT_NAME}.service
sed -i "s/hynt.us/${DOMAIN_NAME}/g" ./etc/${DOMAIN_NAME}.conf

# Additionally, you might want to replace in the conf file as well, if needed
sed -i "s/hynt-web/${PROJECT_NAME}/g" ./etc/${DOMAIN_NAME}.conf
sed -i "s/hynt.us/${DOMAIN_NAME}/g" ./etc/${PROJECT_NAME}.service

# Additionally, you might want to replace in the env file as well, if needed
sed -i "s/hynt-web/${PROJECT_NAME}/g" ./.env.dev
sed -i "s/hynt.us/${DOMAIN_NAME}/g" ./.env.dev
sed -i "s/hynt/${PROJECT_NAME%-web}/g" ./.env.dev

cp ./.env.dev ./.env.prod
pnpm i
pnpm run env:dev
. .env.local


# Create the directory if it does not exist
ssh $user@$HOST_DOMAIN "mkdir -p $TARGET_PATH/static/_posts"

# Deploy the code
rsync -azvP --delete --exclude=node_modules --exclude=.idea --exclude=data --exclude=static/_posts ./ ${user}@${HOST_DOMAIN}:${TARGET_PATH}

# Symlink the Nginx configuration
ssh $user@$HOST_DOMAIN "if [ -f $NGINX_CONF ]; then sudo ln -sf $NGINX_CONF $NGINX_SYMLINK && sudo ln -sf $NGINX_SYMLINK /etc/nginx/sites-enabled/; else echo 'Nginx configuration file not found at $NGINX_CONF'; exit 1; fi"

# Symlink the systemd service
ssh $user@$HOST_DOMAIN "if [ -f $SYSTEMD_SERVICE ]; then sudo ln -sf $SYSTEMD_SERVICE $SYSTEMD_SYMLINK; else echo 'Systemd service file not found at $SYSTEMD_SERVICE'; exit 1; fi"

# Generate Let's Encrypt certificates for the domain
ssh $user@$HOST_DOMAIN "sudo certbot certonly --nginx -d $DOMAIN_NAME"
ssh $user@$HOST_DOMAIN "sudo certbot certonly --nginx -d www.${DOMAIN_NAME}"

# Enable and start the systemd service
ssh $user@$HOST_DOMAIN "sudo systemctl enable $(basename $SYSTEMD_SERVICE) --now"

ssh -t ${user}@${HOST_DOMAIN} ${TARGET_PATH}/bin/post-deploy.sh

echo "Setup completed successfully!"

version=$(jq -r .version package.json)
say "$HOST_PROJECT is setup!"
exit
