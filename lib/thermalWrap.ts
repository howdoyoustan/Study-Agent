const DEFAULT_WIDTH = 32;

/**
 * Hard-wraps text so no output line exceeds `width` characters.
 * Breaks at the last space in each chunk when possible; otherwise breaks mid-word.
 */
export function wrapThermalText(input: string, width = DEFAULT_WIDTH): string {
  if (!input) return "";
  const lines = input.split(/\r?\n/);
  const out: string[] = [];

  for (const raw of lines) {
    if (raw.length <= width) {
      out.push(raw);
      continue;
    }
    let line = raw;
    while (line.length > width) {
      const chunk = line.slice(0, width);
      const sp = chunk.lastIndexOf(" ");
      const cut = sp > 0 ? sp : width;
      let piece = line.slice(0, cut).trimEnd();
      let advance = cut;
      if (piece.length === 0) {
        piece = line.slice(0, width);
        advance = width;
      }
      out.push(piece);
      line = line.slice(advance).trimStart();
    }
    if (line.length > 0) out.push(line);
  }

  return out.join("\n");
}

export function thermalColumnWidth(): number {
  return DEFAULT_WIDTH;
}
