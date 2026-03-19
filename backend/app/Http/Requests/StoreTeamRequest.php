<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;

class StoreTeamRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'abbreviation' => ['required', 'string', 'size:3', 'unique:teams,abbreviation'],
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
            'name.required' => 'Favor preencher o nome do time.',
            'name.string' => 'Nome do time inválido.',
            'name.max' => 'O nome do time não pode exceder 255 caracteres.',
            'abbreviation.required' => 'Favor preencher a sigla do time.',
            'abbreviation.string' => 'Sigla do time inválida.',
            'abbreviation.size' => 'A sigla do time deve conter exatamente 3 caracteres.',
            'abbreviation.unique' => 'Já existe um time com essa sigla.',
        ];
    }
}
