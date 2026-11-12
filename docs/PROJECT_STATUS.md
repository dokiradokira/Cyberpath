# CyberPath 项目状态

## 当前阶段：Curriculum 3.0 DNS 样板（2026-11-12）

本节覆盖下文旧快照。已 fetch 最新 master，从 `2d0cddf`（V2.3-A 合并提交）创建 `feature/curriculum-3-dns-sample`；用户报告 V2.3-A 已上线，本轮未另行验收生产环境。package 保持 2.2.0，不把 Curriculum 3.0 样板称为正式 3.0 发布。

查阅规划分支五份文档但未合并。已有第二课包含 DNS 概览，因此在 `dns-tcp-web` 增强为缓存与诊断样板：先修/Technical/English Goals、五章深入教学、三层反馈练习、可操作的 TTL/NXDOMAIN 实验和响应式 SVG、两条词汇。仍为三节可学课程；原章节、题目、课程 ID 与 IndexedDB/完整备份结构保持。实验为临时状态，证据可写入既有笔记。

本轮 typecheck/lint/build 通过；单元 114 项通过；DNS 定向浏览器最终 2 项通过，完整浏览器 78 项及 LAN 2 项通过。新 SHA 的 CI 尚未触发，不沿用基线绿色结果。README 原用户改动保留且不纳入提交；提交前基线为 `2d0cddf`，最终 SHA 通过 Git 查询解析。

下一步先由用户验收教学节奏、英文难度与真机 SVG/触屏/键盘体验，再选择下一节；不在本轮批量扩课、改 schema、引入同步或部署。详见 [DNS 样板实施记录](CURRICULUM_3_DNS_SAMPLE.md)。

## 当前阶段：V2.3-A Personal Online Access 代码准备（2026-11-11）

V2.2 已合并到 `origin/master`（合并提交 `ce6da4e`）。本轮从该提交创建 `feature/v2.3-a-online-access`，保留 README 的用户空格改动，不 reset/clean/覆盖。

已完成：Vercel 配置与标准 `.next` 输出适配、`.vercelignore`、Manifest 的 `id/scope/lang/categories`、192/512 图标、180px Apple touch icon、Apple/标准 web-app-capable 标记和 iPhone 元数据。IndexedDB、课程、词汇、测验的数据结构和 schema 未改；未加云同步、账号或 Service Worker。

验证：typecheck、lint 通过；单元 13 文件 111 项通过；`npm run build` 与 `VERCEL=1 npm run build` 通过（后者生成 `.next/BUILD_ID`）；Playwright 76 项通过（Chromium + WebKit iPhone 模拟）；LAN 2 项通过。真实 Vercel/HTTPS 部署与真机主屏幕安装尚未执行。CI 未在本轮持续等待，推送后的新 SHA 结果需按 GitHub 实查，不能沿用旧运行。

本轮只授权普通推送到功能分支；不合并 master、不部署生产、不打标签。详见 [V2.3_A_ONLINE_ACCESS.md](V2.3_A_ONLINE_ACCESS.md)。

## 2026-11-11 定向同步修复

仅修复 F03 与主题回归测试的持久化同步：从 IndexedDB 已提交 head/profile 轮询，不依赖异步 localStorage 镜像；主题在硬导航前等待实际落盘。无业务/迁移逻辑变更，无固定 sleep/跳过/删除断言。定向双引擎 4 项、全量浏览器 74 项、单元 107 项、typecheck/lint 均通过（浏览器使用现有生产构建，未重新 build）。新提交 Push/PR CI 待正常推送后生成，不在本次等待结果；旧 PR 失败记录保留为历史。README 原修改不提交，不合并/部署。

## 最终收尾覆盖记录（2026-11-11）

最新验证：50604a8 与此前两个本地提交已正常推送；Push 42982447755 success，PR 42982455392 浏览器回归 failure，LAN skipped，PR #1 无冲突但 unstable。当前不满足双 CI 成功，不应合并；具体用例原因未取得，不伪造归因。版本 2.2.0 与人工验收更新已保存，结果补记提交的新检查需另核实。

用户真实设备体验检查已完成，未发现明显异常；不代表完整专业测试认证。完整屏幕阅读器专项验收尚未确认，生产环境验收尚未进行、后续部署时完成。旧记录中的笼统“真机待验收”为历史状态，不再代表当前用户体验检查结论。

版本统一为 2.2.0（package/lock 根版本），无依赖升级；V2.2 包含 A/B/C/C.1，D 网络实验增强延期、非发布门禁。V2.3 暂停，Curriculum 3.0 不合并。接手基线 f122c4e，本地 dd979d6/f122c4e 曾因网络未推送；本次继续普通 push，最终同步与新 HEAD 双 CI 按交付/接手时 Git 核实，不沿用旧结果。README 用户空格改动保持，不纳入提交。

待负责人授权 Merge；无标签/Release/生产部署。本节覆盖以下早期版本和人工验收状态，不删除故障历史。

## 当前冻结状态（2026-11-11）

本轮同步障碍：发布文档已提交为 dd979d6，但两次普通 push 分别连接重置、连接 github.com:443 失败。随后只读 API 仍确认 PR head=41cd5d2、clean、双 CI success。发布文档尚未上传，不宣称最新本地 HEAD 已通过 CI；本障碍补记也保存在本地。人工恢复时在本功能分支执行 `git push origin feature/v2.2-learning-experience`，再核对新 head 双 CI。README 原改动保留。

V2.2 最终范围为 A/B/C/C.1，V2.2-D 实验增强延期，非本版门禁；V2.3-A 暂停。本次为发布准备，不代表正式发布。稳定基线 41cd5d2 已在远端，Push 42757091257 与 PR 42757097933 均成功；PR #1 open、非 draft、mergeable=true/clean，base master/ef48f53。下文旧 PR 失败及 D 规划为历史快照，最新以 [发布说明](V2.2_RELEASE_NOTES.md) 为准。

本轮重新执行 typecheck/lint/unit，107 单元通过；build/e2e 核对真实远端运行，本地未重跑。真机、屏幕阅读器、生产 HTTPS/部署仍待验收。package 保持 2.1.2，正式发版改号需另行确认。README 用户空格改动保留且排除提交。当前仅授权文档提交/普通 push；新文档 HEAD 的 Push/PR CI 必须在合并前重新核对，等待用户确认 Merge，不启动 V2.3、不合并 Curriculum 3.0。

更新时间：2026-11-09，维护者：Codex。本文为状态快照；每次接手以 Git、源码和同一 SHA 的 CI 实查更新，不以聊天或版本号猜测功能。

## 当前阶段覆盖：V2.2-C.1（2026-11-10）

最新结果：最终代码/测试提交 `51d2978e936ae5ade9a90348002d4150e9e55d36` 已推送。push CI [42756379694](https://github.com/dokiradokira/Cyberpath/actions/runs/42756379694) completed/success，typecheck、lint、unit、production build、浏览器回归、LAN 全部通过。同 SHA PR 运行 [42756386582](https://github.com/dokiradokira/Cyberpath/actions/runs/42756386582) 在浏览器回归失败，单独记录，不能表述为所有 CI 全部通过。详见 [V2.2_C_1_IMPLEMENTATION.md](V2.2_C_1_IMPLEMENTATION.md)。

本轮接手时实际工作区是 `D:\cyberpath`，基线 `557dee1`，Codex 留下 5 个修改、4 个未跟踪文件；`D:\cyberpath-dsh` 是停在 `8b22cdd` 的旧克隆，不是半成品所在。README 的用户空格改动保留且未纳入提交。没有 reset/clean/stash/pull/rebase 或切换分支。

实现：完整测验/复习历史迁到 IndexedDB `cyberpath.learning.v1`，记录按代存储，取消 100 条记录上限且不自动裁剪；旧 `cyberpath.v1` 保留为最近 20 条兼容快照并带 `historyStorage` 标记。首次迁移单事务写入行、原文备份和 head，校验行数后提交；中断回滚后可重试。导入先全量校验再替换，失败不改原档案；导出 v2 含完整历史；配额不足回滚并提示；IndexedDB 不可用时只读降级。成绩趋势按页查询完整记录，错题统计由增量聚合维护。schema 1、F01/F02/F03、词汇与课程进度保留。

本地完整回归在获得本地全访问运行环境后执行：`npm run build`、107 个单元测试、74 个浏览器用例（Chromium + WebKit）、2 个 LAN 用例、typecheck、lint 全部通过；默认沙箱下 unit/build/e2e 的 `spawn EPERM` 仍如实记录。package 仍 `2.1.2`，V2.2 未发布；不合并 master、不部署、不打标签。真机与屏幕阅读器人工验收仍待完成；D 尚未开始，需另行授权。

## 历史阶段记录：V2.2-C（2026-11-10）

最新结果：7e70376 已推送，[push CI 42744976986](https://github.com/dokiradokira/Cyberpath/actions/runs/42744976986) 完整成功，含构建/浏览器/LAN。C 通过当前 push 自动化验收；同 SHA 的 PR 运行 42744981630 在本记录时尚未结束，不推断通过。详见 C 报告，本节以下“待 CI”为功能提交前历史快照。真机仍未验收，V2.2 未发布；结果文档的新 SHA 用 Git/CI 实查。

基线 e645617，分支不变，远程 API 已核对同步，未发现 DSH 规划分支。当前实现真实测验历史、独立错题复习、访问/测验/完成事件时间、按课程筛选的真实成绩 SVG 趋势、带样本数的知识点错误率柱条及开放课程进度。schema/key 保留，可选 study 子版本 1；旧档案不虚构历史，异常原文保护沿用 F02。历史上限 100 条，满时明确拒绝新提交，不自动裁剪。README 既有改动保留。

本地单元 98 通过，新 CI 待本功能提交推送后按 SHA 核对；不能以 B 的绿色结果代替。详见 [V2.2_C_IMPLEMENTATION.md](V2.2_C_IMPLEMENTATION.md)。下方 B 的“C 尚未开发”等文字为历史状态，当前以本节和最新交接为准。package 仍 2.1.2，V2.2 未发布。D 尚未开始，建议教学/实验任务及人工移动验收、历史归档，需另获授权。

## 最新阶段覆盖记录：V2.2-B 词汇升级

**最新验收覆盖（2026-11-10）：** 修复提交 `88ed2e6` 已正常推送，[CI 42741692398](https://github.com/dokiradokira/Cyberpath/actions/runs/42741692398) 全部必需步骤成功，包括完整浏览器回归与 LAN 步骤。V2.2-B 现有自动化验收通过，以下失败描述作为历史保留。真机仍待人工验收，V2.2 未正式发布；V2.2-C 尚未开发，须另获授权。README 用户空格改动继续保留。当前状态文档自身提交用 Git 实查，不预填新 CI 结论。

2026-11-10 针对用户提供的失败日志进行两项最小测试修复：精确限定 packet 词条容器，长列表截图改为视口。业务代码、列表长度及功能断言保留；新 CI 结果待修复提交正常推送后按 SHA 核对，不代表下面旧失败记录已验收。

**2026-11-10 验收更新：** 功能提交 `8b22cdd` 已推送，但 [CI 42632716848](https://github.com/dokiradokira/Cyberpath/actions/runs/42632716848) 浏览器回归失败，LAN 跳过；typecheck/lint/unit/build 成功。V2.2-B 尚未验收，不应开始依赖其通过的后续开发。详细日志 API 返回 403，凭据提取操作被自动审批拒绝；需正常登录 GitHub 查看具体失败用例后修复，详见实施报告。README 用户空格改动仍未提交，保持原样。

本轮提交前基线为 `d828452`，当前分支不变。用户本次将 V2.2-B 明确定义为英语词汇学习升级，取代此前建议的“事件时间/复习契约”阶段命名；旧计划保留为历史，不能按旧建议擅自扩大范围。package 仍为 2.1.2，V2.2 未发布。

- 实现：正文流内词汇定义/例句/收藏、Escape 收起与焦点返回、两种模式立即生效并保存、词汇列表挑战模式按需翻译；复习进度、有限轮次完成与重开、掌握状态调整、键盘翻卡/前后导航。原有搜索、筛选、F03 队列和 F02 存储保护保留。
- 数据：34 个词条保留，新增只读 id 与原 word 完全一致；不改 schema/key，不删除用户收藏或复习记录。12 个课程词条使用显式例句，其他 22 个沿用已有例句。
- 工作区：开始时 README 有一处用户空格改动，保留且不纳入本次提交。其余本轮文件见 [V2.2_B_IMPLEMENTATION.md](V2.2_B_IMPLEMENTATION.md)。因此不能宣称交付时工作区完全干净。
- 验证：本轮 typecheck、lint、90 个单元测试通过；浏览器测试新增 7 个场景 × Chromium/WebKit。提交前尚无本轮 CI 结论，推送后须按新 SHA 实查；不会沿用旧绿色结果。Windows build/e2e 未本地重跑，不重新排查 EPERM。
- 当前开发：V2.2-B 实现与回归验收，状态以新 CI 为准。下一阶段 V2.2-C 建议处理事件时间、测验/错题复习契约，须另获授权；该项仍未实现。
- 部署/权限：仅授权本阶段正常 push 当前功能分支；不 merge、不部署、不打标签、不更改安全设置。真机仍未验收。

下方为前阶段快照，当前阶段、基线和下一步以本节及最新交接为准。本次提交定位仍用 `git log -1 -- docs/PROJECT_STATUS.md` 实查，不预填自身 SHA。

## 版本与仓库

| 项目              | 当前事实                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 项目名称          | CyberPath，零基础网络安全与英语辅助学习网站                                                                                                             |
| 当前正式版本      | 待负责人确认正式发布口径。远端可查历史标签 v2.0.0、v2.1.0，无 GitHub Releases；本地有 v2.1.1 标签，不能推断远端发布。V2.2 未正式发布                    |
| package 版本      | `package.json` 为 2.1.2，稳定性修复候选标识                                                                                                             |
| 当前开发版本/阶段 | V2.2；V2.2-A 课程体验已实现并通过既有自动化门禁，V2.2-B 尚未开始。本轮仅建立协作机制                                                                    |
| 当前分支          | `feature/v2.2-learning-experience`                                                                                                                      |
| 核对时 HEAD       | `19126ca6e21bfca2cc280eaa25f7981f93862ad0`（README 更新），是本次协作文档提交前基线                                                                     |
| 仓库              | [dokiradokira/Cyberpath](https://github.com/dokiradokira/Cyberpath)，origin 保持现有 HTTPS 地址                                                         |
| 远端核对          | 功能分支与上述 SHA 一致；默认 master 为 ef48f53，未合并功能分支，仓库首页因而仍显示旧内容                                                               |
| 文档提交定位      | 本次文档自身 SHA 不预填；用 `git log -1 --format="%H %s" -- docs/PROJECT_STATUS.md` 查此快照所属提交，再用 `git status -sb`、远程查询和 CI 核对其后状态 |

## 已实现与未实现

已实现：Next.js App Router / React / TypeScript 应用，三课英文教材、中文术语辅助、34 词词库、四个浏览器实验、每课五道测验、最近/最高分和最近错题、用户确认完成、笔记与收藏、主题、响应式导航、本地 JSON 导入导出及恢复提示。八课路线中第 4–8 课仅预告。

已完成关键增量：

- V2.1.2 的 F01 严格导入类型校验、F02 异常原文保留和写入保护、F03 词汇队列修复，历史提交 `4a79c43` 保留在当前分支。
- V2.2-A 的 20 个稳定章节 ID、目录/高亮/前后章节、手机目录、自动记录章节与阅读比例、刷新恢复、首页继续学习、旧书签迁移和阅读样式，功能提交 `6b1e840`。
- GitHub Actions CI 配置 `84f42ce`，交接文档 `b6e4bbd`，README 更新 `19126ca`。

当前开发中：仅协作规则及项目状态/交接文档，属于本次授权范围；无在途业务改动。拟下一阶段 V2.2-B：进度事件时间、成绩与复习契约，仍需新的任务授权。

待开发：访问/测验/完成时间分离、错题历史模型、教学示例深化、实验练习目标、移动/无障碍收口。账号、云同步、数据库、AI、支付、真实攻击靶场、课程 4–8 正文及离线缓存均未实现，不作为本次开发范围。具体依赖见 [V2.2_ROADMAP.md](V2.2_ROADMAP.md)，其中历史基线和已完成事项需结合本文辨别，不重做 F01–F03、CI 或稳定章节 ID。

## 已知问题与数据边界

- Windows 默认沙箱构建 EPERM 仍未解决；本轮不重新调查、不修改 ACL/完整性级别、不关闭安全机制。
- `updated` 仍由多类事件共用；访问时间可能干扰最近成绩的语义，是 V2.2-B 应优先解决的问题。旧时间未知不得伪造。
- 阅读位置约 250ms 节流，最后瞬间滚动可能未保存，按章节比例恢复而非像素精确恢复。
- schema 1 / key `cyberpath.v1` 保持；可选 contentVersion/sectionProgress 已加入。新程序兼容合法旧档案，不保证旧程序识别新章节 ID；回滚前导出，不能删除用户记录。
- localStorage 随同源、浏览器和设备隔离，清理数据仍会丢失档案。多标签页只检测已发生的快照冲突，不提供原子自动合并。
- 真机 Safari/Chrome、HTTPS 添加到主屏幕及托管环境未完成独立验收；WebKit 模拟不能替代。

## 测试、CI 与部署

2026-11-09 本次只读 API 核对：`19126ca` 的 [Actions 42618523949](https://github.com/dokiradokira/Cyberpath/actions/runs/42618523949) 状态 completed / success。TypeScript、ESLint、单元、生产构建、浏览器及 LAN 步骤成功；不是本轮重新运行浏览器。LAN 无网卡可 skip，真机仍未验证。

本轮本地检查及结果在 [AGENT_HANDOFF.md](AGENT_HANDOFF.md) 的记录中逐项填写；文档提交前不得把该提交未来的 CI 写成通过。新 push 将触发新运行，交付及下次接手须按新 SHA 查询。工作流用 Ubuntu 24.04 / Node 24、npm ci、只读 contents 权限、失败报告保留 7 天，无部署步骤。

无已确认的公网生产部署，未创建本轮 Release/正式标签、未合并 master，不因 CI 成功宣称正式发布。当前默认分支页面不等同于功能分支状态。

## 下一步与交接入口

1. 本阶段只提交这批协作文档，经本次用户授权正常 push 当前功能分支并核对新 CI。
2. 切换 Agent 前停止前一 Agent 所有写入任务，下一 Agent 按 [统一交接](AGENT_HANDOFF.md) 先只读核对，再认领一个明确任务。
3. 获得下一阶段授权后从 V2.2-B 的事件时间与数据兼容回归用例开始；不擅自启动全部路线、不重做 V2.2-A。发布前另需真机、部署环境与人类批准。
