<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Filier;
use App\Models\Notification;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Timetable;
use App\Models\User;
use App\Models\Year;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function getAnalytics()
    {
        try {
            // Get counts for each model
            $analytics = [
                'general_stats' => [
                    'total_students' => Student::count(),
                    'total_teachers' => Teacher::count(),
                    'total_filiers' => Filier::count(),
                    'total_subjects' => Subject::count(),
                    'total_classrooms' => Classroom::count(),
                    'total_users' => User::count(),
                    'total_timetables' => Timetable::distinct('semester_id')->count('semester_id'),
                ],
                'detailed_stats' => [
                    'students_per_filier' => $this->getStudentsPerFilier(), //
                    'students_by_academic_level' => $this->getStudentsByAcademicLevel(),
                    'subjects_per_filier' => $this->getSubjectsPerFilier(), //
                ],
                'growth_stats' => [
                    'monthly_student_registrations' => $this->getMonthlyStudentRegistrations(),
                    'monthly_teacher_registrations' => $this->getMonthlyTeacherRegistrations(),
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching analytics data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getStudentsByAcademicLevel()
    {
        return Year::leftJoin('students', 'years.id', '=', 'students.year_id')
            ->selectRaw('CONCAT("Year ", years.year_number) as level, COUNT(students.id) as students_count')
            ->groupBy('years.year_number')
            ->orderBy('years.year_number')
            ->get()
            ->map(function ($level) {
                return [
                    'name' => $level->level,
                    'count' => (int) $level->students_count
                ];
            });
    }

    private function getStudentsPerFilier()
    {
        return Filier::withCount('students')
            ->get()
            ->map(function ($filier) {
                return [
                    'name' => $filier->name,
                    'count' => $filier->students_count
                ];
            });
    }


    private function getSubjectsPerFilier()
    {
        return Filier::with(['years.semesters.subjects'])
            ->get()
            ->map(function ($filier) {
                $subjectCount = 0;
                foreach ($filier->years as $year) {
                    foreach ($year->semesters as $semester) {
                        $subjectCount += $semester->subjects->count();
                    }
                }

                return [
                    'name' => $filier->name,
                    'count' => $subjectCount
                ];
            });
    }

    private function getMonthlyStudentRegistrations()
    {
        return Student::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'year' => $item->year,
                    'count' => $item->count,
                    'label' => date('M Y', mktime(0, 0, 0, $item->month, 1, $item->year))
                ];
            });
    }

    private function getMonthlyTeacherRegistrations()
    {
        return Teacher::selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'year' => $item->year,
                    'count' => $item->count,
                    'label' => date('M Y', mktime(0, 0, 0, $item->month, 1, $item->year))
                ];
            });
    }
}
