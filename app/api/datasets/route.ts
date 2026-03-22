import { getWaipBaseUrl, waipHeaders } from "@/lib/waip";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      description?: string;
    };
    const name = body.name?.trim() || "Study dataset";
    const description = body.description?.trim() || "";

    const url = `${getWaipBaseUrl()}/v1.1/datasets`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...waipHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
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
