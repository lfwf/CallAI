import "./style.css";

const events = [
  {
    id: "tencent-game",
    type: "开发",
    number: "01",
    title: "AI CAN DO IT",
    subtitle: "腾讯云黑客松 · 游戏开发挑战赛",
    host: "腾讯云 × 腾讯游戏学堂",
    deadline: "2026-09-13",
    deadlineLabel: "09.13 截止",
    reward: "¥100 万",
    tags: ["AI 游戏", "全球高校", "团队创作"],
    description: "面向全球高校开发者的 AI 驱动游戏创作挑战，主题聚焦生物多样性与心理健康。",
    color: "#dfff00",
    url: "https://tch.cloud.tencent.com/"
  },
  {
    id: "aaiff",
    type: "影像",
    number: "02",
    title: "AAIFF 2026",
    subtitle: "Astana AI Film Festival",
    host: "Ambition Arena",
    deadline: "2026-08-15",
    deadlineLabel: "08.15 截止",
    reward: "$250K",
    tags: ["AI 电影", "全球", "英文字幕"],
    description: "生成式 AI 必须参与核心创作流程。提交一条影片链接，即有机会进入年度 AI 原生电影竞赛。",
    color: "#8f7cff",
    url: "https://www.aaiff.ai/"
  },
  {
    id: "happy-horse",
    type: "影像",
    number: "03",
    title: "HORSEPOWER",
    subtitle: "HappyHorse AI 影像大赛",
    host: "HappyHorse × 阿里云高校计划",
    deadline: "2026-08-20",
    deadlineLabel: "08.20 截止",
    reward: "$6K + 商单",
    tags: ["AI 影像", "学生权益", "导演共创"],
    description: "面向 AI 影像创作者征集先锋作品，包含现金、商单机会与影视项目共创通道。",
    color: "#ff6b42",
    url: "https://university.aliyun.com/action/happyhorse"
  },
  {
    id: "good-ai",
    type: "公益",
    number: "04",
    title: "小有可为 2026",
    subtitle: "AI 向善创新挑战赛",
    host: "阿里云",
    deadline: "2026-08-13",
    deadlineLabel: "08.13 截止",
    reward: "¥21 万",
    tags: ["AI 公益", "应用开发", "Token 补贴"],
    description: "围绕真实的小问题开发可用 AI 工具，方向包含教育、儿童内容、安全与家庭场景。",
    color: "#4ee5cf",
    url: "https://opc.aliyun.com/xiaoyoukewei?display_mode=3"
  },
  {
    id: "nwaiff",
    type: "影像",
    number: "05",
    title: "NEW WORLD AIFF",
    subtitle: "New World AI Film Festival",
    host: "NWAIFF",
    deadline: "2026-09-16",
    deadlineLabel: "09.16 截止",
    reward: "全球展映",
    tags: ["AI 电影", "国际竞赛", "开放征集"],
    description: "面向国际 AI 电影创作者的开放征集，接受以生成式技术参与制作的影像作品。",
    color: "#66a3ff",
    url: "https://nwaiff.lovable.app/"
  },
  {
    id: "ai-job",
    type: "设计",
    number: "06",
    title: "AI × 求职",
    subtitle: "首届全国 AI 创新大赛",
    host: "智联招聘 × 阿里云高校计划",
    deadline: "2026-07-31",
    deadlineLabel: "07 月截止",
    reward: "投资机会",
    tags: ["创意方案", "不限作品形式", "算力支持"],
    description: "从用户视角提出破解求职与招聘困境的 AI 创意方案，不限专业背景与作品形式。",
    color: "#ffc857",
    url: "https://university.aliyun.com/action/job-ai"
  }
];

const list = document.querySelector("#eventList");
const emptyState = document.querySelector("#emptyState");
const liveCount = document.querySelector("#liveCount");
const searchInput = document.querySelector("#searchInput");
const filters = [...document.querySelectorAll(".filter")];
let currentFilter = "all";

function daysLeft(date) {
  const now = new Date();
  const end = new Date(`${date}T23:59:59+08:00`);
  return Math.ceil((end - now) / 86400000);
}

function statusFor(event) {
  const days = daysLeft(event.deadline);
  if (days < 0) return { label: "已截止", className: "closed" };
  if (days <= 7) return { label: days === 0 ? "今天截止" : `仅剩 ${days} 天`, className: "urgent" };
  return { label: "征集中", className: "open" };
}

function arrowIcon() {
  return `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M14 50 50 14M22 14h28v28" fill="none" stroke="currentColor" stroke-width="3"/>
    </svg>`;
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const visible = events.filter((event) => {
    const matchesFilter = currentFilter === "all" || event.type === currentFilter;
    const haystack = [event.title, event.subtitle, event.host, event.type, ...event.tags].join(" ").toLowerCase();
    return matchesFilter && haystack.includes(query);
  });

  list.innerHTML = visible.map((event) => {
    const status = statusFor(event);
    return `
      <a class="event-row" href="${event.url}" target="_blank" rel="noreferrer"
        data-type="${event.type}" style="--event-color:${event.color}">
        <div class="event-no">${event.number}</div>
        <div class="event-title">
          <span>${event.type} / ${event.host}</span>
          <h3>${event.title}</h3>
          <p>${event.subtitle}</p>
        </div>
        <div class="event-detail">
          <p>${event.description}</p>
          <div>${event.tags.map(tag => `<span>${tag}</span>`).join("")}</div>
        </div>
        <div class="event-deadline">
          <span class="status ${status.className}"><i></i>${status.label}</span>
          <strong>${event.deadlineLabel}</strong>
          <small>${event.reward}</small>
        </div>
        <div class="event-arrow">${arrowIcon()}</div>
      </a>`;
  }).join("");

  liveCount.textContent = String(visible.length).padStart(2, "0");
  emptyState.hidden = visible.length > 0;
  observeRows();
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((filter) => filter.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    render();
  });
});

searchInput.addEventListener("input", render);

function observeRows() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("in-view");
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".event-row").forEach((row, index) => {
    row.style.setProperty("--delay", `${index * 55}ms`);
    observer.observe(row);
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.14 });

document.querySelectorAll(".manifesto-points article, .submit h2").forEach((el) => revealObserver.observe(el));

const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");
let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  document.documentElement.style.setProperty("--mouse-x", `${(event.clientX / innerWidth - 0.5) * 18}px`);
  document.documentElement.style.setProperty("--mouse-y", `${(event.clientY / innerHeight - 0.5) * 18}px`);
});

function animateCursor() {
  ringX += (mouseX - ringX) * 0.13;
  ringY += (mouseY - ringY) * 0.13;
  ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll("a, button, input").forEach((el) => {
  el.addEventListener("mouseenter", () => document.body.classList.add("cursor-active"));
  el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-active"));
});

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  document.documentElement.style.setProperty("--scroll", `${y * 0.12}px`);
  document.querySelector(".site-header").classList.toggle("scrolled", y > 40);
}, { passive: true });

render();
