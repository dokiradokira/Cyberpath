# Curriculum 3.0 首个样板：DNS 缓存与诊断

日期：2026-11-12。提交前基线：`2d0cddf`（同步后的 origin/master）；分支：`feature/curriculum-3-dns-sample`。不合并、不部署、不打标签，package 版本不变。

## 课程选择与教学设计

已查阅 `origin/planning/curriculum-3.0`（`8d255d4`）的五份规划：CURRICULUM_3_0、KNOWLEDGE_DEPENDENCIES、PROJECT_BASED_LEARNING、CAREER_TRACKS、CURRICULUM_MIGRATION_PLAN。该规划中的存储及测试快照较旧，本轮以 master 的 IndexedDB 实现为准，未合并规划分支。

现有 `dns-tcp-web` 已讲 DNS 查询、TCP/UDP 和 HTTPS。为避免重复开一节概览课，本轮在该课内补足缓存行为与证据推理，保留原七章顺序，再追加五章：商店地址变更案例、TTL 时钟、负缓存、诊断方法、英文证据报告。预计阅读与实验共 70 分钟，先修为第一课的客户端、IP 与路由器概念。

入口：`/courses/dns-tcp-web`。页首提供先修知识、Technical Goals、English Goals；英文正文配现有可点击中文术语解释，新增 `ttl` 和 `nxdomain` 两个稳定词汇 ID，可收藏和复习。Understand / Apply / Reason 三道形成性练习对每个选项提供具体反馈。原五题正式测验及其历史记录继续使用；新增练习不冒充正式测验记录，也不自动标记完成。

## 实验与 SVG

DNS cache investigation 要求先预测再查询，可改变权威地址、删除/重新创建名称、推进模拟时间、重置。正缓存 60 秒，负缓存 30 秒；缓存命中不刷新到期时钟，权威变更不主动清除递归缓存。显示时间、答案来源、缓存内容、剩余 TTL 与查询次数；SVG 展示 resolver 分别向 Root/TLD/Authority 查询，缓存命中时弱化上游路径，并提供文字说明。SVG 随容器缩放，兼容主题；操作使用原生按钮/select，反馈使用 status。

两条实验路径：旧地址在到期前保留、到期后更新；NXDOMAIN 在名称创建后仍保留到负缓存到期。学习者在既有课程笔记写预测、观察、TTL 计算和结论局限。实验本身为页面内临时状态，不增加存储 schema。

明确局限：单名称、A 查询、单递归缓存、固定 TTL；未模拟浏览器/OS 缓存、CNAME、DNSSEC、故障缓存与 serve-stale。未发出真实 DNS 请求；每次 miss 的完整冷查询路径是教学简化。原 `/labs` DNS 演示与 TCP 等其他实验保留。

技术核对来源：[RFC 1034](https://www.rfc-editor.org/info/rfc1034)（缓存与 TTL）、[RFC 2308](https://www.rfc-editor.org/info/rfc2308)（NXDOMAIN/NODATA 与负缓存）。不能把 DNS 成功等同于 HTTPS 可达或可信。

## 文件与兼容性

- `src/content/lessons/dns-workshop.ts`：目标、五章正文、分层练习。
- `src/content/lessons/index.ts`：增量接入已有课程。
- `src/content/vocabulary.ts`：两条新词，原 34 条身份不变。
- `src/lib/dns-workshop.ts`：可独立测试的纯状态转换。
- `src/components/lessons/dns-workshop.tsx`、`lesson-view.tsx`：实验、SVG、练习及课程接入。
- `tests/dns-workshop.test.ts`、`tests/e2e/dns-workshop.spec.ts`：模型、旧 ID/档案兼容与浏览器交互回归。

不改原课程 ID、原章节 ID、原题目 ID/含义、IndexedDB/schema、迁移、完整备份与恢复逻辑。已完成课程保持完成，不因增加正文清空旧成绩。README 的原有用户修改保留并排除提交。

## 实际验证

先写测试，缺少实验模块时复现失败，再实现模型与界面。

- `npm run typecheck`：通过。
- `npm run lint`：通过。
- `npm test`：14 个文件、114 项通过，新增 3 项。
- `npm run build`：默认环境通过。
- `npx playwright test tests/e2e/dns-workshop.spec.ts`：最终 2 项通过（Chromium / WebKit iPhone）。首次 WebKit 失败因未等待档案初始化和阅读位置恢复；改为等待现有 `data-hydrated` 标记，无固定 sleep。
- `npx playwright test`：完整 78 项通过（Chromium / WebKit iPhone，含迁移、千条历史、完整备份、F01/F02/F03 与原课程回归）。
- `npx playwright test --config=playwright.lan.config.ts`：2 项通过。
- Prettier 新文件检查、文档源码/测试路径检查、Git diff 空白检查通过；提交前检查未发现密钥或产物。

首次默认环境浏览器启动未进入测试，停止后通过工具的单命令正规审批运行；未修改 ACL、沙箱或安全设置。CI 必须以推送后实际 SHA 为准，本文不预填成功。

## 人工验收与下一步

本轮尚未在真实 iPhone、生产环境或屏幕阅读器验收。请重点检查 SVG 小屏可读性、触屏选择预测与查询、键盘操作、英文难度，以及能否独立解释缓存命中与负缓存。用户对旧版本的真机确认不替代本次新内容验收。

下一步先根据学习者反馈调整样板课节奏，再决定下一节主题；不批量扩课，不在本轮引入课程总架构、账号或跨设备同步。
