<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\FilierController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TeacherSubjectController;
use App\Http\Controllers\TimetableController;
use App\Http\Controllers\YearController;
use App\Models\Timetable;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// Protected routes (require valid token)
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Subjects Routes
    Route::prefix('/subjects')
        ->controller(SubjectController::class)
        ->group(function (){
            Route::get('/', 'fetchData');
            Route::post('/', 'store');
            Route::post('/import', 'import');
            Route::delete('/{id}', 'destroy');
            Route::put('/{id}', 'update');
        });


    // Filiers Routes
    Route::prefix('/filiers')
        ->controller(FilierController::class)
        ->group(function (){
            Route::get('/', 'fetchData');
            Route::post('/', 'store');
            Route::delete('/{id}', 'destroy');
            Route::put('/{id}', 'update');
        });


    // Years Routes
    Route::prefix('/years')
        ->controller(YearController::class)
        ->group(function (){
            Route::get('/', 'fetchData');
            Route::post('/', 'store');
            Route::delete('/{id}', 'destroy');
            Route::put('/{id}', 'update');
            Route::get('/{year}/semesters', 'semesters');
        });

    // Semesters Routes
    Route::prefix('/semesters')
        ->controller(SemesterController::class)
        ->group(function (){
            Route::get('/', 'fetchData');
            Route::post('/', 'store');
            Route::delete('/{id}', 'destroy');
            Route::put('/{id}', 'update');
            Route::get('/{semester}/timetables', 'timetables');
        });

    // Students Routes
    Route::prefix('/students')
        ->controller(StudentController::class)
        ->group(function (){
            Route::get('/', 'fetchData');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::post('/import', 'import');
            Route::delete('/{id}', 'destroy');
            Route::put('/{id}', 'update');
            Route::get('/{student_id}/timetable', 'getTimetable');

        });

    // Teachers Routes
    Route::prefix('/teachers')
        ->controller(TeacherController::class)
        ->group(function (){
            Route::get('/', 'fetchData');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::post('/import', 'import');
            Route::delete('/{id}', 'destroy');
            Route::put('/{id}', 'update');
            Route::get('/{id}/subjects', 'getTeacherWithSubjects');
            Route::post('/{teacher}/attach-subject', 'attachSubject');
            Route::delete('/{teacher}/detach-subject/{subject}', 'detachSubject');
        });


    // Classrooms Routes
    Route::prefix('/classrooms')
        ->controller(ClassroomController::class)
        ->group(function (){
            Route::get('/', 'fetchData');
            Route::post('/', 'store');
            Route::delete('/{id}', 'destroy');
            Route::put('/{id}', 'update');
        });

    // Notification Routes
    Route::prefix('/notifications')
        ->controller(NotificationController::class)
        ->group(function (){
            Route::get('/', 'index');
            Route::get('/timetable-updates', 'checkTimetableUpdates');
            Route::post('/{id}/read', 'markAsRead');
            Route::post('/mark-all-read', 'markAllAsRead');
            Route::post('/timetable-update', 'createTimetableUpdateNotification');
        });

    // Announcement routes
    Route::prefix('/announcements')
        ->controller(AnnouncementController::class)
        ->group(function (){
            Route::get('/', 'index');
            Route::get('/{id}', 'show');
            Route::post('/', 'store');
            Route::delete('/{id}', 'destroy');

        });


    Route::get('/timetables', function () {
        return Timetable::with(['course', 'teacher', 'classroom', 'semester'])->get();
    });

    Route::post('/generate-s1-timetables', [TimetableController::class, 'generateS1Timetables']);
    Route::post('/generate-s2-timetables', [TimetableController::class, 'generateS2Timetables']);



    // analytics
    Route::get('/analytics', [AnalyticsController::class, 'getAnalytics']);
});

Route::get('/emploi', [TimetableController::class, 'index']);
Route::post('/confirm-timetables', [TimetableController::class, 'confirmTimetables']);
Route::delete('/cancel-timetables', [TimetableController::class, 'destroyAll']);

Route::get('/teacher/{teacher}/timetable', [TimetableController::class, 'teacherTimetable']);
Route::get('/timetable/{semesterId}', [TimetableController::class, 'getSemesterTimetable']);
Route::post('/timetable', [TimetableController::class, 'store']);
Route::put('/timetable/{id}', [TimetableController::class, 'update']);
Route::delete('/timetable/{id}', [TimetableController::class, 'destroy']);


