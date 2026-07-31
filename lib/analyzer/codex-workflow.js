import { normalizeEvent } from "./event-schema";

/**
 * Codex CLI analysis adapter.
 *
 * Current workflow:
 * 1. User provides official event URL/content.
 * 2. Codex CLI extracts structured JSON.
 * 3. This adapter normalizes the result before storage.
 *
 * The adapter intentionally does not call any model directly.
 * Future providers can replace this layer.
 */
export function analyzeWithCodexResult({ url, result }) {
  return normalizeEvent({
    ...result,
    officialUrl: url,
    analyzedBy: "codex-cli"
  });
}
