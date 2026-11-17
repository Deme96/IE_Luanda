/**
 * Script utilitário para listar todas as tabelas e quantidade de registros no Render
 * Uso:
 * node backend/verificar-tabelas.js 'SUA_EXTERNAL_DATABASE_URL'
 */

const { Client } = require('pg');

async function check() {
  const args = process.argv.slice(2);
  let connectionString = args.join(' ').trim() || process.env.DATABASE_URL;

  if (connectionString) {
    connectionString = connectionString.replace(/^["']|["']$/g, '').trim();
  }

  if (!connectionString) {
    console.error('\n❌ ERRO: Forneça a URL externa do banco!');
    console.log('Exemplo: node backend/verificar-tabelas.js "SUA_EXTERNAL_URL"\n');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('⏳ Conectando ao banco de dados no Render...');
    await client.connect();
    console.log('✅ Conectado!\n');

    // Consulta para listar tabelas públicas e suas contagens
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('====================================================');
    console.log(`📋 TABELAS ENCONTRADAS (${res.rows.length}):`);
    console.log('====================================================');

    for (const row of res.rows) {
      const tableName = row.table_name;
      try {
        const countRes = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
        const total = countRes.rows[0].count;
        console.log(` 🔹 ${tableName.padEnd(25)} : ${total} registro(s)`);
      } catch (err) {
        console.log(` 🔹 ${tableName.padEnd(25)} : (erro ao contar)`);
      }
    }
    console.log('====================================================\n');

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await client.end();
  }
}

check();
