-- Aparelho do cliente (modelo/sistema/navegador) e o User-Agent bruto do envio.
-- Aditivo e idempotente: apenas adiciona colunas nullable; nenhum dado é removido.
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "dispositivo" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
