CREATE TYPE "PerfilUsuario" AS ENUM ('Admin', 'Responsavel', 'Solicitante');

CREATE TABLE IF NOT EXISTS "usuarios_facilities" (
  "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "nome"       VARCHAR(100) NOT NULL,
  "email"      VARCHAR(150) NOT NULL UNIQUE,
  "senha_hash" TEXT NOT NULL,
  "perfil"     "PerfilUsuario" NOT NULL DEFAULT 'Solicitante',
  "ativo"      BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "usuarios_facilities_pkey" PRIMARY KEY ("id")
);

-- Trigger updated_at (função já existe)
DROP TRIGGER IF EXISTS usuarios_facilities_updated_at ON "usuarios_facilities";
CREATE TRIGGER usuarios_facilities_updated_at
BEFORE UPDATE ON "usuarios_facilities"
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Coluna solicitante_id na tabela de solicitações (se não existir)
ALTER TABLE "solicitacoes_facilities" ADD COLUMN IF NOT EXISTS "solicitante_id" VARCHAR(36);
