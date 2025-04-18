<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\Subject;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class TeacherSubjectService
{
    /**
     * Assign a teacher to a subject
     *
     * @param int $teacherId
     * @param int $subjectId
     * @return array
     * @throws \Exception
     */
    public function assignTeacherToSubject(int $teacherId, int $subjectId): array
    {
        try {
            DB::beginTransaction();

            // Verify teacher and subject exist
            $teacher = Teacher::findOrFail($teacherId);
            $subject = Subject::findOrFail($subjectId);

            // Check if assignment already exists
            if ($teacher->subjects()->where('subject_id', $subjectId)->exists()) {
                throw new \Exception('This teacher is already assigned to this subject');
            }

            // Create the assignment
            $teacher->subjects()->attach($subjectId);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Teacher successfully assigned to subject',
                'data' => [
                    'teacher_id' => $teacherId,
                    'subject_id' => $subjectId
                ]
            ];
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Teacher or Subject not found',
                'error' => $e->getMessage()
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to assign teacher to subject',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Remove a teacher from a subject
     *
     * @param int $teacherId
     * @param int $subjectId
     * @return array
     * @throws \Exception
     */
    public function removeTeacherFromSubject(int $teacherId, int $subjectId): array
    {
        try {
            DB::beginTransaction();

            // Verify teacher and subject exist
            $teacher = Teacher::findOrFail($teacherId);
            $subject = Subject::findOrFail($subjectId);

            // Check if assignment exists
            if (!$teacher->subjects()->where('subject_id', $subjectId)->exists()) {
                throw new \Exception('This teacher is not assigned to this subject');
            }

            // Remove the assignment
            $teacher->subjects()->detach($subjectId);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Teacher successfully removed from subject',
                'data' => [
                    'teacher_id' => $teacherId,
                    'subject_id' => $subjectId
                ]
            ];
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Teacher or Subject not found',
                'error' => $e->getMessage()
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Failed to remove teacher from subject',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get all assignments for a subject
     *
     * @param int $subjectId
     * @return array
     */
    public function getTeachersForSubject(int $subjectId): array
    {
        try {
            $subject = Subject::with('teachers')->findOrFail($subjectId);

            return [
                'success' => true,
                'data' => $subject->teachers->map(function ($teacher) {
                    return [
                        'id' => $teacher->id,
                        'name' => $teacher->name,
                        // Add other teacher fields as needed
                    ];
                })->toArray()
            ];
        } catch (ModelNotFoundException $e) {
            return [
                'success' => false,
                'message' => 'Subject not found',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get all subjects for a teacher
     *
     * @param int $teacherId
     * @return array
     */
    public function getSubjectsForTeacher(int $teacherId): array
    {
        try {
            $teacher = Teacher::with('subjects')->findOrFail($teacherId);

            return [
                'success' => true,
                'data' => $teacher->subjects->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name' => $subject->name,
                        // Add other subject fields as needed
                    ];
                })->toArray()
            ];
        } catch (ModelNotFoundException $e) {
            return [
                'success' => false,
                'message' => 'Teacher not found',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get all assignments in the system
     *
     * @return array
     */
    public function getAllAssignments(): array
    {
        $assignments = DB::table('teacher_subject')
            ->select('teacher_id', 'subject_id')
            ->get()
            ->groupBy('subject_id')
            ->map(function ($items) {
                return $items->pluck('teacher_id')->toArray();
            })
            ->toArray();

        return [
            'success' => true,
            'data' => $assignments
        ];
    }
}
