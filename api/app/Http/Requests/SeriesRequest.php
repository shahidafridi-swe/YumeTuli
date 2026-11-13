<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SeriesRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $series = $this->route('series');
        $required = $series ? 'sometimes' : 'required';

        return [
            'slug' => [$required, 'string', 'max:64', 'regex:/^[a-z0-9-]+$/', Rule::unique('series', 'slug')->ignore($series)],
            'name' => [$required, 'string', 'max:120'],
            'folder' => [$required, 'string', 'max:64', 'regex:/^[a-z0-9-]+$/'],
            'project_id' => [$required, 'integer', 'exists:projects,id'],
            'theme' => ['nullable', 'array'],
            'rules' => ['nullable', 'string', 'max:20000'],
        ];
    }
}
