import { PrismaClient } from '@prisma/client';
import { LeadInput, LeadStatus } from '../types';

const prisma = new PrismaClient();

export async function createLead(data: LeadInput) {
  const lead = await prisma.lead.create({
    data: {
      nome: data.nome,
      telefone: data.telefone,
      cpf: data.cpf || null,
      email: data.email || null,
      valorSolicitado: data.valorSolicitado,
      valorTotal: data.valorTotal,
      cidade: data.cidade,
      perfil: data.perfil,
      nomeEmpresa: data.nomeEmpresa || null,
      bairroTrabalho: data.bairroTrabalho || null,
    },
  });

  return lead;
}

export async function addDocuments(
  leadId: string,
  documents: { tipo: string; url: string; filename: string }[]
) {
  const docs = await prisma.document.createMany({
    data: documents.map((doc) => ({
      leadId,
      tipo: doc.tipo,
      url: doc.url,
      filename: doc.filename,
    })),
  });

  return docs;
}

export async function getAllLeads(status?: string) {
  const where = status ? { status } : {};

  return prisma.lead.findMany({
    where,
    include: { documentos: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: { documentos: true },
  });
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  return prisma.lead.update({
    where: { id },
    data: { status },
  });
}

export async function deleteLead(id: string) {
  return prisma.lead.delete({ where: { id } });
}

export async function getStats() {
  const [total, pendentes, aprovados, recusados] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'PENDENTE' } }),
    prisma.lead.count({ where: { status: 'APROVADO' } }),
    prisma.lead.count({ where: { status: 'RECUSADO' } }),
  ]);

  const valorTotal = await prisma.lead.aggregate({
    _sum: { valorSolicitado: true },
  });

  return {
    total,
    pendentes,
    aprovados,
    recusados,
    valorTotalSolicitado: valorTotal._sum.valorSolicitado || 0,
  };
}
