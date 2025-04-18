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
        'salary',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'dateNaissance' => 'date',
        'dateEmbauche' => 'date',
        'salary' => 'decimal:2',
    ];

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'subject_teacher', 'teacher_id', 'subject_id');
    }
}
