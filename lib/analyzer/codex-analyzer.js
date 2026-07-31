import { normalizeEvent } from "./event-schema";

/**
 * Codex CLI 分析适配层。
 *
 * 当前阶段不直接绑定具体模型，外部通过 Codex CLI 生成结构化 JSON 后传入。
 * 后续替换为 API 模型时，只需要替换此模块。
 */
export async function analyzeWithCodex({ url, analysisResult }) {
  return normalizeEvent({
    ...analysisResult,
    officialUrl: url
  });
}
