# CALL//AI

只收录可追溯到官方页面的 AI 创作活动索引。前端不保存活动状态；“征集中 / 七天内 / 今天截止 / 已截止”均由带时区的截止时间实时计算。

## 数据维护

- 编辑 `content/events.json`，不要直接编辑生成文件 `public/events.json`。
- 永久 `id` 一经发布不修改；活动结束后保留记录，由前端自动进入历史区。
- 奖励、资格、语言等信息若无法从官方页面确认，使用空值，不推测。
- `verifiedAt` 表示最后一次人工或自动核验官方来源的时间。

```powershell
npm run events:validate
npm run events:check-links
npm test
npm run build
```

`npm run build` 会先执行联网链接审计；链接失效、日期无时区、重复 ID、来源缺失或字段不完整时会失败。

## URL 接口

`q`、`category`、`status`、`mode`、`region`、`sort` 与 `event` 会写入查询参数。刷新、浏览器前进后退及分享链接均可恢复筛选和当前活动详情。

## 浏览器验收

本地启动后执行：

```powershell
$env:CALL_AI_TEST_URL='http://localhost:3000'
npm run test:ui
```

验收覆盖 1440×1000、390×844、筛选恢复、详情抽屉、ICS 下载、键盘焦点、减少动态、横向溢出与数据加载失败状态。
