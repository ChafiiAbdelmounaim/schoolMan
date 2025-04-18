<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
    use HasFactory;

    protected $fillable = ['semName', 'year_id'];

    public function year()
    {
        return $this->belongsTo(Year::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class, 'semester_id');
    }

}
