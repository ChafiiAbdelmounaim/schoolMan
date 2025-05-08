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

    public function teacherTimetable(Teacher $teacher)
    {
        $timetables = Timetable::with([
            'course',
            'teacher',
            'classroom',
            'semester.year.filier'
        ])
            ->where('teacher_id', $teacher->id)
            ->get();

        return response()->json($timetables);
    }


    public function generateS1Timetables(Request $request)
    {

        // Clear all existing timetables automatically
        try {
            Timetable::truncate(); // This resets auto-increment counters too
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear old timetables: ' . $e->getMessage()
            ], 500);
        }

        // 1. Get all S1 and S3 semesters grouped by filière
        $s1Semesters = Semester::whereIn('semName', ['S1', 'S3'])
            ->with(['year.filier', 'subjects.teachers'])
            ->get()
            ->groupBy('year.filier.id');


        // 2. Get all classrooms
        $classrooms = Classroom::all();

        // 3. Generate ALL possible disponibilities once
        $allDisponibilities = $this->generateDisponibilities($classrooms);
        $usedDisponibilities = []; // Track ALL used disponibilities globally

        // NEW: Track used time slots per semester instead of per program
        $usedSemesterSlots = [];

        $allTimetables = [];
        $conflicts = [];

        foreach ($s1Semesters as $filierId => $semesters) {
            foreach ($semesters as $semester) {
                // Initialize semester slots tracking if not exists
                if (!isset($usedSemesterSlots[$semester->id])) {
                    $usedSemesterSlots[$semester->id] = [];
                }

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
                        $semesterSlotKey = $slot['day'].'-'.$slot['start_time'];

                        // Check if this disponibility is available globally AND for this specific semester
                        if (!isset($usedDisponibilities[$globalSlotKey]) &&
                            !isset($usedSemesterSlots[$semester->id][$semesterSlotKey])) {
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
                                $usedSemesterSlots[$semester->id][$semesterSlotKey] = true;
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




    // S2, S4
    public function generateS2Timetables(Request $request)
    {

        // Clear all existing timetables automatically
        try {
            Timetable::truncate(); // This resets auto-increment counters too
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear old timetables: ' . $e->getMessage()
            ], 500);
        }


        // 1. Get all S2 and S4 semesters grouped by filière
        $s2Semesters = Semester::whereIn('semName', ['S2', 'S4'])
            ->with(['year.filier', 'subjects.teachers'])
            ->get()
            ->groupBy('year.filier.id');


        // 2. Get all classrooms
        $classrooms = Classroom::all();

        // 3. Generate ALL possible disponibilities once
        $allDisponibilities = $this->generateDisponibilities($classrooms);
        $usedDisponibilities = []; // Track ALL used disponibilities globally

        // NEW: Track used time slots per semester instead of per program
        $usedSemesterSlots = [];

        $allTimetables = [];
        $conflicts = [];

        foreach ($s2Semesters as $filierId => $semesters) {
            foreach ($semesters as $semester) {
                // Initialize semester slots tracking if not exists
                if (!isset($usedSemesterSlots[$semester->id])) {
                    $usedSemesterSlots[$semester->id] = [];
                }

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
                        $semesterSlotKey = $slot['day'].'-'.$slot['start_time'];

                        // Check if this disponibility is available globally AND for this specific semester
                        if (!isset($usedDisponibilities[$globalSlotKey]) &&
                            !isset($usedSemesterSlots[$semester->id][$semesterSlotKey])) {
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
                                $usedSemesterSlots[$semester->id][$semesterSlotKey] = true;
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

}
