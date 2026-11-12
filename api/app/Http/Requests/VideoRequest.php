<?php

namespace App\Http\Requests;

use App\Enums\Language;
use App\Enums\VideoMode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VideoRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $creating = $this->route('video') === null;
        $required = $creating ? 'required' : 'sometimes';

        return [
            'series_id' => [$required, 'integer', 'exists:series,id'],
            'title' => [$required, 'string', 'max:160'],
            'language' => [$required, Rule::enum(Language::class)],
            'context' => ['nullable', 'string', 'max:5000'],
            'script' => [$required, 'string', 'max:50000'],
            'target_seconds' => ['nullable', 'integer', 'between:10,600'],
            'mode' => ['sometimes', Rule::enum(VideoMode::class)],
            'voice' => [
                $creating ? 'required' : 'sometimes',
                'file',
                'max:'.config('yumetuli.max_voice_kb'),
                'extensions:mp3,wav,m4a',
                'mimetypes:audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/wave,audio/mp4,audio/x-m4a,audio/aac,video/mp4',
            ],
        ];
    }
}
