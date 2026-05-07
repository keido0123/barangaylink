<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest;
use App\Models\SmsLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DocumentRequestController extends Controller {

    private function sendSms($phone, $message, $userId) {
        try {
            $sid = env('TWILIO_SID');
            $token = env('TWILIO_TOKEN');
            $from = env('TWILIO_FROM');

            if ($sid && $token) {
                $client = new \Twilio\Rest\Client($sid, $token);
                $client->messages->create($phone, ['from' => $from, 'body' => $message]);
            }

            SmsLog::create([
                'user_id' => $userId,
                'phone' => $phone,
                'message' => $message,
                'status' => 'Sent'
            ]);
        } catch (\Exception $e) {
            SmsLog::create([
                'user_id' => $userId,
                'phone' => $phone,
                'message' => $message,
                'status' => 'Failed'
            ]);
        }
    }

    public function store(Request $request) {
        $request->validate([
            'document_type' => 'required',
            'purpose' => 'required|string',
        ]);

        $trackingCode = 'BRG-' . strtoupper(Str::random(8));

        $docRequest = DocumentRequest::create([
            'user_id' => $request->user()->id,
            'document_type' => $request->document_type,
            'purpose' => $request->purpose,
            'tracking_code' => $trackingCode,
            'status' => 'Pending',
        ]);

        $user = $request->user();
        $smsMsg = "St. Catalina Barangay: Your {$request->document_type} request has been received. Tracking Code: {$trackingCode}. We will notify you of updates.";
        $this->sendSms($user->phone, $smsMsg, $user->id);

        return response()->json([
            'message' => 'Document request submitted!',
            'tracking_code' => $trackingCode,
            'request' => $docRequest->load('user')
        ], 201);
    }

    public function index(Request $request) {
        $requests = DocumentRequest::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($requests);
    }

    public function track($code) {
        $req = DocumentRequest::where('tracking_code', $code)->with('user')->first();
        if (!$req) return response()->json(['message' => 'Tracking code not found'], 404);
        return response()->json($req);
    }

    // Admin methods
    public function allRequests(Request $request) {
        $query = DocumentRequest::with('user')->orderBy('created_at', 'desc');
        if ($request->status) $query->where('status', $request->status);
        if ($request->type) $query->where('document_type', $request->type);
        return response()->json($query->paginate(15));
    }

    public function updateStatus(Request $request, $id) {
        $request->validate(['status' => 'required']);
        $docRequest = DocumentRequest::with('user')->findOrFail($id);
        $docRequest->update([
            'status' => $request->status,
            'remarks' => $request->remarks,
            'or_number' => $request->or_number,
            'released_at' => $request->status === 'Released' ? now() : null,
        ]);

        $statusMessages = [
            'Processing' => "Your {$docRequest->document_type} (#{$docRequest->tracking_code}) is now being processed.",
            'Ready' => "Your {$docRequest->document_type} (#{$docRequest->tracking_code}) is READY for pickup at the Barangay Hall.",
            'Released' => "Your {$docRequest->document_type} (#{$docRequest->tracking_code}) has been released. Thank you!",
            'Rejected' => "Your {$docRequest->document_type} (#{$docRequest->tracking_code}) was rejected. Reason: {$request->remarks}",
        ];

        if (isset($statusMessages[$request->status])) {
            $this->sendSms($docRequest->user->phone, $statusMessages[$request->status], $docRequest->user_id);
        }

        return response()->json(['message' => 'Status updated', 'request' => $docRequest]);
    }
}