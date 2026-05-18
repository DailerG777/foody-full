#!/bin/bash
cd /var/www/html
php artisan migrate --force
php artisan db:seed --force 2>/dev/null || true
php artisan restaurantes:fix-images
apache2-foreground
