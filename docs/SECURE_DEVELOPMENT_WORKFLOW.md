# CyberPath 安全开发工作流

适用对象：在 Codex 与 DeepSeek Harness（DSH）之间交替维护本项目的开发者与代理。
版本：2026-11-09。基线提交 `e435314`（分支 `fix/v2.1.2-stability`）。

配套文档：

- `docs/EPERM_PERMISSION_RECOMMENDATIONS.md`：权限实测、方案评估与结论
- `docs/V2.1.3_BUILD_REPORT.md`：EPERM 根因与构建/测试记录
- `docs/V2.1_AUDIT.md`、`docs/V2.2_ROADMAP.md`、`docs/V2.1.2_FIX_REPORT.md`

## 1. 目标与红线

目标：让任何一个新接手的代理，**不读完整历史对话**也能安全地继续开发，并且不靠削弱系统安全来“修好”构建。

红线（任何工具、任何模式都不得违反）：

1. 不递归降低 `D:\cyberpath` 的完整性级别，不系统级修改 ACL。
2. 不把 `full-access` 当作默认工作模式。
3. 不关闭 Defender、防火墙或其他安全机制。
4. 不重写 Git 历史、不 force-push、不覆盖既有提交。
5. 不用改业务代码、改构建配置、加写入重试等方式掩盖权限问题。
6. 不擅自提权；需要管理员权限时停止并请求人工操作。
7. 不 push、不部署、不打标签，除非人类明确要求。

## 2. 角色

| 角色                | 职责                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| 人类负责人          | 决定验证路径、批准例外、执行 push/部署/发布、审阅 ACL 与安全姿态      |
| 开发代理（Codex/DSH）| 读代码、改代码、写测试与文档、跑静态检查；构建/测试结果以 CI 为准      |
| CI（启用后）        | 唯一权威的构建与自动化测试执行者                                     |

## 3. 会话启动检查（30 秒）

每个新会话按顺序执行，结果写入本轮报告的“环境”一节：

```powershell
cd D:\cyberpath
git status --porcelain=v1 -b
git log --oneline -5
whoami /groups | Select-String -Pattern 'Mandatory Label'
```

判定当前模式：

- `Low Mandatory Level` → 默认受限沙箱：只能读、改文件（用文件工具）、`typecheck`、`lint`、只读 Git。**不能 build/test/commit**。
- `Medium/High`（经批准的例外）→ 可构建与测试，但必须记录原因与命令，结束即恢复默认。

启动时还要读：`AGENTS.md`、本文件、最新一份 `docs/V2.1.*_FIX_REPORT.md`/`V2.1.3_BUILD_REPORT.md`，以及 `docs/V2.2_ROADMAP.md` 的当前阶段。

## 4. 能力矩阵（默认沙箱，已实测）

| 操作                          | 默认沙箱 | 说明                                             |
| ----------------------------- | -------- | ------------------------------------------------ |
| 读文件 / `git status` / `git log` | ✅   |                                                  |
| Harness 文件工具改源码        | ✅       | 工具进程不受 Low shell 限制                      |
| shell 改既有 Medium 文件      | ❌ EPERM | 含 `src`、`docs`、`.git`、`.next-v2`             |
| `npm run typecheck`           | ✅       |                                                  |
| `npm run lint`                | ✅       |                                                  |
| `npm test`                    | ❌       | `spawn EPERM`（Vite 配置加载）                   |
| `npm run build`               | ❌       | 文件 EPERM 或 `spawn EPERM`                      |
| `npm run test:e2e`            | ❌       | 浏览器启动 `spawn EPERM`                         |
| `git add/commit`              | ❌       | 不能写 `.git`                                    |
| `git worktree` / `git clone`  | ❌       | 前者写 `.git` 失败，后者 sh 管道失败             |

细节与证据见 `EPERM_PERMISSION_RECOMMENDATIONS.md` 第 2 节。

## 5. 分支与提交规范

- `master`：稳定线，只接受经审阅的合并；不直接提交。
- `fix/vX.Y.Z-<topic>`：修复分支（当前 `fix/v2.1.2-stability`）。
- `docs/<topic>`：纯文档变更。
- `feat/...`、`test/...`：按需；一个分支只做一件事。
- 禁止 force-push、rebase 已推送提交、改写 `4a79c43` 等既有历史。

提交信息：`type: 简述`，type ∈ `feat|fix|test|docs|chore|style|refactor`。正文写“为什么”，并关联对应 `docs/*_REPORT.md`。示例：

```text
fix: protect local learning data and stabilize review queue
docs: record V2.1.3 build verification and EPERM root cause
```

提交粒度：一个逻辑变更一个提交；业务改动、测试、文档可以分开提交，但同一提交必须自洽（代码 + 对应测试）。

## 6. 标准变更循环

1. **读状态**：`git status`、最近报告、相关源码与测试。
2. **复现/定义失败**：先写会失败的测试或给出可复现命令；不允许“先改再找理由”。
3. **最小修改**：只改与问题相关的文件；保留既有行为与数据兼容（schema 1、旧备份可读）。
4. **静态检查**：默认沙箱内跑 `npm run typecheck` 与 `npm run lint`。
5. **验证**：按第 7 节走 CI 或受控例外；**单元测试、浏览器测试、生产构建三者分别记录**，不得互相代替。
6. **文档**：新增/更新 `docs/` 报告，写清改了什么、为什么、哪些没验证、如何回滚。
7. **提交**：人工提交，或经批准的一次性 `full-access`；不 push。
8. **交接**：在报告中补“当前状态 / 下一步 / 阻塞项”。

## 7. 构建与测试策略

### 7.1 首选：CI

- 任何需要“构建通过 / 测试通过”的结论，以 CI 结果为准。
- 本地默认沙箱只保证：能改、能静态检查、能提交。
- CI 未启用前，不得声称“构建已通过”作为发布依据。

### 7.2 备选：受控例外（一次一授权）

仅当 CI 不可用且必须本地验证时：

1. 向人类说明：要跑什么命令、为什么默认沙箱不行、风险是什么。
2. 获得一次明确批准后，用 `full-access` 执行**限定命令**。
3. 在报告中记录：命令、退出码、关键输出、时间、批准人。
4. 结束后回到默认模式；不作为后续默认。

### 7.3 禁止

- 为了本地构建去降低项目完整性级别（递归或按目录）。
- 为了本地构建关闭 Defender/防火墙。
- 把 `.next-v2`、`node_modules` 等目录的权限“顺手”改掉而不记录。

## 8. CI 工作流模板（**尚未在真实 runner 验证**）

启用步骤：推到远端 → 新增 `.github/workflows/ci.yml` → 在分支/PR 上试跑 → 全绿后再作为门禁。首次运行前不要宣称 CI 可用。

```yaml
name: ci

on:
  pull_request:
  push:
    branches: [master]

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
      - run: npx playwright install --with-deps chromium webkit
      - run: npm run test:e2e
      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results
          path: test-results/
          if-no-files-found: ignore
```

说明：

- `npm run build` 必须先于 `test:e2e`，因为 `playwright.config.ts` 的 `webServer` 用 `next start` 读取 `.next-v2`。
- 不把任何密钥写入工作流；项目当前无需部署密钥。
- WebKit 在 Linux runner 上可运行，但不等于真机 Safari。

## 9. 代码审查

审查者（人类或另一代理）按顺序检查：

1. `git diff` 是否只包含声明范围内的文件。
2. 是否有对应测试；测试是否真的会在修复前失败。
3. 是否改动 schema/key、导入校验、存储保护等高风险路径。
4. 是否引入依赖、网络请求、遥测或密钥。
5. 文档是否如实区分“已验证/未验证”。
6. 是否触碰安全红线（第 1 节）。

代理之间互审时，审查结论写入报告，不写在聊天里就算完成。

## 10. 发布与回滚

发布前置（全部满足才可）：

- CI 全绿（typecheck、lint、单测、build、e2e）。
- 真机 Safari/Chrome 至少各一次核心流程；公网 HTTPS 与部署环境已确认。
- `docs/` 有对应版本报告；`package.json` 版本与 CHANGELOG 一致。
- 人类明确批准 push/tag/deploy。

回滚：

- 代码：`git revert <commit>`（不要 reset 已推送历史）。
- 数据：schema/key 未变时可回退代码；回退前提醒用户导出 `cyberpath-progress.json` 与原始数据，旧版本会重新暴露损坏数据覆盖风险。
- 部署：保留上一版本产物与启动命令；回滚后重启旧服务，避免旧进程读取新资产。

## 11. Codex 与 DSH 交替维护协议

### 11.1 交接的唯一事实源

1. `AGENTS.md`（仓库规则）
2. 本文件（流程）
3. 最新 `docs/*_REPORT.md`（当前状态、已验证/未验证、阻塞项）
4. `docs/V2.2_ROADMAP.md`（阶段目标）

聊天记录不是事实源；任何决定必须落盘到 `docs/`。

### 11.2 每轮结束时必须写入的“交接块”

在最新报告末尾追加：

```markdown
## 交接状态（YYYY-MM-DD，工具：Codex/DSH）

- 分支/提交：
- 本轮改动：
- 已验证：typecheck / lint / unit / e2e / build（分别写实际结果）
- 未验证及原因：
- 环境限制/权限状态：
- 下一步（最多 3 条）：
- 阻塞项与需要人类做的事：
```

### 11.3 两个工具的差异处理

- Codex 当前配置为 `sandbox_mode = "danger-full-access"`（见 `~/.codex/config.toml`）。为与安全基线一致，建议人类将其改为 `workspace-write`；在改动前，Codex 会话必须自我约束，不把完全访问当默认。
- DSH 默认 `workspace-write`，但受 Low 令牌与管道限制。两者都**不要**通过降低权限/关闭安全机制来“对齐”。
- 任一工具发现环境阻塞，按“停止 → 记录 → 请求人工决策”处理，不擅自绕过。

### 11.4 新代理接手清单

1. 跑第 3 节命令，确认模式与提交。
2. 读最新报告与 `V2.2_ROADMAP.md` 当前阶段。
3. 复跑 `npm run typecheck`、`npm run lint`（默认沙箱可用）。
4. 需要构建/测试时，先确认 CI 是否可用；不可用则请求受控例外。
5. 改动前先写失败测试；改动后更新报告并提交（不 push）。

## 12. 检查清单

开始时：

- [ ] `git status` 干净或已知改动已说明
- [ ] 确认模式（Low/Medium）与可用命令
- [ ] 读过最新报告与路线图
- [ ] 明确本轮范围（不做范围外功能）

提交前：

- [ ] typecheck、lint 通过
- [ ] 新增/更新测试，且能证明修复前失败
- [ ] 报告区分 unit/e2e/build 的实际结果
- [ ] 未改 schema/key，或已说明迁移与回滚
- [ ] 未 push、未部署

发布前：

- [ ] CI 全绿
- [ ] 真机与部署环境确认
- [ ] 版本/CHANGELOG/报告一致
- [ ] 人类批准
- [ ] 回滚方案已写明
