import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  getConnectionStatus,
  getQRCode,
  disconnectInstance,
  sendTextMessage,
} from '../services/whatsappService';
import { ApiResponse } from '../types';

const prisma = new PrismaClient();

const DEFAULT_TEMPLATES: Record<string, string> = {
  PENDENTE: `Olá *{{nome}}*, tudo bem?\n\nAqui é da *SP Apoio Financeiro*.\n\nRecebemos sua solicitação de crédito no valor de *{{valor}}*.\n\nSeu cadastro está *pendente de análise* e em breve nossa equipe irá avaliar.\n\nFique tranquilo(a), assim que tivermos uma atualização, entraremos em contato por aqui mesmo.\n\nQualquer dúvida, é só chamar!\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
  EM_ANALISE: `Olá *{{nome}}*, tudo bem?\n\nAqui é da *SP Apoio Financeiro*.\n\nPassando para informar que sua solicitação de crédito no valor de *{{valor}}* já está *em análise* pela nossa equipe.\n\nEstamos avaliando toda a documentação enviada e em breve teremos uma resposta para você.\n\nAgradecemos a confiança e a paciência!\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
  APROVADO: `Olá *{{nome}}*! Temos uma ótima notícia!\n\nSua solicitação de crédito no valor de *{{valor}}* foi *APROVADA*!\n\nParabéns! Nossa equipe entrará em contato para finalizar o processo com você.\n\n👉 Para dar continuidade, clique no link abaixo e fale conosco:\n\nhttps://api.whatsapp.com/send?phone=5571983024664\n\nAgradecemos por escolher a *SP Apoio Financeiro*.\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
  RECUSADO: `Olá *{{nome}}*, tudo bem?\n\nAqui é da *SP Apoio Financeiro*.\n\nApós análise criteriosa, infelizmente não foi possível aprovar sua solicitação de crédito no valor de *{{valor}}* neste momento.\n\nIsso não significa que não poderemos ajudá-lo(a) no futuro. Você pode realizar uma nova solicitação após 30 dias ou entrar em contato para avaliarmos outras opções.\n\nAgradecemos seu interesse e confiança.\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
};

function parseTemplate(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '');
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// GET /api/admin/whatsapp/status
export async function handleWhatsAppStatus(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const status = await getConnectionStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/whatsapp/qrcode
export async function handleWhatsAppQRCode(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getQRCode();
    console.log('[WhatsApp QRCode]', JSON.stringify(result).substring(0, 200));
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/whatsapp/disconnect
export async function handleWhatsAppDisconnect(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const ok = await disconnectInstance();
    res.json({ success: ok, message: ok ? 'Desconectado' : 'Erro ao desconectar' });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/whatsapp/templates
export async function handleGetTemplates(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const templates = await prisma.messageTemplate.findMany();
    res.json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/whatsapp/templates/seed
export async function handleSeedTemplates(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const defaults: { status: 'PENDENTE' | 'APROVADO' | 'RECUSADO'; content: string }[] = [
      {
        status: 'PENDENTE',
        content: `Olá *{{nome}}*, tudo bem?\n\nAqui é da *SP Apoio Financeiro*.\n\nRecebemos sua solicitação de crédito no valor de *{{valor}}*.\n\nSeu cadastro está *pendente de análise* e em breve nossa equipe irá avaliar.\n\nFique tranquilo(a), assim que tivermos uma atualização, entraremos em contato por aqui mesmo.\n\nQualquer dúvida, é só chamar!\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
      },
      {
        status: 'APROVADO',
        content: `Olá *{{nome}}*! Temos uma ótima notícia!\n\nSua solicitação de crédito no valor de *{{valor}}* foi *APROVADA*!\n\nParabéns! Nossa equipe entrará em contato para finalizar o processo com você.\n\n👉 Para dar continuidade, clique no link abaixo e fale conosco:\n\nhttps://api.whatsapp.com/send?phone=5571983024664\n\nAgradecemos por escolher a *SP Apoio Financeiro*.\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
      },
      {
        status: 'RECUSADO',
        content: `Olá *{{nome}}*, tudo bem?\n\nAqui é da *SP Apoio Financeiro*.\n\nApós análise criteriosa, infelizmente não foi possível aprovar sua solicitação de crédito no valor de *{{valor}}* neste momento.\n\nIsso não significa que não poderemos ajudá-lo(a) no futuro. Você pode realizar uma nova solicitação após 30 dias ou entrar em contato para avaliarmos outras opções.\n\nAgradecemos seu interesse e confiança.\n\nAtenciosamente,\n*Equipe SP Apoio Financeiro*`,
      },
    ];

    const results = [];
    for (const t of defaults) {
      const template = await prisma.messageTemplate.upsert({
        where: { status: t.status },
        update: {},
        create: { status: t.status, content: t.content },
      });
      results.push(template);
    }

    res.json({ success: true, data: results, message: 'Templates padrão criados' });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/whatsapp/templates/:status
export async function handleUpsertTemplate(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ success: false, error: 'content é obrigatório' });
      return;
    }

    const template = await prisma.messageTemplate.upsert({
      where: { status: status as any },
      update: { content },
      create: { status: status as any, content },
    });

    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/whatsapp/logs/:leadId
export async function handleGetMessageLogs(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const leadId = req.params.leadId as string;
    const logs = await prisma.messageLog.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/whatsapp/send
export async function handleWhatsAppSend(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      res.status(400).json({ success: false, error: 'phone e message são obrigatórios' });
      return;
    }

    const result = await sendTextMessage(phone, message);

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.json({ success: true, message: 'Mensagem enviada com sucesso' });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/whatsapp/send-lead
export async function handleWhatsAppSendLead(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { leadId } = req.body;

    if (!leadId) {
      res.status(400).json({ success: false, error: 'leadId é obrigatório' });
      return;
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      res.status(404).json({ success: false, error: 'Lead não encontrado' });
      return;
    }

    const template = ['PENDENTE', 'APROVADO', 'RECUSADO'].includes(lead.status)
      ? await prisma.messageTemplate.findUnique({
          where: { status: lead.status as any },
        })
      : null;

    const vars: Record<string, string> = {
      nome: lead.nome.split(' ')[0],
      valor: formatCurrency(lead.valorSolicitado),
      telefone: lead.telefone,
      cidade: lead.cidade,
      status: lead.status,
      cpf: lead.cpf || '',
      email: lead.email || '',
    };

    const templateContent = template?.content || DEFAULT_TEMPLATES[lead.status] || DEFAULT_TEMPLATES.PENDENTE;
    const message = parseTemplate(templateContent, vars);
    const result = await sendTextMessage(lead.telefone, message);

    await prisma.messageLog.create({
      data: {
        leadId: lead.id,
        telefone: lead.telefone,
        mensagem: message,
        status: result.success ? 'ENVIADO' : 'ERRO',
      },
    });

    if (!result.success) {
      res.status(500).json({ success: false, error: result.error });
      return;
    }

    res.json({ success: true, data: { message }, message: 'Mensagem enviada com sucesso' });
  } catch (error) {
    next(error);
  }
}
