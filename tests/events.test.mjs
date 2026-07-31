import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getEventStatus, matchesQuery, makeIcs } from "../public/event-utils.mjs";
import { validateEvents } from "../scripts/prepare-events.mjs";

const events = JSON.parse(await readFile(new URL("../content/events.json", import.meta.url), "utf8"));

test("data schema is valid and contains enough live calls", () => {
  assert.deepEqual(validateEvents(events), []);
  const now = new Date("2026-07-31T10:00:00+08:00");
  assert.ok(events.filter((event) => getEventStatus(event.deadline, now).key !== "closed").length >= 12);
});

test("validator rejects duplicate IDs, missing links and timezone-less dates", () => {
  const broken = structuredClone(events);
  broken[1].id = broken[0].id;
  broken[2].officialUrl = "";
  broken[3].deadline = "2026-08-20";
  const errors = validateEvents(broken).join("\n");
  assert.match(errors, /重复/);
  assert.match(errors, /officialUrl 缺失/);
  assert.match(errors, /带时区/);
});

test("status boundaries: 8 days, 7 days, 1 day, today and expired", () => {
  const now = new Date("2026-07-31T12:00:00Z");
  assert.equal(getEventStatus("2026-08-08T12:00:01Z", now).key, "open");
  assert.equal(getEventStatus("2026-08-07T12:00:00Z", now).key, "urgent");
  assert.equal(getEventStatus("2026-08-01T12:00:00Z", now).days, 1);
  assert.equal(getEventStatus("2026-07-31T18:00:00Z", now).label, "今天截止");
  assert.equal(getEventStatus("2026-07-31T11:59:59Z", now).key, "closed");
});

test("search handles Chinese, English and case", () => {
  const event = events.find((item) => item.id === "tencent-ai-can-do-it-2026");
  assert.equal(matchesQuery(event, "腾讯"), true);
  assert.equal(matchesQuery(event, "can do"), true);
  assert.equal(matchesQuery(event, "TENCENT"), true);
  assert.equal(matchesQuery(event, "不存在"), false);
});

test("ICS includes title, official URL, UTC dates and reminder", () => {
  const event = events[0];
  const ics = makeIcs(event, new Date("2026-07-31T00:00:00Z"));
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, new RegExp(event.title));
  assert.match(ics, /URL:https/);
  assert.match(ics, /提前 7 天/);
  assert.match(ics, /BEGIN:VALARM/);
});
