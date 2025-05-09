<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Get notifications for the authenticated user
     */
    public function index(Request $request)
    {
        // Determine user type and ID
        $user = $request->user();
        $userType = $this->getUserType($user);
        $userId = $user->id;

        // Get personal notifications and broadcast notifications for this user type
        $notifications = Notification::where(function($query) use ($userType, $userId) {
            // Personal notifications
            $query->where('user_type', $userType)
                ->where('user_id', $userId);
        })
            ->orWhere(function($query) use ($userType) {
                // Broadcast notifications for this user type
                $query->where('user_type', $userType)
                    ->where('broadcast', true);
            })
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        return response()->json($notifications);
    }

    /**
     * Check for timetable updates
     */
    public function checkTimetableUpdates(Request $request)
    {
        // Determine user type and ID
        $user = $request->user();
        $userType = $this->getUserType($user);
        $userId = $user->id;

        // Get the most recent unread timetable notification for this user
        $latestTimetableNotification = Notification::where('type', 'timetable-update')
            ->where(function($query) use ($userType, $userId) {
                // Personal notifications
                $query->where('user_type', $userType)
                    ->where('user_id', $userId);
            })
            ->orWhere(function($query) use ($userType) {
                // Broadcast notifications for this user type
                $query->where('user_type', $userType)
                    ->where('broadcast', true);
            })
            ->where('read', false)
            ->orderBy('created_at', 'desc')
            ->first();

        // Also check for read markers
        $hasReadMarker = false;
        if ($latestTimetableNotification && $latestTimetableNotification->broadcast) {
            $hasReadMarker = Notification::where('type', 'read-marker')
                ->where('user_type', $userType)
                ->where('user_id', $userId)
                ->where('data->notification_id', $latestTimetableNotification->id)
                ->exists();
        }

        return response()->json([
            'hasUpdates' => $latestTimetableNotification && !$hasReadMarker ? true : false,
            'id' => $latestTimetableNotification ? $latestTimetableNotification->id : null,
            'date' => $latestTimetableNotification ? $latestTimetableNotification->created_at : null
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        // Determine user type and ID
        $user = $request->user();
        $userType = $this->getUserType($user);
        $userId = $user->id;

        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        // Check if this notification is for this user
        if (($notification->user_type === $userType && $notification->user_id === $userId) ||
            ($notification->user_type === $userType && $notification->broadcast)) {

            // For broadcast notifications, create a personal "read" marker
            if ($notification->broadcast) {
                // Check if a personal read marker already exists
                $existingMarker = Notification::where('type', 'read-marker')
                    ->where('user_type', $userType)
                    ->where('user_id', $userId)
                    ->where('data->notification_id', $notification->id)
                    ->first();

                if (!$existingMarker) {
                    // Create a read marker
                    Notification::create([
                        'type' => 'read-marker',
                        'message' => 'Read marker',
                        'user_type' => $userType,
                        'user_id' => $userId,
                        'broadcast' => false,
                        'read' => true,
                        'data' => json_encode([
                            'notification_id' => $notification->id
                        ])
                    ]);
                }
            } else {
                // For personal notifications, just mark as read
                $notification->read = true;
                $notification->save();
            }

            return response()->json(['success' => true]);
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        // Determine user type and ID
        $user = $request->user();
        $userType = $this->getUserType($user);
        $userId = $user->id;

        // Get all unread broadcast notifications
        $broadcastNotifications = Notification::where('user_type', $userType)
            ->where('broadcast', true)
            ->where('read', false)
            ->get();

        // Create read markers for all broadcast notifications
        foreach ($broadcastNotifications as $notification) {
            // Check if a personal read marker already exists
            $existingMarker = Notification::where('type', 'read-marker')
                ->where('user_type', $userType)
                ->where('user_id', $userId)
                ->where('data->notification_id', $notification->id)
                ->first();

            if (!$existingMarker) {
                // Create a read marker
                Notification::create([
                    'type' => 'read-marker',
                    'message' => 'Read marker',
                    'user_type' => $userType,
                    'user_id' => $userId,
                    'broadcast' => false,
                    'read' => true,
                    'data' => json_encode([
                        'notification_id' => $notification->id
                    ])
                ]);
            }
        }

        // Mark personal notifications as read
        Notification::where('user_type', $userType)
            ->where('user_id', $userId)
            ->where('read', false)
            ->update(['read' => true]);

        return response()->json(['success' => true]);
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
