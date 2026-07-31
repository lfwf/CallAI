# CALL//AI 简化架构

目标：AI发现活动，人工确认来源，AI解析和追踪。

流程：

sources
  ↓
discovery
  ↓
candidates
  ↓
tracking
  ↓
analyzer
  ↓
events
  ↓
website

模块职责：

- discovery：发现可能的AI活动
- candidates：人工确认前的数据
- analyzer：解析官方页面
- tracker：周期检查变化
- events：网站展示数据

避免引入复杂CMS流程。
