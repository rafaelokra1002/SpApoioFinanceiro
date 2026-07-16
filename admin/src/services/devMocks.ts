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
    status,
    createdAt: ago(daysAgo),
    updatedAt: ago(Math.max(0, daysAgo - 2)),
    documentos: [],
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

  // Pendentes (4)
  mk('Marcela Teixeira', 'Catu', 800, 'PENDENTE', 'Instagram', 30, 0),
  mk('Gustavo Ramos', 'Camaçari', 1700, 'PENDENTE', null, 60, 3),
  mk('Sérgio Barbosa', 'Pojuca', 1400, 'PENDENTE', 'Amigo', 30, 47),
  mk('Patrícia Nunes', 'Camaçari', 2100, 'PENDENTE', 'panfleto', 90, 101),

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
