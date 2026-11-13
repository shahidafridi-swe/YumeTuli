<?php

return [
    'invalid_credentials' => 'The email or password is incorrect.',
    'invalid_token' => 'Your session has expired. Please log in again.',
    'series_in_use' => 'This series has videos and cannot be deleted.',
    'video_not_editable' => 'Only draft videos can be edited.',
    'video_running' => 'This video is being generated. Cancel it first.',
    'invalid_transition' => 'Cannot :action while the video is :status.',
    'no_active_run' => 'Nothing is running for this video.',
    'no_session' => 'There is no Claude session to continue. Make a plan first.',
    'run_timed_out' => 'Stopped after :minutes minutes (time limit).',
    'run_no_plan' => 'Claude finished without writing the plan file.',
    'run_no_result' => 'Claude finished without a RESULT line, so no video was imported.',
    'run_usage_limit' => 'Claude usage limit reached. Try again later with Retry.',
    'run_claude_error' => 'Claude stopped with an error: :message',
    'project_in_use' => 'This project has series and cannot be deleted.',
    'outro_needs_logo' => 'Upload a logo first.',
    'outro_needs_video' => 'Upload an outro video first.',
    'outro_needs_custom' => 'Generate a custom outro first.',
    'outro_busy' => 'The outro is already being made. Wait for it to finish.',
];
