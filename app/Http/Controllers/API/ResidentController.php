<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use Illuminate\Http\Request;

class ResidentController extends Controller
{
    /**
     * Display residents.
     */
    public function index(Request $request)
    {
        $query = Resident::query();

        // Search by resident name
        if ($request->filled('search')) {
            $query->where(
                'full_name',
                'like',
                '%' . $request->search . '%'
            );
        }

        // Filter by age
        if ($request->filled('age')) {
            $query->where(
                'age',
                $request->age
            );
        }

        // Filter by gender
        if ($request->filled('gender')) {
            $query->where(
                'gender',
                $request->gender
            );
        }

        // Filter by Purok
        if ($request->filled('purok')) {
            $query->where(
                'purok',
                $request->purok
            );
        }

        // Filter by civil status
        if ($request->filled('civil_status')) {
            $query->where(
                'civil_status',
                $request->civil_status
            );
        }

        // Filter by income class
        if ($request->filled('income_class')) {
            $query->where(
                'income_class',
                $request->income_class
            );
        }

        // Get residents, newest first
        $residents = $query
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($residents);
    }

    /**
     * Add a new resident.
     */
    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',

            'birthdate' => 'required|date',

            'age' => 'nullable|integer|min:0|max:150',

            'gender' => 'required|in:Male,Female,Other',

            'mother_name' => 'nullable|string|max:255',

            'father_name' => 'nullable|string|max:255',

            'occupation' => 'nullable|string|max:255',

            'address' => 'required|string',

            'purok' => 'required|string|max:255',

            'phone' => 'nullable|string|max:255',

            'civil_status' =>
                'required|in:Single,Married,Widowed,Separated',

            'income_class' =>
                'required|in:Lower Class,Middle Class,Upper Class',

            'is_voter' => 'boolean',
        ]);

        $resident = Resident::create([
            'user_id' => $request->user_id,

            'full_name' => $request->full_name,

            'birthdate' => $request->birthdate,

            'age' => $request->age,

            'gender' => $request->gender,

            'mother_name' => $request->mother_name,

            'father_name' => $request->father_name,

            'occupation' => $request->occupation,

            'address' => $request->address,

            'purok' => $request->purok,

            'phone' => $request->phone,

            'civil_status' => $request->civil_status,

            'income_class' => $request->income_class,

            'is_voter' => $request->boolean('is_voter'),
        ]);

        return response()->json([
            'message' => 'Resident added',
            'resident' => $resident,
        ], 201);
    }

    /**
     * Update a resident.
     */
    public function update(Request $request, $id)
    {
        $resident = Resident::findOrFail($id);

        $request->validate([
            'full_name' =>
                'sometimes|string|max:255',

            'birthdate' =>
                'sometimes|date',

            'age' =>
                'sometimes|integer|min:0|max:150',

            'gender' =>
                'sometimes|in:Male,Female,Other',

            'mother_name' =>
                'sometimes|nullable|string|max:255',

            'father_name' =>
                'sometimes|nullable|string|max:255',

            'occupation' =>
                'sometimes|nullable|string|max:255',

            'address' =>
                'sometimes|string',

            'purok' =>
                'sometimes|string|max:255',

            'phone' =>
                'sometimes|nullable|string|max:255',

            'civil_status' =>
                'sometimes|in:Single,Married,Widowed,Separated',

            'income_class' =>
                'sometimes|in:Lower Class,Middle Class,Upper Class',

            'is_voter' =>
                'sometimes|boolean',
        ]);

        $resident->update(
            $request->only([
                'full_name',
                'birthdate',
                'age',
                'gender',
                'mother_name',
                'father_name',
                'occupation',
                'address',
                'purok',
                'phone',
                'civil_status',
                'income_class',
                'is_voter',
            ])
        );

        return response()->json([
            'message' => 'Resident updated',
            'resident' => $resident,
        ]);
    }

    /**
     * Delete a resident.
     */
    public function destroy($id)
    {
        Resident::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Resident deleted',
        ]);
    }
}