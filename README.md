# Backend

## Informações gerais e abordagem

Comecei o desenvolvimento do projeto pelo backend.

Utilizei a abordagem de TDD, mapeando os comportamentos esperados e seguindo o ciclo clássico: **Red > Green > Refactor**.

Comecei pelas funcionalidades de login, logout, perfil e registro, e depois fui para o restante. Algumas partes ficaram bem confusas no README do desafio, então segui meus instintos avaliando o que seria mais coerente de acordo com o escopo.

> A tabela de classificação é calculada dinamicamente, não é persistida no banco de dados, então todos os dados de pontuação são refletidos de forma imediata.

## Testes

**100%** de cobertura de testes, com todos os testes **OK**.

```
Tests: 75 passed (325 assertions)

  Http/Controllers/Api\AuthController  100.0%
  Http/Controllers/Api\BaseController  100.0%
  Http/Controllers/Api\GameController  100.0%
  Http/Controllers/Api\ScoreboardController  100.0%
  Http/Controllers/Api\TeamController  100.0%
  Http/Controllers\Controller  100.0%
  Http/Requests\BaseRequest  100.0%
  Http/Requests\LoginRequest  100.0%
  Http/Requests\RegisterRequest  100.0%
  Http/Requests\StoreGameRequest  100.0%
  Http/Requests\StoreTeamRequest  100.0%
  Http/Requests\UpdateGameRequest  100.0%
  Http/Requests\UpdateProfileRequest  100.0%
  Http/Requests\UpdateTeamRequest  100.0%
  Http/Resources\GameResource  100.0%
  Http/Requests\UpdateTeamRequest  100.0%
  Http/Resources\GameResource  100.0%
  Http/Resources\GameResource  100.0%
  Http/Resources\TeamResource  100.0%
  Models\Game  100.0%
  Models\Game  100.0%
  Models\Team  100.0%
  Models\User  100.0%
  Policies\GamePolicy  100.0%
  Policies\TeamPolicy  100.0%
  Providers\AppServiceProvider  100.0%
  Services\AuthService  100.0%
  Services\GameService  100.0%
  Services\ScoreboardService  100.0%

Total: 100.0 %
```

## Documentação

Gerei uma collection do postman que pode ser utilizada como referência e para testar a API.

> [🔗 Brasileirão API.postman_collection.json](/Brasileirão%20API.postman_collection.json).
