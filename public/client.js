const events = [
  {
    type: "开发",
    title: "AI CAN DO IT",
    subtitle: "腾讯云黑客松 · 游戏开发挑战赛",
    host: "腾讯云 × 腾讯游戏学堂",
    deadline: "2026-09-13",
    dateLabel: "09.13",
    reward: "¥100 万",
    color: "#f1ed55",
    posterBg: "#2447ff",
    posterInk: "#f1ed55",
    url: "https://tch.cloud.tencent.com/"
  },
  {
    type: "影像",
    title: "AAIFF 2026",
    subtitle: "Astana AI Film Festival",
    host: "AMBITION ARENA",
    deadline: "2026-08-15",
    dateLabel: "08.15",
    reward: "$250K",
    color: "#ff795f",
    posterBg: "#f0442f",
    posterInk: "#eeeade",
    url: "https://www.aaiff.ai/"
  },
  {
    type: "影像",
    title: "HORSEPOWER",
    subtitle: "HappyHorse AI 影像大赛",
    host: "HAPPYHORSE × 阿里云",
    deadline: "2026-08-20",
    dateLabel: "08.20",
    reward: "$6K + 商单",
    color: "#bad4ff",
    posterBg: "#11110f",
    posterInk: "#f1ed55",
    url: "https://university.aliyun.com/action/happyhorse"
  },
  {
    type: "公益",
    title: "小有可为 2026",
    subtitle: "AI 向善创新挑战赛",
    host: "阿里云",
    deadline: "2026-08-13",
    dateLabel: "08.13",
    reward: "¥21 万",
    color: "#b5e7c2",
    posterBg: "#f1ed55",
    posterInk: "#11110f",
    url: "https://opc.aliyun.com/xiaoyoukewei?display_mode=3"
  },
  {
    type: "影像",
    title: "NEW WORLD AIFF",
    subtitle: "New World AI Film Festival",
    host: "NWAIFF",
    deadline: "2026-09-16",
    dateLabel: "09.16",
    reward: "全球展映",
    color: "#c8b6ff",
    posterBg: "#eeeade",
    posterInk: "#2447ff",
    url: "https://nwaiff.lovable.app/"
  },
  {
    type: "设计",
    title: "AI × 求职",
    subtitle: "首届全国 AI 创新大赛",
    host: "智联招聘 × 阿里云高校计划",
    deadline: "2026-07-31",
    dateLabel: "07.31",
    reward: "投资机会",
    color: "#f3a9c0",
    posterBg: "#f3a9c0",
    posterInk: "#11110f",
    url: "https://university.aliyun.com/action/job-ai"
  }
].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

const list = document.querySelector("#eventList");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const filters = [...document.querySelectorAll(".filter")];
const hoverPoster = document.querySelector("#hoverPoster");
let currentFilter = "all";

function daysLeft(date) {
  const now = new Date();
  const end = new Date(`${date}T23:59:59+08:00`);
  return Math.ceil((end - now) / 86400000);
}

function eventStatus(event) {
  const days = daysLeft(event.deadline);
  if (days < 0) return { label: "已截止", className: "closed" };
  if (days <= 7) return { label: days === 0 ? "今天截止" : `剩 ${days} 天`, className: "urgent" };
  return { label: "征集中", className: "open" };
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const visible = events.filter((event) => {
    const categoryMatch = currentFilter === "all" || event.type === currentFilter;
    const text = [event.title, event.subtitle, event.host, event.type].join(" ").toLowerCase();
    return categoryMatch && text.includes(query);
  });

  list.innerHTML = visible.map((event) => {
    const status = eventStatus(event);
    return `
      <a class="event-row" href="${event.url}" target="_blank" rel="noreferrer"
        style="--row-color:${event.color}"
        data-title="${event.title}"
        data-type="${event.type}"
        data-host="${event.host}"
        data-poster-bg="${event.posterBg}"
        data-poster-ink="${event.posterInk}">
        <strong class="event-date">${event.dateLabel}</strong>
        <div class="event-name">
          <span>${event.host}</span>
          <h3>${event.title}</h3>
        </div>
        <div class="event-type">${event.type}<br />${event.subtitle}</div>
        <div class="event-reward">${event.reward}</div>
        <div class="event-status ${status.className}"><i></i>${status.label}</div>
        <div class="event-arrow">↗</div>
      </a>`;
  }).join("");

  emptyState.hidden = visible.length !== 0;
  bindRows();
}

function bindRows() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("in-view");
    });
  }, { threshold: .12 });

  document.querySelectorAll(".event-row").forEach((row, index) => {
    row.style.setProperty("--delay", `${index * 55}ms`);
    observer.observe(row);

    row.addEventListener("mouseenter", () => {
      hoverPoster.querySelector(".poster-title").textContent = row.dataset.title;
      hoverPoster.querySelector(".poster-type").textContent = `${row.dataset.type} / OPEN CALL`;
      hoverPoster.querySelector(".poster-host").textContent = row.dataset.host;
      hoverPoster.style.setProperty("--poster-bg", row.dataset.posterBg);
      hoverPoster.style.setProperty("--poster-ink", row.dataset.posterInk);
      hoverPoster.classList.add("show");
    });
    row.addEventListener("mouseleave", () => hoverPoster.classList.remove("show"));
  });
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    render();
  });
});

searchInput.addEventListener("input", render);

const cursor = document.querySelector(".cursor-cross");
window.addEventListener("mousemove", (event) => {
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
  hoverPoster.style.left = `${Math.min(event.clientX, innerWidth - 290)}px`;
  hoverPoster.style.top = `${Math.max(180, Math.min(event.clientY, innerHeight - 180))}px`;
});

document.querySelectorAll("a, button, input").forEach((item) => {
  item.addEventListener("mouseenter", () => document.body.classList.add("cursor-active"));
  item.addEventListener("mouseleave", () => document.body.classList.remove("cursor-active"));
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: .2 });

document.querySelectorAll(".standards-list article").forEach((item) => revealObserver.observe(item));

const nextDeadline = events
  .map((event) => daysLeft(event.deadline))
  .filter((days) => days >= 0)
  .sort((a, b) => a - b)[0] ?? 0;

String(Math.min(nextDeadline, 99))
  .padStart(2, "0")
  .split("")
  .forEach((digit, index) => {
    const tile = document.querySelectorAll(".deadline-flip div b")[index];
    if (tile) tile.textContent = digit;
  });

render();
