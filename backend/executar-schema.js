require('dotenv').config({ path: require('path').join(__dirname, '.env') });

/**
 * Script utilitário para executar as tabelas e dados no banco de dados do Render
 * Uso: configure DATABASE_URL para gestao-igreja-db e execute node backend/executar-schema.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('\nERRO: Configure DATABASE_URL para o PostgreSQL gestao-igreja-db.\n');
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
