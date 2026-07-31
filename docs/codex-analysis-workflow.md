# Codex CLI 活动分析流程

当前阶段不直接接入模型 API，而使用 Codex CLI 作为人工辅助分析工具。

流程：

```
官方赛事 URL
    ↓
打开网页内容
    ↓
Codex CLI 分析
    ↓
输出标准 JSON
    ↓
CallAI 入库
```

标准输出字段：

- title
- organizer
- officialUrl
- deadline
- startDate
- reward
- eligibility
- categories
- timeline

后续如果接入 OpenAI、DeepSeek 或其他模型，只替换 analyzer adapter。
