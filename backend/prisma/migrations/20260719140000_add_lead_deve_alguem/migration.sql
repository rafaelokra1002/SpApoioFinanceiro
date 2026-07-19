-- "Deve alguém": anotação usada na análise do cliente (enviada ao grupo).
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "deveAlguem" TEXT;
