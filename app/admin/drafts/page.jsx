import drafts from "../../../content/drafts.json";
import styles from "./page.module.css";

const statusMap = { draft: "草稿", ready: "待发布", published: "已发布" };

export default function DraftsPage() {
  return <main className={styles.page}>
    <header><p>CALL//AI PUBLISH</p><h1>活动草稿</h1><span>{drafts.length} drafts</span></header>
    <section className={styles.list}>{drafts.map((item)=><article key={item.id} className={styles.card}>
      <h2>{item.title || "未命名活动"}</h2>
      <p>状态：{statusMap[item.status] || item.status || "草稿"}</p>
      <p>来源：{item.sourceUrl || "未填写"}</p>
      <button>编辑</button>
      <button>发布检查</button>
    </article>)}</section>
  </main>;
}
