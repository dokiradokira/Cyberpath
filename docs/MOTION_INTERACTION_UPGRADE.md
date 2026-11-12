# Motion & Interaction Quality Upgrade

日期：2026-11-12。基线 `e06d959`（origin/master，PR #4 已包含 DNS 修复 `50b135c`），分支 `feature/motion-interaction-quality`。README 原用户修改保留，不提交。package 仍为 2.2.0，无新依赖、课程/词汇数据、规划或存储 schema 改动；不合并、不部署、不打标签。

参考站本轮访问未返回可读内容，未重复请求，也不声称复刻其效果。本轮按以下实际交互问题实施。

## 可核验的前后变化

| 场景 | 修改前 | 修改后与流畅性的原因 | 实际验收路径 |
| --- | --- | --- | --- |
| 导航 | 选中背景直接换位置，页面标题直接出现 | 手机底部使用同一指示条平移；保留 Shell DOM、只轻量揭示客户端换页标题，首次 SSR 不因 hydration 再淡入；不重挂载整个页面或为长文创建整页动画层 | 在课程/实验/词汇之间切换，检查选中态、Shell 连续性、初始标题无动画、指示条 transform 与无横向溢出 |
| 课程卡片与章节 | 卡片缺少按压反馈；原生目录瞬间展开，章节瞬间定位 | 卡片聚焦/hover 轻抬、按下缩放、箭头呼应；共享 AnimatedDetails 以有限高度过渡展开，可在中途反向；章节定位后轻量揭示标题，保留原书签与瞬时定位规则 | 聚焦卡片后 Enter 进入；目录快速开关；点击第二章，检查 hash、焦点及恢复阅读 |
| 词汇浮层 | 打开直接挂载，关闭立即删除，无退场连续性 | 共享 presence hook 负责进入/退出及取消；关闭即时 aria-hidden/inert，视觉尾部不阻碍操作；快速重开取消旧退场，焦点恢复不等待动画；浮层不推动文章 | Enter 打开、收藏、Escape、立即重开、关闭；检查高度不变、收藏持续与焦点、手机导航不被遮挡 |
| DNS 实验 | 上游变淡但缺少查询过程，时钟与缓存变化欠明确 | 单个标记回放 client→resolver，再经 resolver 分别请求 Root/TLD/Authority 并返回；命中只在 client/resolver 间移动；缓存状态区分空/正缓存/负缓存/过期，状态数据即时更新，快速查询中断旧回放 | 首次查询、改权威地址再命中、推进到 TTL 到期、重新查询；删除名称查询 NXDOMAIN，再次命中；检查 9 点/3 点轨迹与真实结果一致 |
| 测验 | 保存期间无忙碌状态，等待时还能改答案；结果与解析突现 | 恢复档案前及保存中禁用输入；显示 busy、拒绝重复提交；只在真实保存成功后显示分数，解析和结果有限揭示，焦点移到结果；重测回到首题。原生 radio 标签不缩放，只做颜色/内边框反馈，保持命中区稳定 | 阻塞真实 IndexedDB 只读事务，验证保存中不可更改答案/重复写入，释放后只有一条历史且得分正确；验证按压前后 radio 边界不变、重测焦点与必答校验 |

DNS 动效明确标注为“上次查询回放”，不代表实际网络耗时、不发网络包。负缓存命中不会访问上游；推进时钟只改变缓存有效性，不凭空自动查询。状态机 `dns-workshop.ts` 未修改。观察区改为稳定的五项数据网格，反馈区保留位置，避免查询后控件被不同长度答案推走。

## 轻量 Motion System

全局 tokens：`--motion-press:120ms`、`--motion-state:220ms`、`--motion-scene:320ms`，共享 easing `cubic-bezier(.2,.8,.2,1)`；distance 8px、lift 3px、enter scale .985、press scale .98、hidden opacity 0。旧的零散 140/160/250ms 过渡统一引用 tokens。

CSS 负责导航、卡片、选择态及短反馈；Web Animations API 负责可中断的浮层/目录及 DNS 路径。DNS miss 为 scene×3（960ms）以读清八段查询/响应，hit 为 state（220ms），都不阻塞答案或下一次操作。动画只在操作后有限执行，无常驻循环或逐帧 React setState。仅目录展开需 height 动画，局限于小范围目录/说明块，每次操作测量而非滚动时持续测量。

`motion.ts` 管理动画替换、取消的 Promise、完成后监听器清理；prefers-reduced-motion 时不创建 WAAPI，CSS 动画/位移关闭。运行中改为 reduce 直接完成当前动画。`AnimatedDetails` 保留原生 details/summary，无 JS 仍可展开；关闭途中内容立即 inert，避免键盘落入折叠内容。

Safari 兼容修复：WebKit 返回 CSS 时间为 `.22s`，不能按 `parseFloat` 后直接当毫秒。统一 parser 同时支持秒和毫秒，新增 `.22s → 220ms` 等回归；这是首轮发现的真实动效缺陷，不以放宽时序断言掩盖。

## 文件

- `src/lib/{motion,dns-motion}.ts`、`src/hooks/use-motion-presence.ts`、`src/components/animated-details.tsx`：共享实现。
- `shell.tsx`、`chapter-navigation.tsx`、`annotated-text.tsx`、`dns-workshop.tsx`、`quiz.tsx`、`use-reading.ts` 与 globals.css：接入五类交互。
- `tests/{motion,motion-runtime}.test.ts`、`tests/e2e/motion.spec.ts`：模型、动画取消/reduce、五场景验收及录像/抽样。
- `playwright.config.ts`：仅增加可选 PLAYWRIGHT_PORT，CI 默认 3100 不变。原 no-JS 测试的两个硬编码 3100 URL 改用 fixture baseURL，全部断言保留并增加输入禁用断言。本轮发现 3100 被另一个 D:\cyberpath-dsh 服务占用，没有终止它，本地选用 3114。

## 实际验证与观察边界

先增加 DNS 路径/缓存呈现用例，缺少模块时失败，再实现。

- `npm run typecheck`、`npm run lint`：通过，无 lint warning。
- `npm test`：17 文件、126 项通过（本轮增加 9 项）。
- 默认 `npm run build` 失败：`EPERM: operation not permitted, mkdir 'D:\cyberpath\.next-v2\server\app\labs'`。未改 ACL/完整性级别/安全机制；正规单命令审批后的生产构建通过。
- 首轮新浏览器用例 6/10：除 WebKit 时间单位真实缺陷外，新测试错误地对 fieldset 本身使用 disabled 判定；修正为验证实际输入均禁用，保留 busy、重复提交和真实记录断言。秒/毫秒修复后定向 10/10 通过。
- 完整回归曾分别因旧 no-JS 用例访问硬编码端口、WebKit 首题 radio 未激活而各 93/94；前者已正确隔离地址，后者收紧恢复阶段禁用输入并移除 radio 标签位移。迁移/101 次保存/完整导出的原用例在双引擎各重复三次全部通过（6/6），没有删除或放宽旧断言。
- 最终 `$env:PLAYWRIGHT_PORT='3114'; npx playwright test`：**94/94 通过**（含 84 项原回归与 10 项新场景，Chromium + WebKit iPhone）。
- 最终 `npx playwright test --config=playwright.lan.config.ts`：**2/2 通过**。源码 Prettier、Git diff、文档本地链接及敏感文件/产物范围检查通过；新 SHA 的 CI 不预填成功，不持续等待。

性能抽样在 Desktop Chromium 与 WebKit iPhone 模拟器中执行：记录程序点击到下一 rAF 回调、浮层期 layout-shift（支持时）、阅读块高度差、实际 animation duration 和运行中动画数量。它不是 FPS、真实触控延迟或整站 CLS 测量，不声称提升百分比；录像和测试本身也有开销。WebKit 不支持的 observer 字段记为 null，不写成 0。

本轮最终记录（附带录像的无头环境单次样本，不是对照性能基准）：

| 环境/视口 | 点击到下一 rAF | 实际浮层时长 | 阅读块高度差 | 浮层期 layout-shift | 进入时/结束后运行中动画 |
| --- | --- | --- | --- | --- | --- |
| Chromium / 1280px | 11.2ms | 220ms | 0px | 0 | 1 / 0 |
| WebKit iPhone / 390px | 22.0ms | 220ms | 0px | 不支持（null） | 1 / 0 |

可复验：`$env:PLAYWRIGHT_PORT='3114'; npx playwright test tests/e2e/motion.spec.ts`。用例录像、DNS 截图和 `motion-performance.json` 写入被 Git 忽略的 `test-results/motion-*/`，不上传私人数据或产物。

仍需用户在真实 iPhone Safari 检查手感、系统 Reduce Motion、软硬键盘与 VoiceOver；Windows 桌面用键盘与鼠标检查快速反向操作。未进行真机 GPU/FPS 测量或新版本生产验收。
