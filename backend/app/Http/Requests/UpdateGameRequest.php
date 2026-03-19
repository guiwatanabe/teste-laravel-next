<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;

class UpdateGameRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'home_team_goals' => ['sometimes', 'integer', 'min:0'],
            'away_team_goals' => ['sometimes', 'integer', 'min:0'],
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
            'home_team_goals.integer' => 'Número de gols do time da casa deve ser um número inteiro.',
            'home_team_goals.min' => 'O número de gols do time da casa não pode ser negativo.',
            'away_team_goals.integer' => 'O número de gols do time visitante deve ser um número inteiro.',
            'away_team_goals.min' => 'O número de gols do time visitante não pode ser negativo.',
        ];
    }
}
