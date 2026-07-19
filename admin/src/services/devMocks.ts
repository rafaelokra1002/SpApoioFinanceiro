import { Lead } from '../types';

/**
 * Dados de exemplo APENAS para desenvolvimento (`import.meta.env.DEV`).
 * Usados como fallback quando o backend local não está no ar, só para pré-visualizar
 * o layout. Nunca são usados em produção. Para remover: apague este arquivo e o
 * bloco `catch` em services/api.ts que o importa.
 */

const now = Date.now();
const day = 24 * 60 * 60 * 1000;
const ago = (d: number) => new Date(now - d * day).toISOString();

let seq = 0;
function mk(
  nome: string, cidade: string, valor: number, status: string,
  indicacao: string | null, prazo: number, daysAgo: number,
  instagram: string | null = null,
  extra: Partial<Lead> = {},
): Lead {
  seq += 1;
  return {
    id: `dev-${seq}`,
    nome,
    telefone: `(71) 9${String(80000000 + seq * 137).slice(0, 8)}`,
    cpf: null,
    email: null,
    instagram,
    renda: String(1500 + seq * 90),
    valorSolicitado: valor,
    valorTotal: Math.round(valor * 1.3),
    taxaJuros: 30,
    prazo,
    cidade,
    perfil: 'CLT',
    nomeEmpresa: null,
    bairroTrabalho: null,
    indicacao,
    endereco: null,
    cep: null,
    enderecoTrabalho: null,
    observacao: null,
    latitude: null,
    longitude: null,
    evitarGolpes: false,
    analiseCliente: false,
    status,
    createdAt: ago(daysAgo),
    updatedAt: ago(Math.max(0, daysAgo - 2)),
    documentos: [],
    ...extra,
  };
}

/**
 * `daysAgo` espalha os leads pelos últimos ~6 meses para o gráfico ter forma.
 * Cada status aparece em vários meses (inclusive RECUSADO), senão as linhas
 * ficam achatadas em zero e se sobrepõem.
 */
export const DEV_SAMPLE_LEADS: Lead[] = [
  // Aprovados (11) — espalhados de ontem até ~5 meses atrás
  mk('Lucas Ferreira Nunes', 'Camaçari', 600, 'APROVADO', 'João Silva', 30, 1, 'lucas.nunes'),
  mk('Ana Clara Santos', 'Lauro de Freitas', 500, 'APROVADO', '@blogueira_ana', 60, 4, 'anaclara'),
  mk('Rafael Pereira Santos', 'Feira de Santana', 1900, 'APROVADO', 'Maria Oliveira', 30, 22),
  mk('Vinícius Souza Lima', 'Dias d\'Ávila', 3000, 'APROVADO', 'Amigo', 90, 34, 'vini.souza'),
  mk('Juliana Barreto Costa', 'Camaçari', 2400, 'APROVADO', 'Marcos Almeida', 60, 40),
  mk('Diego Moreira Alves', 'Catu', 2200, 'APROVADO', 'panfleto na feira', 90, 63),
  mk('Beatriz Lima Cardoso', 'Mata de São João', 1800, 'APROVADO', 'Irmã', 30, 78),
  mk('Paulo Henrique Silva', 'Pojuca', 2500, 'APROVADO', 'instagram', 60, 96, 'paulinho.hs'),
  mk('Camila Rocha Dias', 'Camaçari', 1200, 'APROVADO', 'Colega de trabalho', 45, 110),
  mk('Rodrigo Nogueira Melo', 'Lauro de Freitas', 900, 'APROVADO', null, 30, 128),
  mk('Fernanda Alves Pinto', 'Feira de Santana', 1500, 'APROVADO', 'Vizinho', 60, 150),

  // Pendentes (4) — com empresa/endereço para o card detalhado
  mk('Marcela Teixeira', 'Catu', 800, 'PENDENTE', 'Instagram', 30, 0, null,
    { nomeEmpresa: 'Indústria Bahia LTDA', enderecoTrabalho: 'Rua do Trabalho, 123 – Polo Industrial', perfil: 'CLT_SEM_REGISTRO',
      endereco: 'Rua das Flores, 123 – Parafuso, Catu/BA', cep: '48110-000',
      observacao: 'Preciso do apoio para quitar minhas contas atrasadas e organizar minhas finanças.',
      latitude: -12.3486, longitude: -38.3781 }),
  mk('Gustavo Ramos', 'Camaçari', 1700, 'PENDENTE', null, 60, 3, null,
    { nomeEmpresa: 'Autônomo', enderecoTrabalho: 'Rua da Liberdade, 45 – Centro', perfil: 'Autônomo',
      endereco: 'Rua do Sol, 88 – Centro, Camaçari/BA', cep: '42800-100',
      observacao: 'Preciso de um empréstimo para investir no meu pequeno negócio e aumentar meu estoque.' }),
  mk('Sérgio Barbosa', 'Pojuca', 1400, 'PENDENTE', 'Amigo', 30, 47),
  mk('Patrícia Nunes', 'Camaçari', 2100, 'PENDENTE', 'panfleto', 90, 101),

  // Clientes que JÁ solicitaram antes (mesmo telefone) — alimentam "Solicitações anteriores".
  mk('Eliana Santana dos Santos', 'Camaçari', 900, 'RECUSADO', 'Achei pelo instagram', 30, 66, 'eliana.ss',
    { telefone: '(71) 99251-8849' }),
  mk('Eliana Santana dos Santos', 'Camaçari', 800, 'PENDENTE', 'Achei pelo instagram', 30, 2, 'eliana.ss',
    { telefone: '(71) 99251-8849', nomeEmpresa: 'Indústria Bahia LTDA', enderecoTrabalho: 'Rua do Trabalho, 123 – Polo Industrial, Camaçari/BA', perfil: 'CLT_SEM_REGISTRO',
      endereco: 'Rua das Flores, 123 – Parafuso, Camaçari/BA', cep: '42800-000',
      observacao: 'Preciso do apoio para quitar minhas contas atrasadas e organizar minhas finanças. Pretendo pagar antes do vencimento.',
      evitarGolpes: true, analiseCliente: true }),

  mk('Dislaikdila Moura', 'Catu', 1600, 'APROVADO', 'Amigo', 60, 85, null, { telefone: '(71) 99348-4694' }),
  mk('Dislaikdila Moura', 'Catu', 1600, 'PENDENTE', 'Amigo', 60, 1, null,
    { telefone: '(71) 99348-4694', nomeEmpresa: 'Autônomo', enderecoTrabalho: 'Rua da Liberdade, 45 – Centro', perfil: 'Autônomo',
      endereco: 'Rua do Sol, 88 – Centro, Catu/BA', cep: '48110-000',
      observacao: 'Preciso de um empréstimo para investir no meu pequeno negócio e aumentar meu estoque.',
      analiseCliente: true }),

  // Recusados (5) — presentes em vários meses
  mk('Tatiane Sousa', 'Dias d\'Ávila', 1100, 'RECUSADO', 'panfleto', 30, 6),
  mk('Everton Dias', 'Catu', 950, 'RECUSADO', null, 30, 29),
  mk('Rita Fontes', 'Camaçari', 1600, 'RECUSADO', 'Instagram', 60, 58),
  mk('Marcos Aurélio', 'Feira de Santana', 700, 'RECUSADO', 'Vizinho', 30, 88),
  mk('Débora Lima', 'Lauro de Freitas', 1250, 'RECUSADO', 'Prima', 45, 140),

  // Não contrataram (3)
  mk('Bruno Carvalho', 'Pojuca', 2000, 'NAO_CONTRATOU', 'Amigo', 90, 12),
  mk('Aline Ferreira', 'Camaçari', 1350, 'NAO_CONTRATOU', 'Instagram', 60, 69),
  mk('Thiago Mendes', 'Catu', 1750, 'NAO_CONTRATOU', null, 30, 120),

  // Passei para colaborador (2)
  mk('Larissa Menezes', 'Camaçari', 1300, 'PASSEI_COLABORADOR', 'Prima', 45, 9),
  mk('Otávio Ramos', 'Dias d\'Ávila', 2300, 'PASSEI_COLABORADOR', 'Amigo', 60, 75),
];

// Anexa documentos de exemplo (só para pré-visualizar o detalhe, Fotos e Backup).
// Imagens do picsum (exigem internet); um PDF para exercitar o ícone de arquivo.
const DEV_PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

function devDoc(leadId: string, n: number, tipo: string, filename: string, url: string): Lead['documentos'][number] {
  return { id: `${leadId}-doc-${n}`, leadId, tipo, url, filename, createdAt: ago(2) };
}

function fullDocs(lead: Lead, seed: number): Lead['documentos'] {
  const img = (i: number) => `https://picsum.photos/seed/${seed + i}/600/600`;
  return [
    devDoc(lead.id, 1, 'RG (Frente)', 'rg-frente.jpg', img(1)),
    devDoc(lead.id, 2, 'RG (Verso)', 'rg-verso.jpg', img(2)),
    devDoc(lead.id, 3, 'CPF', 'cpf.jpg', img(3)),
    devDoc(lead.id, 4, 'Comprovante de residência', 'comprovante-residencia.jpg', img(4)),
    devDoc(lead.id, 5, 'Comprovante de renda', 'comprovante-renda.jpg', img(5)),
    devDoc(lead.id, 6, 'Carteira de trabalho', 'ctps.pdf', DEV_PDF),
    devDoc(lead.id, 7, 'Selfie com documento', 'selfie.jpg', img(7)),
  ];
}

let docSeed = 100;
DEV_SAMPLE_LEADS.forEach((lead) => {
  if (lead.status === 'PENDENTE') {
    lead.documentos = fullDocs(lead, docSeed);
  } else if (lead.status === 'APROVADO') {
    const all = fullDocs(lead, docSeed);
    // RG (frente), CPF, comprovante e a SELFIE (índice 6) — a selfie vira a foto de perfil.
    lead.documentos = [all[0], all[2], all[3], all[6]];
  }
  docSeed += 10;
});
