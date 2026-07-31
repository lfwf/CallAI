import { notFound } from "next/navigation";
import events from "../../../content/events.json";
import { getEventStatus } from "../../../public/event-utils.mjs";

const modeLabels = { online: "线上", offline: "线下", hybrid: "线上 + 线下" };

function formatDate(value) {
  if (!value) return "官方未公布";
  if (/^\d{4}-\d{2}$/.test(value)) return value.replace("-", ".");
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.replaceAll("-", ".");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date).map((part) => [part.type, part.value])
  );
  return `${parts.year}.${parts.month}.${parts.day} · ${parts.hour}:${parts.minute}`;
}

function eventTimeline(event) {
  if (event.schedule?.length) return event.schedule;
  return [
    { label: "作品提交开始", start: event.submissionStart },
    { label: "作品提交截止", start: event.deadline },
    event.eventStart && { label: "活动开始", start: event.eventStart },
    event.eventEnd && { label: "活动结束", start: event.eventEnd },
    event.resultDate && { label: "结果公布", start: event.resultDate }
  ].filter(Boolean);
}

function safeReturnPath(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const event = events.find((item) => item.id === id);
  if (!event) return { title: "活动未找到 | CALL//AI" };
  return {
    title: `${event.title} | CALL//AI`,
    description: event.summary || `${event.subtitle}。${event.format}`
  };
}

export default async function EventDetailPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const event = events.find((item) => item.id === id);
  if (!event) notFound();

  const timeline = eventTimeline(event);
  const submissionDeadline = timeline.find((item) => item.label.includes("提交截止"));
  const displayedDeadline = submissionDeadline?.start || event.deadline;
  const deadlineHasTime = displayedDeadline.includes("T");
  const statusDeadline = deadlineHasTime
    ? displayedDeadline
    : `${displayedDeadline}T23:59:59+08:00`;
  const status = getEventStatus(statusDeadline);
  const prizes = event.prizes?.length
    ? event.prizes
    : [{ title: "活动奖励", value: event.reward?.label || "官方未公布" }];
  const requirements = event.requirements?.length
    ? event.requirements
    : [event.format, event.eligibility].filter(Boolean);
  const summary = event.summary || `${event.subtitle}。${event.format}`;
  const tags = [...event.categories, modeLabels[event.mode], ...event.regions];
  const backHref = safeReturnPath(query?.from);

  return (
    <div className="site-shell detail-shell">
      <header className="detail-topbar">
        <a className="wordmark" href="/"><b>CALL</b><i>//</i><b>AI</b></a>
        <a className="detail-back" href={backHref}>← 返回活动列表</a>
      </header>

      <main className="detail-main" style={{ "--event-accent": event.visual.background }}>
        <header className="detail-hero">
          <div className="detail-kicker">
            <span>{event.organizer}</span>
            <span className={`event-status ${status.key}`}><i></i>{status.label}</span>
          </div>

          <div className="detail-hero-grid">
            <div className="detail-title-block">
              <h1>{event.title}</h1>
              <p className="detail-subtitle">{event.subtitle}</p>
              <div className="detail-tags">
                {tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </div>

            <div className="detail-snapshot">
              <div className="snapshot-primary">
                <span>作品提交截止</span>
                <strong>{formatDate(displayedDeadline)}</strong>
                <small>{deadlineHasTime ? "北京时间 UTC+08:00" : "官方仅公布日期"}</small>
              </div>
              <div>
                <span>活动奖励</span>
                <strong>{event.reward?.label || "官方未公布"}</strong>
              </div>
              <div>
                <span>参与方式</span>
                <strong>{modeLabels[event.mode]}</strong>
              </div>
              <div>
                <span>参赛地区</span>
                <strong>{event.regions.join(" / ")}</strong>
              </div>
            </div>
          </div>

          <div className="detail-primary-actions">
            <a href={event.officialUrl} target="_blank" rel="noreferrer">前往官方页面 ↗</a>
            <button id="detailCalendar" data-event-id={event.id}>加入日历</button>
          </div>
        </header>

        <div className="detail-layout">
          <nav className="detail-nav" aria-label="详情目录">
            <a href="#intro">活动简介</a>
            <a href="#timeline">活动时间线</a>
            <a href="#prizes">活动奖励</a>
            <a href="#requirements">参赛要求</a>
          </nav>

          <div className="detail-content">
            <section className="detail-section" id="intro">
              <p className="section-index">01</p>
              <h2>活动简介</h2>
              <p className="detail-summary">{summary}</p>
              <dl className="detail-facts">
                <div><dt>参与方式</dt><dd>{modeLabels[event.mode]}</dd></div>
                <div><dt>参赛地区</dt><dd>{event.regions.join(" / ")}</dd></div>
                <div><dt>活动语言</dt><dd>{event.languages.join(" / ")}</dd></div>
              </dl>
            </section>

            <section className="detail-section" id="timeline">
              <p className="section-index">02 · 北京时间（UTC+08:00）</p>
              <h2>活动时间线</h2>
              <ol className="detail-timeline">
                {timeline.map((item, index) => (
                  <li className={item.label.includes("提交截止") ? "is-primary" : ""} key={`${item.label}-${index}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{item.label}</h3>
                      <p>{formatDate(item.start)}{item.end ? ` — ${formatDate(item.end)}` : ""}</p>
                      {item.note && <small>{item.note}</small>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="detail-section" id="prizes">
              <p className="section-index">03</p>
              <h2>活动奖励</h2>
              <div className="prize-list">
                {prizes.map((prize, index) => (
                  <article key={`${prize.title}-${index}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{prize.title}</h3>
                      <strong>{prize.value}</strong>
                      {prize.note && <p>{prize.note}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="detail-section" id="requirements">
              <p className="section-index">04</p>
              <h2>参赛要求</h2>
              <ul className="requirement-list">
                {requirements.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
              </ul>
            </section>

            <footer className="detail-source">
              <p>最后核验：{formatDate(event.verifiedAt)} · 信息以官方页面为准</p>
              <a href={event.sourceUrl} target="_blank" rel="noreferrer">查看信息来源 ↗</a>
            </footer>
          </div>
        </div>
      </main>
      <script src="/detail.js?v=20260731-1" type="module" />
    </div>
  );
}
