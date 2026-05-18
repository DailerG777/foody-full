<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Restaurante;

$menus = [
    'la-mansion'         => 'menus/la-mansion.pdf',
    'la-provincia'       => 'menus/la-provincia.pdf',
    'amaretto'           => 'menus/amaretto.pdf',
    'tributo'            => 'menus/tributo.pdf',
    'monos-fusion'       => 'menus/monos-fusion.jpeg',
    'areperia-ocanerita' => 'menus/areperia-ocanerita.pdf',
    'restaurante-boyaca' => 'menus/restaurante-boyaca.pdf',
    'nigiri-sushi'       => 'menus/nigiri-sushi.pdf',
    'la-convencion-1828' => 'menus/la-convencion-1828.pdf',
    'cuestarica'         => null,
    'el-burro-burger'    => null,
    'the-social'         => null,
    'wicho-wings'        => 'menus/wicho-wings.pdf',
    'vacanos'            => null,
    'pascual-food'       => null,
    'casona-don-alfredo' => null,
    'el-dicho-broaster'  => 'menus/el-dicho-broaster.jpeg',
    'pizzeria-sapienza'  => 'menus/pizzeria-sapienza.jpeg',
    'mattia'             => 'menus/mattia.pdf',
    'haoma-cafe'         => 'menus/haoma-cafe.pdf',
    'el-tinto-terraza'   => null,
    'the-beer-house'     => null,
    'el-carajo'          => null,
    'calabongas'         => null,
    'don-juan'           => null,
    'restaurante-leo'    => null,
    'bisonte'            => null,
    'el-futuro'          => null,
    'pizzeria-el-parque' => null,
    'empanadas-de-la-12' => null,
];

$count = 0;
foreach ($menus as $slug => $path) {
    $r = Restaurante::where('slug', $slug)->first();
    if ($r) {
        $r->update(['menu_pdf' => $path]);
        echo "OK: {$r->nombre} -> " . ($path ?? 'null') . "\n";
        $count++;
    } else {
        echo "NOT FOUND: {$slug}\n";
    }
}
echo "\nTotal: {$count}\n";
