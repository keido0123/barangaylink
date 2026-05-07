<?php
namespace Database\Seeders;

use App\Models\Admin;
use App\Models\User;
use App\Models\Resident;
use App\Models\Announcement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder {
    public function run(): void {

        // Create Super Admin
        Admin::create([
            'name' => 'Barangay Captain',
            'email' => 'admin@stcatalina.gov.ph',
            'password' => Hash::make('admin123'),
            'role' => 'Super Admin',
            'phone' => '+639171234567',
        ]);

        // Create dummy user - Regina Jimenez
        $user = User::create([
            'name' => 'Regina Jimenez',
            'email' => 'regina@email.com',
            'password' => Hash::make('password123'),
            'phone' => '+639635267587',
            'address' => '3413 Rizal St., Brgy. Sta. Catalina',
            'birthdate' => '1990-05-15',
            'gender' => 'Female',
            'purok' => 'Purok 3',
            'civil_status' => 'Single',
            'income_class' => 'Middle Class',
            'is_voter' => true,
            'is_verified' => true,
        ]);

        // Create resident record for Regina
        Resident::create([
            'user_id' => $user->id,
            'full_name' => 'Regina Jimenez',
            'birthdate' => '1990-05-15',
            'gender' => 'Female',
            'address' => '3413 St., Brgy. Sta. Catalina',
            'purok' => 'Purok 3',
            'phone' => '+635267587',
            'civil_status' => 'Single',
            'income_class' => 'Middle Class',
            'is_voter' => true,
            'occupation' => 'Teacher',
        ]);

        // Sample announcement
        Announcement::create([
            'admin_id' => 1,
            'title' => 'Welcome to St. Catalina BarangayLink E-Services!',
            'content' => 'We are proud to launch our online document request system. You can now request Barangay Clearance, Certificate of Indigency, Residency, and Voter\'s Certificate online. Track your requests in real-time!',
            'priority' => 'Normal',
            'is_published' => true,
        ]);

        Announcement::create([
            'admin_id' => 1,
            'title' => 'Barangay Assembly - May 15, 2026',
            'content' => 'All residents are invited to attend the Barangay Assembly on May 15, 2026 at 2:00 PM at the Barangay Hall covered court. Important community matters will be discussed.',
            'priority' => 'Urgent',
            'is_published' => true,
        ]);
    }
}