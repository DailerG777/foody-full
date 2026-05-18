<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model {
    use HasFactory;
    protected $table='posts';
    protected $fillable=['restaurante_id','contenido','imagen','activo'];
    protected $casts=['activo'=>'boolean'];
    public function restaurante() { return $this->belongsTo(Restaurante::class); }
}
