# Rodando a aplicação

## Requisitos

- Docker

## Portas

- *api* - **8000**
- *mysql* - **3306**
- *frontend* - **80**

```bash
git clone https://github.com/guiwatanabe/teste-laravel-next.git

cd teste-laravel-next

cp backend/.env.example backend/.env

docker compose up
```

---

## Backend

### Informações gerais e abordagem

Comecei o desenvolvimento do projeto pelo backend.

Utilizei a abordagem de TDD, mapeando os comportamentos esperados e seguindo o ciclo clássico: **Red > Green > Refactor**.

Comecei pelas funcionalidades de login, logout, perfil e registro, e depois fui para o restante. Algumas partes ficaram bem confusas no README do desafio, então segui meus instintos avaliando o que seria mais coerente de acordo com o escopo.

> A tabela de classificação é calculada dinamicamente, não é persistida no banco de dados, então todos os dados de pontuação são refletidos de forma imediata.

### Testes

**100%** de cobertura de testes, com todos os testes **OK**.

```
Tests: 81 passed (343 assertions)

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
  Http/Resources\TeamResource  100.0%  
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

### Documentação

Gerei uma collection do postman que pode ser utilizada como referência e para testar a API.

> [🔗 Brasileirão API.postman_collection.json](/Brasileirão%20API.postman_collection.json).

## Frontend

#### Stack e ferramentas:
  - Next.js 16
  - TailwindCSS para estilização
  - shadcn para componentes
  - React Hook Form para formulários
  - zod para validação
  - axios como cliente http para integrar com a API
  - vitest

#### Funcionalidades:
  - Autenticação (access_token com duração curta, refresh_token com cookie httpOnly)
  - Controle de acesso por roles (RBAC)
  - Edição do perfil do usuário logado
  - Área admin com gerenciamento de times e partidas
  - Área user com visualização da tabela de classificação
  - Paginação e filtros

#### Tratamento de erros e feedback visual:
  - Interceptor de erros HTTP na camada de serviços
  - Exibição de mensagens amigáveis
  - Validação de formulários com feedback imediato e amigável

#### Responsividade e UX
  - Layout consistente, simples e responsivo