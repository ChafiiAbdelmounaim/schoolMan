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
        // Step 1: Fetch all semesters that have 'S1' as semName
        $s1Semesters = Semester::where('semName', 'S1')
            ->with(['year', 'year.filier', 'subjects.teachers', 'subjects'])
            ->get();

        if ($s1Semesters->isEmpty()) {
            return response()->json(['message' => 'No S1 semesters found.'], 404);
        }

        // Define basic schedule constraints
        $daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $timeSlots = [
            ['start' => '09:00:00', 'end' => '12:00:00'], // Morning
            ['start' => '14:00:00', 'end' => '17:00:00']  // Evening
        ];

        $generatedCount = 0;

        // Process each semester
        foreach ($s1Semesters as $semester) {
            $subjects = $semester->subjects;
            $classrooms = Classroom::all();

            foreach ($subjects as $subject) {
                $teachers = $subject->teachers;

                if ($teachers->isEmpty() || $classrooms->isEmpty()) {
                    continue;
                }

                $teacher = $teachers->first();
                $timeSlot = $timeSlots[0]; // Always use first time slot

                // Try each day until we find an available classroom
                foreach ($daysOfWeek as $day) {
                    // Find first available classroom for this day
                    $availableClassroom = null;
                    foreach ($classrooms as $classroom) {
                        $isClassroomUsed = Timetable::where('classroom_id', $classroom->id)
                            ->where('day', $day)
                            ->exists();

                        if (!$isClassroomUsed) {
                            $availableClassroom = $classroom;
                            break;
                        }
                    }

                    if ($availableClassroom) {
                        // Create the timetable entry
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
                        break; // Move to next subject after scheduling
                    }
                }

                // If we couldn't schedule after trying all days, log it
                if (!$availableClassroom) {
                    Log::warning("Could not find available classroom for subject: {$subject->name}");
                }
            }
        }

        return response()->json([
            'message' => 'Timetable generation completed with classroom/day availability check',
            'generated_entries' => $generatedCount,
            'data' => $s1Semesters
        ]);
    }
}
