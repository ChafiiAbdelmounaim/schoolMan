<?php

namespace App\Http\Controllers;

use App\Models\Filier;
use App\Models\Subject;
use Illuminate\Http\Request;

class FilierController extends Controller
{
    // Store
    public function store(Request $request)
    {

        // Validating data
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Create & save in database
        $filier = Filier::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Filier created successfully',
            'subject' => $filier
        ], 201);
    }

    public function fetchData()
    {
        // Fetch all from the database
        $filier = Filier::all();
        return response()->json($filier, 200);
    }


    public function destroy($id)
    {
        $filier = Filier::find($id);
        if (!$filier) {
            return response()->json(['message' => 'Filier not found'], 404);
        }
        $filier->delete();
        return response()->json(['message' => 'Filier deleted successfully'], 200);
    }


    public function update(Request $request, $id)
    {
        // Validate incoming request
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Find the Filier
        $filier = Filier::find($id);
        if (!$filier) {
            return response()->json(['message' => 'Filier not found'], 404);
        }

        // Update filier details
        $filier->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Filier updated successfully!',
            'filier' => $filier
        ], 200);
    }
}
