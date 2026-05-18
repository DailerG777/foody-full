<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

$users = App\Models\User::get(['id','nombre','email','role','telefono']);
echo str_pad('ID',4).str_pad('Nombre',22).str_pad('Email',32).str_pad('Rol',14)."Tel\n";
echo str_repeat('-',80)."\n";
foreach ($users as $u) {
    echo str_pad($u->id,4).str_pad($u->nombre,22).str_pad($u->email,32).str_pad($u->role,14).$u->telefono."\n";
}
echo "\n--- Dueños de restaurantes (user_id -> restaurante) ---\n";
$rests = App\Models\Restaurante::with('user:id,nombre,email')->get(['id','slug','nombre','user_id']);
foreach ($rests as $r) {
    echo "ID:{$r->id} {$r->nombre} (slug:{$r->slug}) -> usuario: ".($r->user?$r->user->nombre.' <'.$r->user->email.'>':'SIN DUEÑO')."\n";
}
