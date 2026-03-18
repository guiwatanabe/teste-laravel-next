<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->user()->id)],
            'current_password' => ['required_with:password', 'string', 'current_password'],
            'password' => ['sometimes', 'filled', 'string', 'min:8', 'confirmed'],
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
            'name.string' => 'Nome inválido',
            'name.max' => 'O nome não pode ter mais de 255 caracteres',
            'email.email' => 'O e-mail deve ser um endereço de e-mail válido',
            'email.unique' => 'O e-mail já está em uso',
            'email.max' => 'O e-mail não pode ter mais de 255 caracteres',
            'password.min' => 'A senha deve ter pelo menos 8 caracteres',
            'password.confirmed' => 'A confirmação da senha não corresponde',
            'current_password.required_with' => 'A senha atual é obrigatória para alterar a senha',
            'current_password.string' => 'Senha atual inválida',
            'current_password.current_password' => 'A senha atual está incorreta',
        ];
    }
}
