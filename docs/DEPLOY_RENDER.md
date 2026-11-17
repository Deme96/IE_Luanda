# =======================================================
# GUIA RÁPIDO: DEPLOY NO RENDER.COM
# =======================================================

## 1. Criar o Banco PostgreSQL no Render
1. Acesse: https://dashboard.render.com/
2. Clique no botão azul: **New +** -> **PostgreSQL**
3. Preencha os dados:
   - **Name:** gestao-igreja-db
   - **Database:** gestao_igreja
   - **User:** postgres (ou o gerado automaticamente)
   - **Region:** Frankfurt (ou Ohio/Oregon - a mesma que escolher para o backend)
   - **Plan:** Free
4. Clique em **Create Database**.
5. Na página do banco criado, copie a **Internal Database URL** (ou External se conectar de fora).
6. Confirme que existe a tabela `usuarios`. Em um banco novo, execute `database/render_schema_completo.sql`; em um banco já usado, faça backup e não reaplique o script sem revisar os dados existentes.

---

## 2. Criar o Web Service (Backend Node.js) no Render
1. Clique em **New +** -> **Web Service**.
2. Conecte o seu repositório GitHub.
3. Configure os campos:
   - **Name:** gestao-igreja-api
   - **Root Directory:** backend
   - **Environment:** Node
   - **Build Command:** npm install
   - **Start Command:** node server.js
   - **Plan:** Free
4. Na aba **Environment Variables**, adicione:
   - `NODE_ENV` = production
   - `PORT` = 10000
   - `DATABASE_URL` = (Cole a Internal Database URL do passo 1)
   - `CORS_ORIGIN` = https://seu-frontend.vercel.app (o link do site na Vercel)
   - `JWT_SECRET` = uma chave aleatória forte e privada
5. Clique em **Deploy Web Service**.

---

## 3. Conectar o Frontend (Vercel) com a API (Render)
1. No Render, copie o link público gerado para sua API (ex: `https://gestao-igreja-api.onrender.com`).
2. Acesse o painel da **Vercel** no seu projeto do Frontend.
3. Vá em **Settings** -> **Environment Variables**.
4. Adicione/Edite:
   - `VITE_API_URL` = https://gestao-igreja-api.onrender.com
5. Vá em **Deployments** e faça um **Redeploy** do frontend.

### Se o frontend também estiver no Render
1. Abra o serviço do frontend e adicione `VITE_API_URL` como variável de build, com o endereço público da API.
2. No serviço da API, configure `CORS_ORIGIN` com o endereço público exato do frontend.
3. Faça um novo deploy do frontend e da API para aplicar as variáveis.

## 4. Sincronização entre aparelhos
- O frontend usa `VITE_API_URL` no momento do build; o deploy do frontend precisa dessa variável apontando para a API Render.
- A API usa o PostgreSQL Render como fonte compartilhada. As tabelas `app_records` e `app_sync_conflicts` são criadas automaticamente ao iniciar o serviço.
- Depois do deploy do frontend e da API, entre com uma conta administradora em cada aparelho para importar os dados locais. O servidor mantém os registros que já existem; diferenças com o mesmo identificador são guardadas em `app_sync_conflicts` e mostradas após o login.
- Não apague os dados do navegador antes da migração. Faça e guarde backups dos aparelhos que contêm dados; os registros locais distintos devem ser importados com uma conta que tenha permissão de backup.
- O login inicial depende de um usuário já existente na tabela `usuarios`. Troque qualquer senha padrão logo após o primeiro login e configure `JWT_SECRET` no Render sem colocá-lo no repositório.

