<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller {

    public function index() {
        $announcements = Announcement::with('admin')
            ->where('is_published', true)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($announcements);
    }

    public function store(Request $request) {
        $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'priority' => 'required|in:Normal,Urgent,Emergency',
        ]);

        $announcement = Announcement::create([
            'admin_id' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->input ('content'),
            'priority' => $request->priority,
            'is_published' => true,
        ]);

        return response()->json([
            'message' => 'Announcement published!',
            'announcement' => $announcement
        ], 201);
    }

    public function destroy($id) {
        Announcement::findOrFail($id)->delete();
        return response()->json(['message' => 'Announcement deleted']);
    }
}