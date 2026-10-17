-- Motorista de aplicativo: veículo próprio/alugado e placa.
-- Aditivo e idempotente: apenas adiciona colunas nullable; nenhum dado é removido.
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "veiculoProprio" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "placaVeiculo" TEXT;
