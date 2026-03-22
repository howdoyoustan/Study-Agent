import { DEFAULT_WAIP_DATASET_ID } from "@/lib/constants";
import { envRaw, getWaipBaseUrl, waipHeaders } from "@/lib/waip";
import { RAG_SYNTHESIS_GUIDANCE } from "@/lib/queryGuidance";
import { THERMAL_RECEIPT_FORMAT_PROMPT } from "@/lib/thermalReceiptFormat";

export async function POST(req: Request) {
  try {
    const envDatasetId = envRaw("WAIP_DATASET_ID");

    const body = (await req.json()) as {
      dataset_id?: string;
      question?: string;
      messages?: { role: string; content: string }[];
      return_sources?: boolean;
      max_output_tokens?: number;
      model_name?: string;
      /** When true (default for question-only requests), prepend thermal receipt rules. */
      receipt_format?: boolean;
    };

    const fromBody =
      typeof body.dataset_id === "string" ? body.dataset_id.trim() : "";
    const resolvedId =
      fromBody || envDatasetId || DEFAULT_WAIP_DATASET_ID;

    let messages: { role: string; content: string }[] | null;

    if (body.messages?.length) {
      messages = body.messages;
      if (body.receipt_format === true) {
        messages = [
          {
            role: "user",
            content: `${THERMAL_RECEIPT_FORMAT_PROMPT}\n\n${RAG_SYNTHESIS_GUIDANCE}\n\n(Follow the formatting rules above for your reply in this conversation.)`,
          },
          ...messages,
        ];
      }
    } else if (body.question?.trim()) {
      const q = body.question.trim();
      const useReceipt = body.receipt_format !== false;
      messages = [
        {
          role: "user",
          content: useReceipt
            ? `${THERMAL_RECEIPT_FORMAT_PROMPT}\n\n${RAG_SYNTHESIS_GUIDANCE}\n\nApply every formatting rule in the first block above to your full response.\n\nQuestion:\n${q}`
            : `${RAG_SYNTHESIS_GUIDANCE}\n\nQuestion:\n${q}`,
        },
      ];
    } else {
      messages = null;
    }

    if (!messages?.length) {
      return Response.json(
        { error: "Provide `question` or `messages`." },
        { status: 400 },
      );
    }

    const useReceiptFormat = body.messages?.length
      ? body.receipt_format === true
      : body.receipt_format !== false;

    const url = `${getWaipBaseUrl()}/v1.1/skills/doc_completion/query`;
    const payload = {
      dataset_id: resolvedId,
      skill_parameters: {
        model_name: body.model_name ?? "gpt-4",
        retrieval_chain: "custom",
        emb_type: "openai",
        temperature: useReceiptFormat ? 0.25 : 0.2,
        max_output_tokens:
          body.max_output_tokens ??
          (useReceiptFormat ? 2048 : 1024),
        return_sources: body.return_sources ?? true,
      },
      stream_response: false,
      messages,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...waipHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { raw: text };
    }
    return Response.json(data, { status: res.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
