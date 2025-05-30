<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    //
    /**
     * @throws ValidationException
     */
    public function register(Request $request): JsonResponse
    {
        $this->validate($request, [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);
        $user  = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'   => $user,
            'role'   => 'user',
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function login(Request $request): JsonResponse
    {
        $this->validate($request,
            [
                'email' => 'required|string|email|max:255',
                'password' => 'required|string|min:6',
            ]
        );

        // Try to authenticate as a user first
        $user = User::where('email', $request->email)->first();
        if ($user && Hash::check($request->password, $user->password)) {
            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json([
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'   => $user,
                'role'   => 'user',
            ]);
        }

        // If user authentication fails, try as a teacher
        $teacher = Teacher::where('email', $request->email)->first();
        if ($teacher && Hash::check($request->password, $teacher->password)) {
            $token = $teacher->createToken('auth_token')->plainTextToken;
            return response()->json([
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'   => $teacher,
                'role'   => 'teacher',
            ]);
        }

        // If user authentication fails, try as a student
        $student = Student::where('email', $request->email)->first();
        if ($student && Hash::check($request->password, $student->password)) {
            $token = $student->createToken('auth_token')->plainTextToken;
            return response()->json([
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'   => $student,
                'role'   => 'student',
            ]);
        }

        // If both fail, throw an error
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    // Retrieve the authenticated user
    public function user(Request $request)
    {
        $user = $request->user();

        // Determine if the authenticated user is a teacher or regular user
        switch (true) {
            case $user instanceof Teacher:
                $role = 'teacher';
                break;

            case $user instanceof Student:
                $role = 'student';
                break;

            default:
                $role = 'user';
                break;
        }

        return response()->json([
            'user' => $user,
            'role' => $role
        ]);
    }




}
