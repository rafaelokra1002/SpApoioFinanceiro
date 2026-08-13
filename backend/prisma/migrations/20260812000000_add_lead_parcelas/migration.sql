-- Nº de parcelas escolhido pelo cliente na solicitação (1 = à vista).
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "parcelas" INTEGER NOT NULL DEFAULT 1;
