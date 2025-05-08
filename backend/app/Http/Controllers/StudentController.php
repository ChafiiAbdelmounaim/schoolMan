<?php

namespace App\Http\Controllers;

use App\Models\Semester;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Timetable;
use App\Models\Year;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class StudentController extends Controller
{
    public function store(Request $request)
    {

        // Validating data
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email',
            'password' => 'required|min:6',
            'dateNaisance' => 'required|date',
            'apogee' => 'required|numeric|unique:students,apogee',
            'year_id' => 'required|exists:years,id',
            'filier_id' => 'required|exists:filiers,id',
        ]);

        // Create & save the Student in database
        $student = Student::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Hash password
            'dateNaisance' => $request->dateNaisance,
            'apogee' => $request->apogee,
            'year_id' => $request->year_id,
            'filier_id' => $request->filier_id
        ]);

        return response()->json([
            'message' => 'Student created successfully',
            'student' => $student
        ], 201);
    }

    public function fetchData()
    {
        // Fetch students with their related Year and Filier
        $students = Student::with(['year.filier'])->get();

        return response()->json($students);
    }

    public function show($id)
    {

        $student = Student::with(['year.filier'])->find($id);

        return response()->json([
            'success' => true,
            'student' => $student
        ]);

    }

    public function destroy($id)
    {
        $student = Student::find($id);
        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }
        $student->delete();
        return response()->json(['message' => 'Student deleted successfully'], 200);
    }



    public function update(Request $request, $id)
    {
        // Validate incoming request
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email,' . $id,
            'password' => 'nullable|min:6',
            'dateNaisance' => 'required|date',
            'apogee' => 'required|numeric|unique:students,apogee,' . $id,
            'year_id' => 'required|exists:years,id',
            'filier_id' => 'required|exists:filiers,id'
        ]);

        // Find the student
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        // Update student details
        $updateData = [
            'full_name' => $request->full_name,
            'email' => $request->email,
            'dateNaisance' => $request->dateNaisance,
            'apogee' => $request->apogee,
            'year_id' => $request->year_id,
            'filier_id' => $request->filier_id
        ];

        // Only update password if provided
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $student->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Student updated successfully!',
            'student' => $student
        ], 200);
    }


    public function import(Request $request)
    {
        $request->validate([
            'students' => 'required|array',
            'students.*.full_name' => 'required|string',
            'students.*.email' => 'required|email|unique:students,email',
            'students.*.password' => 'required|string',
            'students.*.dateNaisance' => 'required|date',
            'students.*.apogee' => 'required|string|unique:students,apogee',
            'students.*.year_id' => 'required|exists:years,id',
            'students.*.filier_id' => 'required|exists:filiers,id',
        ]);

        $importedCount = 0;
        $errors = [];

        foreach ($request->students as $studentData) {
            try {
                Student::create([
                    'full_name' => $studentData['full_name'],
                    'email' => $studentData['email'],
                    'password' => Hash::make($studentData['password']),
                    'dateNaisance' => $studentData['dateNaisance'],
                    'apogee' => $studentData['apogee'],
                    'year_id' => $studentData['year_id'],
                    'filier_id' => $studentData['filier_id'],
                ]);
                $importedCount++;
            } catch (\Exception $e) {
                $errors[] = "Failed to import {$studentData['email']}: " . $e->getMessage();
            }
        }

        return response()->json([
            'success' => true,
            'count' => $importedCount,
            'errors' => $errors,
        ]);
    }

    public function getTimetable($studentId)
    {
        // Find the student
        $student = Student::findOrFail($studentId);

        if (!$student->year_id) {
            return response()->json([], 200);
        }

        // Get all semesters for this student's year
        $semesters = Semester::where('year_id', $student->year_id)->get();
        Log::debug('Semesters:', $semesters->toArray());
        $semesterIds = $semesters->pluck('id')->toArray();

        // Get all timetable entries for these semesters
        $timetables = Timetable::whereIn('semester_id', $semesterIds)
            ->with(['course', 'teacher', 'classroom', 'semester.year.filier'])
            ->get();

        return response()->json($timetables);
    }



}
