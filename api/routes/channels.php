<?php

use Illuminate\Support\Facades\Broadcast;

// Single-owner app: any authenticated user may follow a video's live progress.
Broadcast::channel('video.{videoId}', fn ($user) => $user !== null);
