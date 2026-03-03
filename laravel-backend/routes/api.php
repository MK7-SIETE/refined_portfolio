<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;

/*
 |─────────────────────────────────────────────────────
 | API Routes — Betsaleel Mukuba Portfolio
 |─────────────────────────────────────────────────────
 | These routes are loaded by RouteServiceProvider.
 | They are prefixed with /api automatically.
 |
 | Usage:
 |   POST  https://yourdomain.com/api/contact
 |─────────────────────────────────────────────────────
 */

// Contact form route — handles form submission + auto-reply
Route::post('/contact', [ContactController::class, 'send']);
Route::options('/contact', fn() => response()->json([], 200));

// Health check (optional — for monitoring)
Route::get('/health', fn() => response()->json(['status' => 'ok', 'service' => 'Betsaleel Mukuba Portfolio API']));
