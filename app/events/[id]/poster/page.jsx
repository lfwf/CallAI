import { notFound } from "next/navigation";
import styles from "./poster.module.css";
import events from "../../../../content/events.json";

const modeLabels={online:"线上",offline:"线下",hybrid:"线上 + 线下"};
function date(v){return v?String(v).slice(0,10).replaceAll("-","."):"官方未公布";}
function text(v,f="官方未公布"){return v&&String(v).trim()?v:f;}

export default async function PosterPage({params}){
 const {id}=await params; const event=events.find(x=>x.id===id); if(!event) notFound();
 const timeline=event.schedule?.length?event.schedule:[{label:"报名开启",start:event.submissionStart},{label:"作品提交截止",start:event.deadline},{label:"结果公布",start:event.resultDate}].filter(x=>x.start);
 const prizes=event.prizes?.length?event.prizes:[{title:"活动奖励",value:event.reward?.label||"官方未公布"}];
 const summary=event.summary||event.format||"暂无活动介绍";
 return <main className={styles.posterWrap}>
  <section className={`${styles.poster} ${styles.cover}`}><small>CALL//AI</small><h1>{event.title}</h1><h2>{text(event.subtitle)}</h2><p>{summary}</p><strong>报名截止 {date(event.deadline)}</strong><button className={styles.button}>立即报名参赛 →</button></section>
  <section className={styles.poster}><label>01 WHY JOIN</label><h2>为什么参加</h2><h3>探索 AI 与未来创作</h3><p>{summary}</p><div className={styles.infoGrid}><div>主办方<br/><b>{text(event.organizer)}</b></div><div>地区<br/><b>{event.regions?.length?event.regions.join(" / "):"全球"}</b></div><div>形式<br/><b>{modeLabels[event.mode]||"线上"}</b></div></div></section>
  <section className={`${styles.poster} ${styles.dark}`}><label>02 SCHEDULE</label><h2>赛事流程</h2><div className={styles.timeline}>{timeline.length?timeline.map((t,i)=><article key={i}><b>{date(t.start)}</b><span>{t.label}</span></article>):<p>官方未公布时间安排</p>}</div></section>
  <section className={styles.poster}><label>03 AWARDS</label><h2>奖励</h2><strong className={styles.awardNumber}>{text(event.reward?.label,"官方未公布")}</strong>{prizes.map((p,i)=><p key={i}>{p.title}　{p.value}</p>)}</section>
  <section className={`${styles.poster} ${styles.dark}`}><label>04 WHO CAN JOIN</label><h2>参赛资格</h2><div className={styles.joinList}><p>🌎 全球创作者</p><p>🎵 {text(event.categories?.join(" / "),"AI创作作品")}</p><p>☁ 在线提交</p></div><button className={styles.button}>立即报名参赛 →</button></section>
  <section className={`${styles.poster} ${styles.verify}`}><label>VERIFIED</label><h2>官方信息认证</h2><p>✓ 来源已验证</p><p>核验时间：{date(event.verifiedAt)}</p><button className={styles.button}>查看官方页面 →</button></section>
 </main>;
}
