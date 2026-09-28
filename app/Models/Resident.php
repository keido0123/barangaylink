<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    protected $fillable = [
        'user_id',
        'full_name',
        'birthdate',
        'age',
        'gender',
        'address',
        'purok',
        'phone',
        'civil_status',
        'mother_name',
        'father_name',
        'occupation',
        'income_class',
        'is_voter',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'age' => 'integer',
        'is_voter' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}