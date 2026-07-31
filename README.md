# CALL//AI

CALL//AI 是一个可追溯到官方来源的 AI 赛事、黑客松、创作机会与活动情报库。

目标不是简单聚合链接，而是建立一套可持续运行的情报流程：

```text
来源扫描
→ 候选发现
→ 官方核验
→ 结构化入库
→ 截止提醒
→ 内容分发
→ 结果追踪
```

前端不保存活动状态；“征集中 / 七天内 / 今天截止 / 已截止”均由带时区的截止时间实时计算。

## 数据目录

- `content/sources.json`：来源登记表与扫描优先级
- `content/candidates.json`：自动发现、人工投稿和二手线索的候选审核队列
- `content/events.json`：完成官方核验后公开发布的正式活动数据库
- `public/events.json`：构建时生成的前端活动数据
- `public/sources.json`：构建时生成的启用来源数据
- `docs/editorial-policy.md`：收录、核验与推荐规范
- `docs/candidate-workflow.md`：候选活动审核流程

不要直接编辑 `public/events.json` 或 `public/sources.json`。

## 候选审核队列

任何自动发现、用户投稿或二手平台线索都必须先进入 `content/candidates.json`，不能直接写入正式活动库。

```text
discovered → reviewing → ready → events.json
                    ↘ needs-source
                    ↘ rejected
```

只有具备官方来源、明确主办方和截止时间，并且 `confidence=verified` 的候选才能进入 `ready`。

常用命令：

```powershell
npm run candidates:add -- --id example-2026 --title "Example AI Challenge" --url https://example.com --priority high
npm run candidates:list
npm run candidates:list -- --status reviewing
npm run candidates:status -- --id example-2026 --status reviewing
npm run candidates:validate
```

## 活动维护原则

- 永久 `id` 一经发布不修改。
- 活动结束后保留记录，由前端自动进入历史区。
- 奖励、资格、语言、版权和提交要求无法从官方页面确认时，不推测。
- `verifiedAt` 表示最后一次人工或自动核验官方来源的时间。
- 二手平台仅用于发现线索，正式入库必须能追溯至官方页面。

活动可逐步补充以下专业情报字段：

```json
{
  "sourceLevel": "official",
  "confidence": "verified",
  "audience": ["独立开发者", "学生团队"],
  "benefits": ["现金奖金", "产品曝光"],
  "risks": ["必须使用指定 API"],
  "difficulty": "intermediate",
  "effortHours": 40,
  "score": {
    "credibility": 5,
    "reward": 4,
    "industryValue": 5,
    "beginnerFriendly": 2,
    "timeCost": 3
  }
}
```

这些字段是渐进式增强字段，不要求历史活动一次性补齐。

## 来源库

`content/sources.json` 用于管理长期扫描目标。每个来源包含：

- 来源类型与可信等级
- 地区和主题
- 扫描方式
- 优先级
- 建议检查间隔
- 是否启用

`discovery-only` 来源只能用于发现线索，不能直接作为正式活动的最终证据。

## 常用命令

```powershell
npm run events:validate
npm run events:check-links
npm run sources:validate
npm run candidates:validate
npm run data:validate
npm run data:prepare
npm run intelligence:report
npm test
npm run build
```

`npm run intelligence:report` 会输出：

- 活动、候选和来源数量
- 候选状态分布与高优先级审核项
- 字段完整率
- 超过 14 天未核验的活动
- 未来 7 天截止的活动
- 字段补全队列

`npm run build` 会执行活动链接审计、来源库校验、候选队列校验、数据生成和前端构建。链接失效、日期无时区、重复 ID、来源缺失或字段不完整时会失败。

## URL 接口

`q`、`category`、`status`、`mode`、`region`、`sort` 与 `event` 会写入查询参数。刷新、浏览器前进后退及分享链接均可恢复筛选和当前活动详情。

活动详情页：

```text
/events/<id>
```

活动竖屏阅读与分享模板：

```text
/events/<id>/poster
```

## 浏览器验收

本地启动后执行：

```powershell
$env:CALL_AI_TEST_URL='http://localhost:3000'
npm run test:ui
```

验收覆盖 1440×1000、390×844、筛选恢复、详情页、ICS 下载、键盘焦点、减少动态、横向溢出与数据加载失败状态。
