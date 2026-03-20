<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class UpdateTeamRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('teams', 'name')->ignore($this->route('id'))],
            'abbreviation' => ['sometimes', 'string', 'size:3', Rule::unique('teams', 'abbreviation')->ignore($this->route('id'))],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.string' => 'Nome do time inválido.',
            'name.max' => 'O nome do time não pode exceder 255 caracteres.',
            'abbreviation.string' => 'Sigla do time inválida.',
            'abbreviation.size' => 'A sigla do time deve conter exatamente 3 caracteres.',
            'abbreviation.unique' => 'Já existe um time com essa sigla.',
        ];
    }
}
