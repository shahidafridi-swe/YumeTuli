<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class AssetController extends Controller
{
    /** Signed-URL download/stream. Local files support Range requests (seeking in <video>). */
    public function download(Asset $asset): Response
    {
        $disk = Storage::disk($asset->disk);

        if (config("filesystems.disks.{$asset->disk}.driver") === 'local') {
            return response()->file($disk->path($asset->path), [
                'Content-Type' => $asset->mime ?? 'application/octet-stream',
                'Content-Disposition' => 'inline; filename="'.addslashes($asset->original_name ?? basename($asset->path)).'"',
            ]);
        }

        return redirect()->away($disk->temporaryUrl($asset->path, now()->addMinutes(5)));
    }
}
