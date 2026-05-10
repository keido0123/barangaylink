<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\AdminAuthController;
use App\Http\Controllers\API\DocumentRequestController;
use App\Http\Controllers\API\IncidentReportController;
use App\Http\Controllers\API\AnnouncementController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\ResidentController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::get('/track/{code}', [DocumentRequestController::class, 'track']);
Route::get('/announcements', [AnnouncementController::class, 'index']);

// User protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/documents', [DocumentRequestController::class, 'store']);
    Route::get('/documents', [DocumentRequestController::class, 'index']);
    Route::post('/incidents', [IncidentReportController::class, 'store']);
    Route::get('/incidents', [IncidentReportController::class, 'index']);
});

// Admin protected routes
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/profile', [AdminAuthController::class, 'profile']);
    Route::get('/dashboard', [DashboardController::class, 'adminStats']);
    Route::get('/documents', [DocumentRequestController::class, 'allRequests']);
    Route::put('/documents/{id}/status', [DocumentRequestController::class, 'updateStatus']);
    Route::get('/incidents', [IncidentReportController::class, 'allReports']);
    Route::put('/incidents/{id}/status', [IncidentReportController::class, 'updateStatus']);
    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
    Route::get('/residents', [ResidentController::class, 'index']);
    Route::post('/residents', [ResidentController::class, 'store']);
    Route::put('/residents/{id}', [ResidentController::class, 'update']);
    Route::delete('/residents/{id}', [ResidentController::class, 'destroy']);
});