<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\IncidentReport;
use Illuminate\Http\Request;

class IncidentReportController extends Controller {

    public function store(Request $request) {
        $request->validate([
            'category' => 'required',
            'location' => 'required|string',
            'description' => 'required|string',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('incident_photos', 'public');
        }

        $report = IncidentReport::create([
            'user_id' => $request->user()->id,
            'category' => $request->category,
            'location' => $request->location,
            'description' => $request->description,
            'photo' => $photoPath,
            'status' => 'Reported',
        ]);

        return response()->json([
            'message' => 'Incident report submitted successfully!',
            'report' => $report
        ], 201);
    }

    public function index(Request $request) {
        $reports = IncidentReport::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')->get();
        return response()->json($reports);
    }

    public function allReports(Request $request) {
        $query = IncidentReport::with('user')->orderBy('created_at', 'desc');
        if ($request->status) $query->where('status', $request->status);
        if ($request->category) $query->where('category', $request->category);
        return response()->json($query->paginate(15));
    }

    public function updateStatus(Request $request, $id) {
        $request->validate(['status' => 'required']);
        $report = IncidentReport::findOrFail($id);
        $report->update([
            'status' => $request->status,
            'admin_response' => $request->admin_response,
        ]);
        return response()->json(['message' => 'Incident status updated', 'report' => $report]);
    }
}