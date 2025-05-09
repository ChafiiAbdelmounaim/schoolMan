<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'type',          // Type of notification: 'timetable-update', 'announcement', 'read-marker', etc.
        'message',       // The title or main message of the notification
        'user_type',     // 'user' (admin), 'teacher', or 'student'
        'user_id',       // Specific user ID in respective table, or null for broadcast
        'broadcast',     // Whether this is a broadcast to all users of a type
        'read',          // Whether the notification has been read
        'data',          // JSON data for additional information
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'read' => 'boolean',
        'broadcast' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the notification data as an array.
     *
     * @return array
     */
    public function getDataAttribute($value)
    {
        if (empty($value)) {
            return [];
        }

        if (is_string($value)) {
            try {
                return json_decode($value, true) ?: [];
            } catch (\Exception $e) {
                return [];
            }
        }

        return $value;
    }

    /**
     * Set the notification data.
     *
     * @param  array|string  $value
     * @return void
     */
    public function setDataAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['data'] = json_encode($value);
        } else {
            $this->attributes['data'] = $value;
        }
    }
}
