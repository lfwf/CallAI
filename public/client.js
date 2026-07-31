import { getEventStatus, matchesQuery, rewardValue } from "./event-utils.mjs?v=20260731-8";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const modeLabels = { online: "线上", offline: "线下", hybrid: "线上 + 线下" };
const state = { events: [], view: "all", q: "", mode: "", region: "", sort: "deadline" };
let visibleEvents = [];

const elements = {
  list: $("#eventList"), empty: $("#emptyState"), error: $("#loadError"), search: $("#searchInput"),
  mode: $("#modeSelect"), region: $("#regionSelect"), sort: $("#sortSelect")
};

function formatBeijingDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10).replaceAll("-", ".");
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date).map((part) => [part.type, part.value])
  );
  return `${parts.year}.${parts.month}.${parts.day}`;
}

function readUrl() {
  const params = new URLSearchParams(location.search);
  for (const key of ["view", "q", "mode", "region", "sort"]) {
    if (params.has(key)) state[key] = params.get(key);
  }
  if (!["all", "urgent", "closed"].includes(state.view)) state.view = "all";
  if (!["deadline", "newest", "reward"].includes(state.sort)) state.sort = "deadline";
}

function writeUrl({ replace = false } = {}) {
  const params = new URLSearchParams();
  for (const key of ["view", "q", "mode", "region", "sort"]) {
    if (state[key]
      && !(key === "view" && state[key] === "all")
      && !(key === "sort" && state[key] === "deadline")) params.set(key, state[key]);
  }
  const url = `${location.pathname}${params.size ? `?${params}` : ""}${location.hash}`;
  history[replace ? "replaceState" : "pushState"]({}, "", url);
}

function filtered() {
  return state.events
    .filter((event) => {
      const status = getEventStatus(event.deadline);
      const viewMatch = state.view === "all" || status.key === state.view;
      return viewMatch
        && matchesQuery(event, state.q)
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
  return new Map($$(".event-card").map((card) => [card.dataset.id, card.getBoundingClientRect()]));
}

function animatePositions(before) {
  if (reducedMotion.matches) return;
  $$(".event-card").forEach((card) => {
    const previous = before.get(card.dataset.id);
    if (!previous) {
      card.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
      return;
    }
    const current = card.getBoundingClientRect();
    const delta = previous.top - current.top;
    if (Math.abs(delta) > 1) card.animate([{ transform: `translateY(${delta}px)` }, { transform: "none" }], { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)" });
  });
}

function rowTemplate(event) {
  const status = getEventStatus(event.deadline);
  const reward = event.reward?.label || "未公布";
  const tags = [...event.categories, modeLabels[event.mode], ...event.regions.slice(0, 1)];
  const returnTo = `${location.pathname}${location.search}${location.hash}`;
  const detailUrl = `/events/${encodeURIComponent(event.id)}?from=${encodeURIComponent(returnTo)}`;
  return `<a class="event-card" href="${detailUrl}" data-id="${event.id}" style="--card-accent:${event.visual.background}">
    <span class="card-top">
      <small class="card-organizer">${event.organizer}</small>
      <span class="event-status ${status.key}"><i></i>${status.label}</span>
    </span>
    <strong class="card-title">${event.title}</strong>
    <span class="card-subtitle">${event.subtitle}</span>
    <span class="card-description">${event.format || ""}</span>
    <span class="card-tags">${tags.map((tag) => `<small>${tag}</small>`).join("")}</span>
    <span class="card-meta">
      <span><small>截止日期 · 北京时间</small><b>${formatBeijingDate(event.deadline)}</b></span>
      <span><small>奖励</small><b>${reward}</b></span>
    </span>
    <span class="event-arrow" aria-hidden="true">↗</span>
  </a>`;
}

function render({ updateUrl = true } = {}) {
  const before = capturePositions();
  visibleEvents = filtered();
  elements.list.innerHTML = visibleEvents.map(rowTemplate).join("");
  elements.list.setAttribute("aria-busy", "false");
  elements.empty.hidden = visibleEvents.length !== 0;
  requestAnimationFrame(() => animatePositions(before));
  syncControls();
  if (updateUrl) writeUrl();
}

function syncControls() {
  elements.search.value = state.q;
  elements.mode.value = state.mode;
  elements.region.value = state.region;
  elements.sort.value = state.sort;
  $$(".view-tab").forEach((button) => {
    const active = button.dataset.view === state.view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
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
    render({ updateUrl: false });
  } catch (error) {
    console.error(error);
    elements.list.innerHTML = "";
    elements.empty.hidden = true;
    elements.error.hidden = false;
  }
}

function bindControls() {
  let searchTimer;
  elements.search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.q = elements.search.value; render(); }, 120);
  });
  $$(".view-tab").forEach((button) => button.addEventListener("click", () => { state.view = button.dataset.view; render(); }));
  [["mode", elements.mode], ["region", elements.region], ["sort", elements.sort]].forEach(([key, select]) => {
    select.addEventListener("change", () => { state[key] = select.value; render(); });
  });
  $("#clearFilters").addEventListener("click", () => {
    Object.assign(state, { q: "", mode: "", region: "", sort: "deadline", view: "all" });
    render();
  });
  $("#retryLoad").addEventListener("click", loadEvents);
  addEventListener("popstate", () => {
    Object.assign(state, { view: "all", q: "", mode: "", region: "", sort: "deadline" });
    readUrl();
    render({ updateUrl: false });
  });
}

if (elements.list) {
  readUrl();
  bindControls();
  loadEvents();
}
