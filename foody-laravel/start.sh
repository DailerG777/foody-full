#!/bin/bash
cd /var/www/html
php artisan migrate --force
php artisan db:seed --force 2>/dev/null || true
php artisan restaurantes:fix-images
php -r "require'vendor/autoload.php'; \$app=require_once'bootstrap/app.php'; \$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); \App\Models\User::whereNull('email_verified_at')->update(['email_verified_at'=>now()]); echo 'Usuarios verificados\n';"
apache2-foreground
