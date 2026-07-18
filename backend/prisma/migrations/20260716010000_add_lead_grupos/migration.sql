-- Grupos de triagem do lead (marcação manual pelo painel).
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "evitarGolpes" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "analiseCliente" BOOLEAN NOT NULL DEFAULT false;
