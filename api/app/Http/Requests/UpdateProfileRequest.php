<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'locale' => ['sometimes', Rule::in(config('yumetuli.locales'))],
            'theme' => ['sometimes', Rule::in(['light', 'dark', 'system'])],
            'timezone' => ['sometimes', 'timezone:all'],
        ];
    }
}
