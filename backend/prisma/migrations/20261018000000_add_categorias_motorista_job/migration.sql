-- Novas categorias: Motorista de aplicativo e Trabalho com job (GP).
-- Aditivo e idempotente: só insere a categoria se o "value" ainda não existir
-- (ON CONFLICT DO NOTHING); os documentos só entram junto com a categoria recém-criada.
-- Nada existente é alterado ou removido.

WITH nova AS (
  INSERT INTO "Category" ("id", "value", "label", "icon", "order", "active", "updatedAt")
  VALUES (md5(random()::text || clock_timestamp()::text)::uuid::text,
          'MOTORISTA_APP', 'Motorista de aplicativo', '🚗', 9, true, CURRENT_TIMESTAMP)
  ON CONFLICT ("value") DO NOTHING
  RETURNING "id"
)
INSERT INTO "CategoryDocument" ("id", "categoryId", "key", "label", "description", "icon", "order")
SELECT md5(random()::text || clock_timestamp()::text || d.ord::text)::uuid::text, nova."id", d.key, d.label, d.description, d.icon, d.ord
FROM nova
CROSS JOIN (VALUES
  ('RG ou CNH (frente)', 'RG ou CNH (frente)', 'Documento de identificação', '🪪', 0),
  ('RG ou CNH (verso)', 'RG ou CNH (verso)', 'Documento de identificação', '🪪', 1),
  ('Selfie (rosto)', 'Foto do rosto', 'Foto nítida, sem filtro.', '📷', 2),
  ('Comprovante de residência', 'Comprovante de residência', 'Água ou luz dos últimos 2 meses.', '🏠', 3),
  ('Comprovante de ganhos', 'Comprovante de ganhos', 'Extratos ou prints dos últimos 30 dias da Uber ou 99. Se trabalha nos dois, envie dos dois.', '📊', 4)
) AS d(key, label, description, icon, ord);

WITH nova AS (
  INSERT INTO "Category" ("id", "value", "label", "icon", "order", "active", "updatedAt")
  VALUES (md5(random()::text || clock_timestamp()::text)::uuid::text,
          'TRABALHO_JOB', 'Trabalho com job (GP)', '💼', 10, true, CURRENT_TIMESTAMP)
  ON CONFLICT ("value") DO NOTHING
  RETURNING "id"
)
INSERT INTO "CategoryDocument" ("id", "categoryId", "key", "label", "description", "icon", "order")
SELECT md5(random()::text || clock_timestamp()::text || d.ord::text)::uuid::text, nova."id", d.key, d.label, d.description, d.icon, d.ord
FROM nova
CROSS JOIN (VALUES
  ('RG ou CNH (frente)', 'RG ou CNH (frente)', 'Documento de identificação', '🪪', 0),
  ('RG ou CNH (verso)', 'RG ou CNH (verso)', 'Documento de identificação', '🪪', 1),
  ('Selfie (rosto)', 'Foto do rosto', 'Foto nítida, sem filtro.', '📷', 2),
  ('Comprovante de residência', 'Comprovante de residência', 'Água ou luz dos últimos 2 meses.', '🏠', 3),
  ('Extrato bancário', 'Extrato bancário', 'Últimos 30 dias.', '📄', 4)
) AS d(key, label, description, icon, ord);
