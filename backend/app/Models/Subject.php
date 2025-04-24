<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Termwind\Actions\StyleToMethod;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'semester_id'];

    // Define relationship with Semester
    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'subject_teacher', 'subject_id', 'teacher_id')
            ->withTimestamps();
    }

}
