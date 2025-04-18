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

class TimetableController extends Controller
{
    public function generateS1Timetables(Request $request)
    {
        // Step 1: Fetch all semesters that have 'S1' as semName
        $s1Semesters = Semester::where('semName', 'S2')
            ->with(['year', 'year.filier', 'subjects.teachers']) // Eager load the year and filiere relationships
            ->get();

        // Check if S1 semesters were found
        if ($s1Semesters->isEmpty()) {
            return response()->json(['message' => 'No S1 semesters found.'], 404);
        }
        


        // For now, just return the fetched semesters as a response
        return response()->json(['data' => $s1Semesters]);
    }
}
