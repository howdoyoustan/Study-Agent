import { getWaipBaseUrl, waipHeaders } from "@/lib/waip";

/**
 * Vercel Hobby allows max 300s. Pro/Enterprise can raise this (e.g. 600) in code
 * if your plan supports it: https://vercel.com/docs/functions/runtimes#max-duration
 */
export const maxDuration = 300;

/**
 * Forwards multipart form data to WAIP ingest.
 * Use field name "files" for each uploaded file (or any keys — all file parts are forwarded).
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  /** Slightly under maxDuration so we return 504 before the platform hard-kills. */
  const WAIP_INGEST_TIMEOUT_MS = 295_000;

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
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: waipHeaders(),
        body: out,
        signal: AbortSignal.timeout(WAIP_INGEST_TIMEOUT_MS),
      });
    } catch (e) {
      const name = e instanceof Error ? e.name : "";
      const message = e instanceof Error ? e.message : String(e);
      if (name === "TimeoutError" || message.includes("timeout")) {
        return Response.json(
          {
            error:
              "Ingest timed out waiting for WAIP (very large PDF or slow network). Try one smaller file at a time, or retry. If upload succeeded on WAIP’s side, you may still run Prepare.",
            code: "INGEST_TIMEOUT",
          },
          { status: 504 },
        );
      }
      return Response.json(
        { error: message || "Ingest failed before reaching WAIP.", code: "INGEST_FETCH_ERROR" },
        { status: 502 },
      );
    }

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
