import { getWaipBaseUrl, waipHeaders } from "@/lib/waip";

export const maxDuration = 600;

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const url = `${getWaipBaseUrl()}/v1.1/skills/doc_completion/prepare`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...waipHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dataset_id: id }),
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
