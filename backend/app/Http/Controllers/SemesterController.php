<?php

namespace App\Http\Controllers;

use App\Models\Semester;
use App\Models\Timetable;
use App\Models\Year;
use Illuminate\Http\Request;

class SemesterController extends Controller
{
    public function store(Request $request)
    {

        // Validating data
        $request->validate([
            'semName' => 'required|string|max:255',
            'year_id' => 'required|numeric|min:1',
        ]);

        // Create & save the subject in database
        $semester = Semester::create([
            'semName' => $request->semName,
            'year_id' => $request->year_id
        ]);

        return response()->json([
            'message' => 'Semester created successfully',
            'semester' => $semester
        ], 201);
    }

    public function fetchData()
    {

        $semesters = Semester::with('year.filier')->get();
        return response()->json($semesters, 200);
    }


    public function destroy($id)
    {
        $semester = Semester::find($id);
        if (!$semester) {
            return response()->json(['message' => 'Semester not found'], 404);
        }
        $semester->delete();
        return response()->json(['message' => 'Semester deleted successfully'], 200);
    }



    public function update(Request $request, $id)
    {
        // Validate incoming request
        $request->validate([
            'semName' => 'required|string|max:255',
            'year_id' => 'required|numeric|min:1',
        ]);

        // Find the Semester
        $semester = Semester::find($id);
        if (!$semester) {
            return response()->json(['message' => 'Semester not found'], 404);
        }

        // Update subject details
        $semester->update([
            'semName' => $request->semName,
            'year_id' => $request->year_id
        ]);

        return response()->json([
            'message' => 'Semester updated successfully!',
            'semester' => $semester
        ], 200);
    }

}
