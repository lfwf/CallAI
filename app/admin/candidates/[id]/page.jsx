import candidateData from "../../../../content/candidates.json";
import styles from "./page.module.css";

const candidates = candidateData.candidates || [];

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

  if (!candidate) return <main className={styles.page}>未找到候选活动</main>;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p>CALL//AI REVIEW</p>
        <h1>{candidate.title}</h1>
        <span>{statusLabel[candidate.status] || candidate.status}</span>
      </header>
      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>来源信息</h2>
          <Field title="来源" value={candidate.source}/>
          <Field title="链接" value={candidate.sourceUrl}/>
          <Field title="发现时间" value={candidate.discoveredAt}/>
        </section>
        <section className={styles.card}>
          <h2>审核字段</h2>
          <input name="organizer" defaultValue={candidate.organizer || ""} placeholder="主办方"/>
          <input name="officialUrl" defaultValue={candidate.officialUrl || ""} placeholder="官方地址"/>
          <input name="deadline" defaultValue={candidate.deadline || ""} placeholder="截止时间"/>
        </section>
      </div>
      <section className={styles.card}>
        <h2>编辑判断</h2>
        <textarea placeholder="适合人群"/>
        <textarea placeholder="推荐理由"/>
        <textarea placeholder="风险提示"/>
      </section>
      <section className={styles.card}>
        <h2>评分</h2>
        <p>可信度 / 行业价值 / 新人友好 / 参与难度</p>
        <div className={styles.actions}>
          <button>保存审核</button>
          <button>通过并生成草稿</button>
          <button className={styles.reject}>拒绝</button>
        </div>
      </section>
    </main>
  );
}

function Field({ title, value }) { return <p><b>{title}</b>：{value || "未填写"}</p>; }
