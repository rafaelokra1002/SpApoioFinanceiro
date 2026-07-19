-- Grupo em que o lead caiu (1, 2 ou 3) e motivo da recusa, marcados pelo painel.
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "grupo" INTEGER;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "motivoRecusa" TEXT;
