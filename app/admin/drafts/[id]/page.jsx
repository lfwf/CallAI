import drafts from "../../../../content/drafts.json";
import styles from "./page.module.css";

export default async function DraftDetailPage({ params }) {
  const { id } = await params;
  const draft = drafts.find((item) => item.id === id);

  if (!draft) return <main className={styles.page}>未找到草稿</main>;

  const missing = [
    ["标题", draft.title],
    ["官方链接", draft.officialUrl || draft.sourceUrl],
    ["主办方", draft.organizer],
    ["截止时间", draft.deadline]
  ].filter(([, value]) => !value).map(([key]) => key);

  return <main className={styles.page}>
    <header><p>CALL//AI DRAFT</p><h1>{draft.title || "未命名活动"}</h1></header>
    <section className={styles.card}>
      <h2>发布检查</h2>
      {missing.length ? <p>缺少：{missing.join("、")}</p> : <p>✓ 字段完整，可以发布</p>}
    </section>
    <section className={styles.card}>
      <h2>活动信息</h2>
      <p>主办方：{draft.organizer || "未填写"}</p>
      <p>截止时间：{draft.deadline || "未填写"}</p>
      <p>来源：{draft.sourceUrl || "未填写"}</p>
    </section>
    <section className={styles.actions}><button disabled={missing.length > 0}>发布活动</button></section>
  </main>;
}
