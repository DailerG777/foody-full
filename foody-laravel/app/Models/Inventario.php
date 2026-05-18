<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventario extends Model {
    use HasFactory;
    protected $table='inventario';
    protected $fillable=['restaurante_id','nombre','categoria','unidad','stock','stock_minimo','costo_unitario'];
    protected $casts=['stock'=>'float','stock_minimo'=>'float','costo_unitario'=>'float'];

    public function restaurante()      { return $this->belongsTo(Restaurante::class); }
    public function movimientos()      { return $this->hasMany(InventarioMovimiento::class); }
    public function stockBajo(): bool  { return $this->stock <= $this->stock_minimo; }
}
