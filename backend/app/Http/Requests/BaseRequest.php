<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class BaseRequest extends FormRequest
{
    /**
     * Mensagem que será incluída no campo 'message'.
     */
    protected string $errorMessage = 'Falha na validação dos dados.';

    /**
     * Define se os erros de validação devem ser incluídos na resposta.
     */
    protected bool $includeErrors = true;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function failedValidation(Validator $validator)
    {
        $statusCode = 422;

        $response = [
            'status' => 'error',
            'message' => $this->errorMessage,
        ];

        if ($this->includeErrors) {
            $response['errors'] = $validator->errors();
        }

        throw new HttpResponseException(
            response()->json($response)->setStatusCode($statusCode)
        );
    }
}
