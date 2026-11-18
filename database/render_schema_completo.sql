-- ==============================================================================
-- SCRIPT COMPLETO DE BANCO DE DADOS - GESTÃO ECLESIÁSTICA I.E.L.
-- PostgreSQL 15+ do serviço compartilhado gestao-igreja-db no Render
-- Realidade: Igreja Evangélica de Luanda, Guiné-Bissau
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE USUÁRIOS E PRIVILÉGIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(100),
    role VARCHAR(50) DEFAULT 'personalizado',
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    permissoes JSONB DEFAULT '["dashboard"]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compatibilidade com bancos criados por versões anteriores do esquema.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nome VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cargo VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'personalizado';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS permissoes JSONB DEFAULT '["dashboard"]'::jsonb;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
UPDATE usuarios
SET nome = COALESCE(NULLIF(BTRIM(nome), ''), split_part(email, '@', 1)),
    role = COALESCE(NULLIF(role, ''), 'personalizado'),
    status = COALESCE(NULLIF(status, ''), 'ativo'),
    permissoes = COALESCE(permissoes, '["dashboard"]'::jsonb),
    updated_at = COALESCE(updated_at, NOW());
UPDATE usuarios
SET role = 'admin',
    permissoes = '["dashboard","estatisticas","membros","departamentos","conselho","secretaria","entradas","encargos","patrimonio","projetos","igrejas","configuracoes"]'::jsonb
WHERE lower(email) IN ('admin@iel.com', 'admin@iel.org', 'admin@iegb.org');

-- 2.1 DADOS COMPARTILHADOS DO FRONTEND
CREATE TABLE IF NOT EXISTS app_records (
    collection VARCHAR(80) NOT NULL,
    record_id VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    PRIMARY KEY (collection, record_id)
);

-- 3. TABELA DE CONFIGURAÇÕES GERAIS DA INSTITUIÇÃO
CREATE TABLE IF NOT EXISTS configuracoes (
    id SERIAL PRIMARY KEY,
    nome_igreja VARCHAR(255) NOT NULL DEFAULT 'Igreja Evangélica de Luanda',
    idioma_padrao VARCHAR(10) DEFAULT 'pt',
    telefone VARCHAR(50),
    email VARCHAR(100),
    endereco TEXT DEFAULT 'Luanda, Guiné-Bissau',
    politica_uso TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE IGREJAS FILIADAS / CONGREGAÇÕES
CREATE TABLE IF NOT EXISTS igrejas_filiadas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    cidade VARCHAR(100),
    pastor VARCHAR(255),
    telefone VARCHAR(50),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABELA DE DEPARTAMENTOS
CREATE TABLE IF NOT EXISTS departamentos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    responsavel VARCHAR(255),
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABELA DE MEMBROS
CREATE TABLE IF NOT EXISTS membros (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(50),
    data_nascimento DATE,
    endereco TEXT,
    cidade VARCHAR(100) DEFAULT 'Luanda',
    departamento VARCHAR(100),
    estado_civil VARCHAR(50) CHECK (estado_civil IN ('solteiro', 'casado', 'divorciado', 'viuvo')),
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'afastado')),
    data_batismo DATE,
    cargo VARCHAR(100),
    igreja_filiada_id INT REFERENCES igrejas_filiadas(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABELA DO CONSELHO DE PRESBITÉRIO & DIREÇÃO
CREATE TABLE IF NOT EXISTS conselho_presbiterio (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(50),
    membro_id INT REFERENCES membros(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABELA DE REUNIÕES & ALERTAS DA SECRETARIA
CREATE TABLE IF NOT EXISTS reunioes (
    id SERIAL PRIMARY KEY,
    assunto VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    local VARCHAR(255),
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABELA DE DELIBERAÇÕES & DECISÕES DO CONSELHO
CREATE TABLE IF NOT EXISTS deliberacoes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    reuniao_assunto VARCHAR(255),
    data_reuniao DATE NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('financeira', 'institucional', 'pastoral', 'patrimonio', 'disciplinar', 'missoes', 'outro')),
    status VARCHAR(50) DEFAULT 'aprovada' CHECK (status IN ('aprovada', 'rejeitada', 'em_andamento', 'suspensa', 'concluida')),
    descricao TEXT NOT NULL,
    responsavel VARCHAR(255),
    votos_favor INT DEFAULT 0,
    votos_contra INT DEFAULT 0,
    abstencoes INT DEFAULT 0,
    prazo_execucao DATE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABELA DE ESCALAS DE CULTO
CREATE TABLE IF NOT EXISTS escalas_culto (
    id SERIAL PRIMARY KEY,
    equipe VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. FINANCEIRO: DÍZIMOS (Valores em XOF)
CREATE TABLE IF NOT EXISTS dizimos (
    id SERIAL PRIMARY KEY,
    nome_membro VARCHAR(255) NOT NULL,
    membro_id INT REFERENCES membros(id) ON DELETE SET NULL,
    valor NUMERIC(12,2) NOT NULL,
    data DATE NOT NULL,
    forma_pagamento VARCHAR(50) CHECK (forma_pagamento IN ('dinheiro', 'transferencia', 'mobile_money', 'cartao', 'outro')),
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. FINANCEIRO: OFERTAS (Valores em XOF)
CREATE TABLE IF NOT EXISTS ofertas (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('culto', 'missao', 'construcao', 'especial', 'outro')),
    valor NUMERIC(12,2) NOT NULL,
    data DATE NOT NULL,
    forma_pagamento VARCHAR(50) CHECK (forma_pagamento IN ('dinheiro', 'transferencia', 'mobile_money', 'cartao', 'outro')),
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. FINANCEIRO: ENCARGOS & DESPESAS (Valores em XOF)
CREATE TABLE IF NOT EXISTS encargos (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(12,2) NOT NULL,
    data DATE NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente', 'cancelado')),
    fornecedor VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. TABELA DE PATRIMÔNIO (Valores em XOF)
CREATE TABLE IF NOT EXISTS patrimonio (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) CHECK (categoria IN ('Imovel', 'Equipamento', 'Veiculo', 'Mobiliario', 'Outro')),
    modalidade VARCHAR(50) DEFAULT 'Ativo',
    valor_estimado NUMERIC(14,2) NOT NULL,
    periodo_vida INT DEFAULT 60, -- meses
    data_aquisicao DATE,
    estado VARCHAR(50) DEFAULT 'Bom',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. TABELA DE PROJETOS MISSIONÁRIOS E SOCIAIS (Valores em XOF)
CREATE TABLE IF NOT EXISTS projetos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    responsavel VARCHAR(255),
    orcamento NUMERIC(14,2) NOT NULL,
    valor_arrecadado NUMERIC(14,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'em_andamento' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'cancelado')),
    data_inicio DATE,
    data_fim DATE,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. TABELA DE DOCUMENTOS E ATAS
CREATE TABLE IF NOT EXISTS documentos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('ata', 'estatuto', 'certidao', 'relatorio', 'oficio', 'contrato', 'outro')),
    categoria VARCHAR(50),
    data DATE NOT NULL,
    autor VARCHAR(255),
    file_url TEXT,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. CONTEÚDO DO SITE: CARROSSEL, VÍDEOS, NOTÍCIAS E CULTOS
CREATE TABLE IF NOT EXISTS site_carousel (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    url TEXT NOT NULL,
    ordem INT DEFAULT 1,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_videos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    url TEXT NOT NULL,
    ordem INT DEFAULT 1,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_cultos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    dia VARCHAR(50) NOT NULL,
    hora VARCHAR(20) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_noticias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    descricao TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==============================================================================
-- DADOS INICIAIS (SEEDS) - GUINÉ-BISSAU
-- ==============================================================================

-- 1. Usuário Administrador Principal (senha padrão: admin)
INSERT INTO usuarios (nome, email, password_hash, cargo, role, status, permissoes)
VALUES (
    'Administrador Geral',
    'admin@iel.org',
    'admin',
    'Pastor Presidente',
    'admin',
    'ativo',
    '["dashboard","estatisticas","membros","departamentos","conselho","secretaria","entradas","encargos","patrimonio","projetos","igrejas","configuracoes"]'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- 2. Configurações da Igreja
INSERT INTO configuracoes (nome_igreja, idioma_padrao, telefone, email, endereco, politica_uso)
VALUES (
    'Igreja Evangélica de Luanda',
    'pt',
    NULL,
    NULL,
    'Luanda, Guiné-Bissau',
    'Bem-vindo ao sistema de Gestão Eclesiástica da Igreja Evangélica de Luanda. O uso indevido das informações confidenciais está sujeito a penalidades éticas e legais.'
) ON CONFLICT DO NOTHING;

-- 3. Departamentos
INSERT INTO departamentos (nome, responsavel, descricao) VALUES
('Jovens', 'Pr. João Baptista', 'Ministério de jovens, universitários e adolescentes.'),
('Senhoras', 'Ir. Maria Esperança', 'Sociedade feminina e círculo de oração.'),
('Louvor', 'Ir. Paulo David', 'Ministério de louvor, coral e instrumentistas.'),
('Infantil', 'Ir. Ana Paula', 'Departamento infantil e Escola Bíblica para crianças.')
ON CONFLICT (nome) DO NOTHING;

-- 4. Congregações
INSERT INTO igrejas_filiadas (nome, endereco, cidade, pastor, telefone, status) VALUES
('Congregação Luanda Centro', 'Luanda, Guiné-Bissau', 'Luanda', 'Pb. Carlos', '+244 900 111 222', 'ativa'),
('Congregação de Viana', 'Viana, Luanda', 'Viana', 'Ev. Pedro', '+244 900 333 444', 'ativa'),
('Congregação de Cacuaco', 'Cacuaco, Luanda', 'Cacuaco', 'Ev. Serifo', '+244 900 555 666', 'ativa')
ON CONFLICT DO NOTHING;

-- 5. Membros Iniciais
INSERT INTO membros (nome, email, telefone, data_nascimento, endereco, cidade, departamento, estado_civil, status, cargo) VALUES
('Aminata Baldé', 'aminata.balde@iel.org', '+244 900 001 111', '1985-04-12', 'Luanda, Guiné-Bissau', 'Luanda', 'Jovens', 'casado', 'ativo', 'Líder de Célula'),
('Umaro Cande', 'umaro.cande@iel.org', '+244 900 002 222', '1990-09-03', 'Luanda, Guiné-Bissau', 'Luanda', 'Senhoras', 'solteiro', 'ativo', 'Diácono'),
('Fatoumata Sissoco', 'fatou.sissoco@iel.org', '+244 900 003 333', '1998-12-20', 'Luanda, Guiné-Bissau', 'Luanda', 'Louvor', 'solteiro', 'ativo', 'Vocalista')
ON CONFLICT DO NOTHING;

-- 6. Projetos Sociais (Valores em XOF)
INSERT INTO projetos (nome, responsavel, orcamento, valor_arrecadado, status, data_inicio, data_fim, descricao) VALUES
('Acesso à Água Potável nas Tabancas', 'Pr. Mário Gomes', 5000000.00, 1200000.00, 'em_andamento', '2025-01-01', '2027-12-31', 'Perfuração de poços e bombas solares em tabancas rurais com escassez de água tratada.'),
('Programa de Saúde Comunitária e Alimentos', 'Pb. Mama Djalo', 800000.00, 650000.00, 'em_andamento', '2026-03-01', '2026-12-31', 'Assistência médica básica e cestas alimentares para famílias vulneráveis.')
ON CONFLICT DO NOTHING;
