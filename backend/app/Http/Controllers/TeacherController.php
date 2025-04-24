<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TeacherController extends Controller
{
    public function store(Request $request)
    {
        // Validating data
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:teachers,email',
            'password' => 'required|min:6',
            'dateNaissance' => 'required|date',
            'dateEmbauche' => 'required|date',
            'grade' => 'required|string'
        ]);

        // Create & save the teacher in database
        $teacher = Teacher::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'dateNaissance' => $request->dateNaissance,
            'dateEmbauche' => $request->dateEmbauche,
            'grade' => $request->grade
        ]);

        return response()->json([
            'message' => 'Teacher created successfully',
            'teacher' => $teacher
        ], 201);
    }

    public function show($id)
    {

        $teacher = Teacher::findOrFail($id);
        return response()->json([
            'success' => true,
            'teacher' => $teacher
        ]);

    }

    public function fetchData()
    {
        // Fetch all teachers
        $teachers = Teacher::all();

        return response()->json($teachers);
    }

    public function destroy($id)
    {
        // Find the teacher
        $teacher = Teacher::find($id);
        if (!$teacher) {
            return response()->json(['message' => 'Teacher not found'], 404);
        }

        // Delete teacher
        $teacher->delete();

        return response()->json(['message' => 'Teacher deleted successfully'], 200);
    }

    public function update(Request $request, $id)
    {
        // Validate incoming request
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:teachers,email,' . $id,
            'password' => 'nullable|min:6',
            'dateNaissance' => 'required|date',
            'dateEmbauche' => 'required|date',
            'grade' => 'required|string'
        ]);

        // Find the teacher
        $teacher = Teacher::find($id);
        if (!$teacher) {
            return response()->json(['message' => 'Teacher not found'], 404);
        }

        // Update teacher details
        $updateData = [
            'full_name' => $request->full_name,
            'email' => $request->email,
            'dateNaissance' => $request->dateNaissance,
            'dateEmbauche' => $request->dateEmbauche,
            'grade' => $request->grade
        ];

        // Only update password if provided
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $teacher->update($updateData);

        return response()->json([
            'message' => 'Teacher updated successfully!',
            'teacher' => $teacher
        ], 200);
    }

    /////////////// Assign subjects

    // Add these methods to your TeacherController

    public function getTeacherWithSubjects($id)
    {
        $teacher = Teacher::with('subjects.semester.year.filier')->findOrFail($id);
        return response()->json([
            'success' => true,
            'teacher' => $teacher,
            'subjects' => $teacher->subjects
        ]);
    }

    public function attachSubject(Request $request, $teacherId)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id'
        ]);

        $teacher = Teacher::findOrFail($teacherId);
        $teacher->subjects()->syncWithoutDetaching([$request->subject_id]);

        return response()->json([
            'success' => true,
            'message' => 'Subject attached successfully'
        ]);
    }

    public function detachSubject($teacherId, $subjectId)
    {
        $teacher = Teacher::findOrFail($teacherId);
        $teacher->subjects()->detach($subjectId);

        return response()->json([
            'success' => true,
            'message' => 'Subject detached successfully'
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'teachers' => 'required|array',
            'teachers.*.full_name' => 'required|string',
            'teachers.*.email' => 'required|email|unique:teachers,email',
            'teachers.*.password' => 'required|string',
            'teachers.*.dateNaissance' => 'required|date',
            'teachers.*.dateEmbauche' => 'required|date',
            'teachers.*.grade' => 'required|string',
        ]);

        $importedCount = 0;
        $errors = [];

        foreach ($request->teachers as $teacherData) {
            try {
                Teacher::create([
                    'full_name' => $teacherData['full_name'],
                    'email' => $teacherData['email'],
                    'password' => Hash::make($teacherData['password']),
                    'dateNaissance' => $teacherData['dateNaissance'],
                    'dateEmbauche' => $teacherData['dateEmbauche'],
                    'grade' => $teacherData['grade'],
                ]);
                $importedCount++;
            } catch (\Exception $e) {
                $errors[] = "Failed to import {$teacherData['email']}: " . $e->getMessage();
            }
        }

        return response()->json([
            'success' => true,
            'count' => $importedCount,
            'errors' => $errors,
        ]);
    }

}
