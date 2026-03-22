/** Collapse double+ newlines (optional cleanup). */
export function collapseThermalBlankLines(input: string): string {
  if (!input) return "";
  return input.replace(/\n{2,}/g, "\n");
}

/** Removes leading spaces/tabs on each line so thermal width is not wasted on fake indents. */
export function stripThermalLineLeadingSpaces(input: string): string {
  if (!input) return "";
  return input
    .split(/\r?\n/)
    .map((line) => line.replace(/^[ \t]+/, ""))
    .join("\n");
}

/**
 * Plain thermal preview: no blank lines, markdown-style list stars/hyphens → bullet,
 * strip **bold** markers so the receipt shows plain text.
 */
export function prepareThermalReceiptDisplay(input: string): string {
  let s = stripThermalLineLeadingSpaces(input);
  s = collapseThermalBlankLines(s);
  const lines = s.split(/\r?\n/).map((line) => {
    if (/^\*\s+/.test(line)) return line.replace(/^\*\s+/, "• ");
    if (/^-\s+/.test(line)) return line.replace(/^-\s+/, "• ");
    return line;
  });
  s = lines.join("\n");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  return s;
}
