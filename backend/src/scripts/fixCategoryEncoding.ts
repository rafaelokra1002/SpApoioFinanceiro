/**
 * Migração única: conserta o mojibake (UTF-8 lido como Windows-1252) já gravado
 * nas categorias e documentos. Rode uma vez apontando para o banco desejado:
 *
 *   npm run fix:categories        (usa o DATABASE_URL do ambiente)
 *
 * É seguro rodar mais de uma vez: só altera campos que ainda parecem corrompidos.
 */
import { PrismaClient } from '@prisma/client';
import iconv from 'iconv-lite';

const prisma = new PrismaClient();

/**
 * Marcadores que só aparecem em texto corrompido, nunca no português das categorias.
 * Todo caractere multibyte de UTF-8 lido como win1252 começa por Ã(C3) / Â(C2) /
 * â(E2) / ð(F0), então basta detectar um deles.
 */
function looksMojibake(s: string): boolean {
  return /[ÂÃâð]/.test(s);
}

/** Reverte o mojibake win1252; preserva bytes indefinidos no win1252 (0x81,0x8D,0x8F,0x90,0x9D). */
function fix(s: string): string {
  if (!s || !looksMojibake(s)) return s;
  const bytes: number[] = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    if (cp >= 0x80 && cp <= 0x9f) bytes.push(cp);
    else for (const b of iconv.encode(ch, 'win1252')) bytes.push(b);
  }
  return Buffer.from(bytes).toString('utf8');
}

async function main() {
  let catChanges = 0;
  let docChanges = 0;

  const categories = await prisma.category.findMany({ include: { documents: true } });

  for (const cat of categories) {
    const label = fix(cat.label);
    const icon = fix(cat.icon);
    if (label !== cat.label || icon !== cat.icon) {
      await prisma.category.update({ where: { id: cat.id }, data: { label, icon } });
      catChanges++;
      console.log(`categoria: ${cat.label}  ->  ${label}`);
    }

    for (const doc of cat.documents) {
      const label2 = fix(doc.label);
      const description = fix(doc.description);
      const icon2 = fix(doc.icon);
      const key = fix(doc.key);
      if (label2 !== doc.label || description !== doc.description || icon2 !== doc.icon || key !== doc.key) {
        await prisma.categoryDocument.update({
          where: { id: doc.id },
          data: { label: label2, description, icon: icon2, key },
        });
        docChanges++;
      }
    }
  }

  console.log(`\nConcluído. Categorias corrigidas: ${catChanges}, documentos: ${docChanges}.`);
}

main()
  .catch((err) => {
    console.error('Falha na correção:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
