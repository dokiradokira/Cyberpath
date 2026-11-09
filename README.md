# CyberPath

面向零基础中文学习者的网络安全学习网站：中文界面、英文课程正文、中文术语辅助，同时学习 cybersecurity 和英语。

## 当前开发状态

| 项目          | 已核实状态                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 历史版本      | GitHub 远端标签有 `v2.0.0`、`v2.1.0`，未查到 GitHub Releases。V2.1/V2.1.1 界面及交互改进已实现；版本名称不等于正式发布 |
| package.json  | 保持 `2.1.2`，稳定性修复候选标识，没有修改为 V2.2                                                                      |
| V2.1.2        | F01、F02、F03 修复已提交，保留在当前功能分支                                                                           |
| V2.2-A        | 课程阅读与导航已实现；`b6e4bbd` 的 GitHub CI 必需步骤全部成功，属于开发阶段自动化验收，不代表正式发布或部署            |
| V2.2-B 及后续 | 尚未实施；下一步完善进度事件时间与测验复习                                                                             |

当前分支为 `feature/v2.2-learning-experience`。功能提交 `6b1e840`、CI 提交 `84f42ce`、交接提交 `b6e4bbd` 已同步至原有 GitHub 仓库。

2026-11-09 从 GitHub API 核实，[CI 运行 42617374964](https://github.com/dokiradokira/Cyberpath/actions/runs/42617374964) 对应完整 SHA `b6e4bbdbe582bf870a7d52ba7ce01a873741cdc2`，[逐步骤结果](https://github.com/dokiradokira/Cyberpath/actions/runs/42617374964/job/129160508324)显示：依赖安装、TypeScript、ESLint、单元测试、Next.js 生产构建、Chromium/WebKit 浏览器回归和 LAN 测试步骤均成功。LAN 用例无非回环 IPv4 网卡时可明确 skip，步骤成功不等于真实手机验收。

上述结果只对应该 SHA。后续提交（包括 README 更新）须检查自己的 CI，不能沿用旧提交的绿色结果。开发报告中此前“未推送/无法读取 CI”是历史记录，本次以实际 GitHub 查询为准。

## 已实现的功能

| 入口                           | 当前能力                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `/`                            | 学习概览、完成课程数、最近成绩、Continue Learning（继续学习）和课程推荐                            |
| `/courses`                     | 八课路线图，前三课可学，第 4–8 课仅预告                                                            |
| `/courses/network-foundations` | 网络设备、LAN/WAN、IP、路由器、端口、安全与 Windows 诊断                                           |
| `/courses/dns-tcp-web`         | DNS、缓存、TCP/UDP、握手、HTTP/HTTPS、TLS 与浏览器请求                                             |
| `/courses/ip-subnets-nat`      | IPv4/IPv6、私有地址、子网/CIDR、路由、网关与 NAT/PAT                                               |
| `/vocabulary`                  | 34 个中英术语；搜索、课程/收藏/掌握筛选、闪卡、释义测验和本地复习记录                              |
| `/labs`                        | TCP 握手、DNS 缓存与解析、IPv4 子网计算、双设备 PAT 映射四个浏览器模拟                             |
| `/progress`                    | 完成情况、最近/最高成绩、最近一次错题与解释、词汇记录、笔记、JSON 导入导出、确认重置及异常原文导出 |

每课 5 道单选题，全部作答后提交并显示解释，可重测。完成课程由用户明确标记，与打开课程、成绩分别记录。正文术语可点击，学习模式提供中文辅助，挑战模式按需展开。支持深浅主题持久化、桌面侧栏、移动底部导航、键盘焦点、跳至正文和减少动态效果。

基础 Web App Manifest、192/512 图标及 standalone 配置已存在；没有 Service Worker，不承诺离线可用。添加到主屏幕依赖 HTTPS 与浏览器支持，未完成真实 iPhone 验收。

### V2.1.2 稳定性修复

- **F01 导入校验**：严格检查枚举及重要字段，拒绝数组、对象等非法类型和不支持版本，失败不会部分替换档案。
- **F02 数据保护**：区分首次使用、读取失败、写入失败及冲突。读取失败保留原始记录、暂停自动保存并提供原文导出；确认后才可替换。存储不可用仍可阅读，写入失败显示提示。
- **F03 词汇队列**：修复筛选后当前题及导航状态，覆盖 2→1→0、收藏/掌握切换、重复答题和完成状态。

多标签页提供快照变化检测并暂停保存，不提供原子合并或云同步。详见 [V2.1.2 修复报告](docs/V2.1.2_FIX_REPORT.md)。

### V2.2-A 课程体验升级

- 三课共 20 个稳定章节 ID；桌面目录、手机折叠目录、当前章节高亮、上一/下一章节与跨课导航。
- 自动记录当前课程、章节和章节内比例；刷新恢复，首页继续学习定位到保存章节。打开课程不会自动标记完成。
- 英文正文宽度、行高、标题语言标记及手机排版优化；同段首次术语注释，重复术语仍可点击。命令代码块提供复制及失败提示。
- 保留存储键 `cyberpath.v1` 与 schema 1，兼容旧章节标题、数字锚点及没有新增可选字段的合法旧档案。
- 新课沿用统一 Lesson 渲染，使用稳定课程/章节 ID 和 `introducedIn` 内容修订号，无需复制整页。

恢复位置使用章节比例，不保证跨设备像素一致；约 250ms 节流可能尚未保存退出前最后一小段滚动。回滚前先导出档案：新程序能读旧档案，不代表旧程序能读新章节 ID。详见 [V2.2-A 实施报告](docs/V2.2_A_IMPLEMENTATION.md)。

## Windows 本地运行

使用 Node.js 24（与 CI 一致）及配套 npm。精确依赖由 `package-lock.json` 锁定，使用 `npm ci`；无需 API Key、数据库或环境变量。

```powershell
Set-Location D:\cyberpath
npm ci
npm run dev
```

打开 `http://localhost:3000`，Ctrl+C 停止服务。开发服务使用 Webpack、监听 `0.0.0.0`，产物为 `.next-dev`；生产产物为 `.next-v2`。若仓库在其他目录，请替换上述路径。

生产模式先停止读取旧构建目录的服务，然后依次执行；每一步失败即停止检查，不继续启动缺失的构建：

```powershell
npm run build
npm start
```

也可用 `npm run serve` 顺序构建并启动。不要让旧生产进程继续读取更新后的构建目录，以免出现脚本资源不匹配。

### 手机访问与数据备份

手机和电脑连接同一可信局域网。在 Windows 运行 `ipconfig` 找到活动网卡 IPv4，手机打开 `http://电脑IPv4:3000`，例如 `http://192.168.1.10:3000`。网络隔离、组织策略或防火墙可能阻止连接，项目不修改这些设置。局域网 HTTP 的剪贴板可能不可用，界面会提示手动复制。

档案仅保存在浏览器 localStorage；主机名、协议、端口、浏览器和设备不同均可能形成独立档案。沿用原网址，换地址前在学习进度页导出 JSON，再到新地址导入。清理浏览器数据仍会丢失本地记录，请定期备份。损坏或不兼容档案先导出原文，不要删除原 key 来修复。

### Windows 沙箱 EPERM

默认受限沙箱的生产构建曾在创建 `.next-v2` 子目录时出现 EPERM，最近记录为 `.next-v2/server/app/progress`；另有 DSH 在普通权限环境构建成功的历史记录。Ubuntu CI 对 `b6e4bbd` 的生产构建成功，**不代表本机默认沙箱已修复**。

不要关闭沙箱、Windows 安全机制、修改 ACL/完整性级别或以管理员身份运行来掩盖问题。记录完整错误，在正常获授权的普通开发环境或 CI 验证；构建失败不能把后续浏览器测试写成通过。参见 [构建记录](docs/V2.1.3_BUILD_REPORT.md)、[安全开发流程](docs/SECURE_DEVELOPMENT_WORKFLOW.md)和 [权限建议](docs/EPERM_PERMISSION_RECOMMENDATIONS.md)。

## 测试与 GitHub Actions

```powershell
npm run typecheck
npm run lint
npm test
& ./tests/Test-Agents.ps1
npm run build
# 仅在生产构建成功后继续
npx playwright install chromium webkit
npm run test:e2e
npm run test:lan
```

单元测试本地最近核验为 9 文件、87 测试通过。`test:e2e` 在端口 3100 自动启动生产服务，使用 Chromium 和 WebKit iPhone 模拟；`test:lan` 使用端口 3102 及实际网卡 IPv4，无适配器时明确 skip。测试不复用已有服务，先确认端口可用；失败查看 `test-results/`、`test-results-lan/` 中的 trace。WebKit 模拟不等于真实 iPhone。

[CI 工作流](.github/workflows/ci.yml)在任意分支 push、Pull Request 和 `workflow_dispatch` 时运行，无主分支过滤。Ubuntu 24.04 / Node 24 按以下顺序验证：

1. `npm ci`。
2. TypeScript、ESLint、全部单元测试。
3. Next.js 生产构建。
4. 安装 Playwright Chromium/WebKit 及 runner 系统依赖。
5. 浏览器回归和 LAN 来源回归。
6. 失败保存命令日志、HTML 报告及测试结果，保留 7 天。

权限仅 `contents: read`，无部署、发布、自动合并或写回仓库步骤。打开 [Actions](https://github.com/dokiradokira/Cyberpath/actions)，选择对应分支和**最新 SHA** 的 `CyberPath CI`，查看各步骤；失败下载 `failure-reports-*`。未触发、排队/运行中、失败和成功分别记录，不以旧 SHA 的结果代替最新提交验收。GitHub 手动触发入口是否可用取决于默认分支是否已有该工作流；功能分支 push 已实际触发成功。

## 项目结构

```text
.github/workflows/ci.yml              GitHub Actions 流水线
src/app/                              App Router 页面、样式、Manifest
src/components/layout/                全局导航、主题与模式入口
src/components/lessons/               教材、章节目录、测验及术语交互
src/components/labs/                  四个浏览器模拟
src/components/learning-provider.tsx  档案 Provider
src/content/lessons/                   三课教材、题库与课程数据
src/content/course-summaries.ts        八课路线说明
src/content/vocabulary.ts             中英词库
src/hooks/use-reading.ts              章节定位、滚动记录与恢复
src/lib/                              评分、子网、队列、存储与阅读辅助
src/types/                            Lesson / Progress 等类型
public/                               图标及启动恢复脚本
tests/                                Vitest 与 AGENTS 规则验证
tests/e2e/                            浏览器回归（含 reading.spec.ts）
tests/lan/                            实际网卡来源回归
docs/                                 审计、路线、修复与交接报告
```

技术栈为 Next.js App Router、React、严格 TypeScript、Tailwind CSS 4、Lucide React、Vitest 和 Playwright。教材与页面分离，存储只在客户端读取，SSR 不直接访问 window。实验为简化模型，不进行真实攻击；Windows 诊断命令仅作为可复制教材文本，网站不执行命令。

## 后续路线与边界

- **V2.2-A**：代码及现有自动化 CI 已验收；真实手机仍待人工确认，不等同于 V2.2 正式发布。
- **V2.2-B**：建议分离访问/测验/完成时间，完善最近成绩、错题和复习契约；不重做已实现的稳定章节 ID 与档案保护。
- **后续阶段**：三课教学示例和术语辅助深化、实验目标与反馈、移动端/无障碍及工程验收。具体任务与依赖参见 [审计](docs/V2.1_AUDIT.md)和 [V2.2 路线图](docs/V2.2_ROADMAP.md)；路线图是计划，不是实现清单。

课程 4–8 正文、真实账号、云数据库、云同步、AI 教师、付费服务、真实攻击靶场和离线缓存尚未实现。本轮没有公网部署、创建发布标签或合并主分支；CI 不会自动部署。真实手机、HTTPS 添加到主屏幕及生产托管环境仍需独立验证。
