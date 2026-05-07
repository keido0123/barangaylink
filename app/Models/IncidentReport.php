<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IncidentReport extends Model
{
     protected $fillable = [
        'user_id','category','location','description',
        'photo','status','admin_response'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
    
}
