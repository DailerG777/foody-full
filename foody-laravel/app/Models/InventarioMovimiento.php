<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventarioMovimiento extends Model {
    use HasFactory;
    protected $table='inventario_movimientos';
    protected $fillable=['inventario_id','user_id','tipo','cantidad','motivo'];
    protected $casts=['cantidad'=>'float'];

    public function inventario() { return $this->belongsTo(Inventario::class); }
    public function user()       { return $this->belongsTo(User::class); }
}
