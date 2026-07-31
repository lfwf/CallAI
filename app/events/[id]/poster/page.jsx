import { notFound } from "next/navigation";
import styles from "./poster.module.css";
import events from "../../../../content/events.json";

const modeLabels = { online: "线上", offline: "线下", hybrid: "线上 + 线下" };
function date(v){return v?String(v).slice(0,10).replaceAll("-","."):"官方未公布";}

function PosterBlock({label,title,children,dark=false,className=""}){
 return <section className={`${styles.poster} ${dark?styles.dark:""} ${className}`}><label>{label}</label><h2>{title}</h2>{children}</section>;
}

export default async function PosterPage({params}){
 const {id}=await params; const event=events.find(x=>x.id===id); if(!event) notFound();
 const timeline=event.schedule?.length?event.schedule:[{label:"报名开启",start:event.submissionStart},{label:"作品提交截止",start:event.deadline},{label:"结果公布",start:event.resultDate}].filter(x=>x.start);
 const prizes=event.prizes?.length?event.prizes:[{title:"活动奖励",value:event.reward?.label||"官方未公布"}];
 const summary=event.summary||event.format||"";
 return <main className={styles.posterWrap}>
 <section className={`${styles.poster} ${styles.cover}`}><small>CALL//AI</small><h1>{event.title}</h1><h2>{event.subtitle}</h2><p>{summary}</p><strong>截止 {date(event.deadline)}</strong><button>立即报名参赛 →</button></section>
 <PosterBlock label="01 ABOUT" title="关于赛事"><h3>用 AI · 创造未来的声音</h3><p>{summary}</p><p>主办方<br/><b>{event.organizer}</b></p><p>地区<br/><b>{event.regions?.join(" / ")}</b></p><p>形式<br/><b>{modeLabels[event.mode]}</b></p></PosterBlock>
 <PosterBlock label="02 TIMELINE" title="赛事时间线" dark>{timeline.map((t,i)=><article key={i}><b>{date(t.start)}</b><span>{t.label}</span></article>)}</PosterBlock>
 <PosterBlock label="03 AWARDS" title="奖励"><strong className={styles.money}>{event.reward?.label||"¥100,000"}</strong>{prizes.map((p,i)=><p key={i}>{p.title}　{p.value}</p>)}</PosterBlock>
 <PosterBlock label="04 JOIN" title="参赛要求" dark><p>🌎 全球创作者</p><p>🎵 AI音乐作品</p><p>☁ 在线提交</p><button>立即报名参赛 →</button></PosterBlock>
 <PosterBlock label="VERIFIED" title="官方信息认证" className={styles.verify}><p>✓ 来源已验证</p><p>信息以官方页面为准</p><button>查看官方页面 →</button></PosterBlock>
 </main>;
}
