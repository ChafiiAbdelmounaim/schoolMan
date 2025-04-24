<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'email',
        'password',
        'dateNaissance',
        'dateEmbauche',
        'grade',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'dateNaissance' => 'date',
        'dateEmbauche' => 'date',
        'grade' => 'string',
    ];

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'subject_teacher', 'teacher_id', 'subject_id')
            ->withTimestamps();
    }
}
