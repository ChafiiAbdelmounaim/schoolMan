<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Year;
use Illuminate\Http\Request;

class YearController extends Controller
{
    public function store(Request $request)
    {

        // Validating data
        $request->validate([
            'year_number' => 'required|numeric|min:1',
            'filier_id' => 'required|numeric|min:1',
        ]);

        // Create & save the subject in database
        $year = Year::create([
            'year_number' => $request->year_number,
            'filier_id' => $request->filier_id
        ]);

        return response()->json([
            'message' => 'Year created successfully',
            'year' => $year
        ], 201);
    }

    public function fetchData()
    {
        // Fetch all subjects from the database
        $year = Year::with('filier')->get();
        return response()->json($year, 200);
    }

    public function destroy($id)
    {
        $year = Year::find($id);
        if (!$year) {
            return response()->json(['message' => 'Year not found'], 404);
        }
        $year->delete();
        return response()->json(['message' => 'Year deleted successfully'], 200);
    }


    public function update(Request $request, $id)
    {
        // Validate incoming request
        $request->validate([
            'year_number' => 'required|numeric|min:1',
            'filier_id' => 'required|numeric|min:1'
        ]);

        // Find the subject
        $year = Year::find($id);
        if (!$year) {
            return response()->json(['message' => 'Year not found'], 404);
        }

        // Update subject details
        $year->update([
            'year_number' => $request->year_number,
            'filier_id' => $request->filier_id
        ]);

        return response()->json([
            'message' => 'Year updated successfully!',
            'year' => $year
        ], 200);
    }


}
