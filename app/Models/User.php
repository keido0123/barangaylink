<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name','email','password','phone','address','birthdate',
        'gender','purok','civil_status','income_class','is_voter',
        'is_verified','profile_photo'
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'is_voter' => 'boolean',
        'is_verified' => 'boolean',
        'birthdate' => 'date',
    ];

    public function documentRequests() {
        return $this->hasMany(DocumentRequest::class);
    }

    public function incidentReports() {
        return $this->hasMany(IncidentReport::class);
    }

    
    
}
