<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'birthdate',
        'gender',
        'purok',
        'civil_status',
        'income_class',
        'is_voter',
        'is_verified',
        'profile_photo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'birthdate'         => 'date',
        'is_voter'          => 'boolean',
        'is_verified'       => 'boolean',
        'password'          => 'hashed',
    ];

    public function documentRequests()
    {
        return $this->hasMany(DocumentRequest::class);
    }

    public function incidentReports()
    {
        return $this->hasMany(IncidentReport::class);
    }
}