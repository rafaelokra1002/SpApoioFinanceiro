-- Localização compartilhada pelo cliente ao acessar o link.
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
