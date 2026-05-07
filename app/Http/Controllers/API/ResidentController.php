<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use Illuminate\Http\Request;

class ResidentController extends Controller {

    public function index(Request $request) {
        $query = Resident::query();
        if ($request->income_class) $query->where('income_class', $request->income_class);
        if ($request->purok) $query->where('purok', $request->purok);
        if ($request->search) {
            $query->where('full_name', 'like', "%{$request->search}%");
        }
        return response()->json($query->paginate(20));
    }

    public function store(Request $request) {
        $request->validate([
            'full_name' => 'required|string',
            'birthdate' => 'required|date',
            'gender' => 'required',
            'address' => 'required',
            'purok' => 'required',
            'civil_status' => 'required',
            'income_class' => 'required',
        ]);

        $resident = Resident::create($request->all());
        return response()->json(['message' => 'Resident added', 'resident' => $resident], 201);
    }

    public function update(Request $request, $id) {
        $resident = Resident::findOrFail($id);
        $resident->update($request->all());
        return response()->json(['message' => 'Resident updated', 'resident' => $resident]);
    }

    public function destroy($id) {
        Resident::findOrFail($id)->delete();
        return response()->json(['message' => 'Resident deleted']);
    }
}