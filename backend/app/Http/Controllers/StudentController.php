<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Year;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
            'message' => 'Student updated successfully!',
            'student' => $student
        ], 200);
    }








}
