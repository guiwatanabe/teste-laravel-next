<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class TeamPolicy
{
    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        return $user->role === 'admin' ? true : null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(): Response
    {
        return Response::deny('Você não tem permissão para visualizar os times.');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(): Response
    {
        return Response::deny('Você não tem permissão para visualizar os times.');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(): Response
    {
        return Response::deny('Você não tem permissão para criar um time.');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(): Response
    {
        return Response::deny('Você não tem permissão para editar um time.');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(): Response
    {
        return Response::deny('Você não tem permissão para deletar um time.');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(): Response
    {
        return Response::deny('Você não tem permissão para restaurar um time.');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(): Response
    {
        return Response::deny('Você não tem permissão para deletar permanentemente um time.');
    }
}
