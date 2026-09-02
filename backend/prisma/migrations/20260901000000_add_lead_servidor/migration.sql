-- Servidor público: vínculo (EFETIVO/COMISSIONADO) e matrícula funcional ou cargo ocupado.
-- Aditivo e idempotente: apenas adiciona colunas nullable; nenhum dado é removido.
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "vinculoServidor" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "matriculaCargo" TEXT;
