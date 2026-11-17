require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET || (!isProduction ? crypto.randomBytes(32).toString('hex') : '');
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const COLLECTIONS = {
  Membro: { permission: 'membros', read: 'membros.visualizar', create: 'membros.cadastrar', update: 'membros.editar', delete: 'membros.excluir' },
  Lider: { permission: 'conselho', read: 'conselho.visualizar', create: 'conselho.gerenciar', update: 'conselho.gerenciar', delete: 'conselho.excluir' },
  ConselhoPresbiterio: { permission: 'conselho', read: 'conselho.visualizar', create: 'conselho.gerenciar', update: 'conselho.gerenciar', delete: 'conselho.excluir' },
  Reuniao: { permission: 'secretaria', read: 'secretaria.reunioes', create: 'secretaria.reunioes', update: 'secretaria.reunioes', delete: 'secretaria.reunioes' },
  EscalaCulto: { permission: 'secretaria', read: 'secretaria.escalas', create: 'secretaria.escalas', update: 'secretaria.escalas', delete: 'secretaria.escalas' },
  Deliberacao: { permission: 'secretaria', read: 'secretaria.atas_documentos', create: 'secretaria.atas_documentos', update: 'secretaria.atas_documentos', delete: 'secretaria.atas_documentos' },
  Documento: { permission: 'secretaria', read: 'secretaria.atas_documentos', create: 'secretaria.atas_documentos', update: 'secretaria.atas_documentos', delete: 'secretaria.atas_documentos' },
  Dizimo: { permission: 'entradas', read: 'entradas.visualizar', create: 'entradas.dizimos', update: 'entradas.editar', delete: 'entradas.cancelar' },
  Oferta: { permission: 'entradas', read: 'entradas.visualizar', create: 'entradas.ofertas', update: 'entradas.editar', delete: 'entradas.cancelar' },
  Entrada: { permission: 'entradas', read: 'entradas.visualizar', create: 'entradas.dizimos', update: 'entradas.editar', delete: 'entradas.cancelar' },
  Encargo: { permission: 'encargos', read: 'encargos.visualizar', create: 'encargos.cadastrar', update: 'encargos.editar', delete: 'encargos.excluir' },
  Projeto: { permission: 'projetos', read: 'projetos.visualizar', create: 'projetos.gerenciar', update: 'projetos.gerenciar', delete: 'projetos.excluir' },
  Patrimonio: { permission: 'patrimonio', read: 'patrimonio.visualizar', create: 'patrimonio.gerenciar', update: 'patrimonio.gerenciar', delete: 'patrimonio.excluir' },
  IgrejaFilhada: { permission: 'igrejas', read: 'igrejas.visualizar', create: 'igrejas.gerenciar', update: 'igrejas.gerenciar', delete: 'igrejas.excluir' },
  Departamento: { permission: 'departamentos', read: 'departamentos.visualizar', create: 'departamentos.gerenciar', update: 'departamentos.gerenciar', delete: 'departamentos.excluir' },
  DirecaoRestrita: { permission: 'conselho', read: 'conselho.direcao_restrita', create: 'conselho.direcao_restrita', update: 'conselho.direcao_restrita', delete: 'conselho.direcao_restrita' },
  Estatisticas: { permission: 'estatisticas', read: 'estatisticas.visualizar', create: 'estatisticas.gerenciar', update: 'estatisticas.gerenciar', delete: 'estatisticas.gerenciar' },
  Configuracoes: { permission: 'configuracoes', read: 'configuracoes.sistema', create: 'configuracoes.sistema', update: 'configuracoes.sistema', delete: 'configuracoes.sistema' },
  Carousel: { permission: 'configuracoes', read: 'configuracoes.carrossel', create: 'configuracoes.carrossel', update: 'configuracoes.carrossel', delete: 'configuracoes.carrossel' },
  Videos: { permission: 'configuracoes', read: 'configuracoes.videos', create: 'configuracoes.videos', update: 'configuracoes.videos', delete: 'configuracoes.videos' },
  Cultos: { permission: 'configuracoes', read: 'configuracoes.cultos', create: 'configuracoes.cultos', update: 'configuracoes.cultos', delete: 'configuracoes.cultos' },
  Noticias: { permission: 'configuracoes', read: 'configuracoes.noticias', create: 'configuracoes.noticias', update: 'configuracoes.noticias', delete: 'configuracoes.noticias' }
};

const PUBLIC_COLLECTIONS = new Set([
  'Configuracoes',
  'Carousel',
  'Videos',
  'Cultos',
  'Noticias',
  'Projeto',
  'IgrejaFilhada',
  'Reuniao'
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || !isProduction || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origem não autorizada pela configuração CORS.'));
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: '25mb' }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') return { valid: false, needsUpgrade: false };
  const parts = storedHash.split('$');
  if (parts.length === 3 && parts[0] === 'scrypt') {
    const derived = crypto.scryptSync(password, parts[1], 64).toString('hex');
    return { valid: safeEqual(derived, parts[2]), needsUpgrade: false };
  }
  return { valid: safeEqual(password, storedHash), needsUpgrade: true };
}

function encodeBase64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function createToken(userId) {
  if (!jwtSecret) throw httpError(503, 'JWT_SECRET não está configurado no Render.');
  const now = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = encodeBase64Url(JSON.stringify({ sub: String(userId), iat: now, exp: now + 60 * 60 * 12 }));
  const unsignedToken = `${header}.${payload}`;
  const signature = crypto.createHmac('sha256', jwtSecret).update(unsignedToken).digest('base64url');
  return `${unsignedToken}.${signature}`;
}

function decodeToken(token) {
  if (!jwtSecret) throw httpError(503, 'JWT_SECRET não está configurado no Render.');
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw httpError(401, 'Sessão inválida. Entre novamente.');
  const unsignedToken = `${parts[0]}.${parts[1]}`;
  const expected = crypto.createHmac('sha256', jwtSecret).update(unsignedToken).digest();
  const received = Buffer.from(parts[2], 'base64url');
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    throw httpError(401, 'Sessão inválida. Entre novamente.');
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    throw httpError(401, 'Sessão inválida. Entre novamente.');
  }
  if (!payload.sub || !Number.isFinite(payload.exp) || payload.exp <= Date.now() / 1000) {
    throw httpError(401, 'Sessão expirada. Entre novamente.');
  }
  return payload;
}

function publicUser(row) {
  return {
    id: String(row.id),
    nome: row.nome,
    email: row.email,
    cargo: row.cargo || '',
    role: row.role || 'personalizado',
    status: row.status || 'ativo',
    permissoes: Array.isArray(row.permissoes) ? row.permissoes : []
  };
}

function hasPermission(user, permission) {
  const permissions = Array.isArray(user.permissoes) ? user.permissoes : [];
  return user.role === 'admin'
    || permissions.includes('all')
    || permissions.includes('*')
    || permissions.includes(permission)
    || permissions.includes(permission.split('.')[0]);
}

async function authenticatedUser(req) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) throw httpError(401, 'Autenticação necessária.');
  const payload = decodeToken(match[1]);
  const result = await db.query(
    'SELECT id, nome, email, cargo, role, status, permissoes FROM usuarios WHERE id = $1',
    [payload.sub]
  );
  const user = result.rows[0];
  if (!user || user.status !== 'ativo') throw httpError(401, 'A conta está inativa ou não existe.');
  return user;
}

async function requirePermission(req, permission) {
  const user = await authenticatedUser(req);
  if (!hasPermission(user, permission)) throw httpError(403, 'Não tem permissão para esta operação.');
  return user;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function safeUserRecord(user) {
  const { password, password_hash, ...safe } = user;
  return safe;
}

function canonicalLoginEmails(email) {
  if (email === 'admin@iel.com') return [email, 'admin@iel.org', 'admin@iegb.org'];
  return [email];
}

app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestão Eclesiástica I.E.L. está online e ativa!',
    endpoints: { health: '/api/health', collections: '/api/collections/:collection' }
  });
});

app.get('/api/health', async (req, res, next) => {
  try {
    const result = await db.query('SELECT NOW() AS now');
    res.json({ status: 'ok', db_time: result.rows[0].now });
  } catch (error) {
    next(error);
  }
});

app.get('/api/membros', async (req, res, next) => {
  try {
    await requirePermission(req, 'membros.visualizar');
    const result = await db.query(
      `SELECT data FROM app_records
       WHERE collection = 'Membro' AND deleted_at IS NULL ORDER BY record_id`
    );
    res.json(result.rows.map((row) => row.data));
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    if (!email || !password) throw httpError(400, 'E-mail e senha são obrigatórios.');

    const emails = canonicalLoginEmails(email);
    const result = await db.query(
      'SELECT id, nome, email, password_hash, cargo, role, status, permissoes FROM usuarios WHERE lower(email) = ANY($1::text[]) ORDER BY id LIMIT 1',
      [emails]
    );
    const user = result.rows[0];
    if (!user || user.status !== 'ativo') throw httpError(401, 'Credenciais inválidas ou conta inativa.');

    const verification = verifyPassword(password, user.password_hash);
    if (!verification.valid) throw httpError(401, 'Credenciais inválidas ou conta inativa.');
    if (verification.needsUpgrade) {
      await db.query('UPDATE usuarios SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
        hashPassword(password),
        user.id
      ]);
    }

    res.json({ token: createToken(user.id), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const nome = String(req.body?.nome || '').trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    if (!nome || !email || !password) throw httpError(400, 'Nome, e-mail e senha são obrigatórios.');
    if (password.length < 8) throw httpError(400, 'A senha deve ter pelo menos 8 caracteres.');

    const result = await db.query(
      `INSERT INTO usuarios (nome, email, password_hash, role, status, permissoes)
       VALUES ($1, $2, $3, 'personalizado', 'ativo', '["dashboard"]'::jsonb)
       RETURNING id, nome, email, cargo, role, status, permissoes`,
      [nome, email, hashPassword(password)]
    );
    res.status(201).json({ user: publicUser(result.rows[0]) });
  } catch (error) {
    if (error.code === '23505') return next(httpError(409, 'Já existe uma conta com este e-mail.'));
    next(error);
  }
});

app.get('/api/auth/me', async (req, res, next) => {
  try {
    const user = await authenticatedUser(req);
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/collections/:collection', async (req, res, next) => {
  try {
    const { collection } = req.params;
    if (collection === 'users') {
      await requirePermission(req, 'configuracoes.usuarios');
      const users = await db.query(
        'SELECT id, nome, email, cargo, role, status, permissoes FROM usuarios ORDER BY id'
      );
      return res.json(users.rows.map(publicUser));
    }

    const definition = COLLECTIONS[collection];
    if (!definition) throw httpError(404, 'Coleção não encontrada.');
    if (!PUBLIC_COLLECTIONS.has(collection)) {
      await requirePermission(req, definition.read);
    }
    const result = await db.query(
      'SELECT data FROM app_records WHERE collection = $1 AND deleted_at IS NULL ORDER BY record_id',
      [collection]
    );
    res.json(result.rows.map((row) => row.data));
  } catch (error) {
    next(error);
  }
});

app.post('/api/collections/:collection', async (req, res, next) => {
  try {
    const { collection } = req.params;
    if (!isObject(req.body)) throw httpError(400, 'O registro precisa ser um objeto JSON.');

    if (collection === 'users') {
      await requirePermission(req, 'configuracoes.usuarios');
      const email = normalizeEmail(req.body.email);
      const password = String(req.body.password || '');
      const nome = String(req.body.nome || '').trim();
      if (!email || !nome || password.length < 8) {
        throw httpError(400, 'Nome, e-mail e senha com pelo menos 8 caracteres são obrigatórios.');
      }
      const result = await db.query(
        `INSERT INTO usuarios (nome, email, password_hash, cargo, role, status, permissoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
         RETURNING id, nome, email, cargo, role, status, permissoes`,
        [nome, email, hashPassword(password), req.body.cargo || null, req.body.role || 'personalizado', req.body.status || 'ativo', JSON.stringify(req.body.permissoes || ['dashboard'])]
      );
      return res.status(201).json(publicUser(result.rows[0]));
    }

    const definition = COLLECTIONS[collection];
    if (!definition) throw httpError(404, 'Coleção não encontrada.');
    await requirePermission(req, definition.create);
    const id = String(req.body.id || crypto.randomUUID());
    const record = { ...req.body, id, createdAt: req.body.createdAt || new Date().toISOString() };
    const result = await db.query(
      'INSERT INTO app_records (collection, record_id, data) VALUES ($1, $2, $3::jsonb) RETURNING data',
      [collection, id, JSON.stringify(record)]
    );
    res.status(201).json(result.rows[0].data);
  } catch (error) {
    if (error.code === '23505') return next(httpError(409, 'Já existe um registro com este identificador.'));
    next(error);
  }
});

app.put('/api/collections/:collection/:id', async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    if (!isObject(req.body)) throw httpError(400, 'A atualização precisa ser um objeto JSON.');

    if (collection === 'users') {
      await requirePermission(req, 'configuracoes.usuarios');
      const updates = { ...req.body };
      delete updates.id;
      const fields = [];
      const values = [];
      const allowedFields = ['nome', 'email', 'cargo', 'role', 'status', 'permissoes'];
      for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(updates, field)) {
          values.push(field === 'email' ? normalizeEmail(updates[field]) : field === 'permissoes' ? JSON.stringify(updates[field]) : updates[field]);
          fields.push(`${field} = $${values.length}${field === 'permissoes' ? '::jsonb' : ''}`);
        }
      }
      if (updates.password) {
        values.push(hashPassword(String(updates.password)));
        fields.push(`password_hash = $${values.length}`);
      }
      if (!fields.length) throw httpError(400, 'Não foram enviados campos válidos para atualizar.');
      values.push(id);
      const result = await db.query(
        `UPDATE usuarios SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length}
         RETURNING id, nome, email, cargo, role, status, permissoes`,
        values
      );
      if (!result.rows[0]) throw httpError(404, 'Usuário não encontrado.');
      return res.json(publicUser(result.rows[0]));
    }

    const definition = COLLECTIONS[collection];
    if (!definition) throw httpError(404, 'Coleção não encontrada.');
    await requirePermission(req, definition.update);
    const patch = { ...req.body };
    delete patch.id;
    const result = await db.query(
      `UPDATE app_records
       SET data = data || $3::jsonb || jsonb_build_object('id', $2::text, 'updatedAt', NOW()::text),
           updated_at = NOW()
       WHERE collection = $1 AND record_id = $2 AND deleted_at IS NULL
       RETURNING data`,
      [collection, id, JSON.stringify(patch)]
    );
    if (!result.rows[0]) throw httpError(404, 'Registro não encontrado.');
    res.json(result.rows[0].data);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/collections/:collection/:id', async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    if (collection === 'users') {
      await requirePermission(req, 'configuracoes.usuarios');
      const user = await db.query('SELECT email FROM usuarios WHERE id = $1', [id]);
      if (!user.rows[0]) throw httpError(404, 'Usuário não encontrado.');
      if (['admin@iel.org', 'admin@iel.com', 'admin@iegb.org'].includes(user.rows[0].email.toLowerCase())) {
        throw httpError(400, 'Não é permitido excluir a conta administradora principal.');
      }
      await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
      return res.json({ success: true });
    }

    const definition = COLLECTIONS[collection];
    if (!definition) throw httpError(404, 'Coleção não encontrada.');
    await requirePermission(req, definition.delete);
    const result = await db.query(
      'UPDATE app_records SET deleted_at = NOW(), updated_at = NOW() WHERE collection = $1 AND record_id = $2 AND deleted_at IS NULL',
      [collection, id]
    );
    if (!result.rowCount) throw httpError(404, 'Registro não encontrado.');
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/data/reset', async (req, res, next) => {
  try {
    await requirePermission(req, 'configuracoes.backup');
    await db.query('UPDATE app_records SET deleted_at = NOW(), updated_at = NOW() WHERE deleted_at IS NULL');
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/sync', async (req, res, next) => {
  let client;
  try {
    const user = await requirePermission(req, 'configuracoes.backup');
    const collections = req.body?.collections;
    if (!isObject(collections)) throw httpError(400, 'Os dados para sincronizar não são válidos.');

    client = await db.pool.connect();
    await client.query('BEGIN');
    const imported = {};
    for (const [collection, records] of Object.entries(collections)) {
      if (collection.startsWith('_')) continue;
      if (collection === 'users' && Array.isArray(records)) {
        imported.users = 0;
        for (const incoming of records) {
          if (!isObject(incoming)) continue;
          const email = normalizeEmail(incoming.email);
          if (!email || ['admin@iel.com', 'admin@iel.org', 'admin@iegb.org'].includes(email)) continue;
          if (
            incoming.password === 'admin'
            && ['secretaria@iel.com', 'financeiro@iel.com'].includes(email)
          ) continue;
          const aliases = canonicalLoginEmails(email);
          const existing = await client.query(
            `SELECT id, nome, email, cargo, role, status, permissoes
             FROM usuarios WHERE lower(email) = ANY($1::text[]) ORDER BY id LIMIT 1`,
            [aliases]
          );
          const incomingProfile = safeUserRecord({
            ...incoming,
            email,
            permissoes: Array.isArray(incoming.permissoes) ? incoming.permissoes : ['dashboard']
          });
          if (!existing.rows[0]) {
            const password = String(incoming.password || '');
            if (password.length < 8) {
              await client.query(
                `INSERT INTO app_sync_conflicts
                  (collection, record_id, existing_data, incoming_data, source_user_id)
                 VALUES ('users', $1, '{"reason":"password must contain at least 8 characters"}'::jsonb, $2::jsonb, $3)`,
                [email, JSON.stringify(incomingProfile), user.id]
              );
              continue;
            }
            await client.query(
              `INSERT INTO usuarios (nome, email, password_hash, cargo, role, status, permissoes)
               VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
              [
                String(incoming.nome || email.split('@')[0]),
                email,
                hashPassword(password),
                incoming.cargo || null,
                incoming.role || 'personalizado',
                incoming.status || 'ativo',
                JSON.stringify(incomingProfile.permissoes)
              ]
            );
            imported.users += 1;
            continue;
          }

          const existingProfile = publicUser(existing.rows[0]);
          const comparableFields = ['nome', 'email', 'cargo', 'role', 'status', 'permissoes'];
          const existingComparable = Object.fromEntries(comparableFields.map((field) => [field, existingProfile[field] || (field === 'permissoes' ? [] : '')]));
          const incomingComparable = Object.fromEntries(comparableFields.map((field) => [field, incomingProfile[field] || (field === 'permissoes' ? [] : '')]));
          const sameProfile = JSON.stringify(existingComparable) === JSON.stringify(incomingComparable);
          if (!sameProfile) {
            const alreadyReported = await client.query(
              `SELECT 1 FROM app_sync_conflicts
               WHERE collection = 'users' AND record_id = $1 AND incoming_data = $2::jsonb
                 AND resolved_at IS NULL LIMIT 1`,
              [email, JSON.stringify(incomingProfile)]
            );
            if (!alreadyReported.rowCount) {
              await client.query(
                `INSERT INTO app_sync_conflicts
                  (collection, record_id, existing_data, incoming_data, source_user_id)
                 VALUES ('users', $1, $2::jsonb, $3::jsonb, $4)`,
                [email, JSON.stringify(existingProfile), JSON.stringify(incomingProfile), user.id]
              );
            }
          }
        }
        continue;
      }
      if (!COLLECTIONS[collection] || !Array.isArray(records)) continue;
      imported[collection] = 0;
      for (const incoming of records) {
        if (!isObject(incoming) || incoming.id === undefined || incoming.id === null) continue;
        const id = String(incoming.id);
        const payload = JSON.stringify({ ...incoming, id });
        const insert = await client.query(
          `INSERT INTO app_records (collection, record_id, data)
           VALUES ($1, $2, $3::jsonb)
           ON CONFLICT (collection, record_id) DO NOTHING`,
          [collection, id, payload]
        );
        if (insert.rowCount) {
          imported[collection] += 1;
          continue;
        }
        const current = await client.query(
          'SELECT data, data = $3::jsonb AS equal, deleted_at FROM app_records WHERE collection = $1 AND record_id = $2',
          [collection, id, payload]
        );
        if (current.rows[0] && (current.rows[0].deleted_at || !current.rows[0].equal)) {
          const alreadyReported = await client.query(
            `SELECT 1 FROM app_sync_conflicts
             WHERE collection = $1 AND record_id = $2 AND incoming_data = $3::jsonb
               AND resolved_at IS NULL LIMIT 1`,
            [collection, id, payload]
          );
          if (alreadyReported.rowCount) continue;
          await client.query(
            `INSERT INTO app_sync_conflicts (collection, record_id, existing_data, incoming_data, source_user_id)
             VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)`,
            [
              collection,
              id,
              JSON.stringify(current.rows[0].deleted_at
                ? { deleted: true, record: current.rows[0].data }
                : current.rows[0].data),
              payload,
              user.id
            ]
          );
        }
      }
    }

    const stored = await client.query(
      'SELECT collection, record_id, data FROM app_records WHERE deleted_at IS NULL ORDER BY collection, record_id'
    );
    const serverCollections = Object.fromEntries(Object.keys(COLLECTIONS).map((collection) => [collection, []]));
    for (const row of stored.rows) {
      if (!serverCollections[row.collection]) serverCollections[row.collection] = [];
      serverCollections[row.collection].push(row.data);
    }
    const pendingConflicts = await client.query(
      `SELECT id, collection, record_id FROM app_sync_conflicts
       WHERE resolved_at IS NULL ORDER BY created_at DESC LIMIT 500`
    );
    await client.query('COMMIT');
    res.json({
      imported,
      conflictCount: pendingConflicts.rows.length,
      conflicts: pendingConflicts.rows,
      collections: serverCollections
    });
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Failed to roll back data sync:', rollbackError);
      }
    }
    next(error);
  } finally {
    if (client) client.release();
  }
});

app.get('/api/sync/conflicts', async (req, res, next) => {
  try {
    await requirePermission(req, 'configuracoes.backup');
    const result = await db.query(
      `SELECT id, collection, record_id, existing_data, incoming_data, created_at
       FROM app_sync_conflicts WHERE resolved_at IS NULL ORDER BY created_at DESC LIMIT 500`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.status && error.status < 500) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  console.error('API request failed:', error);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

async function start() {
  if (isProduction && !jwtSecret) {
    throw new Error('Defina JWT_SECRET nas variáveis de ambiente do Render antes de iniciar a API.');
  }
  await db.query(`
    CREATE TABLE IF NOT EXISTS app_records (
      collection VARCHAR(80) NOT NULL,
      record_id VARCHAR(255) NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ,
      PRIMARY KEY (collection, record_id)
    )
  `);
  await db.query('ALTER TABLE app_records ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ');
  await db.query(`
    CREATE TABLE IF NOT EXISTS app_sync_conflicts (
      id BIGSERIAL PRIMARY KEY,
      collection VARCHAR(80) NOT NULL,
      record_id VARCHAR(255) NOT NULL,
      existing_data JSONB NOT NULL,
      incoming_data JSONB NOT NULL,
      source_user_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      resolved_at TIMESTAMPTZ
    )
  `);
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
