/** Best-effort extract assistant text from doc_completion / completion-style JSON. */
export function extractDocCompletionContent(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (o.data && typeof o.data === "object" && o.data !== null) {
    const inner = o.data as Record<string, unknown>;
    if (typeof inner.content === "string") return inner.content;
  }
  if (typeof o.content === "string") return o.content;
  return null;
}
