<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

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
    ];

    protected $casts = [
        'dateNaisance' => 'date',
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
