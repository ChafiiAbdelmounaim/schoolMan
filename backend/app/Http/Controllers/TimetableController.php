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

    public function index()
    {
        $timetables = Timetable::with(['course', 'teacher', 'classroom', 'semester.year.filier'])->get();

        return response()->json($timetables);
    }

    public function generateS1Timetables(Request $request)
    {
        Log::info('Starting timetable generation for S1 semesters');

        try {
            // Fetch S1 semesters with relationships
            $s1Semesters = Semester::where('semName', 'S1')
                ->with(['year', 'year.filier', 'subjects.teachers', 'subjects'])
                ->get();

            if ($s1Semesters->isEmpty()) {
                $message = 'No S1 semesters found in database';
                Log::error($message);
                return response()->json(['error' => $message], 404);
            }

            // School schedule configuration
            $daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            $timeSlots = [
                ['start' => '09:00:00', 'end' => '12:00:00'], // Morning
                ['start' => '14:00:00', 'end' => '17:00:00']  // Evening
            ];

            $generatedCount = 0;
            $warnings = [];

            foreach ($s1Semesters as $semester) {
                Log::info("Processing semester ID: {$semester->id}");

                $subjects = $semester->subjects;
                $classrooms = Classroom::all();

                if ($classrooms->isEmpty()) {
                    $message = "No classrooms available for semester {$semester->id}";
                    Log::warning($message);
                    $warnings[] = $message;
                    continue;
                }

                foreach ($subjects as $subject) {
                    Log::debug("Scheduling subject: {$subject->name}");

                    $teachers = $subject->teachers;

                    if ($teachers->isEmpty()) {
                        $message = "No teachers available for subject {$subject->name} in semester {$semester->id}";
                        Log::warning($message);
                        $warnings[] = $message;
                        continue;
                    }

                    $teacher = $teachers->first();
                    $scheduled = false;

                    foreach ($daysOfWeek as $day) {
                        foreach ($timeSlots as $timeSlot) {
                            // Check semester availability
                            $semesterConflict = Timetable::where('semester_id', $semester->id)
                                ->where('day', $day)
                                ->where(function($query) use ($timeSlot) {
                                    $query->whereBetween('start_time', [$timeSlot['start'], $timeSlot['end']])
                                        ->orWhereBetween('end_time', [$timeSlot['start'], $timeSlot['end']]);
                                })
                                ->exists();

                            if ($semesterConflict) {
                                Log::debug("Timeslot conflict for semester {$semester->id} on {$day} {$timeSlot['start']}-{$timeSlot['end']}");
                                continue;
                            }

                            // Find available classroom
                            foreach ($classrooms as $classroom) {
                                $classroomBusy = Timetable::where('classroom_id', $classroom->id)
                                    ->where('day', $day)
                                    ->where(function($query) use ($timeSlot) {
                                        $query->whereBetween('start_time', [$timeSlot['start'], $timeSlot['end']])
                                            ->orWhereBetween('end_time', [$timeSlot['start'], $timeSlot['end']]);
                                    })
                                    ->exists();

                                if (!$classroomBusy) {
                                    // Create timetable entry
                                    Timetable::create([
                                        'course_id' => $subject->id,
                                        'teacher_id' => $teacher->id,
                                        'classroom_id' => $classroom->id,
                                        'semester_id' => $semester->id,
                                        'day' => $day,
                                        'start_time' => $timeSlot['start'],
                                        'end_time' => $timeSlot['end']
                                    ]);

                                    $generatedCount++;
                                    $scheduled = true;
                                    Log::info("Scheduled {$subject->name} in {$classroom->name} on {$day} {$timeSlot['start']}-{$timeSlot['end']}");
                                    break 3; // Exit all nested loops
                                }
                            }
                        }
                    }

                    if (!$scheduled) {
                        $message = "Failed to schedule subject {$subject->name} for semester {$semester->id} - no available slots";
                        Log::warning($message);
                        $warnings[] = $message;
                    }
                }
            }

            $result = [
                'message' => 'Timetable generation completed',
                'generated_entries' => $generatedCount,
                'warnings' => $warnings,
                'success' => $generatedCount > 0
            ];

            Log::info('Timetable generation completed', $result);
            return response()->json($result);

        } catch (\Exception $e) {
            $errorMessage = "Timetable generation failed: " . $e->getMessage();
            Log::error($errorMessage);
            return response()->json(['error' => $errorMessage], 500);
        }
    }
}
