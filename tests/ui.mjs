import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const baseUrl = process.env.CALL_AI_TEST_URL || "http://localhost:4179";
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browser = await chromium.launch({ executablePath: chrome, headless: true });
const artifacts = new URL("../artifacts/", import.meta.url);
await mkdir(artifacts, { recursive: true });

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await desktop.goto(`${baseUrl}/?category=${encodeURIComponent("影像")}&sort=deadline#index`, { waitUntil: "networkidle" });
  await desktop.locator("#index").scrollIntoViewIfNeeded();
  assert.equal(await desktop.locator('[data-value="影像"]').getAttribute("class"), "filter active");
  assert.ok(await desktop.locator(".event-row").count() >= 8);
  assert.equal(await desktop.locator(".event-row").first().isVisible(), true);
  assert.equal(await desktop.locator(".load-error").isHidden(), true);
  await desktop.screenshot({ path: fileURLToPath(new URL("index-desktop.png", artifacts)), fullPage: false });

  await desktop.locator(".event-row").first().click();
  assert.equal(await desktop.locator("#eventDrawer").getAttribute("open"), "");
  assert.match(desktop.url(), /event=/);
  assert.match(await desktop.locator("#drawerDeadline").textContent(), /UTC[+-]\d{2}:\d{2}|UTC$/);
  const download = desktop.waitForEvent("download");
  await desktop.locator("#calendarButton").click();
  assert.match((await download).suggestedFilename(), /\.ics$/);
  await desktop.locator("#closeDrawer").click();

  await desktop.reload({ waitUntil: "networkidle" });
  assert.equal(await desktop.locator('[data-value="影像"]').getAttribute("class"), "filter active");
  await desktop.keyboard.press("Tab");
  assert.ok(await desktop.evaluate(() => document.activeElement !== document.body));

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(`${baseUrl}/?status=urgent#index`, { waitUntil: "networkidle" });
  await mobile.locator("#index").scrollIntoViewIfNeeded();
  assert.equal(await mobile.locator("#statusSelect").inputValue(), "urgent");
  const pageWidth = await mobile.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  assert.equal(pageWidth[0], pageWidth[1], `移动端页面横向溢出：${pageWidth.join("/")}`);
  await mobile.locator(".event-row").first().click();
  await mobile.waitForTimeout(550);
  assert.equal(await mobile.locator("#closeDrawer").isVisible(), true);
  const drawerBox = await mobile.locator("#eventDrawer").boundingBox();
  const closeBox = await mobile.locator("#closeDrawer").boundingBox();
  assert.ok(drawerBox.width >= 389 && drawerBox.x <= 1, `移动抽屉未铺满：${JSON.stringify(drawerBox)}`);
  assert.ok(closeBox.x + closeBox.width <= 390, `关闭按钮超出视口：${JSON.stringify(closeBox)}`);
  await mobile.screenshot({ path: fileURLToPath(new URL("drawer-mobile.png", artifacts)), fullPage: false });

  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  await reduced.goto(baseUrl, { waitUntil: "networkidle" });
  const marqueeDuration = await reduced.locator(".marquee > div").evaluate((element) => getComputedStyle(element).animationDuration);
  assert.ok(parseFloat(marqueeDuration) < 0.1, `减少动态模式仍有持续动画：${marqueeDuration}`);

  const offline = await browser.newPage();
  await offline.route("**/events.json", (route) => route.abort());
  await offline.goto(baseUrl, { waitUntil: "networkidle" });
  assert.equal(await offline.locator("#loadError").isVisible(), true);
  assert.equal(await offline.locator(".event-row").count(), 0);

  console.log("UI 验收通过：1440×1000、390×844、URL 恢复、抽屉、ICS、键盘焦点与横向溢出");
} finally {
  await browser.close();
}
