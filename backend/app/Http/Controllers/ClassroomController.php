<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    public function store(Request $request)
    {
        // Validating data
        $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|numeric|min:1',
        ]);

        // Create & save the classroom in the database
        $classroom = Classroom::create([
            'name' => $request->name,
            'capacity' => $request->capacity
        ]);

        return response()->json([
            'message' => 'Classroom created successfully',
            'classroom' => $classroom
        ], 201);
    }

    public function fetchData()
    {
        // Fetch all classrooms from the database
        $classrooms = Classroom::all();
        return response()->json($classrooms, 200);
    }

    public function destroy($id)
    {
        $classroom = Classroom::find($id);
        if (!$classroom) {
            return response()->json(['message' => 'Classroom not found'], 404);
        }
        $classroom->delete();
        return response()->json(['message' => 'Classroom deleted successfully'], 200);
    }

    public function update(Request $request, $id)
    {
        // Validate incoming request
        $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
        ]);

        // Find the Classroom
        $classroom = Classroom::find($id);
        if (!$classroom) {
            return response()->json(['message' => 'Classroom not found'], 404);
        }

        // Update classroom details
        $classroom->update([
            'name' => $request->name,
            'capacity' => $request->capacity,
        ]);

        return response()->json([
            'message' => 'Classroom updated successfully!',
            'classroom' => $classroom
        ], 200);
    }


}
