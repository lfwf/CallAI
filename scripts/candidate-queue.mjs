import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const file = resolve(root, "content/candidates.json");
const [, , command, ...args] = process.argv;

async function load() { return JSON.parse(await readFile(file, "utf8")); }
async function save(payload) {
  payload.updatedAt = new Date().toISOString();
  await writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}
function value(name) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : "";
}
function required(name) {
  const result = value(name);
  if (!result) throw new Error(`缺少 --${name}`);
  return result;
}

const payload = await load();

if (command === "list") {
  const status = value("status");
  const rows = status ? payload.candidates.filter((item) => item.status === status) : payload.candidates;
  console.table(rows.map(({ id, title, status, confidence, priority, discoveredAt }) => ({ id, title, status, confidence, priority, discoveredAt })));
} else if (command === "add") {
  const id = required("id");
  if (payload.candidates.some((item) => item.id === id)) throw new Error(`候选 ID 已存在: ${id}`);
  payload.candidates.push({
    id,
    title: required("title"),
    discoveredAt: new Date().toISOString(),
    discoveredFrom: required("url"),
    officialUrl: value("official") || "",
    sourceUrl: value("source") || "",
    organizer: value("organizer") || "",
    deadline: value("deadline") || "",
    status: "discovered",
    confidence: "pending",
    priority: value("priority") || "normal",
    reviewNote: value("note") || ""
  });
  await save(payload);
  console.log(`已加入候选队列: ${id}`);
} else if (command === "set-status") {
  const id = required("id");
  const item = payload.candidates.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`候选不存在: ${id}`);
  item.status = required("status");
  if (value("confidence")) item.confidence = value("confidence");
  if (value("note")) item.reviewNote = value("note");
  if (value("official")) item.officialUrl = value("official");
  if (value("source")) item.sourceUrl = value("source");
  if (value("organizer")) item.organizer = value("organizer");
  if (value("deadline")) item.deadline = value("deadline");
  item.lastCheckedAt = new Date().toISOString();
  await save(payload);
  console.log(`已更新候选状态: ${id} -> ${item.status}`);
} else if (command === "remove") {
  const id = required("id");
  const before = payload.candidates.length;
  payload.candidates = payload.candidates.filter((item) => item.id !== id);
  if (before === payload.candidates.length) throw new Error(`候选不存在: ${id}`);
  await save(payload);
  console.log(`已移除候选: ${id}`);
} else {
  console.log(`候选队列命令：
  npm run candidates:list -- [--status reviewing]
  npm run candidates:add -- --id demo-2026 --title "活动名" --url https://example.com [--priority high]
  npm run candidates:status -- --id demo-2026 --status ready --confidence verified --official https://... --source https://... --organizer "主办方" --deadline 2026-12-31T23:59:59+08:00
  npm run candidates:remove -- --id demo-2026`);
}
