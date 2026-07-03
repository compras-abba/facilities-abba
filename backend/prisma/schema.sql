-- Abba Facilities — Schema inicial
-- Cole no SQL Editor do Supabase e clique em Run

-- ENUMS
CREATE TYPE "Setor" AS ENUM (
  'Producao', 'Manutencao', 'Administrativo',
  'Logistica', 'Qualidade', 'Comercial', 'Diretoria'
);

CREATE TYPE "TipoFacilities" AS ENUM (
  'Manutencao', 'Instalacao', 'Limpeza', 'Reparo', 'Licenca'
);

CREATE TYPE "FaseFacilities" AS ENUM (
  'Triagem', 'Diagnostico', 'Agendamento',
  'AguardandoCompras', 'Execucao', 'Concluido', 'Cancelado'
);

CREATE TYPE "Prioridade" AS ENUM (
  'Baixa', 'Media', 'Alta', 'Urgente'
);

-- TABELA PRINCIPAL
CREATE TABLE "solicitacoes_facilities" (
  "id"                     TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "solicitante_nome"       VARCHAR(100) NOT NULL,
  "solicitante_email"      VARCHAR(150),
  "setor"                  "Setor" NOT NULL,
  "tipo"                   "TipoFacilities" NOT NULL,
  "local_area"             VARCHAR(100) NOT NULL,
  "local_detalhe"          VARCHAR(200),
  "descricao"              TEXT NOT NULL,
  "prioridade"             "Prioridade" NOT NULL DEFAULT 'Media',
  "fase_atual"             "FaseFacilities" NOT NULL DEFAULT 'Triagem',
  "responsavel_nome"       VARCHAR(100),
  "responsavel_email"      VARCHAR(150),
  "diagnostico"            TEXT,
  "observacoes"            TEXT,
  "data_agendamento"       TIMESTAMPTZ,
  "data_execucao"          TIMESTAMPTZ,
  "data_conclusao"         TIMESTAMPTZ,
  "requer_cotacao_externa" BOOLEAN NOT NULL DEFAULT false,
  "solicitacao_compra_id"  VARCHAR(36),
  "anexos"                 TEXT[] NOT NULL DEFAULT '{}',
  "historico"              JSONB[] NOT NULL DEFAULT '{}',
  "created_at"             TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"             TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "solicitacoes_facilities_pkey" PRIMARY KEY ("id")
);

-- AUTO-UPDATE updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER facilities_updated_at
BEFORE UPDATE ON "solicitacoes_facilities"
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ÍNDICES
CREATE INDEX idx_facilities_fase ON "solicitacoes_facilities"("fase_atual");
CREATE INDEX idx_facilities_tipo ON "solicitacoes_facilities"("tipo");
CREATE INDEX idx_facilities_created ON "solicitacoes_facilities"("created_at" DESC);
