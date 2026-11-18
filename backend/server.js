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
const ADMIN_EMAILS = ['admin@iel.com', 'admin@iel.org', 'admin@iegb.org'];
const ADMIN_PERMISSIONS = [
  'dashboard',
  'estatisticas',
  'membros',
  'departamentos',
  'conselho',
  'secretaria',
  'entradas',
  'encargos',
  'patrimonio',
  'projetos',
  'igrejas',
  'configuracoes'
];

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

const MEMBER_FIELDS = [
  'nome',
  'email',
  'telefone',
  'data_nascimento',
  'endereco',
  'cidade',
  'departamento',
  'estado_civil',
  'status',
  'data_batismo',
  'cargo',
  'pdf_document'
];
const MEMBER_RETURNING = `record_id AS id, ${MEMBER_FIELDS.join(', ')}, created_at AS "createdAt", updated_at AS "updatedAt"`;

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
app.use(express.json({ limit: '35mb' }));
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
  req.auditActor = user;
  if (!hasPermission(user, permission)) throw httpError(403, 'Não tem permissão para esta operação.');
  return user;
}

async function writeSystemLog(req, {
  actor = req.auditActor,
  action,
  entity = null,
  recordId = null,
  summary,
  outcome = 'success',
  details = {}
}) {
  try {
    await db.query(
      `INSERT INTO system_logs
        (actor_id, actor_name, actor_email, actor_role, action, entity, record_id,
         outcome, summary, request_method, request_path, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)`,
      [
        actor?.id == null ? null : String(actor.id),
        actor?.nome || null,
        actor?.email || null,
        actor?.role || null,
        action,
        entity,
        recordId == null ? null : String(recordId),
        outcome,
        summary,
        req.method,
        req.originalUrl,
        JSON.stringify(details)
      ]
    );
  } catch (error) {
    console.error('Failed to write system audit log:', error);
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nullableValue(value) {
  return value === undefined || value === null || value === '' ? null : value;
}

function normalizeMember(data) {
  return {
    nome: String(data.nome || '').trim(),
    email: nullableValue(data.email),
    telefone: nullableValue(data.telefone),
    data_nascimento: nullableValue(data.data_nascimento),
    endereco: nullableValue(data.endereco),
    cidade: nullableValue(data.cidade) || 'Luanda',
    departamento: nullableValue(data.departamento),
    estado_civil: nullableValue(data.estado_civil),
    status: nullableValue(data.status) || 'ativo',
    data_batismo: nullableValue(data.data_batismo),
    cargo: nullableValue(data.cargo),
    pdf_document: nullableValue(data.pdf_document)
  };
}

function canonicalLoginEmails(email) {
  if (ADMIN_EMAILS.includes(email)) {
    return [email, ...ADMIN_EMAILS.filter((adminEmail) => adminEmail !== email)];
  }
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

app.get('/api/system-logs', async (req, res, next) => {
  try {
    await requirePermission(req, 'configuracoes.logs');
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 250)
      : 250;
    const result = await db.query(
      `SELECT id, created_at, actor_name, actor_email, actor_role, action,
              entity, record_id, outcome, summary, request_method, request_path, details
       FROM system_logs
       ORDER BY created_at DESC, id DESC
       LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.get('/api/membros', async (req, res, next) => {
  try {
    await requirePermission(req, 'membros.visualizar');
    const result = await db.query(
      `SELECT ${MEMBER_RETURNING} FROM membros ORDER BY id`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  let email = '';
  try {
    email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    if (!email || !password) throw httpError(400, 'E-mail e senha são obrigatórios.');

    const emails = canonicalLoginEmails(email);
    const result = await db.query(
      `SELECT id, nome, email, password_hash, cargo, role, status, permissoes
       FROM usuarios
       WHERE lower(email) = ANY($1::text[])
       ORDER BY array_position($1::text[], lower(email)), id
       LIMIT 1`,
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

    await writeSystemLog(req, {
      actor: user,
      action: 'login',
      entity: 'users',
      recordId: user.id,
      summary: 'Sessão iniciada'
    });
    res.json({ token: createToken(user.id), user: publicUser(user) });
  } catch (error) {
    if (error.status === 401 && email) {
      await writeSystemLog(req, {
        actor: { email },
        action: 'login_failed',
        entity: 'users',
        summary: 'Tentativa de início de sessão sem sucesso',
        outcome: 'failure'
      });
    }
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
    await writeSystemLog(req, {
      actor: result.rows[0],
      action: 'user_registered',
      entity: 'users',
      recordId: result.rows[0].id,
      summary: 'Conta criada por registo'
    });
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
    if (collection === 'Membro') {
      const members = await db.query(
        `SELECT ${MEMBER_RETURNING} FROM membros ORDER BY id`
      );
      return res.json(members.rows);
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
      await writeSystemLog(req, {
        action: 'create',
        entity: 'users',
        recordId: result.rows[0].id,
        summary: 'Utilizador criado'
      });
      return res.status(201).json(publicUser(result.rows[0]));
    }

    const definition = COLLECTIONS[collection];
    if (!definition) throw httpError(404, 'Coleção não encontrada.');
    await requirePermission(req, definition.create);
    if (collection === 'Membro') {
      const member = normalizeMember(req.body);
      if (!member.nome) throw httpError(400, 'O nome do membro é obrigatório.');
      const recordId = String(req.body.id || crypto.randomUUID());
      const placeholders = MEMBER_FIELDS.map((_, index) => `$${index + 2}`).join(', ');
      const result = await db.query(
        `INSERT INTO membros (record_id, ${MEMBER_FIELDS.join(', ')})
         VALUES ($1, ${placeholders})
         RETURNING ${MEMBER_RETURNING}`,
        [recordId, ...MEMBER_FIELDS.map((field) => member[field])]
      );
      await writeSystemLog(req, {
        action: 'create',
        entity: collection,
        recordId,
        summary: 'Membro criado'
      });
      return res.status(201).json(result.rows[0]);
    }
    const id = String(req.body.id || crypto.randomUUID());
    const record = { ...req.body, id, createdAt: req.body.createdAt || new Date().toISOString() };
    const result = await db.query(
      'INSERT INTO app_records (collection, record_id, data) VALUES ($1, $2, $3::jsonb) RETURNING data',
      [collection, id, JSON.stringify(record)]
    );
    await writeSystemLog(req, {
      action: 'create',
      entity: collection,
      recordId: id,
      summary: 'Registo criado'
    });
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
      await writeSystemLog(req, {
        action: 'update',
        entity: 'users',
        recordId: id,
        summary: 'Utilizador atualizado'
      });
      return res.json(publicUser(result.rows[0]));
    }

    const definition = COLLECTIONS[collection];
    if (!definition) throw httpError(404, 'Coleção não encontrada.');
    await requirePermission(req, definition.update);
    if (collection === 'Membro') {
      const member = normalizeMember(req.body);
      if (!member.nome) throw httpError(400, 'O nome do membro é obrigatório.');
      const assignments = MEMBER_FIELDS.map((field, index) => `${field} = $${index + 1}`);
      const result = await db.query(
        `UPDATE membros
         SET ${assignments.join(', ')}, updated_at = NOW()
         WHERE record_id = $${MEMBER_FIELDS.length + 1}
         RETURNING ${MEMBER_RETURNING}`,
        [...MEMBER_FIELDS.map((field) => member[field]), id]
      );
      if (!result.rows[0]) throw httpError(404, 'Membro não encontrado.');
      await writeSystemLog(req, {
        action: 'update',
        entity: collection,
        recordId: id,
        summary: 'Membro atualizado'
      });
      return res.json(result.rows[0]);
    }
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
    await writeSystemLog(req, {
      action: 'update',
      entity: collection,
      recordId: id,
      summary: 'Registo atualizado'
    });
    res.json(result.rows[0].data);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/collections/:collection/:id', async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    if (collection === 'Membro') {
      await requirePermission(req, COLLECTIONS.Membro.delete);
      const result = await db.query('DELETE FROM membros WHERE record_id = $1', [id]);
      if (!result.rowCount) throw httpError(404, 'Membro não encontrado.');
      await writeSystemLog(req, {
        action: 'delete',
        entity: collection,
        recordId: id,
        summary: 'Membro excluído'
      });
      return res.json({ success: true });
    }
    if (collection === 'users') {
      await requirePermission(req, 'configuracoes.usuarios');
      const user = await db.query('SELECT email FROM usuarios WHERE id = $1', [id]);
      if (!user.rows[0]) throw httpError(404, 'Usuário não encontrado.');
      if (['admin@iel.org', 'admin@iel.com', 'admin@iegb.org'].includes(user.rows[0].email.toLowerCase())) {
        throw httpError(400, 'Não é permitido excluir a conta administradora principal.');
      }
      await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
      await writeSystemLog(req, {
        action: 'delete',
        entity: 'users',
        recordId: id,
        summary: 'Utilizador excluído'
      });
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
    await writeSystemLog(req, {
      action: 'delete',
      entity: collection,
      recordId: id,
      summary: 'Registo excluído'
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/data/reset', async (req, res, next) => {
  let client;
  try {
    await requirePermission(req, 'configuracoes.backup');
    client = await db.pool.connect();
    await client.query('BEGIN');
    await client.query('DELETE FROM membros');
    await client.query('UPDATE app_records SET deleted_at = NOW(), updated_at = NOW() WHERE deleted_at IS NULL');
    await client.query('COMMIT');
    await writeSystemLog(req, {
      action: 'data_reset',
      entity: 'system',
      summary: 'Dados operacionais eliminados'
    });
    res.json({ success: true });
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Failed to roll back data reset:', rollbackError);
      }
    }
    next(error);
  } finally {
    if (client) client.release();
  }
});

app.get('/api/data/export', async (req, res, next) => {
  try {
    await requirePermission(req, 'configuracoes.backup');
    const [records, members] = await Promise.all([
      db.query(
        `SELECT collection, data FROM app_records
         WHERE collection <> 'Membro' AND deleted_at IS NULL ORDER BY collection, record_id`
      ),
      db.query(`SELECT ${MEMBER_RETURNING} FROM membros ORDER BY id`)
    ]);
    const collections = Object.fromEntries(
      Object.keys(COLLECTIONS).map((collection) => [collection, []])
    );
    collections.Membro = members.rows;
    for (const row of records.rows) {
      if (!collections[row.collection]) collections[row.collection] = [];
      collections[row.collection].push(row.data);
    }
    await writeSystemLog(req, {
      action: 'backup_export',
      entity: 'system',
      summary: 'Backup exportado',
      details: {
        collections: Object.fromEntries(
          Object.entries(collections).map(([name, items]) => [name, items.length])
        )
      }
    });
    res.json(collections);
  } catch (error) {
    next(error);
  }
});

app.post('/api/data/import', async (req, res, next) => {
  let client;
  try {
    await requirePermission(req, 'configuracoes.backup');
    const collections = req.body?.collections;
    if (!isObject(collections)) throw httpError(400, 'Os dados do backup não são válidos.');

    const dataCollections = Object.entries(collections)
      .filter(([collection, records]) => COLLECTIONS[collection] && Array.isArray(records));
    if (!dataCollections.length) {
      throw httpError(400, 'O backup não contém coleções de dados reconhecidas.');
    }
    for (const [collection, records] of dataCollections) {
      if (records.some((record) =>
        !isObject(record)
        || record.id === undefined
        || record.id === null
        || !String(record.id).trim()
        || String(record.id).length > 255
      )) {
        throw httpError(400, `A coleção "${collection}" contém um registo sem identificador válido.`);
      }
      if (collection === 'Membro' && records.some((record) => !String(record.nome || '').trim())) {
        throw httpError(400, 'O backup contém um membro sem nome.');
      }
    }

    client = await db.pool.connect();
    await client.query('BEGIN');
    const imported = {};
    for (const [collection, records] of dataCollections) {
      const recordsById = new Map();
      for (const incoming of records) {
        const id = String(incoming.id);
        recordsById.set(id, { ...incoming, id });
      }

      const normalizedRecords = [...recordsById.values()];
      if (collection === 'Membro') {
        await client.query(
          `INSERT INTO membros
            (record_id, nome, email, telefone, data_nascimento, endereco, cidade,
             departamento, estado_civil, status, data_batismo, cargo, pdf_document)
           SELECT
             member.id, member.nome, member.email, member.telefone,
             NULLIF(member.data_nascimento, '')::date, member.endereco,
             COALESCE(NULLIF(member.cidade, ''), 'Luanda'), member.departamento,
             NULLIF(member.estado_civil, ''), COALESCE(NULLIF(member.status, ''), 'ativo'),
             NULLIF(member.data_batismo, '')::date, member.cargo, member.pdf_document
           FROM jsonb_to_recordset($1::jsonb) AS member(
             id text, nome text, email text, telefone text, data_nascimento text,
             endereco text, cidade text, departamento text, estado_civil text,
             status text, data_batismo text, cargo text, pdf_document text
           )
           ON CONFLICT (record_id) DO UPDATE SET
             nome = EXCLUDED.nome,
             email = EXCLUDED.email,
             telefone = EXCLUDED.telefone,
             data_nascimento = EXCLUDED.data_nascimento,
             endereco = EXCLUDED.endereco,
             cidade = EXCLUDED.cidade,
             departamento = EXCLUDED.departamento,
             estado_civil = EXCLUDED.estado_civil,
             status = EXCLUDED.status,
             data_batismo = EXCLUDED.data_batismo,
             cargo = EXCLUDED.cargo,
             pdf_document = EXCLUDED.pdf_document,
             updated_at = NOW()`,
          [JSON.stringify(normalizedRecords)]
        );
        imported[collection] = normalizedRecords.length;
        continue;
      }

      await client.query(
        `INSERT INTO app_records (collection, record_id, data)
         SELECT $1, incoming.data->>'id', incoming.data
         FROM jsonb_array_elements($2::jsonb) AS incoming(data)
         ON CONFLICT (collection, record_id) DO UPDATE
         SET data = EXCLUDED.data, updated_at = NOW(), deleted_at = NULL`,
        [collection, JSON.stringify(normalizedRecords)]
      );
      imported[collection] = normalizedRecords.length;
    }

    await client.query('COMMIT');
    await writeSystemLog(req, {
      action: 'backup_import',
      entity: 'system',
      summary: 'Backup restaurado',
      details: { imported }
    });
    res.json({ imported });
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Failed to roll back backup import:', rollbackError);
      }
    }
    next(error);
  } finally {
    if (client) client.release();
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || 500;
  if (
    status >= 500
    || status === 401
    || status === 403
    || ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
  ) {
    const isLoginFailure = req.path === '/api/auth/login' && status < 500;
    const isAuditReadFailure = req.path === '/api/system-logs';
    if (!isLoginFailure && !isAuditReadFailure) {
      void writeSystemLog(req, {
        action: status >= 500 ? 'api_error' : 'request_failed',
        entity: req.params?.collection || 'system',
        summary: `Operação não concluída (${req.method} ${req.path})`,
        outcome: 'failure',
        details: { status }
      });
    }
  }
  if (error.status && error.status < 500) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  console.error('API request failed:', error);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

async function migrateLegacyMembers() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const legacyMembers = await client.query(
      `SELECT record_id, data FROM app_records
       WHERE collection = 'Membro' AND deleted_at IS NULL ORDER BY record_id`
    );
    const placeholders = MEMBER_FIELDS.map((_, index) => `$${index + 2}`).join(', ');
    let migratedCount = 0;

    for (const row of legacyMembers.rows) {
      const member = normalizeMember(row.data);
      const recordId = String(row.data.id || row.record_id).trim();
      if (!member.nome || !recordId || recordId.length > 255) {
        console.error(`Skipping invalid legacy member record ${row.record_id}.`);
        continue;
      }

      await client.query(
        `INSERT INTO membros (record_id, ${MEMBER_FIELDS.join(', ')})
         VALUES ($1, ${placeholders})
         ON CONFLICT (record_id) DO NOTHING`,
        [recordId, ...MEMBER_FIELDS.map((field) => member[field])]
      );
      await client.query(
        `DELETE FROM app_records
         WHERE collection = 'Membro' AND record_id = $1`,
        [row.record_id]
      );
      migratedCount += 1;
    }

    await client.query('COMMIT');
    if (migratedCount) console.log(`Migrated ${migratedCount} legacy member record(s) to membros.`);
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Failed to roll back legacy member migration:', rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

async function start() {
  if (isProduction && !jwtSecret) {
    throw new Error('Defina JWT_SECRET nas variáveis de ambiente do Render antes de iniciar a API.');
  }
  await db.query(`
    ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS nome VARCHAR(255),
      ADD COLUMN IF NOT EXISTS cargo VARCHAR(100),
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'personalizado',
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo',
      ADD COLUMN IF NOT EXISTS permissoes JSONB DEFAULT '["dashboard"]'::jsonb,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `);
  await db.query(`
    UPDATE usuarios
    SET nome = COALESCE(NULLIF(BTRIM(nome), ''), split_part(email, '@', 1)),
        role = COALESCE(NULLIF(role, ''), 'personalizado'),
        status = COALESCE(NULLIF(status, ''), 'ativo'),
        permissoes = COALESCE(permissoes, '["dashboard"]'::jsonb),
        updated_at = COALESCE(updated_at, NOW())
  `);
  await db.query(
    `UPDATE usuarios SET role = 'admin', permissoes = $1::jsonb
     WHERE lower(email) = ANY($2::text[])`,
    [JSON.stringify(ADMIN_PERMISSIONS), ADMIN_EMAILS]
  );
  await db.query('ALTER TABLE usuarios ALTER COLUMN nome SET NOT NULL');
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
  await db.query(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      actor_id VARCHAR(255),
      actor_name VARCHAR(255),
      actor_email VARCHAR(255),
      actor_role VARCHAR(50),
      action VARCHAR(80) NOT NULL,
      entity VARCHAR(100),
      record_id VARCHAR(255),
      outcome VARCHAR(20) NOT NULL DEFAULT 'success'
        CHECK (outcome IN ('success', 'failure')),
      summary TEXT NOT NULL,
      request_method VARCHAR(10),
      request_path TEXT,
      details JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `);
  await db.query(
    'CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON system_logs (created_at DESC, id DESC)'
  );
  await db.query('ALTER TABLE app_records ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ');
  await db.query(`
    ALTER TABLE membros
      ADD COLUMN IF NOT EXISTS record_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS departamento VARCHAR(100),
      ADD COLUMN IF NOT EXISTS data_batismo DATE,
      ADD COLUMN IF NOT EXISTS pdf_document TEXT
  `);
  await db.query('UPDATE membros SET record_id = id::text WHERE record_id IS NULL OR record_id = \'\'');
  await db.query('CREATE UNIQUE INDEX IF NOT EXISTS membros_record_id_uidx ON membros (record_id)');
  await db.query('UPDATE membros SET status = COALESCE(NULLIF(status, \'\'), \'ativo\')');
  await db.query('ALTER TABLE membros DROP CONSTRAINT IF EXISTS membros_status_check');
  await db.query(`
    ALTER TABLE membros
      ADD CONSTRAINT membros_status_check
      CHECK (status IN ('ativo', 'inativo', 'afastado', 'disciplina'))
  `);
  await migrateLegacyMembers();
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
