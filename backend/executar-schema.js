/**
 * Script utilitário para executar as tabelas e dados no banco de dados do Render
 * Uso:
 * node backend/executar-schema.js "SUA_EXTERNAL_DATABASE_URL_DO_RENDER"
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  // Pega o argumento ou junta se o PowerShell separou com espaços
  const args = process.argv.slice(2);
  let connectionString = args.join(' ').trim() || process.env.DATABASE_URL;

  // Remove aspas extras se existirem
  if (connectionString) {
    connectionString = connectionString.replace(/^["']|["']$/g, '').trim();
  }

  if (!connectionString) {
    console.error('\n❌ ERRO: Nenhuma URL de banco de dados foi fornecida!');
    console.log('\nComo usar:');
    console.log('node backend/executar-schema.js "postgresql://usuario:senha@host-externo.render.com:5432/gestao_igreja"\n');
    process.exit(1);
  }

  console.log('⏳ Conectando ao PostgreSQL do Render...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso!');

    const schemaPath = path.join(__dirname, '..', 'database', 'render_schema_completo.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⏳ Executando script SQL (criando tabelas e dados iniciais)...');
    await client.query(sql);

    console.log('\n🎉 PARABÉNS! Todas as tabelas e dados da Igreja Evangélica de Luanda foram criados com sucesso no Render!\n');
  } catch (err) {
    console.error('\n❌ Falha ao executar o schema:', err.message);
  } finally {
    await client.end();
  }
}

run();
