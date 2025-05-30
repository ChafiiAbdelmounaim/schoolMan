<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Year extends Model
{
    use HasFactory;

    protected $fillable = ['year_number', 'filier_id'];

    public function filier()
    {
        return $this->belongsTo(Filier::class);
    }

    public function semesters()
    {
        return $this->hasMany(Semester::class);
    }
}
