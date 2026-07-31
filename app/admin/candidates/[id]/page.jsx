import candidates from "../../../../content/candidates.json";
import styles from "./page.module.css";

const statusLabel = {
  discovered: "发现",
  reviewing: "审核中",
  "needs-source": "缺少来源",
  ready: "待发布",
  rejected: "拒绝"
};

export default async function CandidateDetailPage({ params }) {
  const { id } = await params;
  const candidate = candidates.find((item) => item.id === id);

  if (!candidate) {
    return <main className={styles.page}>未找到候选活动</main>;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p>CALL//AI REVIEW</p>
        <h1>{candidate.title}</h1>
        <span>{statusLabel[candidate.status] || candidate.status}</span>
      </header>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>发现信息</h2>
          <p>来源：{candidate.source || "未填写"}</p>
          <p>链接：{candidate.sourceUrl || "未填写"}</p>
          <p>优先级：{candidate.priority || "normal"}</p>
          <p>发现时间：{candidate.discoveredAt || "未填写"}</p>
        </section>

        <section className={styles.card}>
          <h2>审核检查</h2>
          <label>官方来源</label>
          <p>{candidate.officialUrl || "待补充"}</p>
          <label>主办方</label>
          <p>{candidate.organizer || "待补充"}</p>
          <label>截止时间</label>
          <p>{candidate.deadline || "待补充"}</p>
        </section>
      </div>

      <section className={styles.card}>
        <h2>审核操作</h2>
        <div className={styles.actions}>
          <button>保存审核信息</button>
          <button>通过并生成活动</button>
        </div>
        <p className={styles.note}>当前版本先完成审核视图，后续接入数据写入和活动生成。</p>
      </section>
    </main>
  );
}
