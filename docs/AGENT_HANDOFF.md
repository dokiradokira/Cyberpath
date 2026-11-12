# Agent Handoff

适用于 Codex 与 DeepSeek Harness（DSH）交替维护同一个 CyberPath 仓库。当前写入者：Codex（本轮 Motion & Interaction 任务）；下一写入者待负责人指定。写入权由负责人确认移交，文档不是互斥锁，也不能证明另一工具已停止。

先读 [AGENTS.md](../AGENTS.md)、[PROJECT_STATUS.md](PROJECT_STATUS.md)、[安全工作流](SECURE_DEVELOPMENT_WORKFLOW.md)。历史报告只作对应时间/SHA 的证据；实际 Git、源码和同一 SHA 的 CI 优先核实。不得仅凭聊天重做已有功能。

## 固定交接格式

每阶段或工具切换时，在“交接记录”顶部追加一份以下格式，保留旧记录。所有字段必须填写；无则写“无”，未知写“待确认 + 原因”，受阻写错误和人工步骤。HEAD 与工作区均注明快照时点；不要填尚未创建的文档提交哈希。

```text
Agent Handoff — YYYY-MM-DD HH:mm timezone（记录时点）
Previous Agent:
Current Development Phase:
Branch:
HEAD:
Working Tree Status:
Latest Completed Task:
Changed Files:
Tests Actually Run:
Test Results:
CI Status:
Uncommitted Changes:
Unpushed Commits:
Known Issues:
Remaining Tasks:
Next Recommended Action:
Important Warnings:
```

CI Status 必须包含 SHA、运行链接和未触发/排队/运行中/失败/成功/无法读取；测试区分本地本轮、历史本地、远程 CI，写 skip 和未执行原因。Changed Files 包括已提交及未提交范围，授权不自动转移到下一 Agent。

## 切换或额度将尽时

1. 停止新任务，通知负责人正在交接。保存完整可用增量；未完成代码不能硬说完成，记录剩余工作。
2. 检查 `git status`、diff、文件归属、密钥和产物。保留用户修改，不执行 reset/clean，不用 `git add .`。
3. 运行当前环境允许的检查，记录实际结果。优先查询 CI，受阻不反复排查 Windows 权限，不跳过或放宽断言获取绿色结果。
4. 按功能阶段提交到正确分支。提交前把 PROJECT_STATUS 与本交接记录写入同一提交；若阶段代码已经提交，则独立提交文档。
5. 仅在该阶段获得用户明确授权时 push origin 的指定功能分支，核对远端 SHA 并查询对应 CI。未授权或失败就保留本地成果、记录未推送提交；不合并主分支、部署或打标签。
6. 更新状态和交接中的已知事实；不能提前写“推送/CI 成功”。自身提交哈希通过下面命令在交付时核实，不为更新自身哈希无限追加提交；提交后新发现的 CI 失败须作为后续记录，不改写历史。
7. 负责人确认前一 Agent 停止该目录的编辑、Git 与会写文件的后台任务，再授权下一 Agent 写入。不要擅自终止未知进程。若两边都在运行，先停止写入，只读核对后由负责人选择唯一写入者。

## 接手时的最小检查

```powershell
Set-Location D:\cyberpath
git status
git branch -vv
git remote -v
git log -5 --oneline
git log -1 --format="%H %s" -- docs/AGENT_HANDOFF.md
git diff --stat
git diff --cached --stat
git log --oneline '@{upstream}..HEAD'
```

没有 upstream 时最后一条会失败，记录为未配置，不擅自设定或猜测远端。`origin/*` 是本地缓存；联网可用时经允许 fetch（不自动 pull）或只读远程查询核对实际 SHA。不要因两工具名称不同就重新创建仓库、分支、安装依赖或全量审计。先比较任务涉及文件及报告，遇到新证据才扩大相关检查。

### commit / push 受阻的人工步骤

保留所有文件，记录 `git status --short` 的完整清单及错误；列出实际文件，以下是本轮文档范围的示例，不是对未来任务的自动授权。普通 PowerShell 逐步执行，失败停止；检查暂存区没有用户无关文件后才提交。

```powershell
Set-Location D:\cyberpath
git status -sb
git diff --check
git diff -- AGENTS.md docs/SECURE_DEVELOPMENT_WORKFLOW.md
git add -- AGENTS.md docs/PROJECT_STATUS.md docs/AGENT_HANDOFF.md docs/SECURE_DEVELOPMENT_WORKFLOW.md
git diff --cached --stat
git diff --cached
git commit -m "docs: establish shared agent workflow and handoff"
# 只有用户明确授权此阶段才执行下一行
git push origin feature/v2.2-learning-experience
```

绝不修改 ACL、完整性级别、关闭安全机制或删除工作区来获得 Git 写入权限。工具正规逐命令审批可用时按授权使用；不支持则由人类执行。

## 交接记录

### Agent Handoff — 2026-11-12 Asia/Shanghai（Codex，Motion 定向修整）

- Previous Agent: Codex（同任务续作，07a0bba）；当前唯一写入者继续 Codex。
- Current Development Phase: Motion 真机反馈定向修整，不进入其他阶段。
- Branch: `feature/motion-interaction-quality`。
- HEAD: 提交前基线 `07a0bba`；最终交接提交通过 `git log -1 --format="%H %s" -- docs/AGENT_HANDOFF.md` 查询，未预填不存在 SHA。
- Working Tree Status: 本轮源码/测试/文档与原 README 用户修改；README 不暂存。
- Latest Completed Task: 退出结束帧闪烁复现/修复；主栏目预取、即时 pending；加强位移/缩放/底栏与 DNS 反馈；分阶段导航对照采样。
- Changed Files: motion.ts、globals.css、Shell、NavFeedback；motion-runtime 单元、motion-refinement e2e、app 导航 e2e、vocabulary-learning 档案恢复同步；MOTION_REFINEMENT、PROJECT_STATUS、AGENT_HANDOFF。
- Tests Actually Run: typecheck、lint、127 unit、审批后 production build、定向浏览器 6 项、LAN 2 项、完整浏览器回归；diff/敏感文件/产物范围检查在提交前执行。
- Test Results: 静态/127 单元/build/新增定向 6 项/LAN 2 项均通过；最终完整回归 **100/100**，5.9 分钟。首轮 98/100，WebKit 硬替换文档中断预取产生访问控制误报、收藏筛选早于档案恢复造成点击位置变化；分别改为实际课程入口及等待真实收藏数据，保留全部断言，不过滤异常。修复两用例及退出期间快速重开双引擎定向 6/6。基线双引擎已复现结束帧 opacity=1，修复后为 0。
- CI Status: 本轮新提交尚未创建，未触发；推送后按最终 SHA 在 [Actions](https://github.com/dokiradokira/Cyberpath/actions) 查询，不持续等待、不沿用旧绿色记录。
- Uncommitted Changes: 提交前为上述本轮文件及 README；本轮提交后应只余用户 README，以最终 git status 核实。
- Unpushed Commits: 本轮提交尚未创建；基线已与 origin 同步；已获准普通 push 当前 Motion 分支。
- Known Issues: 默认沙箱 EPERM 未重新排查；本轮 build/browser 走正规单命令审批，无安全设置变更。WebKit 模拟不代表真实 iPhone Safari 合成/触感验收；无 FPS 声称。
- Remaining Tasks: 提交/普通 push、按新 SHA 查询 CI；用户真机复验。
- Next Recommended Action: iPhone Safari 连续开关/切换词汇、滚动后关闭、快速重开；首次/重复点底栏，观察即时反馈；卡片及 DNS 查询/TTL/负缓存，比较 Reduce Motion。
- Important Warnings: 保留 README；不改课程/词汇内容、IndexedDB/备份格式和正式版本号；不合并/部署/标签/强推。3114 为本轮隔离测试端口，未停止独立 DSH 目录服务。交接前停止本工作区写入。

### Agent Handoff — 2026-11-12 Asia/Shanghai（Codex，Motion & Interaction）

- Previous Agent: Codex（DNS 修整 50b135c）。
- Current Development Phase: Motion & Interaction Quality Upgrade。
- Branch: `feature/motion-interaction-quality`。
- HEAD: 提交前基线 `e06d959`；交接提交用 `git log -1 --format="%H %s" -- docs/AGENT_HANDOFF.md` 解析。master 已包含 DNS PR #4，未在本轮合并。
- Working Tree Status: 提交前为本轮源码/测试/文档及原 README 用户改动；README 排除提交。
- Latest Completed Task: Motion tokens；导航、卡片/目录、词汇浮层、DNS 回放、测验保存/结果五类接入；WebKit CSS 秒/毫秒解析修复。
- Changed Files: globals.css；Shell、AnnotatedText、ChapterNavigation、DnsWorkshop、Quiz、use-reading；新增 motion/dns-motion 工具、presence hook、AnimatedDetails；两个单元文件和 motion e2e；Playwright 可选端口；Motion 报告/PROJECT_STATUS/AGENT_HANDOFF。
- Tests Actually Run: typecheck、lint、126 unit、production build、新场景定向 10 项、SSR/导航定向 4 项、迁移原用例重复 6 项、最终完整浏览器 94 项、LAN 2 项；格式/链接/diff/敏感文件与产物范围检查。
- Test Results: 最终上述均通过，完整 94/94、LAN 2/2，无 lint warning。默认 build 的 `.next-v2/server/app/labs` mkdir EPERM 保留记录；构建/浏览器按正规单命令审批执行，未改系统权限。首轮 WebKit 动效因 CSS 时间单位过快、后续 no-JS 固定端口、radio 恢复/按压命中问题均如实记录并修复；未删/跳过/放宽旧断言。浮层高度差 0、结束后运行中动画 0，原始 JSON/录像位于 test-results。
- CI Status: 新提交尚未创建，CI 未触发；推送后按最终 SHA 查询 [Actions](https://github.com/dokiradokira/Cyberpath/actions)，不持续等待、不预填成功。
- Uncommitted Changes: 本轮提交后应只余 README 用户空格修改，以交付时 git status 核实。
- Unpushed Commits: 提交前本阶段无新 commit；本轮已获准普通 push 新 Motion 分支，最终同步以远端 SHA 核实。
- Known Issues: 默认 Windows build EPERM；真实 iPhone/VoiceOver/生产环境尚未验收，不把 WebKit 模拟或无头抽样当作 FPS 认证。3100 为独立 D:\cyberpath-dsh Next 服务占用，未停止或写入其目录，本轮改用 3114。
- Remaining Tasks: 提交/push 和新 SHA CI 状态核对，用户真机观感、VoiceOver 与生产验收。
- Next Recommended Action: 在手机切换底栏、目录快速反向展开、Enter/Escape 重开词汇、观察 DNS miss/hit/负缓存、提交并重做测验；开关系统 Reduce Motion 比较。
- Important Warnings: 保留 README；不改词汇/课程数据、规划、schema 和正式版本号；不 merge/部署/打标签/强推。录像与性能抽样属于忽略的测试产物，不提交。换 Agent 前确认本工作区已停止写入。

### Agent Handoff — 2026-11-12 Asia/Shanghai（Codex，DNS 整合与阅读修整）

- Previous Agent: Codex（DNS 样板 f1747ed，本轮用户继续交付修整任务）。
- Current Development Phase: DNS Sample Integration & Reading Experience Polish。
- Branch: `feature/curriculum-3-dns-sample`。
- HEAD: 提交前 `f1747ed`；交接提交用 `git log -1 --format="%H %s" -- docs/AGENT_HANDOFF.md` 解析。fetch 后 master 为 `13cc786`（已包含初版样板，无源码差异）。
- Working Tree Status: 提交前为本轮增量文件和用户 README 空格改动；README 不暂存。
- Latest Completed Task: 共享词库覆盖、语境浮层、实验中心入口与共享模拟器、语义分段与手机排版、真实版本标签。
- Changed Files: content 的 dns-vocabulary/vocabulary/DNS 正文；lib 的 terms/version/labs；AnnotatedText、DnsWorkshop、LessonView、Shell、Overview、labs/page、globals.css；新增 reading-polish unit/e2e、旧 DNS e2e 语义定位；本轮实施记录与状态/交接文档。
- Tests Actually Run: typecheck、lint、117 unit、production build、定向浏览器、完整回归 84 项、LAN 2 项；末尾两处文字校正后再跑 unit/lint/build、定向 10 项、LAN 2 项，均通过；文档链接、格式和敏感文件检查通过。
- Test Results: 静态/单元通过，审批后的 build 通过。首轮完整 83/84，发现手机浮层遮挡底部导航，真实修复后定向 10/10、完整 84/84、LAN 2/2。默认 build EPERM 不隐瞒、不修改安全设置。首轮定向旧 DNS 按钮索引失效，修正为选项完整名称，保留原断言。
- CI Status: 新 SHA 尚不存在，CI 未触发；推送后从 [Actions](https://github.com/dokiradokira/Cyberpath/actions) 按 SHA 查询，不持续等待，不预填成功。
- Uncommitted Changes: 本轮提交后应仅余用户 README；交付时重新 git status 核实。
- Unpushed Commits: 提交前无新增提交；本轮获准普通 push 当前 DNS 分支，最终 SHA 和同步状态在交付核实。
- Known Issues: 术语是选择性辅助而非全文翻译；非模态释义浮层可关闭/点击外部关闭；实验状态仍仅当前页面保留。新词备份向旧应用反向导入不作保证，旧档案在新应用保持兼容。
- Remaining Tasks: 提交推送和新 SHA CI 状态核对，用户真实 iPhone/屏幕阅读器与新内容生产验收。
- Next Recommended Action: 人工试读、收藏新词、从课程与实验中心完成 TTL/负缓存实验；再决定后续课程。
- Important Warnings: README 用户修改保留；不改 IDB/schema/旧 ID；不合并规划、master，不部署、不打标签、不强推。交接前确认当前 Agent 停止写入。

### Agent Handoff — 2026-11-12 Asia/Shanghai（Codex，DNS 样板）

- Previous Agent: DSH（现有最近交接记录）；本轮由用户交给 Codex。
- Current Development Phase: Curriculum 3.0 首个高质量样板，增强现有 DNS 课程而非重复建课。
- Branch: `feature/curriculum-3-dns-sample`。
- HEAD: 提交前基线 `2d0cddf`；交接提交以 `git log -1 --format="%H %s" -- docs/AGENT_HANDOFF.md` 解析。
- Working Tree Status: 提交前为本轮 8 个源码/测试文件、3 个文档和用户 README 改动；README 不暂存。
- Latest Completed Task: 阅读五份远端课程规划；五章正文、目标、三层练习、TTL/负缓存状态机及 SVG、两条新词接入原课程。
- Changed Files: `src/components/lessons/{dns-workshop.tsx,lesson-view.tsx}`、`src/content/lessons/{dns-workshop.ts,index.ts}`、`src/content/vocabulary.ts`、`src/lib/dns-workshop.ts`、`tests/dns-workshop.test.ts`、`tests/e2e/dns-workshop.spec.ts`、`docs/{CURRICULUM_3_DNS_SAMPLE,PROJECT_STATUS,AGENT_HANDOFF}.md`。
- Tests Actually Run: typecheck、lint、114 个单元、production build、DNS 定向 Chromium/WebKit 2 项、完整浏览器 78 项、LAN 2 项、Prettier 与文档路径/diff 检查，最终均通过。
- Test Results: 上述已完成检查通过；定向首次 WebKit 未等待档案初始化而失败，等待现有 data-hydrated 后最终 2/2 通过。默认浏览器启动受阻未开始用例，后续走正规单命令审批，不修改安全设置。
- CI Status: 提交前基线 `2d0cddf`；本轮 SHA 尚不存在，CI 未触发。推送后从 [Actions](https://github.com/dokiradokira/Cyberpath/actions) 按最终 SHA 查询，不预填通过。
- Uncommitted Changes: 提交前包括上列本轮文件；交付后应仅保留用户 README 表格空格变更，重新执行 git status 核实。
- Unpushed Commits: 提交前无本轮 commit；本次获准正常 push 新功能分支，实际结果以交付及远端 SHA 核实。
- Known Issues: 实验固定 TTL、单 A 查询与单缓存，未模拟故障/serve-stale/DNSSEC；实验状态不跨刷新保存。真实手机、屏幕阅读器与新内容教学难度待人工验收。
- Remaining Tasks: 核对推送后 CI，人工体验样板。
- Next Recommended Action: 用户试做正缓存与负缓存两条实验，提交英文证据笔记后反馈课程节奏；再决定下一主题。
- Important Warnings: 不合并规划分支、不改历史 schema/旧 ID；不覆盖或提交 README 用户改动；不 merge、部署、打标签。下一阶段须另获授权，切换前确认当前 Agent 停止写入。

### Agent Handoff — 2026-11-11 17:00 Asia/Shanghai（DSH，V2.3-A 在线访问准备）

- Previous Agent: Codex（额度不足；已确认无 Git 锁、近半小时无源码写入，仅余 Codex 应用/服务进程）。
- Current Development Phase: V2.3-A Personal Online Access 代码准备。
- Branch: feature/v2.3-a-online-access，基于 `origin/master` 的 `ce6da4e`。
- HEAD: `ce6da4e`（本轮提交前基线；本次提交 SHA 用 Git 实查）。
- Working Tree Status: README.md 用户空格改动保留；本轮新增/修改见下，全部随本次提交。
- Latest Completed Task: Vercel 配置、Manifest/iPhone 图标元数据、HTTPS 兼容性核查和自动化测试。
- Changed Files: `vercel.json`、`.vercelignore`、`next.config.ts`、`src/app/manifest.ts`、`src/app/layout.tsx`、`public/apple-touch-icon.png`、`tests/online-access.test.ts`、`tests/e2e/online-access.spec.ts`、`docs/V2.3_A_ONLINE_ACCESS.md`、`docs/PROJECT_STATUS.md`、`docs/AGENT_HANDOFF.md`。
- Tests Actually Run: 本地 typecheck、lint、`npm test`、`npm run build`、`VERCEL=1 npm run build`、`npm run test:e2e`、`npm run test:lan`。
- Test Results: typecheck/lint 通过；单元 13 文件 111 项通过；两种构建通过且 Vercel 模式生成 `.next/BUILD_ID`；Playwright 76 项通过；LAN 2 项通过。未执行真实部署/生产 HTTPS/真机安装。
- CI Status: 尚未触发；本轮普通推送后须按新 SHA 查询，不能沿用 V2.2 或旧运行的绿色结果。
- Uncommitted Changes: 本轮代码/测试/文档待提交；README 用户空格改动不暂存。
- Unpushed Commits: 记录时无；提交后普通推送功能分支。
- Known Issues: Vercel Preview 与真机主屏幕尚未验收；HTTPS 与旧 HTTP/LAN 是不同 origin，存储不自动迁移；无 Service Worker 离线能力。
- Remaining Tasks: 普通推送并核对新 SHA 的 CI；人工完成 Vercel Preview 与 iPhone 主屏幕验收。
- Next Recommended Action: 部署 Preview 后检查 Manifest、图标、课程/词汇/测验和刷新后的 IndexedDB 进度；确认通过后再评估合并。
- Important Warnings: 不合并 master、不部署生产、不打标签、不强推；不改 ACL/完整性级别；README 用户改动保留。

### Agent Handoff — 2026-11-11（Codex，最后两项回归定向修复）

- Previous Agent: Codex。
- Current Development Phase: V2.2 发布前测试同步修复。
- Branch: feature/v2.2-learning-experience。
- HEAD: c9e2482，提交前基线；新提交用 Git 实查。
- Working Tree Status: README 用户改动保留；本轮仅测试与此处简短状态记录。
- Latest Completed Task: F03 等待主档案中 packet.attempts；主题硬导航前等待 IndexedDB theme 提交。
- Changed Files: 两个失败测试、tests/support/persisted-profile.ts、PROJECT_STATUS、AGENT_HANDOFF。
- Tests Actually Run: 定向 Playwright 后全量回归，typecheck/lint/unit；沿用既有生产构建。
- Test Results: 定向 4、浏览器 74、单元 107 通过，静态检查通过；LAN 以本次交付结果为准。
- CI Status: 新提交尚未推送，按用户要求推送后给链接、不等结束。
- Uncommitted Changes: 本轮五文件及排除的 README 用户修改。
- Unpushed Commits: c9e2482 合法报告提交随本修复正常推送。
- Known Issues: 新 CI 尚待验证，不能写成全绿。
- Remaining Tasks: 普通 push 最多一次尝试，失败停止；不合并。
- Next Recommended Action: 用户查看新 HEAD 双 CI。
- Important Warnings: 未改业务/存储/迁移/完整备份，不放宽 F03 或主题断言，不改 README、不部署/标签/V2.3。

### 2026-11-11 最终收尾 CI 阻塞记录

50604a8 版本/验收更新及 dd979d6、f122c4e 已推送，本地 typecheck/lint/107 unit 通过，锁文件结构比较确认仅根版本变更。Push [42982447755](https://github.com/dokiradokira/Cyberpath/actions/runs/42982447755) success；PR [42982455392](https://github.com/dokiradokira/Cyberpath/actions/runs/42982455392) 的 Browser regression failure，LAN skipped，其他静态/单元/构建步骤成功。PR #1 open、master、mergeable=true 但 unstable；具体失败用例未知，公开注释只有 exit code 1。结果补记本身产生新 SHA，不能预填新检查通过。停止合并准备动作，等待失败报告/明确下一步；不合并、不打标签、不部署。README 原有修改保留。本记录不是“全部通过”结论。

### Agent Handoff — 2026-11-11（Codex，2.2.0 最终收尾）

- Previous Agent: Codex。
- Current Development Phase: V2.2 冻结，统一 2.2.0 与人工验收状态，等待 Merge 授权。
- Branch: feature/v2.2-learning-experience。
- HEAD: f122c4e，本次提交前基线，远端/PR head 核实为 41cd5d2，无其他 Agent 新远端提交。
- Working Tree Status: 原有 README 用户空格修改保留；本轮版本文件及四份文档。
- Latest Completed Task: package/lock 2.2.0，无依赖升级；更新真实设备体验确认与专项/生产验收的区别。
- Changed Files: package.json、package-lock.json、CHANGELOG、V2.2_RELEASE_NOTES、PROJECT_STATUS、AGENT_HANDOFF；README 不暂存。
- Tests Actually Run: 本轮按实际命令/新 CI 记录；不把先前 41cd5d2 结果当新提交通过。
- Test Results: 待新提交验证，不预填。
- CI Status: 新 HEAD 待 push 后分别核查 Push、PR 两类运行。
- Uncommitted Changes: 提交前上述文件与 README 用户改动。
- Unpushed Commits: 开始时 dd979d6、f122c4e；本次正常 push 一并同步，最终结果实查。
- Known Issues: 屏幕阅读器专项尚未确认；生产验收尚未进行，部署时完成；用户真实设备体验检查已完成、未发现明显异常，非全面专业认证。
- Remaining Tasks: 新 HEAD 双 CI 及 PR 目标/冲突/检查复核；等待明确授权合并。
- Next Recommended Action: 符合条件后用户可授权普通 Merge commit，未授权不执行。
- Important Warnings: D 已延期，非门禁；不强推/合并/部署/标签，不启动 V2.3、不改 Curriculum 3.0、不提交 README。

### 2026-11-11 发布文档推送障碍补记

dd979d6 已保存发布资料；首次普通 push 报 Recv failure: Connection was reset，重试报 Failed to connect to github.com:443。API 仍可读，PR #1 head=41cd5d2、open/mergeable=true/clean，Push 42757091257 与 PR 42757097933 success。本地文档提交未推送，此补记也仅保存为本地提交；用 `git log --oneline '@{upstream}..HEAD'` 查完整待推送清单，不丢弃它们。README 原修改保持未提交。恢复网络后正常 push 当前功能分支，等新 head 双 CI 后由用户决定 Merge。当前停止，不合并、不部署、不启动 V2.3。

### Agent Handoff — 2026-11-11（Codex，V2.2 冻结与发布准备）

- Previous Agent: DSH 完成 C.1，Codex 本轮只做冻结核查。
- Current Development Phase: V2.2 A/B/C/C.1 冻结，待负责人确认 Merge；D 延期，V2.3-A 暂停。
- Branch: feature/v2.2-learning-experience。
- HEAD: 41cd5d2，本文提交前基线；最终文档 SHA 用 Git 实查。
- Working Tree Status: 进入时仅 README 用户空格改动；本轮三个发布文档，不暂存 README。
- Latest Completed Task: 核对 PR #1、稳定基线双 CI、数据兼容源码及敏感文件，整理发布说明。
- Changed Files: V2.2_RELEASE_NOTES、PROJECT_STATUS、AGENT_HANDOFF；无源码/测试/版本号修改。
- Tests Actually Run: 本地 typecheck/lint/unit、diff/文档检查；只读 API 核对双 CI 各步骤。
- Test Results: 单元 12 文件 107，通过；build/e2e 本轮本地未执行，稳定基线远端成功，真机待办。
- CI Status: 41cd5d2 Push 42757091257、PR 42757097933 success；新文档提交不能预填通过。
- Uncommitted Changes: 提交前三文档及需保留的 README 原改动。
- Unpushed Commits: 进入时无，功能基线与 origin/PR head 一致。
- Known Issues: 真机/屏幕阅读器/生产环境待验收，package 2.1.2 未正式改号，Windows EPERM；完整历史受配额/64 MB 备份上限约束，无云同步。
- Remaining Tasks: 文档独立提交推送，检查最新 head 双 CI/PR；等待用户确认 Merge，不自行合并。
- Next Recommended Action: 经审阅并明确授权后使用普通 Merge commit 保留阶段历史；正式发布另行确认版本号与验收。
- Important Warnings: 不强推、merge、部署、标签；不合并 Curriculum 3.0，不启动 V2.3；保留 README，避免用历史 PR 失败覆盖当前成功结论。

### Agent Handoff — 2026-11-10 12:05 Asia/Shanghai（DSH，V2.2-C.1 接手补完）

- Previous Agent: Codex（V2.2-C.1 中途额度耗尽，留下未提交半成品；没有 C.1 文档）。
- Current Development Phase: V2.2-C.1 完整历史与 IndexedDB 持久存储。
- Branch: feature/v2.2-learning-experience。
- HEAD: 51d2978（功能 `e9716a0`、测试等待 `1bae7f9`、WebKit 修复 `51d2978`；文档提交自身 SHA 用 Git 查）。
- Working Tree Status: README 用户空格改动保留；本轮 C.1 报告、PROJECT_STATUS、本交接待提交。
- Latest Completed Task: 移除 100 条记录上限；IndexedDB 迁移/回滚/兼容快照/导入导出/配额与分页补完；新增 101、1001、旧档案、镜像最近 20 条、导出排序测试。
- Changed Files: `src/lib/history-backup.ts`、`src/lib/history-repository.ts`、`src/lib/study.ts`、`src/components/learning-provider.tsx`、`src/components/lessons/quiz.tsx`、`src/components/progress-view.tsx`、`src/components/study-dashboard.tsx`、`tests/history-backup.test.ts`、`tests/study.test.ts`、`tests/e2e/history-storage.spec.ts`、`tests/e2e/app.spec.ts`、`tests/e2e/study.spec.ts`、`tests/e2e/stability.spec.ts`、`tests/e2e/v2.spec.ts`、`tests/e2e/vocabulary-learning.spec.ts`。
- Tests Actually Run: 本地 `npm run build`、`npm test`、`npx playwright test`、`npm run test:lan`、typecheck、lint；远端 push CI 全部步骤。
- Test Results: 本地 107 单元、74 浏览器、2 LAN、build/typecheck/lint 通过；默认沙箱下 `npm test` 仍 `spawn EPERM`，已记录。push CI 全部成功；同 SHA PR CI 浏览器回归失败，未定位，不能写成全部通过。
- CI Status: push [42756379694](https://github.com/dokiradokira/Cyberpath/actions/runs/42756379694)，51d2978，success；PR [42756386582](https://github.com/dokiradokira/Cyberpath/actions/runs/42756386582)，同 SHA，浏览器回归 failure。历史失败 `e9716a0`、`1bae7f9` 已在 `51d2978` 修正。
- Uncommitted Changes: 三份 C.1 文档待提交；README 不暂存。
- Unpushed Commits: 记录时无；文档提交待推送。
- Known Issues: PR 运行浏览器回归失败原因未取得日志；localStorage 被禁用但 IndexedDB 可用的组合仍只读；浏览器清理站点数据会删除 IndexedDB；重置保留旧代作为本地回滚备份；旧版本只看到最近 20 条；真机未验收。
- Remaining Tasks: 推送文档并核对新 SHA 的 push/PR CI；排查 PR 浏览器失败；真机/屏幕阅读器人工验收；获授权后再评估 D。
- Next Recommended Action: 推送文档后核对新 SHA 的 push CI；单独排查同 SHA PR 浏览器失败，不把 push 成功当作 PR 通过；真机验收后再考虑 D。
- Important Warnings: 不合并 master、不部署、不打标签、不强推；不改 ACL/完整性级别；不删除用户档案；README 用户改动保留。

### Agent Handoff — 2026-11-10（Codex，V2.2-C push CI 成功）

- Previous Agent: Codex。
- Current Development Phase: C 功能通过 push 自动化门禁，结果补记。
- Branch: feature/v2.2-learning-experience。
- HEAD: 7e70376，结果文档提交前基线；本记录所属提交用 Git 实查。
- Working Tree Status: 原有 README 用户改动保留；本轮只更新三份结果文档。
- Latest Completed Task: 历史/错题/图表及兼容读取通过现有完整 push CI。
- Changed Files: 本次仅 C 报告、PROJECT_STATUS、此交接。
- Tests Actually Run: 本地 typecheck/lint/unit 98/AGENTS/diff；远端完整 push CI。
- Test Results: push 测试步骤成功，配置保留 64 个浏览器用例；LAN 无网卡可 skip，真机待确认。
- CI Status: [42744976986](https://github.com/dokiradokira/Cyberpath/actions/runs/42744976986)，7e70376，success；同 SHA PR 42744981630 记录时仍运行，不混淆。新文档 CI 待自身 SHA 核对。
- Uncommitted Changes: 三文档待提交，README 不暂存。
- Unpushed Commits: 进入补记时无，功能已推送。
- Known Issues: 100 条历史容量、旧时间未知、Windows EPERM、真机未验收。
- Remaining Tasks: 推送本结果文档并查新 SHA；PR 状态下次重新核对。
- Next Recommended Action: 获用户授权后规划 D 的教学支架/实验任务、历史归档与移动人工验收。
- Important Warnings: 不合并或部署，不强推，不提交 README；新旧备份先导出，禁止伪造旧历史。

### Agent Handoff — 2026-11-10（Codex，V2.2-C 提交前）

- Previous Agent: Codex，继续同一工作区；不启动并发 Agent。
- Current Development Phase: V2.2-C 历史、复习、进度及可视化，等待完整 CI。
- Branch: feature/v2.2-learning-experience。
- HEAD: e645617 基线；本次提交用 git log -1 -- docs/V2.2_C_IMPLEMENTATION.md 实查。
- Working Tree Status: README 原有空格修改保留，不暂存；其他均本轮文件。
- Latest Completed Task: 真实作答快照、独立复习、时间分离、趋势/错误率/进度及单元浏览器测试。
- Changed Files: types、study/storage、Quiz/LessonView、Overview/ProgressView、新 StudyDashboard、CSS、study 单元/浏览器测试、本报告及状态文档；见实施报告完整清单。
- Tests Actually Run: 初次模块缺失红测、npm test、typecheck、lint、格式/diff；完整浏览器交由 CI。
- Test Results: unit 11 文件 98 通过；最终 typecheck/lint/CI 以本次交付为准，未执行不能写通过。
- CI Status: 新提交尚未创建，待推送后查询；基线已通过不代表本轮。
- Uncommitted Changes: 本轮源码/测试/三文档与 README 用户修改。
- Unpushed Commits: 开始时无，远程与本地 e645617 同步。
- Known Issues: 真机未验收、Windows EPERM；历史最大 100 条，旧成绩无真实时间无法生成历史。
- Remaining Tasks: 范围/敏感文件检查、正常提交推送、查完整 CI，若失败按实际日志修复。
- Next Recommended Action: 先核对本 C 提交的真实 CI；D 仅建议，不自动启动。
- Important Warnings: 不删除旧错误/伪造历史、不提交 README、不改安全设置、不合并/强推/部署/打标签。旧程序可能忽略 study，回滚先导出。

### Agent Handoff — 2026-11-10（Codex，修复 CI 成功）

- Previous Agent: Codex。
- Current Development Phase: V2.2-B 自动化验收通过，补记结果。
- Branch: feature/v2.2-learning-experience。
- HEAD: 88ed2e6，文档补记前基线；本记录所属提交用 Git 实查。
- Working Tree Status: 仅 README 原有用户改动及本轮三份结果文档。
- Latest Completed Task: 两类浏览器测试修复均通过完整 CI。
- Changed Files: 本结果提交仅实施报告、PROJECT_STATUS、AGENT_HANDOFF。
- Tests Actually Run: 本地 typecheck、lint、unit 90、格式检查与 Playwright 列举；远端完整 CI。
- Test Results: 本地检查通过；远端 unit/build/browser/LAN 步骤成功，浏览器配置保留 60 项。
- CI Status: [42741692398](https://github.com/dokiradokira/Cyberpath/actions/runs/42741692398)，SHA 88ed2e6，completed/success；本结果文档的新 CI 仍需推送后核查。
- Uncommitted Changes: 提交前为三文档和 README 原有改动；后者不暂存。
- Unpushed Commits: 进入本补记时无；f2cdcb1、88ed2e6 已推送。
- Known Issues: 真机未验收，Windows EPERM、事件时间等原问题不在此次范围。
- Remaining Tasks: 保存并推送本结果记录，确认同步；不开发 C。
- Next Recommended Action: 下个阶段需用户另行授权；建议再处理事件时间及测验复习。
- Important Warnings: 不 merge、强推、部署或打标签；不清理 README；自动化验收不是正式发布。

### Agent Handoff — 2026-11-10（Codex，定向浏览器修复提交前）

- Previous Agent: Codex。
- Current Development Phase: V2.2-B 两类浏览器失败的最小修复与 CI 验收。
- Branch: feature/v2.2-learning-experience。
- HEAD: f2cdcb1，提交前基线，开始时较 origin 缓存领先一条合法报告提交。
- Working Tree Status: 原有 README 用户空格改动保留，另有本修复两测试及三文档。
- Latest Completed Task: 根据实际筛选/DOM 结构修复唯一定位；WebKit 长页截图改视口。
- Changed Files: tests/e2e/vocabulary-learning.spec.ts、tests/e2e/v2.spec.ts、三个状态/报告文档。
- Tests Actually Run: typecheck、lint、unit、格式检查与 Playwright 列举，结果以交付及新 CI 为准。
- Test Results: 不把用例列举当执行；本地不重试已知 EPERM，生产浏览器待 CI。
- CI Status: 原 8b22cdd 浏览器失败；修复提交尚未创建，未有新结果。
- Uncommitted Changes: 本轮五文件以及不纳入提交的 README 改动。
- Unpushed Commits: 开始时 f2cdcb1，授权将其与本修复正常推送。
- Known Issues: 真机未验收、Windows EPERM；不得以旧 CI 结论替代新 SHA。
- Remaining Tasks: 推送、查完整 CI，成功后补记实际验收结论。
- Next Recommended Action: 按新 SHA 核查全部步骤；仅若失败根据新日志修复，不开发 C。
- Important Warnings: 不更改真实列表内容、搜索逻辑或断言含义，不提交 README、不强推/合并/部署。

### Agent Handoff — 2026-11-10（Codex，CI 失败复核）

- Previous Agent: Codex，继续同一 V2.2-B 任务。
- Current Development Phase: V2.2-B 浏览器回归失败，尚未完成验收。
- Branch: `feature/v2.2-learning-experience`。
- HEAD: `8b22cdd`，本次状态补记前基线，已与远端同步。
- Working Tree Status: 进入时仅 README 用户空格改动；本轮补记三个状态文档，待独立提交。
- Latest Completed Task: 读取 CI 最终结论，确认浏览器失败和日志访问障碍。
- Changed Files: PROJECT_STATUS、AGENT_HANDOFF、V2.2_B_IMPLEMENTATION；不改业务代码或测试断言。
- Tests Actually Run: 本轮仅 Git/远端 CI/API 只读核对及文档检查，没有重新运行本地业务测试。
- Test Results: 8b22cdd 的远端 typecheck/lint/unit/build 成功，browser 失败，LAN skipped。
- CI Status: [42632716848](https://github.com/dokiradokira/Cyberpath/actions/runs/42632716848)，completed/failure，对应完整 SHA 见实施报告。
- Uncommitted Changes: 提交前上述三文档以及需保留的 README 用户改动；实际以 status 核对。
- Unpushed Commits: 本轮开始无；本状态提交按现有 V2.2-B 授权正常推送。
- Known Issues: 浏览器具体错误未知；未认证日志 API 403，凭据提取命令被自动审批拒绝；不绕过。
- Remaining Tasks: 用户从正常登录的 GitHub 页面提供失败用例与 e2e.log 错误；再定位修复并重跑 CI。
- Next Recommended Action: 打开该运行的 Browser regression 或 failure-reports 中 reports/e2e.log，提供错误文本，不提供秘密凭据。
- Important Warnings: 不把单元/构建成功当浏览器通过；不删除测试、不改安全设置、不强推/合并/部署；README 用户改动仍需保留。

### Agent Handoff — 2026-11-09（Codex，V2.2-B 提交前快照）

- Previous Agent: Codex；本轮继续开发，没有启动并发 Agent。
- Current Development Phase: 用户指定的 V2.2-B 英语词汇升级，实现及 CI 验收；原事件时间计划留待 V2.2-C。
- Branch: `feature/v2.2-learning-experience`。
- HEAD: `d828452` 提交前基线；本阶段提交用 `git log -1 -- docs/V2.2_B_IMPLEMENTATION.md` 实查。
- Working Tree Status: 开始时 README.md 已有一处空格改动，保留且不暂存。本轮代码、测试、文档待提交，完整范围见实施报告。
- Latest Completed Task: 正文词汇例句/收藏/键盘解释，模式即时与持久化、有限轮次复习、进度及掌握调整，90 个单元测试通过。
- Changed Files: vocabulary 数据、vocabulary-learning 纯函数、AnnotatedText、课程 Vocabulary、VocabularyView、shell、globals.css、两个新增测试文件、本实施报告、PROJECT_STATUS、此交接及路线阶段映射。README 用户改动不包含。
- Tests Actually Run: `npm test`（含初次新模块未实现的失败测试）、`npm run typecheck`、`npm run lint`、`npx playwright test --list`、Prettier、diff 检查；最后结果见实施报告。
- Test Results: 单元 10 文件 90 测试、typecheck、lint 通过；本地浏览器仅列举，未执行；不在本机重跑已知受限的 build/e2e。
- CI Status: 本次提交尚未创建，CI 待 push 后按新 SHA 查询，不能预填通过；基线 d828452 历史 CI 已成功。
- Uncommitted Changes: 提交前为本阶段文件及已有 README 用户改动；交付后重新查 status，README 应仍保留。
- Unpushed Commits: 基线与 origin 缓存一致；本阶段提交须正常推送并通过远端 API 核对，不 force push。
- Known Issues: Windows EPERM、真机未验收；自评/测验结果代表最近掌握状态，不是 SRS；原事件时间混用仍未解决。
- Remaining Tasks: 检查敏感文件及 diff，提交并按本次授权 push，核验完整 CI；若失败按真实日志修复，不删除旧测试或放宽断言。
- Next Recommended Action: 下一 Agent 先核对本阶段实际 SHA/CI 和 README 用户改动；获授权后处理 V2.2-C 时间与测验复习契约。
- Important Warnings: 模式切换与词汇操作不得改课程完成状态；保护 F01–F03、schema 1 和原 key。不得把用户 README 空格一并提交，不 merge/master、不部署、不改安全设置。本阶段 push 授权不自动转移到下阶段。

### Agent Handoff — 2026-11-09（Codex，本轮文档提交前快照）

- Previous Agent: Codex；此前 DSH 的构建/安全工作已由既有提交和报告接手，本轮不重新审计。
- Current Development Phase: V2.2-A 已通过现有自动化验收；本轮建立双 Agent 规则与交接。V2.2-B 未开始。
- Branch: `feature/v2.2-learning-experience`。
- HEAD: `19126ca6e21bfca2cc280eaa25f7981f93862ad0`，提交前基线；本交接文档提交用 `git log -1 --format="%H %s" -- docs/AGENT_HANDOFF.md` 实查。
- Working Tree Status: 开始时干净；记录时为下列四个协作文档新增/修改，无其他用户改动。提交后须重跑 status，不能把此快照当实时状态。
- Latest Completed Task: 核实 Git、远程、CI、版本和安全资料；增量建立通用规范、状态入口与固定交接格式。上个已提交任务为 README 更新 `19126ca`。
- Changed Files: `AGENTS.md`、`docs/PROJECT_STATUS.md`（新增）、`docs/AGENT_HANDOFF.md`（新增）、`docs/SECURE_DEVELOPMENT_WORKFLOW.md`。不改源码、依赖、课程、测试断言或 CI。
- Tests Actually Run: 本轮验证结果在下方“本轮文档验证”记录；GitHub API 只读核对分支/CI/标签/Release，读取了既有成功运行结果，不是本轮重跑全部测试。
- Test Results: 以“本轮文档验证”为准；本轮不在 Windows 重跑 build/e2e，不重新排查 EPERM。
- CI Status: 本轮核实 `19126ca` 的 [42618523949](https://github.com/dokiradokira/Cyberpath/actions/runs/42618523949) completed / success；typecheck、lint、unit、build、browser、LAN 步骤成功。新文档提交尚未创建，因此尚无其 CI 结果，不能沿用此结论。
- Uncommitted Changes: 快照为上述四文档；实际交接后以 `git status --short` 核实。禁止删除这些文件来获得干净状态。
- Unpushed Commits: 基线无，已用远程 API 核对功能分支 SHA；本次文档提交和推送结果需在交付/接手时实查。
- Known Issues: Windows 沙箱 EPERM；updated 事件时间混用；250ms 阅读节流；本地档案同源隔离及极端多页并发限制；真机/部署未验收。详见 PROJECT_STATUS。
- Remaining Tasks: 完成本轮文档检查、独立提交、按本次授权正常推送并核对新 SHA 的 CI；后续待新授权启动 V2.2-B。
- Next Recommended Action: 下一个 Agent 先确认前任写入已停止并重新检查 Git/最新 CI；然后认领用户指定任务。若授权 V2.2-B，先为访问/测验/完成时间及旧档案兼容定义回归用例。
- Important Warnings: 本次 push 授权仅适用于这批文档；不自动延续至下一 Agent/阶段。默认分支为 master，仓库首页仍是旧主线；不合并、不 force push、不部署/打标签、不改安全设置，保护 F01–F03 和学习数据。

### 本轮文档验证

| 本轮检查                              | 结果                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `npm run typecheck`                   | 通过，退出码 0                                                             |
| `npm run lint`                        | 通过，退出码 0                                                             |
| `./tests/Test-Agents.ps1`             | 通过；原三条规则完整保留，不改测试断言                                     |
| Markdown 格式                         | 四文档经 Prettier 格式化并检查                                             |
| 文档交叉链接、16 个模板字段及首份记录 | 本地脚本验证通过；全部路径存在、字段齐全、AGENTS 旧文本保持前缀            |
| `git diff --check` / 范围审阅         | 通过；仅四个协作文档，无源码/依赖/测试/工作流改动                          |
| 本轮本地 unit / build / e2e / LAN     | 未重跑，纯文档阶段；不排查 EPERM，不把历史 CI 当作本轮新执行               |
| 既有 CI                               | 只读核实 `19126ca` 的 42618523949 成功；新文档 SHA 的 CI 待提交/推送后查询 |

旧版安全流程交接块兼容摘要：

## 交接状态（2026-11-09，工具：Codex）

- 分支/提交：当前功能分支，提交前基线 19126ca；本交接所属提交由上方 Git 命令解析。
- 本轮改动：仅 AGENTS、PROJECT_STATUS、AGENT_HANDOFF、安全流程入口。
- 已验证：typecheck / lint / 文档及规则检查通过；unit / e2e / build 只核实既有 CI，不声称本轮本地执行。
- 未验证及原因：本次文档提交的 CI 在提交前尚不存在；真机及部署仍未验收。
- 环境限制/权限状态：不改安全设置；Git/联网操作仅使用本次授权与正规逐命令审批。
- 下一步（最多 3 条）：提交并按本次授权推送；核对新 SHA 与 CI；下一 Agent 接手后认领获授权任务。
- 阻塞项与需要人类做的事：阶段切换前负责人确认前一 Agent 已停止写入；如果 Git 或网络受阻，保留工作区并按上方人工步骤操作。

## 可复用接手指令

### A. Codex → DSH

负责人确认 Codex 已停止对 `D:\cyberpath` 的所有写入任务。请 DSH 接手：先检查实际 Git，阅读 AGENTS.md、docs/PROJECT_STATUS.md、docs/AGENT_HANDOFF.md 和安全流程，核对最新提交、未提交/未推送内容及对应 CI。延续交接中已授权且未完成的任务；没有明确业务任务就先汇报下一步，不自行启动新阶段。不重复开发、不覆盖用户改动。结束按统一模板交接；push 须有本阶段明确授权，不合并主分支、不部署。

### B. DSH → Codex

负责人确认 DSH 已停止对 `D:\cyberpath` 的所有写入任务。请 Codex 接手：先检查实际 Git，阅读 AGENTS.md、docs/PROJECT_STATUS.md、docs/AGENT_HANDOFF.md 和安全流程，核对最新提交、未提交/未推送内容及对应 CI。延续交接中已授权且未完成的任务；没有明确业务任务就先汇报下一步，不自行启动新阶段。不重复开发、不覆盖用户改动。结束按统一模板交接；push 须有本阶段明确授权，不合并主分支、不部署。
