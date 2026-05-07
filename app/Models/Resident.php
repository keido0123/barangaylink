<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    protected $fillable = [
        'user_id','full_name','birthdate','gender','address',
        'purok','phone','civil_status','income_class','is_voter','occupation'
    ];

    protected $casts = [
        'birthdate' => 'date',
        'is_voter' => 'boolean',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
