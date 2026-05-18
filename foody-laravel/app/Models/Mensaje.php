<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mensaje extends Model {
    use HasFactory;
    protected $table='mensajes';
    protected $fillable=['conversacion_id','sender_id','tipo','contenido','imagen_path','estado'];
    protected $casts=['leido_at'=>'datetime'];
    public function conversacion() { return $this->belongsTo(Conversacion::class); }
    public function sender()       { return $this->belongsTo(User::class,'sender_id'); }
}
