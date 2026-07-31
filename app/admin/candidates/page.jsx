import candidates from "../../../content/candidates.json";
import styles from "./page.module.css";

const statusLabel = {
  discovered: "发现",
  reviewing: "审核中",
  "needs-source": "缺少来源",
  ready: "待发布",
  rejected: "拒绝"
};

export default function CandidateAdminPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p>CALL//AI ADMIN</p>
        <h1>候选活动审核队列</h1>
        <span>从发现线索到正式活动库的中间审核层</span>
      </header>

      <section className={styles.stats}>
        <div>候选 {candidates.length}</div>
        <div>待审核 {candidates.filter((item) => item.status === "reviewing").length}</div>
        <div>待发布 {candidates.filter((item) => item.status === "ready").length}</div>
      </section>

      <section className={styles.list}>
        {candidates.map((item) => (
          <article className={styles.card} key={item.id}>
            <div>
              <small>{item.priority || "normal"}</small>
              <h2>{item.title}</h2>
              <p>{item.sourceUrl}</p>
            </div>
            <div className={styles.meta}>
              <span>{statusLabel[item.status] || item.status}</span>
              <span>{item.discoveredAt?.slice(0, 10)}</span>
            </div>
            <button>进入审核</button>
          </article>
        ))}
      </section>
    </main>
  );
}
