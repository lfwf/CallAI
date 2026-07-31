import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const input = resolve(root, "content/sources.json");
const output = resolve(root, "public/sources.json");
const allowedKinds = new Set(["competition-platform", "event-platform", "official-community", "government-platform", "company", "university", "media", "other"]);
const allowedPriorities = new Set(["high", "medium", "low"]);
const allowedTrustLevels = new Set(["official", "platform", "discovery-only"]);
const allowedMethods = new Set(["manual", "rss", "api", "html", "email"]);

export function validateSources(sources) {
  const errors = [];
  const ids = new Set();
  if (!Array.isArray(sources) || sources.length === 0) return ["来源库不能为空"];
  for (const [index, source] of sources.entries()) {
    const at = `sources[${index}]`;
    for (const field of ["id", "name", "homepage", "kind", "regions", "topics", "discoveryMethod", "priority", "trustLevel", "checkIntervalHours", "enabled"]) {
      if (source[field] === undefined || source[field] === null || source[field] === "") errors.push(`${at}.${field} 缺失`);
    }
    if (ids.has(source.id)) errors.push(`${at}.id 重复: ${source.id}`);
    ids.add(source.id);
    try {
      const url = new URL(source.homepage);
      if (url.protocol !== "https:") errors.push(`${at}.homepage 必须使用 HTTPS`);
    } catch {
      errors.push(`${at}.homepage 不是有效 URL`);
    }
    if (!allowedKinds.has(source.kind)) errors.push(`${at}.kind 非法`);
    if (!allowedPriorities.has(source.priority)) errors.push(`${at}.priority 非法`);
    if (!allowedTrustLevels.has(source.trustLevel)) errors.push(`${at}.trustLevel 非法`);
    if (!allowedMethods.has(source.discoveryMethod)) errors.push(`${at}.discoveryMethod 非法`);
    if (!Array.isArray(source.regions) || source.regions.length === 0) errors.push(`${at}.regions 不能为空`);
    if (!Array.isArray(source.topics) || source.topics.length === 0) errors.push(`${at}.topics 不能为空`);
    if (!Number.isInteger(source.checkIntervalHours) || source.checkIntervalHours < 1) errors.push(`${at}.checkIntervalHours 必须是正整数`);
    if (typeof source.enabled !== "boolean") errors.push(`${at}.enabled 必须是布尔值`);
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const sources = JSON.parse(await readFile(input, "utf8"));
  const errors = validateSources(sources);
  if (errors.length) {
    console.error(`来源库校验失败（${errors.length} 项）\n${errors.map((item) => `- ${item}`).join("\n")}`);
    process.exit(1);
  }
  if (!process.argv.includes("--check")) {
    await mkdir(resolve(root, "public"), { recursive: true });
    const active = sources.filter((source) => source.enabled);
    await writeFile(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), count: active.length, sources: active }, null, 2)}\n`, "utf8");
    console.log(`已生成 public/sources.json（${active.length} 个启用来源）`);
  } else {
    console.log(`来源库通过校验（${sources.length} 条）`);
  }
}
