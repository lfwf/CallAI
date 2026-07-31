# 候选活动审核流程

`content/candidates.json` 是正式活动库之前的缓冲区。任何自动发现、人工投稿或二手平台线索，都必须先进入候选队列，不能直接写入 `content/events.json`。

## 状态流转

```text
discovered → reviewing → ready → 写入 events.json
                    ↘ needs-source
                    ↘ rejected
```

- `discovered`：刚发现，仅确认线索存在。
- `reviewing`：编辑正在检查官方页面、日期、资格和奖励。
- `needs-source`：缺少可追溯的官方来源，暂不发布。
- `ready`：官方来源、主办方、截止时间已确认，且 `confidence=verified`。
- `rejected`：广告、重复、与 AI 无关、信息失效或不符合收录标准。

## 常用命令

```bash
npm run candidates:add -- --id example-2026 --title "Example AI Challenge" --url https://example.com --priority high
npm run candidates:list
npm run candidates:list -- --status reviewing
npm run candidates:status -- --id example-2026 --status reviewing
npm run candidates:status -- --id example-2026 --status ready --confidence verified --official https://example.com --source https://example.com/rules --organizer "Example" --deadline 2026-12-31T23:59:59+08:00
npm run candidates:remove -- --id example-2026
npm run candidates:validate
```

## 发布前检查

候选活动进入 `ready` 前必须确认：

1. 活动名称和主办方与官方页面一致。
2. `officialUrl` 和 `sourceUrl` 均为 HTTPS 官方页面。
3. 截止时间包含时区；如果官方只给日期，需要在正式活动数据中明确处理规则。
4. 奖励、资格、语言、费用和提交形式不得推测。
5. 与 `content/events.json` 中既有活动不存在重复。
6. `reviewNote` 记录冲突、缺失或特殊解释。

## 正式发布

当前阶段采用人工提升：编辑从 `ready` 候选复制并补全为正式活动对象，写入 `content/events.json`，随后执行：

```bash
npm run data:validate
npm run intelligence:report
npm test
npm run build
```

发布成功后，从候选队列删除对应记录。后续阶段可再增加自动生成正式活动草稿和审核后台。
