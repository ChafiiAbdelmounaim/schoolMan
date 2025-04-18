<?php

namespace App\Http\Controllers;

use App\Models\Filier;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Classroom;
use App\Models\Semester;
use App\Models\Timetable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TimetableController extends Controller
{
    public function generateS1Timetables(Request $request)
    {
        // Fetch S1 semesters with relationships
        $s1Semesters = Semester::where('semName', 'S1')
            ->with(['year', 'year.filier', 'subjects.teachers', 'subjects'])
            ->get();

        if ($s1Semesters->isEmpty()) {
            return response()->json(['message' => 'No S1 semesters found.'], 404);
        }

        // School schedule configuration
        $daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $timeSlots = [
            ['start' => '09:00:00', 'end' => '12:00:00'], // Morning
            ['start' => '14:00:00', 'end' => '17:00:00']  // Evening
        ];

        $generatedCount = 0;

        foreach ($s1Semesters as $semester) {
            $subjects = $semester->subjects;
            $classrooms = Classroom::all();

            foreach ($subjects as $subject) {
                $teachers = $subject->teachers;

                if ($teachers->isEmpty() || $classrooms->isEmpty()) {
                    continue;
                }

                $teacher = $teachers->first();

                // Try each day and time slot combination
                foreach ($daysOfWeek as $day) {
                    foreach ($timeSlots as $timeSlot) {
                        // Check if semester already has a subject at this day/time
                        $semesterConflict = Timetable::where('semester_id', $semester->id)
                            ->where('day', $day)
                            ->where(function($query) use ($timeSlot) {
                                $query->whereBetween('start_time', [$timeSlot['start'], $timeSlot['end']])
                                    ->orWhereBetween('end_time', [$timeSlot['start'], $timeSlot['end']]);
                            })
                            ->exists();

                        if ($semesterConflict) {
                            continue; // Skip to next time slot
                        }

                        // Find available classroom for this day/time
                        $availableClassroom = null;
                        foreach ($classrooms as $classroom) {
                            $isClassroomBusy = Timetable::where('classroom_id', $classroom->id)
                                ->where('day', $day)
                                ->where(function($query) use ($timeSlot) {
                                    $query->whereBetween('start_time', [$timeSlot['start'], $timeSlot['end']])
                                        ->orWhereBetween('end_time', [$timeSlot['start'], $timeSlot['end']]);
                                })
                                ->exists();

                            if (!$isClassroomBusy) {
                                $availableClassroom = $classroom;
                                break;
                            }
                        }

                        if ($availableClassroom) {
                            // Create timetable entry
                            Timetable::create([
                                'course_id' => $subject->id,
                                'teacher_id' => $teacher->id,
                                'classroom_id' => $availableClassroom->id,
                                'semester_id' => $semester->id,
                                'day' => $day,
                                'start_time' => $timeSlot['start'],
                                'end_time' => $timeSlot['end']
                            ]);

                            $generatedCount++;
                            break 2; // Exit both day and time slot loops
                        }
                    }
                }

                if (!$availableClassroom) {
                    Log::warning("Could not schedule subject {$subject->name} for semester {$semester->id}");
                }
            }
        }

        return response()->json([
            'message' => 'Timetable generation completed with all constraints',
            'generated_entries' => $generatedCount,
            'data' => $s1Semesters
        ]);
    }
}
