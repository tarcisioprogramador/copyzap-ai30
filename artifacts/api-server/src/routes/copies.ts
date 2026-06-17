import { Router } from "express";
import { db } from "@workspace/db";
import { copiesTable } from "@workspace/db";
import { GenerateCopyBody, DeleteCopyParams } from "@workspace/api-zod";
import Groq from "groq-sdk";
import { eq, sql, desc } from "drizzle-orm";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY must be set.");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const router = Router();

const messageTypeLabels: Record<string, string> = {
  venda: "Venda / Primeiro contato",
  followup: "Follow-up / Acompanhamento",
  urgencia: "Urgência / Escassez",
  posVenda: "Pós-venda / Fidelização",
  objecao: "Quebra de objeção",
};

const toneLabels: Record<string, string> = {
  profissional: "profissional e confiante",
  amigavel: "amigável e descontraído",
  direto: "direto e objetivo",
  emocional: "emocional e empático",
};

function buildPrompt(
  clientName: string,
  product: string,
  messageType: string,
  tone: string,
  value?: string,
  context?: string
): string {
  const typeLabel = messageTypeLabels[messageType] ?? messageType;
  const toneLabel = toneLabels[tone] ?? tone;

  let prompt = `Você é um especialista em copywriting para vendas pelo WhatsApp no Brasil.

Gere uma mensagem de WhatsApp do tipo "${typeLabel}" com tom ${toneLabel}.

Dados:
- Nome do cliente: ${clientName}
- Produto/Serviço: ${product}`;

  if (value) prompt += `\n- Valor: R$ ${value}`;
  if (context) prompt += `\n- Contexto adicional: ${context}`;

  prompt += `

Regras importantes:
- Escreva diretamente a mensagem, sem introduções como "Aqui está" ou "Segue a mensagem"
- Use linguagem natural brasileira
- Máximo de 5 parágrafos curtos
- Pode usar 1-2 emojis relevantes, mas não exagere
- Inclua uma chamada para ação clara no final
- A mensagem deve parecer escrita por um humano, não por IA
- Não use asteriscos para negrito
- Adapte o tom conforme solicitado

Escreva apenas a mensagem final, pronta para enviar.`;

  return prompt;
}

router.get("/copies/stats", async (req, res) => {
  try {
    const total = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(copiesTable);

    const byTypeRows = await db
      .select({
        messageType: copiesTable.messageType,
        count: sql<number>`count(*)::int`,
      })
      .from(copiesTable)
      .groupBy(copiesTable.messageType);

    const todayRows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(copiesTable)
      .where(sql`date(created_at) = current_date`);

    const byType: Record<string, number> = {};
    for (const row of byTypeRows) {
      byType[row.messageType] = row.count;
    }

    res.json({
      total: total[0]?.count ?? 0,
      byType,
      todayCount: todayRows[0]?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get copy stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/copies", async (req, res) => {
  try {
    const copies = await db
      .select()
      .from(copiesTable)
      .orderBy(desc(copiesTable.createdAt))
      .limit(50);

    res.json(
      copies.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list copies");
    res.status(500).json({ error: "Failed to list copies" });
  }
});

router.post("/copies", async (req, res) => {
  const parsed = GenerateCopyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error });
    return;
  }

  const { clientName, product, value, context, messageType, tone = "profissional" } = parsed.data;

  try {
    const prompt = buildPrompt(clientName, product, messageType, tone, value ?? undefined, context ?? undefined);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
    });

    const generatedText = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!generatedText) {
      res.status(500).json({ error: "A IA não retornou texto. Tente novamente." });
      return;
    }

    const [inserted] = await db
      .insert(copiesTable)
      .values({
        clientName,
        product,
        value: value ?? null,
        context: context ?? null,
        messageType,
        tone,
        generatedText,
      })
      .returning();

    res.status(201).json({
      ...inserted,
      createdAt: inserted.createdAt.toISOString(),
    });
  } catch (err: unknown) {
    req.log.error({ err }, "Failed to generate copy");
    const msg = err instanceof Error ? err.message : "Erro ao gerar copy com IA";
    res.status(502).json({ error: msg });
  }
});

router.delete("/copies/:id", async (req, res) => {
  const parsed = DeleteCopyParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    await db.delete(copiesTable).where(eq(copiesTable.id, parsed.data.id));
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete copy");
    res.status(500).json({ error: "Failed to delete copy" });
  }
});

export default router;
