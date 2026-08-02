-- Origem real do cliente (PANFLETO/INSTAGRAM/INDICACAO), escolhida no envio.
-- Antes a origem era adivinhada por palavra-chave sobre o campo livre "indicacao".
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "origem" TEXT;
