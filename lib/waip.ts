/** Trim whitespace and optional surrounding quotes from .env values */
export function envRaw(name: string): string | undefined {
  const v = process.env[name];
  if (v == null || v === "") return undefined;
  let s = v.trim();
  if (
    (s.startsWith("'") && s.endsWith("'")) ||
    (s.startsWith('"') && s.endsWith('"'))
  ) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

export function requireEnv(name: string): string {
  const v = envRaw(name);
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

export function getWaipBaseUrl(): string {
  const base = requireEnv("WAIP_API_ENDPOINT").replace(/\/$/, "");
  return base;
}

export function waipHeaders(): HeadersInit {
  const key = requireEnv("WAIP_API_KEY");
  return {
    Authorization: `Bearer ${key}`,
    Accept: "application/json, text/event-stream",
  };
}
