<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

$disk = Illuminate\Support\Facades\Storage::disk('public');
App\Models\Restaurante::query()->update(['rating' => 0, 'total_resenas' => 0]);
echo "Todos los ratings y total_resenas se han puesto a 0.\n";

$rs = App\Models\Restaurante::orderBy('id')->get(['id','slug','rating','total_resenas']);
foreach ($rs as $r) {
    echo $r->slug . ' | rating=' . $r->rating . ' | resenas=' . $r->total_resenas . "\n";
}
