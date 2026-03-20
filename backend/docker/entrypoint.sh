#!/bin/sh
set -e

cd /var/www/app

# Generate APP_KEY first — must happen before any artisan command that boots the app
if [ -z "$APP_KEY" ]; then
  unset APP_KEY
  php artisan key:generate
fi

php artisan config:clear
php artisan route:clear

php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache

exec php-fpm
