<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\Attributes\StopOnFirstFailure;

#[StopOnFirstFailure]
class LoginRequest extends BaseRequest
{
    protected string $errorMessage = 'Endereço de e-mail ou senha inválidos.';

    protected bool $includeErrors = false;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
