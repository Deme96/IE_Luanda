# Documentação do Sistema - Gestão Eclesiástica Pro

## Arquitetura
O sistema segue o modelo cliente-servidor (Fullstack Monorepo):
1. **Frontend (`/frontend`)**: Aplicação React com Vite. Responsável pela UI, consumo da API e site público; não mantém uma base de dados local.
2. **Backend (`/backend`)**: API REST construída em Node.js com Express; toda a persistência passa pela API.
3. **Database (`/database`)**: Scripts e modelos para o PostgreSQL compartilhado `gestao-igreja-db`.

## Tecnologias Utilizadas
- **Frontend**: React 18, Vite, Tailwind CSS v4, shadcn/ui, Recharts.
- **Backend**: Node.js, Express, `pg` (node-postgres), CORS.
- **Banco de Dados**: PostgreSQL.

## Configuração e Inicialização

### 1. Banco de Dados
1. Use o PostgreSQL Render `gestao-igreja-db`, com a base `gestao_igreja`.
2. Configure `DATABASE_URL` com a URL desse banco no ambiente do backend.
3. Execute `node backend/executar-schema.js` com essa mesma variável para criar as tabelas.

### 2. Backend
1. Navegue até a pasta `backend`: `cd backend`
2. Instale as dependências: `npm install`
3. Crie um arquivo `.env` na pasta `backend` com a URL de conexão do `gestao-igreja-db` e as configurações:
   ```env
   PORT=3000
   DATABASE_URL=<URL do PostgreSQL gestao-igreja-db>
   ```
   Use a URL interna quando o backend estiver no Render e a URL externa para desenvolvimento local. Ambas devem apontar ao mesmo `gestao-igreja-db`. O backend não inicia sem `DATABASE_URL`; não há conexão alternativa local.
4. Configure `VITE_API_URL` no ambiente de build do frontend para apontar à API deste backend.
5. Inicie o servidor: `npm start` (ou `node server.js`).

### 3. Frontend
1. Navegue até a pasta `frontend`: `cd frontend`
2. Instale as dependências: `npm install`
3. Inicie o servidor de desenvolvimento: `npm run dev`
4. A aplicação estará disponível em `http://localhost:5173`.

> O frontend usa exclusivamente a API compartilhada. O login não importa dados do navegador; a restauração de um backup JSON é manual, insere registos novos e atualiza os que já existem com o mesmo identificador. As contas de utilizador não são incluídas nem alteradas pelo backup.

## Estrutura do Banco de Dados
O schema contempla as seguintes tabelas principais:
- `usuarios`: Autenticação.
- `igrejas_filiadas`: Igrejas secundárias/filiais.
- `membros`: Cadastro geral de membros.
- `lideres` & `conselho_presbiterio`: Relacionamento com Membros para definir cargos.
- `dizimos`, `ofertas` & `encargos`: Entidades financeiras da igreja.
- `documentos` & `projetos`: Gestão documental e missões.
