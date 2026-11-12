# DNS 样板整合与阅读体验修整

2026-11-12，提交前 HEAD `f1747ed`，分支 `feature/curriculum-3-dns-sample`。

## 实际基线与范围

本轮 fetch 后发现 `origin/master = 13cc786`，已通过 PR #3 包含 DNS 样板，master 与本轮起点的源码无差异。仍在已有 DNS 分支增量修复，没有再次合并 master/规划分支。README 原有表格空格修改保留、排除提交；package 仍为 2.2.0。不改学习历史 schema、不新增课程、不部署或打标签。

## 词汇覆盖

从 36 条扩展为 91 条共享词汇（新增 55 条，旧 ID 原样保留），统一使用原收藏、闪卡、掌握状态、筛选和备份机制。`dns-vocabulary.ts` 只是共享 `wordEntries` 的内容分文件，不是第二套词典或存储。

- 正文：query（查询）、A record（A 记录）、zone（DNS 管理区）、referral（转介指引）、SOA（起始授权记录）、NODATA、SERVFAIL、timeout（超时）、reachability（网络可达性）。
- 先修：client、IP address、URL、host、browser、operating system。
- Technical/English Goals：cache miss（缓存未命中）、remaining（剩余的）、resolve（解析）、expire（到期）、counterexample（反例）、evidence（证据）。
- 实验路径与模型局限：cache hit、upstream、delegation、SOA、CNAME、DNSSEC。
- 练习题干/反馈：unexpired（尚未到期）、invalidate（使缓存失效）、transport（传输层通信）等。选项保留英文原句，避免选项按钮内嵌套词汇按钮；反馈提供解释与术语操作。

支持词形/短语别名，如 cached/caching → `cache`，expired/expiry → `expire`，prediction → `predict`，negative DNS response → `negative answer`，time to live → `ttl`。最长短语优先，不匹配 hostile 中的 host。普通小写 `a record` 按泛指资源记录处理，避免误注为 IPv4 的 `A record`。

既有 `private` 释义补充个人/群体私有的一般含义，保留私有 IP 的网络语境与原 ID，避免课程中 private logs 被误解释为只能描述私网。首页实验入口也移除了过时的固定“4 个”计数。

Learning Mode 显示每段首次词汇的中文辅助；Challenge Mode 默认隐藏，点开后显示。浮层包含当前词所在原句、准确中文、英文定义、例句与收藏；使用原稳定 ID，短语 ID 可完整导入导出。仍是关键术语辅助，不是全文翻译，也不声称覆盖所有英语表达。

术语核对参考 [RFC 9499 DNS Terminology](https://www.rfc-editor.org/info/rfc9499/)；DNSSEC 的数据认证及非保密性边界参考 [RFC 4033](https://www.rfc-editor.org/info/rfc4033/)。实验 TTL/负缓存依据见 [原样板记录](CURRICULUM_3_DNS_SAMPLE.md)。

## 实验与阅读整合

`DnsCacheLab` 是课程和 `/labs#lab-dns-cache` 的同一组件，继续调用同一个 `src/lib/dns-workshop.ts` 状态机。实验中心新增名称、目标、介绍、开始入口及课程链接，旧 tcp/dns/subnet/nat ID 与模拟器保留。预测、修改权威地址、推进时间、TTL 到期和 NXDOMAIN 负缓存均保留；两处独立页面状态不跨导航保存。

先修/Technical/English Goals 改为三个独立区块，移入阅读栏，去除 DNS 页重复目标卡片。作者在 DNS 原七章及新增五章加入语义段落分隔，渲染器共用段落规则；章节 ID 和书签不变。统一系统字体栈，阅读正文 17px/1.85 行高、最大约 66ch、明确标题和段落间距，手机仍保持 17px。

词汇解释使用非模态浮层，不向文章插入大块内容；支持 Escape、关闭后焦点恢复、外部点击/焦点移出关闭。手机浮层避开 70px 底部导航及安全区，桌面避开侧栏，保留背景导航可用。原文语境按实际出现位置提取，重复词可得到不同原句。实验反馈预留空间，控制按钮触控高度至少 44px，SVG 自适应。按钮、导航、SVG 仅使用短颜色/透明度过渡，尊重 reduced-motion；不引入动画依赖。

版本标签通过 `src/lib/version.ts` 读取 package.json，不再硬编码 V2.1.1，也未修改正式版本号。

参考站 https://chinaschool.pub.atoms.world/ 未返回可读内容，未重复尝试或复制其代码、品牌与布局。

## 验证

先增加词形/覆盖回归，缺少术语模块时验证失败，再实现。新增短语收藏和旧词汇记录备份往返测试；新增浏览器测试覆盖双入口状态转移、目标/反馈注释、语境、收藏后复习、挑战模式持久化、阅读高度不跳变、375/768/1280 布局、reduced-motion 和真实版本显示。

- typecheck / ESLint：通过。
- unit：15 文件、117 项通过。
- 默认 production build：`EPERM: operation not permitted, mkdir 'D:\cyberpath\.next-v2\server\app\progress'`。未调整安全设置；最终 `npm run build` 经正规单命令审批通过（含 TypeScript，无 JSON 导入警告）。
- 首轮定向：新体验/既有词汇 20 项通过，旧 DNS 2 项因按钮序号定位失效。已改为选项完整名称，保留错误反馈与正确回答断言。
- 此后定向 8/8、LAN 2/2 通过；首轮完整回归 83/84，发现 iPhone WebKit 浮层遮挡底部词汇导航这一实际缺陷。已修复浮层边界并增加导航不遮挡和键盘焦点移出关闭断言，保留旧跨页点击用例不变，重新执行完整回归。
- 浏览器测试初次启动另遇 ESM JSON import 要求，测试改为 fs 读取 package.json；产品版本模块采用默认 JSON import，生产构建无该警告。
- 已查看新测试生成的 375px 与 1280px 截图，确认浮层与正文排版；WebKit 是模拟，不代表真实手机。
- 导航修复后定向 10/10、`npx playwright test` 完整 84/84、`npx playwright test --config=playwright.lan.config.ts` 2/2 通过。末尾仅同步首页固定计数文案和 private 释义，随后再跑 117 单元、lint、构建及相关定向浏览器 10/10、LAN 2/2，全部通过。未为两处文字微调再次重复全量浏览器，验证范围据此区分。远端 CI 不预填通过、不持续等待。

主要文件：共享词汇/匹配器、AnnotatedText、DNS 组件、LessonView、labs 页面、全局阅读样式、Shell/version，以及新增 unit/e2e 和旧 DNS 定位修正。无 IndexedDB、storage、迁移、测验历史逻辑改动。

人工仍需检查真实 iPhone Safari 浮层与键盘、中文辅助密度和长文阅读节奏；生产环境和屏幕阅读器专项尚未验收。本轮不合并、不部署，不因旧版本真机反馈宣称新改动已验收。
