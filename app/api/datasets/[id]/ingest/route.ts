import { getWaipBaseUrl, waipHeaders } from "@/lib/waip";

/**
 * Forwards multipart form data to WAIP ingest.
 * Use field name "files" for each uploaded file (or any keys — all file parts are forwarded).
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const incoming = await req.formData();
    const out = new FormData();
    let fileCount = 0;

    for (const [key, value] of incoming.entries()) {
      if (value instanceof File && value.size > 0) {
        out.append(key, value, value.name);
        fileCount += 1;
      }
    }

    if (fileCount === 0) {
      return Response.json(
        { error: "No files received. Use a form field named `files` with PDFs." },
        { status: 400 },
      );
    }

    const url = `${getWaipBaseUrl()}/v1.1/datasets/${id}/ingest`;
    const res = await fetch(url, {
      method: "POST",
      headers: waipHeaders(),
      body: out,
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
