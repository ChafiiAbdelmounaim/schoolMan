<?php

namespace App\Http\Controllers;

use App\Services\TeacherSubjectService;
use Illuminate\Http\Request;

class TeacherSubjectController extends Controller
{
    protected $teacherSubjectService;

    public function __construct(TeacherSubjectService $teacherSubjectService)
    {
        $this->teacherSubjectService = $teacherSubjectService;
    }

    /**
     * Assign a teacher to a subject
     */
    public function assignTeacher(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|integer|exists:teachers,id',
            'subject_id' => 'required|integer|exists:subjects,id'
        ]);

        $result = $this->teacherSubjectService->assignTeacherToSubject(
            $request->teacher_id,
            $request->subject_id
        );

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Remove a teacher from a subject
     */
    public function removeTeacher(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|integer|exists:teachers,id',
            'subject_id' => 'required|integer|exists:subjects,id'
        ]);

        $result = $this->teacherSubjectService->removeTeacherFromSubject(
            $request->teacher_id,
            $request->subject_id
        );

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Get teachers for a subject
     */
    public function getTeachersForSubject($subjectId)
    {
        $result = $this->teacherSubjectService->getTeachersForSubject($subjectId);
        return response()->json($result, $result['success'] ? 200 : 404);
    }

    /**
     * Get subjects for a teacher
     */
    public function getSubjectsForTeacher($teacherId)
    {
        $result = $this->teacherSubjectService->getSubjectsForTeacher($teacherId);
        return response()->json($result, $result['success'] ? 200 : 404);
    }

    /**
     * Get all assignments
     */
    public function getAllAssignments()
    {
        $result = $this->teacherSubjectService->getAllAssignments();
        return response()->json($result);
    }
}
