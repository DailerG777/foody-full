<?php
namespace App\Console\Commands;
use App\Models\Restaurante;
use Illuminate\Console\Command;

class FixRestauranteImages extends Command {
    protected $signature = 'restaurantes:fix-images';
    protected $description = 'Assign local images to restaurants that have UI Avatars';

    public function handle() {
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
            if ($r && str_starts_with($r->foto_portada, 'http')) {
                $r->update(['foto_portada' => $path, 'logo' => $path]);
                $this->info("OK: {$r->nombre}");
                $count++;
            }
        }
        $this->info("Fixed {$count} restaurants");
    }
}
