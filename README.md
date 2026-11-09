# CyberPath V2.1.1

面向零基础中文学习者的网络安全学习网站：**中文界面和操作引导、英文课程正文、中文术语注释、独立英语词汇学习**。

## V2.1.1 交互反馈

词汇列表的收藏按钮增加选中填充态与确认提示；手机顶部语言模式切换显示操作说明；子网预设提供计算反馈；单项词汇导航与初始实验重置明确禁用。状态标签、静态图标和示意图不再使用按钮式外观。操作反馈支持屏幕阅读器。

更新后须停止旧生产进程，再运行 `npm run serve`。不要让旧进程继续读取更新后的构建目录，否则可能出现脚本资源不匹配、页面显示但按钮无响应的问题。

## V2.1 界面调整

移除口号式文案、页首装饰标签和大标题标点。课程标题以英文为主，下一行提供中文注释；操作入口保留中文。侧栏、空状态和统计说明改为直接描述用途与状态，使用现有线性图标，不使用 emoji。

## V2 更新与手机启动

V2 修复整页依赖客户端初始化而卡住的问题：正文改为服务端可读，记录恢复不再阻塞页面；脚本加载失败会显示恢复提示。开发来源仅允许本机实际网卡地址和主机名；开发产物 `.next-dev` 与生产 `.next-v2` 分离，防止开发/构建互相覆盖资源。

手机日常使用建议运行生产服务：先在原服务窗口按 **Ctrl+C** 停止旧服务，再运行：

```powershell
cd D:\cyberpath
npm ci
npm run serve
```

`serve` 会构建并启动生产版。电脑打开 http://localhost:3000，手机与电脑在同一局域网时打开 `http://电脑的IPv4地址:3000`。请沿用原来的 IP、端口与浏览器，以读取同源旧进度；若换了网址，用 JSON 导入迁移。仅刷新手机页面无法替换仍在运行的旧生产服务。

主题现在同时应用于页面根节点和整个应用容器，回归测试直接断言首页、课程、实验、进度、词汇页的实际背景颜色，并检查导航和刷新后的保存状态。

新增 `/vocabulary`：34 个带中文释义、英文定义、例句与课程链接的术语；中英搜索、课程/收藏/掌握状态筛选、闪卡自评、释义测验、学习记录持久化。课程正文中的词语可点击，中文辅助模式默认显示注释，挑战模式按需展开。V1 记录和备份无需手动转换，新增词汇复习记录会一并导出。存储 schema 1 采用向后兼容的可选 `reviews` 字段，不更换原存储键。

## 环境和安装

本项目使用 Next.js App Router、React、TypeScript strict、Tailwind CSS 4、Lucide React、Vitest 和 Playwright。建议 Node.js 24 LTS 与 npm 11。依赖的精确解析版本见 `package-lock.json`，复现时使用 `npm ci`。

```powershell
cd D:\cyberpath
npm ci
npm run dev
```

Windows 浏览器打开 http://localhost:3000 。停止服务按 Ctrl+C。开发服务监听 `0.0.0.0`，无需管理员权限。项目不修改防火墙、安全设置，也不执行教材中的命令。

## 手机访问

电脑与手机连接相同可信局域网。在 Windows 自行运行 `ipconfig` 找到活动网卡的局域网 IPv4，例如 `192.168.1.10`，然后用 iPhone Safari 打开 `http://192.168.1.10:3000`。访客 Wi-Fi 隔离、组织网络策略或防火墙可能阻止连接；本项目不会更改这些设置。跨网络访问请使用下述 HTTPS 部署。

不同浏览器、主机名、端口与设备有独立 localStorage。用「学习进度」中的「导出 JSON / 导入 JSON」 转移记录；这不是自动云同步。剪贴板 API 在局域网 HTTP 下可能不可用，界面会提示手动复制。

## 功能

- `/`：真实学习进度、完成课程数、最近成绩、继续学习、活动记录和下一课推荐；初始成绩为空。
- `/courses`：8 课路线图；前三课完整可学，第 4–8 课仅预告，不能进入空白教材。
- `/courses/network-foundations`：网络、设备、LAN/WAN、IP、路由器、端口、安全与 Windows 诊断。
- `/courses/dns-tcp-web`：DNS、缓存、TCP/UDP、握手、HTTP/HTTPS、TLS、HTTP/3 与浏览器请求。
- `/courses/ip-subnets-nat`：IPv4/IPv6、RFC 1918、CIDR、路由、网关、NAT/PAT 与防火墙区别。
- `/vocabulary`：34 个中英术语，支持搜索、筛选、闪卡、释义测验和复习记录。
- `/labs`：可逐步切换 TCP 握手、DNS 缓存与解析过程、IPv4 子网计算、双设备 PAT 映射与返回流量。
- 每课 5 道单选题；全部作答后才能提交，显示逐题结果和解释；可重测，保存最近与最高分、最近一次错题。
- 课程完成由用户明确标记，独立于成绩；收藏词汇、学习/英语挑战模式、章节书签、自动保存笔记。
- `/progress`：完成情况、成绩、错题解释、词汇复习、笔记、JSON 导入导出、确认重置；可明确导入已有的 Lesson 1–2 完成与 Lesson 2 的 5/5 记录。
- 深浅主题持久化、桌面侧栏与移动底部导航、键盘焦点、跳至正文、减少动态效果支持。
- 基础 Web App Manifest、192/512 PNG 图标、standalone 配置。HTTPS 下可在兼容浏览器添加到主屏幕；iPhone 用 Safari 分享菜单中的“添加到主屏幕”。

## 测试和构建

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
npm run test:lan
powershell -ExecutionPolicy Bypass -File tests/Test-Agents.ps1
```

`test:e2e` 在独立端口 3100 自动启动生产服务（因此先 build），不复用用户的开发服务。`test:lan` 在独立端口 3102 启动生产服务，通过实际网卡 IPv4 地址模拟手机来源测试。测试覆盖 Chromium 和 WebKit iPhone 模拟、页面导航、测验和保存恢复、四个实验、导出/非法导入/重置，以及 375、390、768、1024、1440 宽度。WebKit 模拟不等于真机 Safari 验收。失败时查看 `test-results` 或 `test-results-lan` 中的 trace。

生产运行：

```powershell
npm run build
npm start
```

实际执行结果和限制见 [TESTING.md](TESTING.md)。

## 公网 HTTPS 部署

可将此 GitHub 仓库导入支持 Next.js 的托管平台，例如 Vercel。选择仓库根目录，框架 Next.js，安装命令 `npm ci`，构建命令 `npm run build`，Node.js 24，无需环境变量或数据库。部署成功后使用平台提供的 HTTPS 地址；同一网址可在电脑和手机访问。域名设置后由托管平台管理 HTTPS。每次推送到部署分支可触发新部署。

也可在已有 Node.js 服务器执行 `npm ci && npm run build && npm start`，由管理员在前面配置 HTTPS 反向代理和进程守护。仓库本身没有配置或创建任何收费服务，没有实际部署到外部托管平台。

参考 [Next.js 官方部署说明](https://nextjs.org/docs/app/getting-started/deploying)。这是标准 Next.js 应用，没有绑定特定云服务。

## 结构与决策

```text
src/app/                  App Router 页面、全局样式、Manifest
src/components/layout/    全局导航与主题/模式入口
src/components/lessons/   教材渲染、测验与词汇交互
src/components/labs/      四个浏览器模拟
src/content/lessons/      三课教材、题库和五课预告元数据
src/lib/                  子网计算、测验评分、存储与导入校验
src/types/                Lesson、Question、Progress 等严格类型
public/                   PWA PNG 图标
 tests/                   单元测试、浏览器测试与仓库规则验证
```

教材与页面逻辑分离，新增完整课程只需遵循 Lesson 类型填充内容。Progress schema 为版本 1，键为 `cyberpath.v1`；导入只重建已知课程和字段，验证枚举、分数、错题、日期、笔记长度和最大文件大小，拒绝不兼容版本。文本一律通过 React 转义渲染。未来迁移云存储可以复用独立的数据模型和验证入口。

存储只在客户端挂载后读取，避免 SSR 访问 window；损坏或不可用的存储会显示提示并回退。没有跨标签页自动合并，避免假装提供同步语义。子网算法使用 0–2^32 范围内精确整数算术，不依赖 JavaScript 有符号 32 位位运算。

ESLint 使用 ESLint 10、TypeScript、React Hooks 和 Next 官方插件的 flat config，避免旧版汇总配置中不兼容 ESLint 10 的插件。minimatch 覆盖到已修复的 11.0.5 系列，安装后审计确认。构建使用 Next 支持的 Webpack，并限制构建工作进程，以适应当前 Windows 执行环境；不禁用沙箱或类型检查。

## 内容依据

- [RFC 1918：私有 IPv4 地址](https://www.rfc-editor.org/rfc/rfc1918)
- [RFC 3021：/31 点对点链路](https://www.rfc-editor.org/info/rfc3021/)
- [RFC 5737：文档保留 IPv4 地址](https://www.rfc-editor.org/info/rfc5737/)
- [RFC 9114：HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html)
- [RFC 9293：TCP](https://www.rfc-editor.org/rfc/rfc9293)

所有实验为简化模型，不发送网络请求；示例外部 IPv4 地址为文档保留范围。命令只是带复制与结果解释的教材文本，没有后端命令执行接口。

## 当前版本边界

未实现课程 4–8 正文、真实账号、云同步、云数据库、AI、支付、真实攻击靶场或任意命令执行，符合本期范围。不含 Service Worker，不声称离线可用。浏览器数据会随清理而丢失，请定期导出备份。未在真实 iPhone 上测试，也未代替用户部署到公网；部署步骤已提供。
