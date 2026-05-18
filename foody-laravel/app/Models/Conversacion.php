<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversacion extends Model {
    use HasFactory;
    protected $table='conversaciones';
    protected $fillable=['tipo','participante_1_id','participante_2_id','pedido_id','archivada'];
    protected $casts=['archivada'=>'boolean'];
    public function participante1() { return $this->belongsTo(User::class,'participante_1_id'); }
    public function participante2() { return $this->belongsTo(User::class,'participante_2_id'); }
    public function pedido()        { return $this->belongsTo(Pedido::class); }
    public function mensajes()      { return $this->hasMany(Mensaje::class); }
    public function ultimoMensaje() { return $this->hasOne(Mensaje::class)->latestOfMany(); }
}
