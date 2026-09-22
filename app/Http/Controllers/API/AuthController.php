<?php
// FILE: app/Http/Controllers/API/AuthController.php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * PSA-aligned income classification.
     * Lower Class:  below ₱24,060/month
     * Middle Class: ₱24,060 – ₱144,360/month
     * Upper Class:  above ₱144,360/month
     */
    private function classifyIncome(float $salary): string
    {
        if ($salary < 24060) return 'Lower Class';
        if ($salary <= 144360) return 'Middle Class';
        return 'Upper Class';
    }

    public function register(Request $request)
{
    $request->validate([
        'name'                => 'required|string|max:255',
        'email'               => 'required|email|unique:users',
        'password'            => 'required|min:8|confirmed',
        'phone'               => 'required|string',
        'address'             => 'required|string',
        'birthdate'           => 'required|date',
        'gender'              => 'required|in:Male,Female,Other',
        'purok'               => 'required|string',
        'civil_status'        => 'required',
        'monthly_salary'      => 'required|numeric|min:0',
        'id_document'         => 'required|image|mimes:jpg,jpeg,png,webp|max:8192',
        'ocr_extracted_text'  => 'required|string|min:5',
    ], [
        'id_document.required' => 'A valid government ID photo is required.',
        'id_document.image'    => 'The ID must be a photo (JPG, JPEG, PNG, or WEBP) — documents and PDFs are not accepted.',
        'id_document.mimes'    => 'The ID must be a JPG, JPEG, PNG, or WEBP image file.',
        'ocr_extracted_text.required' => 'ID could not be verified. Please re-upload a clearer photo.',
        'ocr_extracted_text.min'      => 'ID could not be verified. Please re-upload a clearer photo.',
    ]);

    $salary = (float) $request->monthly_salary;
    $incomeClass = $this->classifyIncome($salary);

    // Store the verified ID photo
    $documentPath = $request->file('id_document')->store('id_documents', 'public');

    // 1. Create the User
    $user = User::create([
        'name'               => $request->name,
        'email'              => $request->email,
        'password'           => Hash::make($request->password),
        'phone'              => $request->phone,
        'address'            => $request->address,
        'birthdate'          => $request->birthdate,
        'gender'             => $request->gender,
        'purok'              => $request->purok,
        'civil_status'       => $request->civil_status,
        'monthly_salary'     => $salary,
        'income_class'       => $incomeClass,
        'is_voter'           => $request->boolean('is_voter'),
        'id_document_path'   => $documentPath,
        'ocr_extracted_text' => $request->ocr_extracted_text,
        'is_verified'        => true,
    ]);

    // 2. Also create the Resident record (this is what the Admin page reads)
    \App\Models\Resident::create([
        'user_id'      => $user->id,
        'full_name'    => $user->name,
        'birthdate'    => $user->birthdate,
        'gender'       => $user->gender,
        'address'      => $user->address,
        'purok'        => $user->purok,
        'phone'        => $user->phone,
        'civil_status' => $user->civil_status,
        'income_class' => $user->income_class,
        'is_voter'     => $user->is_voter,
        'occupation'   => null, // you can add an occupation field later if needed
    ]);

    $token = $user->createToken('user-token')->plainTextToken;

    return response()->json([
        'message'      => 'Registration successful!',
        'user'         => $user,
        'token'        => $token,
        'income_class' => $incomeClass,
    ], 201);
}

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user  = Auth::user();
        $token = $user->createToken('user-token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }
}