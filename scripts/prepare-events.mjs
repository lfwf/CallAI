import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const input = resolve(root, "content/events.json");
const output = resolve(root, "public/events.json");
const required = [
  "id", "title", "subtitle", "organizer", "officialUrl", "sourceUrl", "categories",
  "mode", "regions", "eligibility", "submissionStart", "deadline", "reward",
  "languages", "featured", "visual", "verifiedAt", "createdAt"
];
const isoWithZone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(?:Z|[+-]\d{2}:\d{2})$/;
const scheduleDate = /^\d{4}-\d{2}(?:-\d{2}(?:T\d{2}:\d{2}(:\d{2})?(?:Z|[+-]\d{2}:\d{2}))?)?$/;

export function validateEvents(events) {
  const errors = [];
  const ids = new Set();
  if (!Array.isArray(events) || events.length < 20) errors.push("活动数量必须至少为 20 条");
  for (const [index, event] of events.entries()) {
    const at = `events[${index}]`;
    for (const field of required) {
      if (event[field] === undefined || event[field] === null || event[field] === "") {
        errors.push(`${at}.${field} 缺失`);
      }
    }
    if (ids.has(event.id)) errors.push(`${at}.id 重复: ${event.id}`);
    ids.add(event.id);
    for (const field of ["officialUrl", "sourceUrl"]) {
      try {
        const url = new URL(event[field]);
        if (url.protocol !== "https:") errors.push(`${at}.${field} 必须使用 HTTPS`);
      } catch {
        errors.push(`${at}.${field} 不是有效 URL`);
      }
    }
    for (const field of ["submissionStart", "deadline", "verifiedAt", "createdAt"]) {
      if (!isoWithZone.test(event[field]) || Number.isNaN(Date.parse(event[field]))) {
        errors.push(`${at}.${field} 必须是带时区的 ISO 日期`);
      }
    }
    if (!Array.isArray(event.categories) || event.categories.length === 0) errors.push(`${at}.categories 不能为空`);
    if (!["online", "offline", "hybrid"].includes(event.mode)) errors.push(`${at}.mode 非法`);
    if (!event.visual?.background || !event.visual?.ink || !event.visual?.accent) errors.push(`${at}.visual 配色不完整`);
    if (event.schedule !== undefined) {
      if (!Array.isArray(event.schedule) || event.schedule.length === 0) {
        errors.push(`${at}.schedule 必须是非空数组`);
      } else {
        for (const [scheduleIndex, item] of event.schedule.entries()) {
          if (!item.label || !item.start) errors.push(`${at}.schedule[${scheduleIndex}] 缺少 label 或 start`);
          for (const field of ["start", "end"]) {
            if (item[field] && !scheduleDate.test(item[field])) {
              errors.push(`${at}.schedule[${scheduleIndex}].${field} 日期格式非法`);
            }
          }
        }
      }
    }
    if (event.prizes !== undefined) {
      if (!Array.isArray(event.prizes) || event.prizes.length === 0) {
        errors.push(`${at}.prizes 必须是非空数组`);
      } else {
        for (const [prizeIndex, prize] of event.prizes.entries()) {
          if (!prize.title || !prize.value) errors.push(`${at}.prizes[${prizeIndex}] 缺少 title 或 value`);
        }
      }
    }
    if (event.requirements !== undefined
      && (!Array.isArray(event.requirements) || event.requirements.length === 0
        || event.requirements.some((item) => typeof item !== "string" || !item.trim()))) {
      errors.push(`${at}.requirements 必须是非空字符串数组`);
    }
  }
  return errors;
}

async function checkLinks(events) {
  const errors = [];
  for (const event of events) {
    try {
      const response = await fetch(event.officialUrl, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
        headers: { "User-Agent": "CALL-AI-Link-Audit/1.0" }
      });
      if (response.status >= 400 && ![401, 403, 405, 429].includes(response.status)) {
        errors.push(`${event.id}: HTTP ${response.status} ${event.officialUrl}`);
      }
    } catch (error) {
      errors.push(`${event.id}: ${error.message}`);
    }
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const events = JSON.parse(await readFile(input, "utf8"));
  const errors = validateEvents(events);
  if (process.argv.includes("--check-links")) errors.push(...await checkLinks(events));
  if (errors.length) {
    console.error(`活动数据校验失败（${errors.length} 项）\n${errors.map((item) => `- ${item}`).join("\n")}`);
    process.exit(1);
  }

  if (!process.argv.includes("--check") && !process.argv.includes("--check-links")) {
    await mkdir(resolve(root, "public"), { recursive: true });
    await writeFile(output, `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      count: events.length,
      events
    }, null, 2)}\n`, "utf8");
    console.log(`已生成 public/events.json（${events.length} 条）`);
  } else {
    console.log(`活动数据通过校验（${events.length} 条）`);
  }
}
