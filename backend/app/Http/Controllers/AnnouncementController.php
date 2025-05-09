<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    /**
     * Store a new announcement and create notifications for recipients
     */
    public function store(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'recipients' => 'required|array|min:1',
            'recipients.*' => 'required|string|in:student,teacher,user',
        ]);

        // Get the user for logging
        $user = $request->user();
        $senderName = $user->name;
        $senderId = $user->id;

        try {
            // Create notifications for each recipient type
            foreach ($validated['recipients'] as $recipientType) {
                $notification = new Notification();
                $notification->type = 'announcement';
                $notification->message = $validated['title'];
                $notification->user_type = $recipientType;
                $notification->broadcast = true;
                $notification->read = false;

                // Store additional data as a JSON string
                $data = [
                    'body' => $validated['body'],
                    'sender_name' => $senderName,
                    'sender_id' => $senderId,
                    'sender_type' => 'user', // Admin users
                    'created_at' => now()->toIso8601String()
                ];

                $notification->data = json_encode($data);
                $notification->save();

                Log::info("Created announcement notification for {$recipientType}s", [
                    'title' => $validated['title'],
                    'sender' => $senderName
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Announcement sent successfully',
                'recipients' => $validated['recipients']
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create announcement notifications', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send announcement: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * List all announcements filtered by user type
     */
    public function index(Request $request)
    {
        // Get the current user type based on which guard is authenticated
        $userType = $this->getUserType($request->user());

        // Only fetch announcements for this user type (or admins fetch all)
        $query = Notification::where('type', 'announcement');

        // If not an admin, filter by user type
        if ($userType !== 'user') {
            $query->where('user_type', $userType);
        }

        $announcements = $query->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('message') // Group by title (to avoid duplicates for different recipient types)
            ->map(function ($group) {
                $item = $group->first();
                $recipients = $group->pluck('user_type')->toArray();

                // Decode data in a safe way
                $decodedData = [];
                if (!empty($item->data)) {
                    try {
                        if (is_string($item->data)) {
                            $decodedData = json_decode($item->data, true) ?: [];
                        } else {
                            $decodedData = $item->data;
                        }
                    } catch (\Exception $e) {
                        Log::error('Error decoding notification data', [
                            'notification_id' => $item->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }

                return [
                    'id' => $item->id,
                    'title' => $item->message,
                    'body' => $decodedData['body'] ?? '',
                    'sender_name' => $decodedData['sender_name'] ?? 'Unknown',
                    'recipients' => $recipients,
                    'created_at' => $item->created_at
                ];
            })
            ->values();

        return response()->json($announcements);
    }

    /**
     * Get announcement details by ID
     */
    public function show(Request $request, $id)
    {
        $notification = Notification::find($id);

        if (!$notification || $notification->type !== 'announcement') {
            return response()->json([
                'success' => false,
                'message' => 'Announcement not found'
            ], 404);
        }

        // Check if the user has permission to view this announcement
        $userType = $this->getUserType($request->user());

        // If not admin and this announcement is not for this user type, return 403
        if ($userType !== 'user' && $notification->user_type !== $userType) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view this announcement'
            ], 403);
        }

        // Decode data in a safe way
        $decodedData = [];
        if (!empty($notification->data)) {
            try {
                if (is_string($notification->data)) {
                    $decodedData = json_decode($notification->data, true) ?: [];
                } else {
                    $decodedData = $notification->data;
                }
            } catch (\Exception $e) {
                Log::error('Error decoding notification data', [
                    'notification_id' => $notification->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return response()->json([
            'id' => $notification->id,
            'title' => $notification->message,
            'body' => $decodedData['body'] ?? '',
            'sender_name' => $decodedData['sender_name'] ?? 'Unknown',
            'recipient_type' => $notification->user_type,
            'created_at' => $notification->created_at
        ]);
    }

    /**
     * Delete an announcement (admin only)
     */
    public function destroy(Request $request, $id)
    {
        $notification = Notification::find($id);

        if (!$notification || $notification->type !== 'announcement') {
            return response()->json([
                'success' => false,
                'message' => 'Announcement not found'
            ], 404);
        }

        // Delete all notifications with the same title and type (all recipient groups)
        Notification::where('type', 'announcement')
            ->where('message', $notification->message)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Announcement deleted successfully'
        ]);
    }

    /**
     * Helper method to determine user type
     */
    private function getUserType($user)
    {
        if ($user instanceof \App\Models\Teacher) {
            return 'teacher';
        } elseif ($user instanceof \App\Models\Student) {
            return 'student';
        } else {
            return 'user'; // For regular users (admins)
        }
    }
}
