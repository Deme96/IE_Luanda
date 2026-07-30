# Documentação do Sistema - Gestão Eclesiástica Pro

## Arquitetura
O sistema segue o modelo cliente-servidor (Fullstack Monorepo):
1. **Frontend (`/frontend`)**: Aplicação React com Vite. Responsável pela UI, consumo de API, e o site público.
2. **Backend (`/backend`)**: API REST construída em Node.js com Express.
3. **Database (`/database`)**: Scripts e modelos para PostgreSQL.

## Tecnologias Utilizadas
- **Frontend**: React 18, Vite, Tailwind CSS v4, shadcn/ui, Recharts.
- **Backend**: Node.js, Express, `pg` (node-postgres), CORS.
- **Banco de Dados**: PostgreSQL.

## Configuração e Inicialização

### 1. Banco de Dados
1. Instale e inicie um servidor PostgreSQL.
2. Crie um banco de dados chamado `gestao_igreja`.
3. Execute o script `database/schema.sql` no banco para criar as tabelas.

### 2. Backend
1. Navegue até a pasta `backend`: `cd backend`
2. Instale as dependências: `npm install`
3. Crie um arquivo `.env` na pasta `backend` com as credenciais do banco:
   ```env
   PORT=3000
   DB_USER=postgres
   DB_PASSWORD=sua_senha
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=gestao_igreja
   ```
4. Inicie o servidor: `npm start` (ou `node server.js`).

### 3. Frontend
1. Navegue até a pasta `frontend`: `cd frontend`
2. Instale as dependências: `npm install`
3. Inicie o servidor de desenvolvimento: `npm run dev`
4. A aplicação estará disponível em `http://localhost:5173`.

> **Nota:** Atualmente, a persistência de dados no Frontend é realizada por um Mock (simulando um BaaS local chamado Base44). Para conectar completamente o frontend à nova API, as chamadas no arquivo `frontend/src/base44/index.js` devem ser substituídas pelas chamadas `fetch()` apontando para `http://localhost:3000/api/...`.

## Estrutura do Banco de Dados
O schema contempla as seguintes tabelas principais:
- `usuarios`: Autenticação.
- `igrejas_filiadas`: Igrejas secundárias/filiais.
- `membros`: Cadastro geral de membros.
- `lideres` & `conselho_presbiterio`: Relacionamento com Membros para definir cargos.
- `dizimos`, `ofertas` & `encargos`: Entidades financeiras da igreja.
- `documentos` & `projetos`: Gestão documental e missões.
