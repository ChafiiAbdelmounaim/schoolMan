<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function store(Request $request)
    {
        // Validating data
        $request->validate([
            'name' => 'required|string|max:255',
            'semester_id' => 'required|exists:semesters,id',
        ]);

        // Create & save the subject in database
        $subject = Subject::create([
            'name' => $request->name,
            'semester_id' => $request->semester_id,
        ]);

        return response()->json([
            'message' => 'Subject created successfully',
            'subject' => $subject
        ], 201);
    }

    public function fetchData()
    {
        // Fetch all subjects along with their related semester
        $subjects = Subject::with('semester.year.filier')->get();

        return response()->json($subjects, 200);
    }

    public function destroy($id)
    {
        // Find the subject
        $subject = Subject::find($id);
        if (!$subject) {
            return response()->json(['message' => 'Subject not found'], 404);
        }

        // Delete the subject
        $subject->delete();
        return response()->json(['message' => 'Subject deleted successfully'], 200);
    }

    public function update(Request $request, $id)
    {
        // Validate incoming request
        $request->validate([
            'name' => 'required|string|max:255',
            'semester_id' => 'required|exists:semesters,id'
        ]);

        // Find the subject
        $subject = Subject::find($id);
        if (!$subject) {
            return response()->json(['message' => 'Subject not found'], 404);
        }

        // Update subject details
        $subject->update([
            'name' => $request->name,
            'semester_id' => $request->semester_id,
        ]);

        return response()->json([
            'message' => 'Subject updated successfully!',
            'subject' => $subject
        ], 200);
    }

    public function import(Request $request)
    {
        $request->validate([
            'subjects' => 'required|array',
            'subjects.*.name' => 'required|string',
            'subjects.*.semester_id' => 'required|exists:semesters,id',
        ]);

        $importedCount = 0;
        $errors = [];

        foreach ($request->subjects as $subjectData) {
            try {
                Subject::create([
                    'name' => $subjectData['name'],
                    'semester_id' => $subjectData['semester_id'],
                ]);
                $importedCount++;
            } catch (\Exception $e) {
                $errors[] = "Failed to import subject '{$subjectData['name']}': " . $e->getMessage();
            }
        }

        return response()->json([
            'success' => true,
            'count' => $importedCount,
            'errors' => $errors,
        ]);
    }


}
