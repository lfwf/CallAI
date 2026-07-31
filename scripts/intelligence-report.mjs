import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const events = JSON.parse(await readFile(resolve(root, "content/events.json"), "utf8"));
const sources = JSON.parse(await readFile(resolve(root, "content/sources.json"), "utf8"));
const candidatePayload = JSON.parse(await readFile(resolve(root, "content/candidates.json"), "utf8"));
const candidates = candidatePayload.candidates || [];
const now = Date.now();
const DAY = 86_400_000;
const has = (value) => value !== undefined && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0);
const completenessFields = ["summary", "format", "eligibility", "requirements", "reward", "languages", "regions", "schedule", "verifiedAt"];
const stale = events.filter((event) => now - new Date(event.verifiedAt).getTime() > 14 * DAY);
const deadlines7d = events.filter((event) => {
  const delta = new Date(event.deadline).getTime() - now;
  return delta >= 0 && delta <= 7 * DAY;
});
const incomplete = events.map((event) => ({
  id: event.id,
  missing: completenessFields.filter((field) => !has(event[field]))
})).filter((item) => item.missing.length);
const completeness = events.length
  ? Math.round(events.reduce((sum, event) => sum + completenessFields.filter((field) => has(event[field])).length / completenessFields.length, 0) / events.length * 100)
  : 0;
const sourceStats = Object.entries(sources.reduce((acc, source) => {
  acc[source.priority] = (acc[source.priority] || 0) + 1;
  return acc;
}, {}));
const candidateStats = ["discovered", "reviewing", "needs-source", "ready", "rejected"]
  .map((status) => [status, candidates.filter((item) => item.status === status).length]);
const urgentCandidates = candidates.filter((item) => item.priority === "urgent" || item.priority === "high");

console.log("CALL//AI 情报质量报告");
console.log("=".repeat(42));
console.log(`活动总数: ${events.length}`);
console.log(`候选活动: ${candidates.length}（${candidateStats.map(([key, value]) => `${key}=${value}`).join(" / ")}）`);
console.log(`来源总数: ${sources.length}（启用 ${sources.filter((source) => source.enabled).length}）`);
console.log(`字段完整率: ${completeness}%`);
console.log(`超过 14 天未核验: ${stale.length}`);
console.log(`未来 7 天截止: ${deadlines7d.length}`);
console.log(`高优先级候选: ${urgentCandidates.length}`);
console.log(`存在可选字段缺失: ${incomplete.length}`);
console.log(`来源优先级: ${sourceStats.map(([key, value]) => `${key}=${value}`).join(" / ")}`);

if (urgentCandidates.length) {
  console.log("\n高优先级候选:");
  for (const item of urgentCandidates) console.log(`- [${item.status}] ${item.title} (${item.id})`);
}
if (deadlines7d.length) {
  console.log("\n未来 7 天截止:");
  for (const event of deadlines7d.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))) {
    console.log(`- ${event.deadline.slice(0, 10)} ${event.title} (${event.id})`);
  }
}
if (stale.length) {
  console.log("\n需要重新核验:");
  for (const event of stale.slice(0, 20)) console.log(`- ${event.title}: ${event.verifiedAt}`);
}
if (incomplete.length) {
  console.log("\n字段补全队列:");
  for (const item of incomplete.slice(0, 20)) console.log(`- ${item.id}: ${item.missing.join(", ")}`);
}
