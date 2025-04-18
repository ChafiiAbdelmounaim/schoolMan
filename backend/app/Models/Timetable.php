<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Timetable extends Model
{
    use HasFactory;

    // Define the table associated with the model (optional if follows Laravel's convention)
    protected $table = 'timetables';

    // Mass assignable attributes
    protected $fillable = [
        'course_id',
        'teacher_id',
        'classroom_id',
        'semester_id',
        'day',
        'start_time',
        'end_time',
    ];

    // Relationships

    /**
     * Get the course associated with the timetable.
     */
    public function course()
    {
        return $this->belongsTo(Subject::class, 'course_id');
    }

    /**
     * Get the teacher associated with the timetable.
     */
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    /**
     * Get the classroom associated with the timetable.
     */
    public function classroom()
    {
        return $this->belongsTo(Classroom::class, 'classroom_id');
    }

    /**
     * Get the semester associated with the timetable.
     */
    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id');
    }
}
