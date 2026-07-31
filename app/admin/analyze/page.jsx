export default function AnalyzePage() {
  return (
    <main style={{maxWidth:720,margin:'40px auto',padding:24}}>
      <h1>活动分析工作台</h1>
      <p>输入官方赛事页面，由 Codex CLI 分析并生成结构化活动信息。</p>
      <form>
        <input placeholder="赛事官网 URL" style={{width:'100%',padding:12}} />
        <button style={{marginTop:16,padding:'10px 20px'}}>开始分析</button>
      </form>
    </main>
  );
}
