<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest;
use App\Models\IncidentReport;
use App\Models\Resident;
use App\Models\User;
use App\Models\Announcement;

class DashboardController extends Controller {

    public function adminStats() {
        $docStats = DocumentRequest::selectRaw('status, count(*) as count')
            ->groupBy('status')->pluck('count', 'status');

        $incidentStats = IncidentReport::selectRaw('category, count(*) as count')
            ->groupBy('category')->pluck('count', 'category');

        $incomeCluster = User::selectRaw('income_class, count(*) as count')
            ->groupBy('income_class')->pluck('count', 'income_class');

        $docTypes = DocumentRequest::selectRaw('document_type, count(*) as count')
            ->groupBy('document_type')->pluck('count', 'document_type');

        $monthlyRequests = DocumentRequest::selectRaw('MONTH(created_at) as month, count(*) as count')
            ->whereYear('created_at', date('Y'))
            ->groupBy('month')->pluck('count', 'month');

        return response()->json([
            'total_users' => User::count(),
            'total_residents' => Resident::count(),
            'total_document_requests' => DocumentRequest::count(),
            'total_incidents' => IncidentReport::count(),
            'pending_requests' => DocumentRequest::where('status', 'Pending')->count(),
            'pending_incidents' => IncidentReport::where('status', 'Reported')->count(),
            'document_status' => $docStats,
            'incident_categories' => $incidentStats,
            'income_clusters' => $incomeCluster,
            'document_types' => $docTypes,
            'monthly_requests' => $monthlyRequests,
        ]);
    }
}