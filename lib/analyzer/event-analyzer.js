import { analyzeWithCodex } from "./codex-analyzer";

/**
 * 活动解析统一入口。
 *
 * 当前阶段：
 * 1. 人工使用 Codex CLI 分析官方赛事页面
 * 2. 将结构化结果传入
 * 3. 统一标准化输出
 *
 * 后续接入 API 模型时，仅替换 analyzer 实现。
 */
export async function analyzeEventPage({ url, analysisResult }) {
  return analyzeWithCodex({
    url,
    analysisResult
  });
}
