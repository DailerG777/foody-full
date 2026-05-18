#!/bin/bash
cd /var/www/html
php artisan migrate --force
php artisan db:seed --force
apache2-foreground
