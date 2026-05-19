<?php
namespace App\Console\Commands;
use App\Models\{Inventario, Restaurante};
use Illuminate\Console\Command;

class SetupMansion extends Command {
    protected $signature = 'restaurantes:setup-mansion';
    protected $description = 'Set up La Mansión demo data (nequi, daviplata, inventario links)';

    public function handle() {
        $r = Restaurante::where('slug', 'la-mansion')->first();
        if (!$r) { $this->error('La Mansión no encontrado'); return; }

        $r->update(['nequi' => '3001234567', 'daviplata' => '3109876543']);

        $mapping = [
            'Lomo fino'       => 'Lomo al trapo',
            'Salmón fresco'   => 'Salmón glaseado',
            'Arroz'           => 'Risotto de hongos',
            'Crema de leche'  => 'Pasta Alfredo con pollo',
            'Limón'           => 'Limonada natural',
        ];

        $count = 0;
        foreach ($mapping as $invNombre => $prodNombre) {
            $inv = Inventario::where('restaurante_id', $r->id)->where('nombre', $invNombre)->first();
            $prod = $r->productos()->where('nombre', $prodNombre)->first();
            if ($inv && $prod) {
                $inv->update(['producto_id' => $prod->id]);
                $this->info("Link: {$invNombre} → {$prodNombre}");
                $count++;
            } else {
                $this->warn("Skip: {$invNombre} → {$prodNombre} (not found)");
            }
        }

        // Set costos on productos
        $costos = [
            'Ceviche de camarón'     => 12000,
            'Langostinos al ajillo'  => 15000,
            'Croquetas de jamón'     => 8000,
            'Lomo al trapo'          => 28000,
            'Salmón glaseado'        => 22000,
            'Risotto de hongos'      => 14000,
            'Pasta Alfredo con pollo'=> 12000,
            'Limonada natural'       => 1500,
            'Mojito clásico'         => 4000,
            'Vino tinto copa'        => 7000,
        ];
        foreach ($costos as $nombre => $costo) {
            $r->productos()->where('nombre', $nombre)->update(['costo' => $costo]);
        }
        $this->info("Costos actualizados para {$r->nombre}");
        $this->info("Setup completo: {$count} inventario items vinculados");
    }
}
