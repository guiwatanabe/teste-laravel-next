<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class StoreGameRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'home_team_id' => ['required', 'exists:teams,id'],
            'away_team_id' => ['required', 'exists:teams,id', 'different:home_team_id'],
            'played_at' => ['required', 'date', Rule::date()->after('now')],
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
            'home_team_id.required' => 'Favor preencher o campo time da casa.',
            'home_team_id.exists' => 'O time da casa selecionado é inválido.',
            'away_team_id.required' => 'Favor preencher o campo time visitante.',
            'away_team_id.exists' => 'O time visitante selecionado é inválido.',
            'away_team_id.different' => 'O time visitante deve ser diferente do time da casa.',
            'played_at.required' => 'Favor preencher a data e hora da partida.',
            'played_at.date' => 'Data inválida.',
            'played_at.after' => 'A data deve ser no futuro.',
        ];
    }
}
