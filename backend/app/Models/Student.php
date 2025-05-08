<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Student extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'full_name',
        'email',
        'password',
        'dateNaisance',
        'apogee',
        'year_id',
        'filier_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'dateNaisance' => 'date',
        'email_verified_at' => 'datetime',
    ];

    // Relationship with Year
    public function year()
    {
        return $this->belongsTo(Year::class);
    }

    // Relationship with Filier
    public function filier()
    {
        return $this->belongsTo(Filier::class);
    }

}
