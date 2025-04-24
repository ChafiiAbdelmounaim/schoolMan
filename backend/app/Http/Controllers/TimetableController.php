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
        // 1. Get all S1 semesters grouped by filière
        $s1Semesters = Semester::where('semName', 'S1')
            ->with(['year.filier', 'subjects.teachers'])
            ->get()
            ->groupBy('year.filier.id');

        // 2. Get all classrooms
        $classrooms = Classroom::all();

        // 3. Generate ALL possible disponibilities once
        $allDisponibilities = $this->generateDisponibilities($classrooms);
        $usedDisponibilities = []; // Track ALL used disponibilities globally

        $allTimetables = [];
        $conflicts = [];

        foreach ($s1Semesters as $filierId => $semesters) {
            $usedProgramSlots = []; // Track used time slots per program

            foreach ($semesters as $semester) {
                foreach ($semester->subjects as $subject) {
                    if ($subject->teachers->isEmpty()) continue;

                    $assigned = false;
                    $attempts = 0;
                    $maxAttempts = count($allDisponibilities);

                    while (!$assigned && $attempts < $maxAttempts) {
                        $randomIndex = array_rand($allDisponibilities);
                        $slot = $allDisponibilities[$randomIndex];

                        // Create unique keys for checks
                        $globalSlotKey = $slot['classroom']->id.'-'.$slot['day'].'-'.$slot['start_time'];
                        $programSlotKey = $slot['day'].'-'.$slot['start_time'];

                        // Check if this disponibility is available globally AND for the program
                        if (!isset($usedDisponibilities[$globalSlotKey]) && !isset($usedProgramSlots[$programSlotKey])) {
                            try {
                                $timetable = Timetable::create([
                                    'course_id' => $subject->id,
                                    'teacher_id' => $subject->teachers->first()->id,
                                    'classroom_id' => $slot['classroom']->id,
                                    'semester_id' => $semester->id,
                                    'day' => $slot['day'],
                                    'start_time' => $slot['start_time'],
                                    'end_time' => $slot['end_time'],
                                    'filier_id' => $filierId
                                ]);

                                $allTimetables[] = $timetable;
                                $usedDisponibilities[$globalSlotKey] = true;
                                $usedProgramSlots[$programSlotKey] = true;
                                $assigned = true;

                                // Remove used disponibility to avoid reuse
                                unset($allDisponibilities[$randomIndex]);
                            } catch (\Exception $e) {
                                $conflicts[] = "Error assigning {$subject->name}: ".$e->getMessage();
                            }
                        }
                        $attempts++;
                    }

                    if (!$assigned) {
                        $conflicts[] = "Could not assign {$subject->name} - no available slots";
                    }
                }
            }
        }

        return response()->json([
            'success' => empty($conflicts),
            'timetables_created' => count($allTimetables),
            'remaining_disponibilities' => count($allDisponibilities),
            'conflicts' => $conflicts,
            'data' => $allTimetables
        ]);
    }

    private function generateDisponibilities($classrooms)
    {
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $timeSlots = [
            ['start' => '09:00:00', 'end' => '12:00:00'],
            ['start' => '14:00:00', 'end' => '17:00:00']
        ];

        $disponibilities = [];

        foreach ($classrooms as $classroom) {
            foreach ($days as $day) {
                foreach ($timeSlots as $timeSlot) {
                    $disponibilities[] = [
                        'classroom' => $classroom,
                        'day' => $day,
                        'start_time' => $timeSlot['start'],
                        'end_time' => $timeSlot['end']
                    ];
                }
            }
        }

        shuffle($disponibilities);
        return $disponibilities;
    }








    // Working Shit

//    public function generateS1Timetables(Request $request)
//    {
//        Log::info('Starting timetable generation for S1 semesters');
//
//        try {
//            // Fetch S1 semesters with relationships
//            $s1Semesters = Semester::where('semName', ['S1', 'S2'])
//                ->with(['year', 'year.filier', 'subjects.teachers', 'subjects'])
//                ->get();
//
//            if ($s1Semesters->isEmpty()) {
//                $message = 'No S1 semesters found in database';
//                Log::error($message);
//                return response()->json(['error' => $message], 404);
//            }
//
//            // School schedule configuration
//            $daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
//            $timeSlots = [
//                ['start' => '09:00:00', 'end' => '12:00:00'], // Morning
//                ['start' => '14:00:00', 'end' => '17:00:00']  // Evening
//            ];
//
//            $generatedCount = 0;
//            $warnings = [];
//
//            foreach ($s1Semesters as $semester) {
//                Log::info("Processing semester ID: {$semester->id}");
//
//                $subjects = $semester->subjects;
//                $classrooms = Classroom::all();
//
//                if ($classrooms->isEmpty()) {
//                    $message = "No classrooms available for semester {$semester->id}";
//                    Log::warning($message);
//                    $warnings[] = $message;
//                    continue;
//                }
//
//                foreach ($subjects as $subject) {
//                    Log::debug("Scheduling subject: {$subject->name}");
//
//                    $teachers = $subject->teachers;
//
//                    if ($teachers->isEmpty()) {
//                        $message = "No teachers available for subject {$subject->name} in semester {$semester->id}";
//                        Log::warning($message);
//                        $warnings[] = $message;
//                        continue;
//                    }
//
//                    $teacher = $teachers->first();
//                    $scheduled = false;
//
//                    foreach ($daysOfWeek as $day) {
//                        foreach ($timeSlots as $timeSlot) {
//                            // Check semester availability
//                            $semesterConflict = Timetable::where('semester_id', $semester->id)
//                                ->where('day', $day)
//                                ->where(function($query) use ($timeSlot) {
//                                    $query->whereBetween('start_time', [$timeSlot['start'], $timeSlot['end']])
//                                        ->orWhereBetween('end_time', [$timeSlot['start'], $timeSlot['end']]);
//                                })
//                                ->exists();
//
//                            if ($semesterConflict) {
//                                Log::debug("Timeslot conflict for semester {$semester->id} on {$day} {$timeSlot['start']}-{$timeSlot['end']}");
//                                continue;
//                            }
//
//                            // Find available classroom
//                            foreach ($classrooms as $classroom) {
//                                $classroomBusy = Timetable::where('classroom_id', $classroom->id)
//                                    ->where('day', $day)
//                                    ->where(function($query) use ($timeSlot) {
//                                        $query->whereBetween('start_time', [$timeSlot['start'], $timeSlot['end']])
//                                            ->orWhereBetween('end_time', [$timeSlot['start'], $timeSlot['end']]);
//                                    })
//                                    ->exists();
//
//                                if (!$classroomBusy) {
//                                    // Create timetable entry
//                                    Timetable::create([
//                                        'course_id' => $subject->id,
//                                        'teacher_id' => $teacher->id,
//                                        'classroom_id' => $classroom->id,
//                                        'semester_id' => $semester->id,
//                                        'day' => $day,
//                                        'start_time' => $timeSlot['start'],
//                                        'end_time' => $timeSlot['end']
//                                    ]);
//
//                                    $generatedCount++;
//                                    $scheduled = true;
//                                    Log::info("Scheduled {$subject->name} in {$classroom->name} on {$day} {$timeSlot['start']}-{$timeSlot['end']}");
//                                    break 3; // Exit all nested loops
//                                }
//                            }
//                        }
//                    }
//
//                    if (!$scheduled) {
//                        $message = "Failed to schedule subject {$subject->name} for semester {$semester->id} - no available slots";
//                        Log::warning($message);
//                        $warnings[] = $message;
//                    }
//                }
//            }
//
//            $result = [
//                'message' => 'Timetable generation completed',
//                'generated_entries' => $generatedCount,
//                'warnings' => $warnings,
//                'success' => $generatedCount > 0
//            ];
//
//            Log::info('Timetable generation completed', $result);
//            return response()->json($result);
//
//        } catch (\Exception $e) {
//            $errorMessage = "Timetable generation failed: " . $e->getMessage();
//            Log::error($errorMessage);
//            return response()->json(['error' => $errorMessage], 500);
//        }
//    }
}
