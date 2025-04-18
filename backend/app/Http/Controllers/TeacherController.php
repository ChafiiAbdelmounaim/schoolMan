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
            'salary' => 'required|numeric|min:0'
        ]);

        // Create & save the teacher in database
        $teacher = Teacher::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'dateNaissance' => $request->dateNaissance,
            'dateEmbauche' => $request->dateEmbauche,
            'salary' => $request->salary
        ]);

        return response()->json([
            'message' => 'Teacher created successfully',
            'teacher' => $teacher
        ], 201);
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
            'salary' => 'required|numeric|min:0'
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
            'salary' => $request->salary
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


}
