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
5. Clique em **Deploy Web Service**.

---

## 3. Conectar o Frontend (Vercel) com a API (Render)
1. No Render, copie o link público gerado para sua API (ex: `https://gestao-igreja-api.onrender.com`).
2. Acesse o painel da **Vercel** no seu projeto do Frontend.
3. Vá em **Settings** -> **Environment Variables**.
4. Adicione/Edite:
   - `VITE_API_URL` = https://gestao-igreja-api.onrender.com
5. Vá em **Deployments** e faça um **Redeploy** do frontend.

