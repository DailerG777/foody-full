<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Nomina extends Model {
    use HasFactory;
    protected $table='nominas';
    protected $fillable=['restaurante_id','sub_cuenta_id','empleado_nombre','empleado_cedula','cargo','tipo_contrato','salario_base','bonificaciones','deducciones','total','periodo','fecha_pago','pagado'];
    protected $casts=['salario_base'=>'float','bonificaciones'=>'float','deducciones'=>'float','total'=>'float','pagado'=>'boolean','fecha_pago'=>'date'];

    public function restaurante() { return $this->belongsTo(Restaurante::class); }
    public function subCuenta()   { return $this->belongsTo(SubCuenta::class); }

    public function calcularTotal(): float {
        $this->total = $this->salario_base + $this->bonificaciones - $this->deducciones;
        return $this->total;
    }
}
