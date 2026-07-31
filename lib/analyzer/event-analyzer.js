import { normalizeEvent } from "./event-schema";

/**
 * AI解析入口。
 * 当前只负责定义输入输出边界，后续接入LLM后替换内部实现。
 */
export async function analyzeEventPage({ url, content = "" }) {
  return normalizeEvent({
    officialUrl: url,
    rawContent: content
  });
}
