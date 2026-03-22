/** Default document library for this deployment (WAIP dataset `_id`). */
export const DEFAULT_WAIP_DATASET_ID =
  "c81e6816-3aa3-4193-a35e-16c4f6614603";

/**
 * Default doc_completion model for WAIP (must match tenant allow-list).
 * `gpt-5-chat` is the GPT-5-class option; strong alternatives: `gpt-4.1`, `gpt-4o`, `gemini-2.5-pro`.
 */
export const DEFAULT_WAIP_MODEL_NAME = "gpt-5-chat";

/**
 * WAIP validates max_output_tokens per model (e.g. gpt-4: 1–4096).
 */
export function waipMaxOutputCapForModel(modelName: string): number {
  const m = modelName.toLowerCase();
  if (m.includes("gpt-5") || m.includes("gemini")) {
    return 8192;
  }
  if (
    m.includes("gpt-4") ||
    m.includes("gpt4-8k") ||
    m.includes("gpt-35") ||
    m.includes("gpt-3")
  ) {
    return 4096;
  }
  return 4096;
}
