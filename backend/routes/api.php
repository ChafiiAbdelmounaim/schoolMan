<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\FilierController;
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
        });

    // Semesters Routes
    Route::prefix('/semesters')
        ->controller(SemesterController::class)
        ->group(function (){
            Route::get('/', 'fetchData');
            Route::post('/', 'store');
            Route::delete('/{id}', 'destroy');
            Route::put('/{id}', 'update');
        });

    // Students Routes
    Route::prefix('/students')
        ->controller(StudentController::class)
        ->group(function (){
            Route::get('/', 'fetchData');
            Route::post('/', 'store');
            Route::delete('/{id}', 'destroy');
            Route::put('/{id}', 'update');
        });

    // Teachers Routes
    Route::prefix('/teachers')
        ->controller(TeacherController::class)
        ->group(function (){
            Route::get('/', 'fetchData');
            Route::post('/', 'store');
            Route::delete('/{id}', 'destroy');
            Route::put('/{id}', 'update');
        });

    // Assign Teachers Routes
    Route::prefix('teacher-subjects')
        ->controller(TeacherSubjectController::class)
        ->group(function () {
        Route::post('/assign', 'assignTeacher');
        Route::post('/remove', 'removeTeacher');
        Route::get('/subject/{subjectId}/teachers', 'getTeachersForSubject');
        Route::get('/teacher/{teacherId}/subjects', 'getSubjectsForTeacher');
        Route::get('/assignments', 'getAllAssignments');
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


    Route::get('/timetables', function () {
        return Timetable::with(['course', 'teacher', 'classroom', 'semester'])->get();
    });

    Route::post('/generate-s1-timetables', [TimetableController::class, 'generateS1Timetables']);

});


