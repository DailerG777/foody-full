<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CajaMovimiento extends Model {
    use HasFactory;
    protected $table='caja_movimientos';
    protected $fillable=['restaurante_id','user_id','tipo','categoria','concepto','monto','referencia','nota'];
    protected $casts=['monto'=>'float'];

    public function restaurante() { return $this->belongsTo(Restaurante::class); }
    public function user()        { return $this->belongsTo(User::class); }
}
