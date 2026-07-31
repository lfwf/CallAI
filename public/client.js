import { getEventStatus, matchesQuery, rewardValue, makeIcs } from "./event-utils.mjs";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const modeLabels = { online: "线上", offline: "线下", hybrid: "线上 + 线下" };
const state = { events: [], generatedAt: null, view: "all", q: "", category: "", status: "", mode: "", region: "", sort: "deadline", event: "" };
let visibleEvents = [];
let currentEvent = null;

const elements = {
  list: $("#eventList"), empty: $("#emptyState"), error: $("#loadError"), search: $("#searchInput"),
  status: $("#statusSelect"), mode: $("#modeSelect"), region: $("#regionSelect"), sort: $("#sortSelect"),
  poster: $("#hoverPoster"), drawer: $("#eventDrawer"), rail: $("#dateRail"), railDate: $("#railDate")
};

function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", ...options }).format(new Date(value));
}

function formatDeadline(value) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}).*(Z|[+-]\d{2}:\d{2})$/);
  if (!match) return value;
  const [, year, month, day, hour, minute, zone] = match;
  return `${year}.${month}.${day} · ${hour}:${minute} ${zone === "Z" ? "UTC" : `UTC${zone}`}`;
}

function formatEventDate(value) {
  return `${value.slice(5, 7)}/${value.slice(8, 10)}`;
}

function readUrl() {
  const params = new URLSearchParams(location.search);
  for (const key of ["q", "category", "status", "mode", "region", "sort", "event"]) {
    if (params.has(key)) state[key] = params.get(key);
  }
  if (!["deadline", "newest", "reward"].includes(state.sort)) state.sort = "deadline";
}

function writeUrl({ replace = false } = {}) {
  const params = new URLSearchParams();
  for (const key of ["q", "category", "status", "mode", "region", "sort", "event"]) {
    if (state[key] && !(key === "sort" && state[key] === "deadline")) params.set(key, state[key]);
  }
  const url = `${location.pathname}${params.size ? `?${params}` : ""}${location.hash}`;
  history[replace ? "replaceState" : "pushState"]({}, "", url);
}

function isNew(event) {
  return Date.now() - new Date(event.createdAt).getTime() <= 7 * 86_400_000;
}

function filtered() {
  return state.events
    .filter((event) => {
      const status = getEventStatus(event.deadline);
      const viewMatch = state.view === "all" || (state.view === "new" ? isNew(event) : status.key === "urgent");
      return viewMatch
        && matchesQuery(event, state.q)
        && (!state.category || event.categories.includes(state.category))
        && (!state.status || status.key === state.status)
        && (!state.mode || event.mode === state.mode)
        && (!state.region || event.regions.includes(state.region));
    })
    .sort((a, b) => {
      if (state.sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (state.sort === "reward") return rewardValue(b.reward) - rewardValue(a.reward) || new Date(a.deadline) - new Date(b.deadline);
      const aClosed = getEventStatus(a.deadline).key === "closed";
      const bClosed = getEventStatus(b.deadline).key === "closed";
      if (aClosed !== bClosed) return aClosed ? 1 : -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
}

function capturePositions() {
  return new Map($$(".event-row").map((row) => [row.dataset.id, row.getBoundingClientRect()]));
}

function animatePositions(before) {
  if (reducedMotion.matches) return;
  $$(".event-row").forEach((row) => {
    const previous = before.get(row.dataset.id);
    if (!previous) {
      row.animate([{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }], { duration: 360, easing: "cubic-bezier(.2,.8,.2,1)" });
      return;
    }
    const current = row.getBoundingClientRect();
    const delta = previous.top - current.top;
    if (Math.abs(delta) > 1) row.animate([{ transform: `translateY(${delta}px)` }, { transform: "none" }], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
  });
}

function rowTemplate(event) {
  const status = getEventStatus(event.deadline);
  const reward = event.reward?.label || "未公布";
  return `<button class="event-row" type="button" data-id="${event.id}" style="--row-color:${event.visual.background};--row-ink:${event.visual.ink}">
    <strong class="event-date"><span>${formatEventDate(event.deadline)}</span><small>${event.deadline.slice(0, 4)}</small></strong>
    <span class="event-name"><small>${event.organizer}</small><b>${event.title}</b></span>
    <span class="event-type"><b>${event.categories.join(" / ")}</b><small>${event.subtitle}</small></span>
    <span class="event-reward">${reward}</span>
    <span class="event-status ${status.key}"><i></i>${status.label}</span>
    <span class="event-arrow">↗</span>
  </button>`;
}

function render({ updateUrl = true } = {}) {
  const before = capturePositions();
  visibleEvents = filtered();
  elements.list.innerHTML = visibleEvents.map(rowTemplate).join("");
  elements.list.setAttribute("aria-busy", "false");
  elements.empty.hidden = visibleEvents.length !== 0;
  bindRows();
  requestAnimationFrame(() => animatePositions(before));
  syncControls();
  if (updateUrl) writeUrl();
}

function syncControls() {
  elements.search.value = state.q;
  elements.status.value = state.status;
  elements.mode.value = state.mode;
  elements.region.value = state.region;
  elements.sort.value = state.sort;
  $$("#categoryFilters .filter").forEach((button) => button.classList.toggle("active", button.dataset.value === state.category));
  $$(".view-tab").forEach((button) => {
    const active = button.dataset.view === state.view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  $("#viewTitle").textContent = state.view === "new" ? "本周新收录" : state.view === "urgent" ? "即将截止" : "全部活动";
}

function bindRows() {
  $$(".event-row").forEach((row) => {
    const event = state.events.find((item) => item.id === row.dataset.id);
    row.addEventListener("click", () => openDrawer(event));
    row.addEventListener("mouseenter", () => showPoster(event));
    row.addEventListener("mouseleave", hidePoster);
    row.addEventListener("focus", () => showPoster(event));
    row.addEventListener("blur", hidePoster);
  });
}

function showPoster(event) {
  const status = getEventStatus(event.deadline);
  $(".poster-title").textContent = event.title;
  $(".poster-type").textContent = `${event.categories.join(" / ")} · ${modeLabels[event.mode]}`;
  $(".poster-host").textContent = event.organizer;
  $(".poster-days").textContent = status.key === "closed" ? "ARCHIVE" : status.days === 0 ? "TODAY" : `T−${String(status.days).padStart(2, "0")}`;
  elements.poster.style.setProperty("--poster-bg", event.visual.background);
  elements.poster.style.setProperty("--poster-ink", event.visual.ink);
  elements.poster.style.setProperty("--poster-accent", event.visual.accent);
  elements.poster.classList.add("show", `is-${status.key}`);
}

function hidePoster() {
  elements.poster.className = "hover-poster";
}

function fact(label, value) {
  if (!value) return "";
  return `<div><dt>${label}</dt><dd>${value}</dd></div>`;
}

function openDrawer(event, { fromUrl = false } = {}) {
  if (!event) return;
  currentEvent = event;
  const status = getEventStatus(event.deadline);
  $("#drawerCategory").textContent = event.categories.join(" / ");
  $("#drawerPosterTitle").textContent = event.title;
  $("#drawerHost").textContent = event.organizer;
  $("#drawerTitle").textContent = event.title;
  $("#drawerSubtitle").textContent = event.subtitle;
  $("#drawerDeadline").textContent = formatDeadline(event.deadline);
  $("#drawerStatus").textContent = status.label;
  $("#drawerFacts").innerHTML = [
    fact("资格", event.eligibility),
    fact("参与方式", modeLabels[event.mode]),
    fact("地区", event.regions.join(" / ")),
    fact("语言", event.languages.join(" / ")),
    fact("奖励", event.reward?.label || "官方未公布")
  ].join("");
  $("#drawerFormat").textContent = event.format || "";
  $("#drawerVerified").textContent = `最后核验 ${formatDate(event.verifiedAt, { year: "numeric" })} · 来源：官方活动页面`;
  $("#officialLink").href = event.officialUrl;
  $("#drawerPoster").style.setProperty("--drawer-bg", event.visual.background);
  $("#drawerPoster").style.setProperty("--drawer-ink", event.visual.ink);
  state.event = event.id;
  if (!fromUrl) writeUrl();
  if (!elements.drawer.open) elements.drawer.showModal();
}

function closeDrawer({ fromHistory = false } = {}) {
  if (elements.drawer.open) elements.drawer.close();
  currentEvent = null;
  if (state.event) {
    state.event = "";
    if (!fromHistory) writeUrl();
  }
}

function downloadCalendar() {
  if (!currentEvent) return;
  const blob = new Blob([makeIcs(currentEvent)], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${currentEvent.id}.ics`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 500);
}

function updateStats() {
  const statuses = state.events.map((event) => getEventStatus(event.deadline));
  const live = statuses.filter((status) => status.key !== "closed").length;
  const urgent = statuses.filter((status) => status.key === "urgent").length;
  const fresh = state.events.filter(isNew).length;
  $("#heroCount").textContent = String(live).padStart(2, "0");
  $("#totalCount").textContent = state.events.length;
  $("#urgentCount").textContent = urgent;
  $("#newCount").textContent = fresh;
  $("#viewUrgentCount").textContent = urgent;
  $("#allCount").textContent = state.events.length;
  $("#updatedAt").textContent = `数据生成 ${formatDate(state.generatedAt, { year: "numeric" })}`;
  const next = statuses.filter((status) => status.key !== "closed").sort((a, b) => a.days - b.days)[0]?.days ?? 0;
  String(Math.min(99, next)).padStart(2, "0").split("").forEach((digit, index) => {
    const tile = $$(".deadline-flip div b")[index];
    if (tile?.textContent !== digit) {
      tile.animate?.([{ transform: "rotateX(-90deg)" }, { transform: "rotateX(0)" }], { duration: 420, easing: "ease-out" });
      tile.textContent = digit;
    }
  });
}

async function loadEvents() {
  elements.error.hidden = true;
  elements.list.setAttribute("aria-busy", "true");
  try {
    const response = await fetch("/events.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (!Array.isArray(payload.events)) throw new Error("Invalid payload");
    state.events = payload.events;
    state.generatedAt = payload.generatedAt;
    updateStats();
    render({ updateUrl: false });
    if (state.event) openDrawer(state.events.find((event) => event.id === state.event), { fromUrl: true });
  } catch (error) {
    console.error(error);
    elements.list.innerHTML = "";
    elements.empty.hidden = true;
    elements.error.hidden = false;
  }
}

function updateRail() {
  const rows = $$(".event-row");
  if (!rows.length || innerWidth < 1100) return;
  const target = rows.find((row) => row.getBoundingClientRect().top > 120) || rows.at(-1);
  const event = state.events.find((item) => item.id === target?.dataset.id);
  if (event) elements.railDate.textContent = formatEventDate(event.deadline);
  const section = $("#index").getBoundingClientRect();
  elements.rail.classList.toggle("show", section.top < 100 && section.bottom > innerHeight * .6);
}

function bindControls() {
  let searchTimer;
  elements.search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.q = elements.search.value; render(); }, 120);
  });
  $("#categoryFilters").addEventListener("click", (event) => {
    const button = event.target.closest(".filter");
    if (button) { state.category = button.dataset.value; render(); }
  });
  $$(".view-tab").forEach((button) => button.addEventListener("click", () => { state.view = button.dataset.view; render(); }));
  [["status", elements.status], ["mode", elements.mode], ["region", elements.region], ["sort", elements.sort]].forEach(([key, select]) => {
    select.addEventListener("change", () => { state[key] = select.value; render(); });
  });
  $("#clearFilters").addEventListener("click", () => {
    Object.assign(state, { q: "", category: "", status: "", mode: "", region: "", sort: "deadline", view: "all" });
    render();
  });
  $("#retryLoad").addEventListener("click", loadEvents);
  $("#closeDrawer").addEventListener("click", () => closeDrawer());
  $("#calendarButton").addEventListener("click", downloadCalendar);
  elements.drawer.addEventListener("click", (event) => {
    if (event.target === elements.drawer) closeDrawer();
  });
  elements.drawer.addEventListener("cancel", (event) => { event.preventDefault(); closeDrawer(); });
  addEventListener("popstate", () => {
    Object.assign(state, { q: "", category: "", status: "", mode: "", region: "", sort: "deadline", event: "" });
    readUrl();
    render({ updateUrl: false });
    if (state.event) openDrawer(state.events.find((event) => event.id === state.event), { fromUrl: true });
    else closeDrawer({ fromHistory: true });
  });
}

const cursor = $(".cursor-cross");
addEventListener("pointermove", (event) => {
  cursor.style.translate = `${event.clientX}px ${event.clientY}px`;
  elements.poster.style.left = `${Math.min(event.clientX, innerWidth - 300)}px`;
  elements.poster.style.top = `${Math.max(190, Math.min(event.clientY, innerHeight - 190))}px`;
});
document.addEventListener("pointerover", (event) => document.body.classList.toggle("cursor-active", Boolean(event.target.closest("a,button,input,select"))));
addEventListener("scroll", updateRail, { passive: true });

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) entry.target.classList.add("visible");
}), { threshold: .2 });
$$(".standards-list article").forEach((item) => revealObserver.observe(item));

readUrl();
bindControls();
loadEvents();
