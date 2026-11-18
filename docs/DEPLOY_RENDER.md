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
   - **Name:** IE_Luanda
   - **Root Directory:** backend
   - **Environment:** Node
   - **Build Command:** npm install
   - **Start Command:** node server.js
   - **Plan:** Free
4. Na aba **Environment Variables**, adicione:
   - `NODE_ENV` = production
   - `PORT` = 10000
   - `DATABASE_URL` = cole a **Internal Database URL completa** do PostgreSQL Render (não use endereço de exemplo)
   - `CORS_ORIGIN` = https://igrejaemluanda.onrender.com
   - `JWT_SECRET` = uma chave aleatória forte e privada
5. Clique em **Deploy Web Service**.

---

## 3. Conectar o Static Site e a API no Render
1. Abra o Static Site `Igrejaemluanda` no Render.
2. Em **Environment**, configure a variável de build:
   - `VITE_API_URL` = `https://ie-luanda.onrender.com`
3. Use **Save and deploy** para reconstruir o frontend com a URL da API.
4. No Web Service `IE_Luanda`, configure `CORS_ORIGIN` com a origem exata:
   - `https://igrejaemluanda.onrender.com`
5. Salve a variável e faça deploy do backend para aplicá-la.
6. Em **Redirects/Rewrites** do Static Site, configure `/*` para `/index.html` com a ação **Rewrite**, para que rotas como `/login` funcionem ao abrir diretamente.

## 4. Sincronização entre aparelhos
- O frontend usa `VITE_API_URL` no momento do build; o deploy do frontend precisa dessa variável apontando para a API Render.
- A API usa exclusivamente o PostgreSQL Render `gestao-igreja-db` como fonte de dados. A tabela `app_records` é criada automaticamente ao iniciar o serviço.
- A API completa colunas faltantes na tabela `usuarios` de bancos antigos. A conta administrativa precisa existir; em um banco novo, execute `database/render_schema_completo.sql` para criar a conta inicial.
- O frontend não mantém nem importa automaticamente uma base local ao iniciar sessão. Todos os dados lidos e gravados passam pela API e ficam no banco compartilhado.
- Os backups de dados são exportados diretamente do banco. A restauração é manual: registos com o mesmo identificador são atualizados pelo backup e os restantes são inseridos. As contas de utilizador não são alteradas pela restauração.
- Dados que existiam apenas no armazenamento de um navegador não são usados pelo novo sistema. Se ainda forem necessários, exporte-os usando a versão antiga e importe o arquivo conscientemente pela opção **Backup & Dados**.
- O login inicial depende de um usuário já existente na tabela `usuarios`. Troque qualquer senha padrão logo após o primeiro login e configure `JWT_SECRET` no Render sem colocá-lo no repositório.

