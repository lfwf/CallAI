const DAY = 86_400_000;

export function getEventStatus(deadline, now = new Date()) {
  const end = new Date(deadline);
  if (Number.isNaN(end.getTime())) throw new TypeError(`Invalid deadline: ${deadline}`);
  const remaining = end.getTime() - now.getTime();
  if (remaining < 0) return { key: "closed", label: "已截止", days: -1 };
  const days = Math.ceil(remaining / DAY);
  const beijingNow = new Date(now.getTime() + 8 * 60 * 60_000).toISOString().slice(0, 10);
  const beijingDeadline = new Date(end.getTime() + 8 * 60 * 60_000).toISOString().slice(0, 10);
  if (beijingNow === beijingDeadline) return { key: "urgent", label: "今天截止", days: 0 };
  if (days <= 7) return { key: "urgent", label: `${days} 天后截止`, days };
  return { key: "open", label: "征集中", days };
}

export function matchesQuery(event, query) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  return [
    event.title,
    event.subtitle,
    event.organizer,
    event.officialUrl,
    ...(event.categories || []),
    ...(event.regions || [])
  ].join(" ").toLocaleLowerCase().includes(needle);
}

export function rewardValue(reward) {
  if (!reward?.amount) return 0;
  const rates = { USD: 7.2, EUR: 7.8, CNY: 1 };
  return reward.amount * (rates[reward.currency] || 1);
}

export function escapeIcs(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function toIcsDate(date) {
  return new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function makeIcs(event, now = new Date()) {
  const deadline = new Date(event.deadline);
  const reminder = new Date(deadline.getTime() - 7 * DAY);
  const description = `${event.organizer} — ${event.format || ""}\\n${event.officialUrl}`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CALL AI//Open Calls//ZH-CN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(event.id)}@call-ai`,
    `DTSTAMP:${toIcsDate(now)}`,
    `DTSTART:${toIcsDate(reminder)}`,
    `DTEND:${toIcsDate(deadline)}`,
    `SUMMARY:${escapeIcs(`提前 7 天：${event.title} 截止`)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `URL:${escapeIcs(event.officialUrl)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT0M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(`${event.title} 将在 7 天后截止`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ].join("\r\n");
}
