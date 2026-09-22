<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
     protected $fillable = ['admin_id','title','content','priority','is_published'];

    public function admin() {
        return $this->belongsTo(Admin::class);
    }
}
