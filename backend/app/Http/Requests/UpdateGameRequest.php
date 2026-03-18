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
}
