<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentRequest extends Model
{
    protected $fillable = [
        'user_id','document_type','purpose','status',
        'tracking_code','remarks','or_number','fee','released_at'
    ];

    protected $casts = ['released_at' => 'datetime'];

    public function user() {
        return $this->belongsTo(User::class);
    }
    //
}
