import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const input = resolve(root, "content/candidates.json");
const allowedStatus = new Set(["discovered", "reviewing", "needs-source", "ready", "rejected"]);
const allowedConfidence = new Set(["pending", "partial", "verified"]);
const allowedPriority = new Set(["low", "normal", "high", "urgent"]);

function isHttps(value) {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export function validateCandidates(payload) {
  const errors = [];
  if (!payload || typeof payload !== "object") return ["候选队列必须是对象"];
  if (!Array.isArray(payload.candidates)) return ["candidates 必须是数组"];
  const ids = new Set();
  for (const [index, item] of payload.candidates.entries()) {
    const at = `candidates[${index}]`;
    for (const field of ["id", "title", "discoveredAt", "discoveredFrom", "status", "confidence", "priority"]) {
      if (item[field] === undefined || item[field] === null || item[field] === "") errors.push(`${at}.${field} 缺失`);
    }
    if (ids.has(item.id)) errors.push(`${at}.id 重复: ${item.id}`);
    ids.add(item.id);
    if (!allowedStatus.has(item.status)) errors.push(`${at}.status 非法`);
    if (!allowedConfidence.has(item.confidence)) errors.push(`${at}.confidence 非法`);
    if (!allowedPriority.has(item.priority)) errors.push(`${at}.priority 非法`);
    if (!isHttps(item.discoveredFrom)) errors.push(`${at}.discoveredFrom 必须是 HTTPS URL`);
    if (item.officialUrl && !isHttps(item.officialUrl)) errors.push(`${at}.officialUrl 必须是 HTTPS URL`);
    if (item.sourceUrl && !isHttps(item.sourceUrl)) errors.push(`${at}.sourceUrl 必须是 HTTPS URL`);
    if (Number.isNaN(Date.parse(item.discoveredAt))) errors.push(`${at}.discoveredAt 日期非法`);
    if (item.lastCheckedAt && Number.isNaN(Date.parse(item.lastCheckedAt))) errors.push(`${at}.lastCheckedAt 日期非法`);
    if (item.status === "ready") {
      for (const field of ["officialUrl", "sourceUrl", "organizer", "deadline"]) {
        if (!item[field]) errors.push(`${at}.${field} 在 ready 状态下必填`);
      }
      if (item.confidence !== "verified") errors.push(`${at}.ready 状态必须为 verified`);
    }
    if (item.status === "rejected" && !item.reviewNote) errors.push(`${at}.rejected 状态必须填写 reviewNote`);
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const payload = JSON.parse(await readFile(input, "utf8"));
  const errors = validateCandidates(payload);
  if (errors.length) {
    console.error(`候选活动校验失败（${errors.length} 项）\n${errors.map((item) => `- ${item}`).join("\n")}`);
    process.exit(1);
  }
  const counts = Object.fromEntries([...allowedStatus].map((status) => [status, payload.candidates.filter((item) => item.status === status).length]));
  console.log(`候选活动通过校验（${payload.candidates.length} 条）`);
  console.log(counts);
}
