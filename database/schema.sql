-- Script para criação do banco de dados Gestão Eclesiástica Pro (PostgreSQL)

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
);
CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON system_logs (created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS igrejas_filiadas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    cidade VARCHAR(100),
    pastor VARCHAR(255),
    data_fundacao DATE,
    telefone VARCHAR(50),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS membros (
    id SERIAL PRIMARY KEY,
    record_id VARCHAR(255),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(50),
    data_nascimento DATE,
    endereco TEXT,
    cidade VARCHAR(100),
    estado_civil VARCHAR(50) CHECK (estado_civil IN ('solteiro', 'casado', 'divorciado', 'viuvo')),
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'afastado', 'disciplina')),
    departamento VARCHAR(100),
    data_batismo DATE,
    pdf_document TEXT,
    data_ingresso DATE,
    igreja_filiada_id INT REFERENCES igrejas_filiadas(id) ON DELETE SET NULL,
    batizado BOOLEAN DEFAULT false,
    cargo VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lideres (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    membro_id INT REFERENCES membros(id) ON DELETE SET NULL,
    cargo VARCHAR(100) NOT NULL CHECK (cargo IN ('pastor', 'presbitero', 'diacono', 'lider_celula', 'coordenador')),
    data_inicio DATE,
    data_fim DATE,
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    igreja_filiada_id INT REFERENCES igrejas_filiadas(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conselho_presbiterio (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    membro_id INT REFERENCES membros(id) ON DELETE SET NULL,
    cargo VARCHAR(100) NOT NULL CHECK (cargo IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'conselheiro')),
    data_inicio DATE,
    data_fim DATE,
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dizimos (
    id SERIAL PRIMARY KEY,
    nome_membro VARCHAR(255) NOT NULL,
    membro_id INT REFERENCES membros(id) ON DELETE SET NULL,
    valor NUMERIC(10,2) NOT NULL,
    data DATE NOT NULL,
    forma_pagamento VARCHAR(50) CHECK (forma_pagamento IN ('dinheiro', 'pix', 'cartao', 'transferencia')),
    igreja_filiada_id INT REFERENCES igrejas_filiadas(id) ON DELETE SET NULL,
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ofertas (
    id SERIAL PRIMARY KEY,
    valor NUMERIC(10,2) NOT NULL,
    data DATE NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('culto', 'missao', 'construcao', 'especial')),
    descricao TEXT,
    forma_pagamento VARCHAR(50) CHECK (forma_pagamento IN ('dinheiro', 'pix', 'cartao', 'transferencia')),
    igreja_filiada_id INT REFERENCES igrejas_filiadas(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS encargos (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    data DATE NOT NULL,
    categoria VARCHAR(50) CHECK (categoria IN ('manutencao', 'agua', 'luz', 'internet', 'salario', 'imposto', 'material', 'evento', 'outro')),
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente', 'cancelado')),
    igreja_filiada_id INT REFERENCES igrejas_filiadas(id) ON DELETE SET NULL,
    fornecedor VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documentos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('ata', 'certidao', 'contrato', 'oficio', 'relatorio', 'outro')),
    descricao TEXT,
    file_url TEXT,
    data DATE,
    membro_id INT REFERENCES membros(id) ON DELETE SET NULL,
    igreja_filiada_id INT REFERENCES igrejas_filiadas(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projetos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_inicio DATE,
    data_fim DATE,
    orcamento NUMERIC(10,2),
    valor_arrecadado NUMERIC(10,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'cancelado')),
    responsavel VARCHAR(255),
    igreja_filiada_id INT REFERENCES igrejas_filiadas(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
