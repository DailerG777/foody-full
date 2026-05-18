<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Restaurante;

$updates = [
    'la-mansion'=>'restaurantes/la-mansion.jpeg','la-provincia'=>'restaurantes/la-provincia.jpeg',
    'amaretto'=>'restaurantes/amaretto.jpeg','tributo'=>'restaurantes/tributo.jpeg',
    'monos-fusion'=>'restaurantes/monos-fusion.jpeg','areperia-ocanerita'=>'restaurantes/areperia-ocanerita.jpeg',
    'restaurante-boyaca'=>'restaurantes/restaurante-boyaca.jpeg','restaurante-leo'=>'restaurantes/restaurante-leo.jpeg',
    'nigiri-sushi'=>'restaurantes/nigiri-sushi.jpeg','la-convencion-1828'=>'restaurantes/la-convencion-1828.jpeg',
    'cuestarica'=>'restaurantes/cuestarica.jpeg','el-burro-burger'=>'restaurantes/el-burro-burger.jpeg',
    'the-social'=>'restaurantes/the-social.jpeg','wicho-wings'=>'restaurantes/wicho-wings.jpeg',
    'vacanos'=>'restaurantes/vacanos.jpeg','pascual-food'=>'restaurantes/pascual-food.jpeg',
    'casona-don-alfredo'=>'restaurantes/casona-don-alfredo.jpeg','el-dicho-broaster'=>'restaurantes/el-dicho-broaster.jpeg',
    'pizzeria-sapienza'=>'restaurantes/pizzeria-sapienza.jpeg','mattia'=>'restaurantes/mattia.jpeg',
    'haoma-cafe'=>'restaurantes/haoma-cafe.jpeg','el-tinto-terraza'=>'restaurantes/el-tinto-terraza.jpeg',
    'the-beer-house'=>'restaurantes/the-beer-house.jpeg','el-carajo'=>'restaurantes/el-carajo.jpeg',
    'calabongas'=>'restaurantes/calabongas.jpeg','don-juan'=>'restaurantes/don-juan.jpeg',
];

$count = 0;
foreach ($updates as $slug => $path) {
    $r = Restaurante::where('slug', $slug)->first();
    if ($r) {
        $r->update(['foto_portada' => $path, 'logo' => $path]);
        echo "OK: {$r->nombre}\n";
        $count++;
    } else {
        echo "NOT FOUND: {$slug}\n";
    }
}
echo "\nTotal: {$count}\n";
