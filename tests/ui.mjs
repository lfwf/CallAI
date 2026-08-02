import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const baseUrl = process.env.CALL_AI_TEST_URL || "http://localhost:4179";
const systemBrowsers = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium"
];
const chrome = process.env.CALL_AI_CHROME
  || systemBrowsers.find((candidate) => existsSync(candidate))
  || chromium.executablePath();
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const artifacts = new URL("../artifacts/", import.meta.url);
await mkdir(artifacts, { recursive: true });

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await desktop.goto(`${baseUrl}/?view=urgent&sort=deadline#index`, { waitUntil: "networkidle" });
  await desktop.locator("#index").scrollIntoViewIfNeeded();
  assert.match(await desktop.locator('[data-view="urgent"]').getAttribute("class"), /active/);
  assert.ok(await desktop.locator(".event-card").count() >= 1);
  assert.equal(await desktop.locator(".event-card").first().isVisible(), true);
  assert.equal(await desktop.locator(".load-error").isHidden(), true);
  await desktop.screenshot({ path: fileURLToPath(new URL("index-desktop.png", artifacts)), fullPage: false });

  await desktop.locator(".event-card").first().click();
  await desktop.waitForLoadState("networkidle");
  assert.match(desktop.url(), /\/events\//);
  assert.equal(await desktop.locator("#intro").isVisible(), true);
  assert.ok(await desktop.locator(".detail-timeline > li").count() >= 2);
  assert.ok(await desktop.locator(".prize-list > article").count() >= 1);
  assert.ok(await desktop.locator(".requirement-list > li").count() >= 1);
  const download = desktop.waitForEvent("download");
  await desktop.locator("#detailCalendar").click();
  assert.match((await download).suggestedFilename(), /\.ics$/);
  await desktop.locator(".detail-back").click();
  await desktop.waitForLoadState("networkidle");
  assert.match(await desktop.locator('[data-view="urgent"]').getAttribute("class"), /active/);
  await desktop.keyboard.press("Tab");
  assert.ok(await desktop.evaluate(() => document.activeElement !== document.body));

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(`${baseUrl}/?view=closed#index`, { waitUntil: "networkidle" });
  await mobile.locator("#index").scrollIntoViewIfNeeded();
  assert.match(await mobile.locator('[data-view="closed"]').getAttribute("class"), /active/);
  const pageWidth = await mobile.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  assert.equal(pageWidth[0], pageWidth[1], `移动端页面横向溢出：${pageWidth.join("/")}`);
  await mobile.locator(".event-card").first().click();
  await mobile.waitForLoadState("networkidle");
  assert.equal(await mobile.locator(".detail-hero").isVisible(), true);
  const detailWidth = await mobile.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  assert.equal(detailWidth[0], detailWidth[1], `移动端详情横向溢出：${detailWidth.join("/")}`);
  await mobile.screenshot({ path: fileURLToPath(new URL("detail-mobile.png", artifacts)), fullPage: false });

  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  await reduced.goto(baseUrl, { waitUntil: "networkidle" });
  await reduced.locator(".event-card").first().waitFor();
  assert.equal(await reduced.locator(".event-card").first().isVisible(), true);

  const offline = await browser.newPage();
  await offline.route("**/events.json", (route) => route.abort());
  await offline.goto(baseUrl, { waitUntil: "networkidle" });
  await offline.locator("#loadError").waitFor();
  assert.equal(await offline.locator("#loadError").isVisible(), true);
  assert.equal(await offline.locator(".event-card").count(), 0);

  console.log("UI 验收通过：1440×1000、390×844、详情路由、URL 恢复、ICS、键盘焦点与横向溢出");
} finally {
  await browser.close();
}
