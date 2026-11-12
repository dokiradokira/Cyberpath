# Motion 定向修整

2026-11-12；基线 `07a0bba`，沿用 `feature/motion-interaction-quality`。用户真机反馈是本轮起点；以下自动化为本地 Chromium / WebKit iPhone 模拟，不等同于真实 iPhone Safari 复验。

## 修复与范围

- **词汇退出闪烁**：旧 WAAPI 退出默认 `fill: none`，动画完成而 React 尚未卸载时，computed opacity 恢复为 1。两个引擎均已先复现。退出改为 `fill: forwards`，保持真实透明结束帧；WeakMap 保留动画所有权，重开或卸载会取消旧 effect。没有增加延时或遮罩掩盖闪烁。回归在同一 JS 任务里完成动画并读取结束帧，修复后 opacity 为 0；另检查连续切换词汇、滚动后关闭与焦点恢复。
- **可感知反馈**：共用入场距离 8→14px、缩放 .985→.965、卡片/导航图标抬升 3→5px、按压 .98→.965；不增加 120/220/320ms 时长。底栏指示条增加细描边，未缓存导航立即显示边框/短线和读屏状态。DNS 缓存标记、解释反馈短暂位移/缩放，反馈区保留边框空间避免切换撑开布局。没有新依赖、常驻动画或 DNS 逻辑变化。
- **栏目切换**：原五个主导航 `prefetch=false`，首次切换需点击后获取 RSC；改为仅五个主栏目预取。`useLinkStatus` 在真实 pending 时立即反馈，实际 `aria-current` 仍跟随已到达路由，不提前展示错误页面。标题另用 .8→1 opacity、4→0px、120ms 的轻切换，消除旧全透明入场的阅读等待。原课程链接等保持既有预取策略。
- **可访问性/数据**：保留立即 inert、Escape、焦点恢复、取消/快速重开机制；reduce 模式直接完成，无动态位移。课程、词汇内容、IndexedDB、备份格式和 package 版本未改。README 原用户修改不提交。

## 导航测量

生产构建，同一机器，每种引擎/网络条件各三次：首页硬加载，档案 ready、网络空闲后首次点击词汇栏目。另注入每个 RSC 150ms 延迟作受控对照；这是测试网络模拟，不是 UI 固定等待。原始 ResourceTiming/DOM 观察样本位于忽略的 `test-results`。小样本受无头浏览器/机器负载影响，不代表真实设备速度或 FPS。

| 点击到实际标题 DOM 提交中位数 | 07a0bba | 修复后 |
| ----------------------------- | ------: | -----: |
| Chromium，无额外延迟          |  67.2ms | 37.7ms |
| WebKit iPhone，无额外延迟     |   263ms |  244ms |
| Chromium，RSC +150ms          | 210.3ms | 61.2ms |
| WebKit iPhone，RSC +150ms     |   382ms |  199ms |

旧版每次点击后均发起 1 次 RSC；修复后 12 次样本均在点击前预取完成，点击后请求为 0。修复后 pending 反馈观察约 0.8–4ms。标题提交到 opacity ≥.75 的额外等待由旧版约数十至百毫秒，降至 0–1ms；标题仍有轻量运动。没有删数据或隐藏未完成工作。

两版切换时额外 IndexedDB open 均为 0，未发现 Provider 随栏目重复初始化。请求响应后到 DOM 提交仍含路由处理、JS 与 React 工作（WebKit 较明显），该指标不是独立 React Profiler 渲染时间，不宣称完全消除延迟。未缓存/预取未完成的路线另用受控请求门验证：立即 pending、保留旧页面，响应释放后再更新真实栏目，无 sleep 或假内容。

## 本轮验证

- `npm run typecheck`、`npm run lint`：通过。
- `npm test`：17 文件、127 项通过（新增退出 effect 生命周期回归）。
- `npm run build`：经正规单命令审批执行，通过；未修改系统权限或重新排查已知默认沙箱 EPERM。
- `$env:PLAYWRIGHT_PORT='3114'; npx playwright test tests/e2e/motion-refinement.spec.ts`：6/6，通过。新增导航分阶段采样、结束帧、反复开关/滚动/焦点和未缓存 pending 用例。原有 motion 用例继续覆盖快速重开与 reduced-motion。
- `$env:PLAYWRIGHT_PORT='3114'; npm run test:e2e`：最终 **100/100 通过**（5.9 分钟，Chromium + WebKit iPhone）；包含 F01/F02/F03、词汇、测验、迁移/配额/完整备份及 reduced-motion。
- `npm run test:lan`：2/2，通过。使用实际网络适配器来源；不能等同于 iPhone 真机。
- 新 SHA 的 CI 尚未触发；推送后只查询状态，不持续等待或沿用基线绿色结果。

最终浮层抽样：Chromium / WebKit 下一帧分别约 11.6 / 17ms，阅读区高度差均 0，入场完成后运行中动画均 0；Chromium 的局部 layout-shift 样本为 0，WebKit 不支持该指标、记录为 null。不是页面整体 CLS 或真机性能认证。前后导航样本保存在忽略的 `test-results/motion-refinement-comparison.json`。

完整回归首轮在 WebKit 导航用例出现文档替换期间的同源预取访问控制报错；该用例原先连续 `page.goto()`。已改为通过真实课程卡片/主导航访问，保留全部内容与零错误断言，随后重新执行。相关引擎行为可参见 [Playwright #43120](https://github.com/microsoft/playwright/issues/43120)；本地失败记录没有当作通过。

首轮为 98/100，另一失败的 trace 显示：收藏筛选在档案恢复前操作，档案恢复使列表与滚动位置变化，闪卡点击未生效。该用例现在先断言实际加载的“2 个收藏”，再操作；没有固定 sleep、删除测试或放宽断言。中间导航入口的 locator 曾同时命中正文返回链接与主导航，已限定到“主导航”。上述两用例及新增的退出期间快速重开，双引擎定向共 6/6 通过，再执行完整回归。

## 人工复验

在真实 iPhone Safari 连续打开/关闭不同词汇、滚动后收起、快速重开；确认无白闪及焦点/滚动跳变。比较首次及重复点击五个底栏、缓存未命中时即时反馈；观察卡片按压、DNS miss/hit/TTL/负缓存提示。系统 Reduce Motion 开关各检查一次。真机合成层闪烁、触感、VoiceOver 与生产部署未由本轮本地模拟认证；本轮不合并、不部署、不打标签。
