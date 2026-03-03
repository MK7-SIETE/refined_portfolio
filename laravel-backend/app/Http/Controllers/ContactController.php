<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\RateLimiter;
use App\Mail\ContactNotification;
use App\Mail\ContactAutoReply;

/**
 * ═══════════════════════════════════════════════
 * ContactController.php
 * Betsaleel Mukuba Portfolio — Laravel Backend
 *
 * Handles the contact form POST request:
 *  1. Validates & sanitises input
 *  2. Rate-limits by IP (3 per hour)
 *  3. Sends notification email to owner
 *  4. Sends branded auto-reply to visitor
 * ═══════════════════════════════════════════════
 */
class ContactController extends Controller
{
    /**
     * Handle incoming contact form submission.
     */
    public function send(Request $request)
    {
        // ── CORS Headers ──────────────────────────
        if ($request->isMethod('OPTIONS')) {
            return response()->json([], 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Accept');
        }

        // ── Rate Limiting (3 per hour per IP) ─────
        $key = 'contact:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            return $this->jsonError(
                "Too many requests. Please wait {$seconds} seconds before trying again.",
                429
            );
        }
        RateLimiter::hit($key, 3600); // decay: 1 hour

        // ── Validation ────────────────────────────
        $validator = Validator::make($request->all(), [
            'name'    => 'required|string|min:2|max:100',
            'email'   => 'required|email|max:255',
            'subject' => 'nullable|string|max:200',
            'message' => 'required|string|min:10|max:3000',
        ], [
            'name.required'    => 'Please enter your full name.',
            'name.min'         => 'Name must be at least 2 characters.',
            'email.required'   => 'Please enter your email address.',
            'email.email'      => 'Please enter a valid email address.',
            'message.required' => 'Please enter a message.',
            'message.min'      => 'Message must be at least 10 characters.',
        ]);

        if ($validator->fails()) {
            return $this->jsonError($validator->errors()->first(), 422);
        }

        // ── Sanitise ─────────────────────────────
        $data = [
            'name'    => strip_tags($request->input('name')),
            'email'   => filter_var($request->input('email'), FILTER_SANITIZE_EMAIL),
            'subject' => strip_tags($request->input('subject', 'General Enquiry')),
            'message' => strip_tags($request->input('message')),
        ];

        try {
            // 1️⃣ Notify owner (mukuba950@gmail.com)
            Mail::to(config('mail.owner_email', 'mukuba950@gmail.com'))
                ->send(new ContactNotification($data));

            // 2️⃣ Auto-reply to visitor
            Mail::to($data['email'])
                ->send(new ContactAutoReply($data));

            return response()->json([
                'success' => true,
                'message' => "Message sent, {$data['name']}! I'll reply within 24 hours.",
            ], 200)->header('Access-Control-Allow-Origin', '*');

        } catch (\Exception $e) {
            \Log::error('Contact form mail failed: ' . $e->getMessage());
            return $this->jsonError(
                'Failed to send message. Please email directly: mukuba950@gmail.com',
                500
            );
        }
    }

    /**
     * Helper: return standardised JSON error response.
     */
    private function jsonError(string $message, int $status = 400)
    {
        return response()->json(['error' => $message], $status)
            ->header('Access-Control-Allow-Origin', '*');
    }
}
