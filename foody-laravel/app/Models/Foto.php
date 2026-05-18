<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Foto extends Model {
    use HasFactory;
    protected $table='fotos_restaurante';
    protected $fillable=['restaurante_id','path','descripcion','orden'];
    public function restaurante() { return $this->belongsTo(Restaurante::class); }
}
