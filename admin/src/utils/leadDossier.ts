import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { Lead } from '../types';

export interface LeadMessageLog {
  id: string;
  mensagem: string;
  status: string;
  createdAt: string;
}

function formatCurrency(value: number | string | null) {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  if (numericValue === null || Number.isNaN(numericValue)) {
    return '—';
  }

  return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR');
}

function safeLabel(value: string | null | undefined) {
  if (!value) {
    return '—';
  }

  return value;
}

function formatProfile(profile: string) {
  return profile.replace(/_/g, ' ');
}

function sanitizeSegment(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function extensionFromDocumentName(fileName: string, blobType: string) {
  const fromName = fileName.split('.').pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) {
    return fromName;
  }

  if (blobType.includes('pdf')) {
    return 'pdf';
  }
  if (blobType.includes('png')) {
    return 'png';
  }
  if (blobType.includes('webp')) {
    return 'webp';
  }

  return 'jpg';
}

function buildSummaryLines(lead: Lead, logs: LeadMessageLog[]) {
  const lines = [
    'DOSSIE DO LEAD - SP APOIO FINANCEIRO',
    '',
    `Gerado em: ${formatDate(new Date().toISOString())}`,
    `Lead ID: ${lead.id}`,
    '',
    'DADOS DO CLIENTE',
    `Nome: ${lead.nome}`,
    `Telefone: ${lead.telefone}`,
    `CPF: ${safeLabel(lead.cpf)}`,
    `Email: ${safeLabel(lead.email)}`,
    `Instagram: ${safeLabel(lead.instagram)}`,
    `Renda: ${formatCurrency(lead.renda)}`,
    '',
    'DADOS DA SOLICITACAO',
    `Status: ${lead.status}`,
    `Perfil: ${formatProfile(lead.perfil)}`,
    `Cidade: ${lead.cidade}`,
    `Valor solicitado: ${formatCurrency(lead.valorSolicitado)}`,
    `Valor total: ${formatCurrency(lead.valorTotal)}`,
    `Taxa de juros: ${lead.taxaJuros}%`,
    `Prazo: ${lead.prazo} dias`,
    `Empresa: ${safeLabel(lead.nomeEmpresa)}`,
    `Bairro de trabalho: ${safeLabel(lead.bairroTrabalho)}`,
    `Criado em: ${formatDate(lead.createdAt)}`,
    `Atualizado em: ${formatDate(lead.updatedAt)}`,
    '',
    `DOCUMENTOS (${lead.documentos.length})`,
    ...lead.documentos.map((doc, index) => `${index + 1}. ${doc.filename} - ${doc.url}`),
  ];

  if (logs.length > 0) {
    lines.push('', `MENSAGENS (${logs.length})`);
    logs.forEach((log, index) => {
      lines.push(`${index + 1}. [${log.status}] ${formatDate(log.createdAt)}`);
      lines.push(log.mensagem);
      lines.push('');
    });
  }

  return lines;
}

function buildSummaryPdf(lead: Lead, logs: LeadMessageLog[]) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const maxWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const ensureSpace = (requiredHeight: number) => {
    if (cursorY + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      cursorY = margin;
    }
  };

  const addTextBlock = (text: string, fontSize = 10, weight: 'normal' | 'bold' = 'normal', gap = 14) => {
    pdf.setFont('helvetica', weight);
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    const blockHeight = lines.length * (fontSize + 2);
    ensureSpace(blockHeight + gap);
    pdf.text(lines, margin, cursorY);
    cursorY += blockHeight + gap;
  };

  addTextBlock('SP Apoio Financeiro', 16, 'bold', 8);
  addTextBlock('Dossie para analise de credito', 12, 'normal', 20);

  buildSummaryLines(lead, logs).forEach((line) => {
    if (line === '') {
      cursorY += 4;
      return;
    }

    const isSection = /^[A-Z0-9 ()-]+$/.test(line) && !line.includes(':');
    addTextBlock(line, isSection ? 11 : 10, isSection ? 'bold' : 'normal', isSection ? 10 : 8);
  });

  return pdf.output('blob');
}

async function fetchDocumentBlob(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao baixar documento: ${url}`);
  }

  return response.blob();
}

function triggerDownload(blob: Blob, fileName: string) {
  const link = document.createElement('a');
  const blobUrl = URL.createObjectURL(blob);
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}

export async function downloadLeadDossier(lead: Lead, logs: LeadMessageLog[]) {
  const zip = new JSZip();
  const folderName = [sanitizeSegment(lead.nome) || 'lead', sanitizeSegment(lead.telefone) || lead.id.slice(0, 8)]
    .filter(Boolean)
    .join('_');

  const rootFolder = zip.folder(folderName) || zip;
  const docsFolder = rootFolder.folder('documentos') || rootFolder;
  const summaryLines = buildSummaryLines(lead, logs);

  rootFolder.file('resumo.txt', summaryLines.join('\n'));
  rootFolder.file('resumo.pdf', buildSummaryPdf(lead, logs));

  const failedDocuments: string[] = [];

  for (const [index, documentItem] of lead.documentos.entries()) {
    try {
      const blob = await fetchDocumentBlob(documentItem.url);
      const extension = extensionFromDocumentName(documentItem.filename, blob.type);
      const baseName = sanitizeSegment(documentItem.filename.replace(/\.[^.]+$/, '')) || `documento_${index + 1}`;
      const numberedName = `${String(index + 1).padStart(2, '0')}_${baseName}.${extension}`;
      docsFolder.file(numberedName, blob);
    } catch {
      failedDocuments.push(`${documentItem.filename} - ${documentItem.url}`);
    }
  }

  if (failedDocuments.length > 0) {
    rootFolder.file('documentos_nao_baixados.txt', failedDocuments.join('\n'));
  }

  const archive = await zip.generateAsync({ type: 'blob' });
  triggerDownload(archive, `${folderName || 'lead'}_dossie.zip`);
}