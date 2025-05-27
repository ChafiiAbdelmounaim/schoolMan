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
use Illuminate\Support\Facades\Validator;

class TimetableController extends Controller
{
    /**
     * Get timetables with optional status filter
     */
    public function index(Request $request)
    {
        // Filter by status if provided
        $status = $request->query('status');

        $query = Timetable::with(['course', 'teacher', 'classroom', 'semester.year.filier']);

        // Add status filter if provided
        if ($status) {
            $query->where('status', $status);
        }

        $timetables = $query->get();

        return response()->json($timetables);
    }

    /**
     * Get timetables for a specific teacher
     */
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

    /**
     * Create a new timetable entry
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'semester_id' => 'required|exists:semesters,id',
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for conflicts with existing timetable entries
        $conflictResult = $this->checkForConflicts($request);
        if ($conflictResult !== true) {
            return response()->json([
                'success' => false,
                'message' => $conflictResult
            ], 422);
        }

        try {
            $timetable = Timetable::create([
                'course_id' => $request->course_id,
                'teacher_id' => $request->teacher_id,
                'classroom_id' => $request->classroom_id,
                'semester_id' => $request->semester_id,
                'day' => $request->day,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'status' => 'confirmed' // New entries added through the editor are confirmed
            ]);

            // Load relationships for the response
            $timetable->load(['course', 'teacher', 'classroom', 'semester.year.filier']);

            return response()->json($timetable, 201);
        } catch (\Exception $e) {
            Log::error('Failed to create timetable entry', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create timetable entry: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing timetable entry
     */
    public function update(Request $request, $id)
    {
        $timetable = Timetable::find($id);

        if (!$timetable) {
            return response()->json([
                'success' => false,
                'message' => 'Timetable entry not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:subjects,id',
            'teacher_id' => 'required|exists:teachers,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for conflicts with existing timetable entries (excluding this one)
        $conflictResult = $this->checkForConflicts($request, $id);
        if ($conflictResult !== true) {
            return response()->json([
                'success' => false,
                'message' => $conflictResult
            ], 422);
        }

        try {
            $timetable->update([
                'course_id' => $request->course_id,
                'teacher_id' => $request->teacher_id,
                'classroom_id' => $request->classroom_id,
                'day' => $request->day,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
            ]);

            // Load relationships for the response
            $timetable->load(['course', 'teacher', 'classroom', 'semester.year.filier']);

            return response()->json($timetable);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update timetable entry: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a timetable entry
     */
    public function destroy($id)
    {
        $timetable = Timetable::find($id);

        if (!$timetable) {
            return response()->json([
                'success' => false,
                'message' => 'Timetable entry not found'
            ], 404);
        }

        try {
            $timetable->delete();

            return response()->json([
                'success' => true,
                'message' => 'Timetable entry deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete timetable entry: ' . $e->getMessage()
            ], 500);
        }
    }



// Add these optimized methods to your TimetableController class

    /**
     * Get timetable entries for a specific semester (optimized)
     */
    /**
     * Get timetable entries for a specific semester (optimized)
     */
    public function getSemesterTimetable($semesterId)
    {
        try {
            // Start measuring execution time for debugging
            $startTime = microtime(true);

            // Performance optimization: Select only necessary fields and use eager loading constraints
            $timetable = Timetable::select(
                'id',
                'course_id',
                'teacher_id',
                'classroom_id',
                'semester_id',
                'day',
                'start_time',
                'end_time',
                'status'
            )
                ->with([
                    'course:id,name',  // Only select necessary fields
                    'teacher:id,full_name',
                    'classroom:id,name',
                    'semester' => function($query) {
                        $query->select('id', 'semName', 'year_id');
                    },
                    'semester.year' => function($query) {
                        $query->select('id', 'year_number', 'filier_id');
                    },
                    'semester.year.filier:id,name'
                ])
                ->where('semester_id', $semesterId)
                ->get();

            // Calculate execution time
            $executionTime = microtime(true) - $startTime;

            // Log for debugging
            Log::info('Fetched semester timetable', [
                'semester_id' => $semesterId,
                'entries_count' => $timetable->count(),
                'execution_time_ms' => round($executionTime * 1000, 2)
            ]);

            return response()->json($timetable);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve semester timetable', [
                'semester_id' => $semesterId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve timetable data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check for conflicts with existing timetable entries (optimized)
     */
    /**
     * Check for conflicts with existing timetable entries
     *
     * @param Request $request
     * @param int|null $excludeId ID of entry to exclude from conflict check (for updates)
     * @return true|string True if no conflicts, error message string if conflicts found
     */
    private function checkForConflicts(Request $request, $excludeId = null)
    {
        // Get the semester for this request
        $semesterId = $request->semester_id ?? Timetable::find($excludeId)->semester_id;

        // Performance optimization: Use one query with OR conditions instead of multiple queries
        $conflicts = Timetable::where(function($query) use ($request, $excludeId, $semesterId) {
            // Classroom conflict check
            $query->where('classroom_id', $request->classroom_id)
                ->where('day', $request->day)
                ->where('start_time', $request->start_time);
        })
            ->orWhere(function($query) use ($request, $semesterId) {
                // Semester conflict check
                $query->where('semester_id', $semesterId)
                    ->where('day', $request->day)
                    ->where('start_time', $request->start_time);
            })
            ->orWhere(function($query) use ($request) {
                // Teacher conflict check
                $query->where('teacher_id', $request->teacher_id)
                    ->where('day', $request->day)
                    ->where('start_time', $request->start_time);
            });

        // Exclude the current entry if updating
        if ($excludeId) {
            $conflicts->where('id', '!=', $excludeId);
        }

        // Get all conflicts in one query
        $conflictResults = $conflicts->get();

        // Check classroom conflicts
        $classroomConflict = $conflictResults->first(function ($item) use ($request) {
            return $item->classroom_id == $request->classroom_id
                && $item->day == $request->day
                && $item->start_time == $request->start_time;
        });

        if ($classroomConflict) {
            return 'This classroom is already booked for this time slot.';
        }

        // Check semester conflicts
        $semesterConflict = $conflictResults->first(function ($item) use ($semesterId, $request) {
            return $item->semester_id == $semesterId
                && $item->day == $request->day
                && $item->start_time == $request->start_time;
        });

        if ($semesterConflict) {
            return 'This semester already has a class scheduled during this time slot.';
        }

        // Check teacher conflicts
        $teacherConflict = $conflictResults->first(function ($item) use ($request) {
            return $item->teacher_id == $request->teacher_id
                && $item->day == $request->day
                && $item->start_time == $request->start_time;
        });

        if ($teacherConflict) {
            return 'This teacher is already teaching another class during this time slot.';
        }

        return true; // No conflicts found
    }
    /**
     * Generate timetables for first half semesters (S1, S3)
     */
    public function generateS1Timetables(Request $request)
    {
        // Clear ALL existing timetables (both confirmed and unconfirmed)
        try {
            Timetable::truncate(); // This completely clears the table
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

        // Track used time slots per semester
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
                                // Add status field to mark as unconfirmed
                                $timetable = Timetable::create([
                                    'course_id' => $subject->id,
                                    'teacher_id' => $subject->teachers->first()->id,
                                    'classroom_id' => $slot['classroom']->id,
                                    'semester_id' => $semester->id,
                                    'day' => $slot['day'],
                                    'start_time' => $slot['start_time'],
                                    'end_time' => $slot['end_time'],
                                    'filier_id' => $filierId,
                                    'status' => 'unconfirmed' // Mark as unconfirmed
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

        // Fetch the complete timetable data with all relations for the frontend
        $completeTimetables = Timetable::with(['course', 'teacher', 'classroom', 'semester.year.filier'])
            ->where('status', 'unconfirmed')
            ->get();

        return response()->json([
            'success' => empty($conflicts),
            'timetables_created' => count($allTimetables),
            'remaining_disponibilities' => count($allDisponibilities),
            'conflicts' => $conflicts,
            'data' => $completeTimetables
        ]);
    }

    /**
     * Generate timetables for second half semesters (S2, S4)
     */
    public function generateS2Timetables(Request $request)
    {
        // Clear ALL existing timetables (both confirmed and unconfirmed)
        try {
            Timetable::truncate(); // This completely clears the table
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

        // Track used time slots per semester
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
                                // Add status field to mark as unconfirmed
                                $timetable = Timetable::create([
                                    'course_id' => $subject->id,
                                    'teacher_id' => $subject->teachers->first()->id,
                                    'classroom_id' => $slot['classroom']->id,
                                    'semester_id' => $semester->id,
                                    'day' => $slot['day'],
                                    'start_time' => $slot['start_time'],
                                    'end_time' => $slot['end_time'],
                                    'filier_id' => $filierId,
                                    'status' => 'unconfirmed' // Mark as unconfirmed
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

        // Fetch the complete timetable data with all relations for the frontend
        $completeTimetables = Timetable::with(['course', 'teacher', 'classroom', 'semester.year.filier'])
            ->where('status', 'unconfirmed')
            ->get();

        return response()->json([
            'success' => empty($conflicts),
            'timetables_created' => count($allTimetables),
            'remaining_disponibilities' => count($allDisponibilities),
            'conflicts' => $conflicts,
            'data' => $completeTimetables
        ]);
    }

    /**
     * Generate all possible timeslots
     */
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

    /**
     * Confirm generated timetables
     */
    public function confirmTimetables()
    {
        try {
            // Update all unconfirmed timetables to confirmed status
            $updated = Timetable::where('status', 'unconfirmed')
                ->update(['status' => 'confirmed']);

            // Log for debugging
            Log::info('Confirmed timetables', ['count' => $updated]);

            // Create notifications for teachers and students
            if ($updated > 0) {
                try {
                    // Create a notification for teachers
                    $teacherNotification = new Notification();
                    $teacherNotification->type = 'timetable-update';
                    $teacherNotification->message = 'New timetable has been published';
                    $teacherNotification->user_type = 'teacher';
                    $teacherNotification->broadcast = true;
                    $teacherNotification->read = false;
                    $teacherNotification->save();

                    // Create a notification for students
                    $studentNotification = new Notification();
                    $studentNotification->type = 'timetable-update';
                    $studentNotification->message = 'New timetable has been published';
                    $studentNotification->user_type = 'student';
                    $studentNotification->broadcast = true;
                    $studentNotification->read = false;
                    $studentNotification->save();

                    Log::info('Timetable notifications created for teachers and students');
                } catch (\Exception $e) {
                    Log::error('Failed to create notifications', ['error' => $e->getMessage()]);
                    // Continue with the confirmation process even if notifications fail
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Timetables confirmed successfully',
                'updated_count' => $updated
            ]);
        } catch (\Exception $e) {
            Log::error('Error confirming timetables', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Error confirming timetables: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete all unconfirmed timetables
     */
    public function destroyAll()
    {
        // Delete only unconfirmed timetables
        Timetable::whereIn('status', ['unconfirmed', 'confirmed'])->delete();

        return response()->json([
            'success' => true,
            'message' => 'Unconfirmed timetables deleted successfully'
        ]);
    }
}
