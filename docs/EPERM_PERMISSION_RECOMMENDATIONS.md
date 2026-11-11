# CyberPath EPERM 权限评估与建议

日期：2026-11-09。基线：分支 `fix/v2.1.2-stability`，HEAD `e435314`，工作区干净。本文只做只读核查与隔离实验；**未修改源码、未 push、未部署、未降低完整性级别**。

相关文档：`docs/V2.1.3_BUILD_REPORT.md`（EPERM 根因首次定位）、`docs/SECURE_DEVELOPMENT_WORKFLOW.md`（长期流程）。

## 1. 结论（先看这里）

| 问题                 | 回答                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------ |
| 最安全的方案         | **方案三：CI 隔离构建与测试**。不改本机权限、可复现、可审计                               |
| 经过实际验证的方案   | 方案一**部分验证**：隔离副本可写、可提交；但构建仍失败。方案二**已被证伪为不足**          |
| 只是理论建议的方案   | 方案三（本地无法执行 GitHub Actions）、方案四（上游修复）                                  |
| 是否需要用户手动操作 | **是**：选择验证路径；如启用 CI 需 push 分支并添加工作流；可选上报 Harness 问题             |
| 残余安全风险         | 上一阶段遗留的根目录 ACL/完整性标签变更；Low 标签下新文件可被低完整性进程改写；`full-access` 例外需人工把关 |
| 长期交替维护         | 以文档与 CI 为唯一事实源，默认沙箱只做读/改/静态检查，构建测试交给 CI 或受控例外            |

**关键新发现：** 即使把整个项目复制到一个完全可写的 Low 目录，`next build` 仍然失败于 `spawn EPERM`。原因是沙箱禁止子进程使用管道（named pipe），而 Next/Vite/Playwright 都必须 spawn 带管道的子进程。**因此“换 worktree / 换目录 / 只给构建目录授权”都无法恢复本地构建**；上一阶段把 EPERM 归因于文件完整性级别只解释了“写文件”那一层，构建还有第二道沙箱限制。

## 2. 当前状态实测

### 2.1 Git 与进程

| 项         | 值                                                       |
| ---------- | -------------------------------------------------------- |
| 分支/提交  | `fix/v2.1.2-stability` / `e435314`（`4a79c43` 未被覆盖） |
| 工作区     | 干净                                                     |
| 命令令牌   | `Mandatory Label\Low Mandatory Level`（`S-1-16-4096`）   |
| 文件策略   | `workspace-write`                                        |

### 2.2 DACL 与完整性标签

| 路径                               | 完整性标签                    | 显式 ACE 数 |
| ---------------------------------- | ----------------------------- | ----------- |
| `D:\cyberpath`                     | Low，`(OI)(CI)(NW)`           | 3           |
| `src`、`docs`、`.git`、`.next-v2`  | 无标签（默认 Medium）         | 0           |
| `test-results`                     | Low，`(I)(OI)(CI)(NW)`        | 0           |
| `test-results-lan`                 | 无标签（Medium）              | 0           |
| `docs/V2.1.3_BUILD_REPORT.md`      | 无标签（Medium）              | 0           |

根目录 3 条显式 ACE：

| 主体                              | 权限                                             | 说明                         |
| --------------------------------- | ------------------------------------------------ | ---------------------------- |
| `Everyone`                        | `DeleteSubdirectoriesAndFiles`（拒绝，容器继承） | Harness 沙箱自身写入         |
| `S-1-4-92437018-731994447`        | `Write, Delete, DeleteChild, Synchronize`（继承）| Harness 沙箱写授权           |
| `dokidoki\14105`                  | `FullControl`（仅本目录）                        | 上一阶段 ACL 修复脚本写入    |

### 2.3 沙箱实际允许的操作（本机逐项验证）

| 操作                                             | 结果 / 错误                                      |
| ------------------------------------------------ | ------------------------------------------------ |
| 读取项目文件、`git status/log/list`              | 允许                                             |
| `npm run typecheck`                              | 通过（退出码 0）                                 |
| `npm run lint`                                   | 通过（退出码 0）                                 |
| 在根目录/新建 Low 目录创建文件                   | 允许                                             |
| 修改、删除既有 Low 文件                          | 允许                                             |
| 用 Harness 文件工具修改既有 Medium 源文件        | 允许（工具走 Harness 进程，不受 shell 令牌限制） |
| 用 shell 修改既有 Medium 文件（src/docs/.git）   | `EPERM`                                          |
| `git add` / `git commit`（主仓库）               | `Permission denied`（不能写 `.git`，Medium）     |
| `git worktree add`                               | `could not create leading directories of '.git/worktrees/...': Permission denied` |
| `git clone`（本地）                              | MSYS `sh.exe: couldn't create signal pipe, Win32 error 5` |
| 创建 junction / 重解析点                         | 沙箱拒绝（`file access denied`）                 |
| `child_process.execSync` 或 pipe 方式 `spawn`    | `EPERM -4048`                                    |
| `spawnSync(stdio: 'inherit')`                    | 成功                                             |
| `npm test`（Vitest）                             | `spawn EPERM`（Vite 加载配置阶段）               |
| Playwright 启动浏览器                            | `browserType.launch: spawn EPERM`                |
| `npm run build`（主仓库）                        | `EPERM open .next-v2\trace`，退出码 1            |
| `npm run build`（完全可写的 Low 副本）           | `Error: spawn EPERM`                             |
| 系统临时目录写入                                 | 允许                                             |

## 3. 上一阶段 `icacls /reset /T` 的持久影响

### 3.1 与基线差异

会话开始前的基线（上一阶段首次检查时记录）：根目录只有继承自 `D:\` 的 `Administrators`/`SYSTEM`/`Authenticated Users`/`Users` 条目，**没有任何显式 ACE，也没有完整性标签**；各子目录同样只有继承项。

当前差异：

1. 根目录新增 3 条显式 ACE（上表）——其中 `dokidoki\14105` 是上一阶段修复 `WRITE_OWNER` 时写入，`Everyone` 拒绝项与 `S-1-4-*` 是 Harness 自身写入。
2. 根目录被标记为 **Low 完整性**（`NW`）。
3. 10 个项目子目录执行过 `/reset /T`：ACL 被替换为“纯继承”。执行前抽查顶层目录均为 0 条显式 ACE，因此**没有删除任何已知自定义授权**；但**没有逐个文件的事前审计**，无法证明所有文件原本都没有自定义 ACE——这是残余不确定性。
4. `test-results` 因 Playwright 运行被重建，继承根目录标签，现为 Low。
5. 文件内容、所有者均未改变；`.git` 历史未被改写。

### 3.2 风险

- `S-1-4-*` 是**可继承**的写授权：根目录下新建的一切都会带上它。若该 SID 与当前登录会话绑定，风险随会话结束而降低；如果是稳定 SID，则相当于给该沙箱身份长期写权限。没有证据表明它可被其他用户利用。
- 根目录 Low 标签会让**新建于根目录**的文件成为 Low，Low 完整性进程（例如浏览器渲染进程）可以改写它们。**不要把密钥、令牌或真实用户数据放在项目根目录**。
- `Everyone` 的 `DeleteSubdirectoriesAndFiles` 拒绝项会阻止“仅凭父目录 DELETE_CHILD 删除子项”的路径；实际删除仍可通过子项自身的 DELETE 权限完成（已验证 Low 目录内删除正常）。个别旧脚本若依赖 DELETE_CHILD 语义可能受影响。
- `dokidoki\14105` 的 FullControl 仅作用于根目录本身，不向下继承，影响面最小。

### 3.3 是否需要恢复

**本次未做任何恢复，也不建议自动恢复。** 删除根目录新增授权或标签会立刻让 Harness 在默认沙箱下连根目录都无法写，且 `spawn EPERM` 仍然存在，构建依旧不可用——恢复只会增加风险，不解决问题。

如需人工审阅或恢复，请在你自己的终端、明确知情后执行；不要交给代理自动执行：

```powershell
# 只读审阅
icacls "D:\cyberpath"
(Get-Acl "D:\cyberpath").Access | Where-Object { -not $_.IsInherited }

# 若确需回退（会导致 Harness 无法写入，需管理员）
icacls "D:\cyberpath" /remove:g "dokidoki\14105"
# 删除 Low 标签（需 SeSecurityPrivilege）
icacls "D:\cyberpath" /setintegritylevel (OI)(CI)M
```

`/reset /T` 本身没有留下可逐条回滚的记录（诊断备份已在上一阶段清理）；由于当时未发现显式 ACE，实际可回滚的内容仅为上述根目录条目。

## 4. 四种方案评估

### 方案一：独立 Git worktree / 独立代码副本

**实测结果：部分可行，但不能解决构建。**

| 实验                                                       | 结果                                                       |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| `git worktree add --detach .workflow-wt HEAD`              | 失败：无法创建 `.git/worktrees/...`（`.git` 为 Medium）    |
| `git clone` 到新建 Low 目录                                | 失败：MSYS `sh` 无法创建信号管道（沙箱限制）               |
| `robocopy` 复制仓库（含 `.git`）到新建 Low 目录            | 成功；副本内所有文件为 Low                                 |
| 副本内 `git add` + `git commit`                            | **成功**（生成提交 `3a55e5f`，仅存在于已删除的副本中）     |
| 副本内 `npm run build`（复用主仓库 `node_modules`）        | **失败：`spawn EPERM`**                                    |

结论：副本可以编辑和提交，但**不能构建、不能跑测试**。把它当作“沙箱内可写草稿区”尚可，作为验证路径不成立；而且提交发生在副本里，合并回主仓库仍需人工操作，收益低。

### 方案二：只给可再生的构建产物目录授权

**实测结果：不可行且不充分。**

- 设置完整性标签需要 `SeSecurityPrivilege`：`icacls src /setintegritylevel "(OI)(CI)L"` 返回 `Access is denied`（退出码 5），必须管理员执行。
- 即使把 `.next-v2`、`test-results` 降为 Low 并授予写权限，构建仍会在 `spawn EPERM` 处失败——**文件权限不是唯一阻塞**。
- 该方案还需要修改 `next.config.ts` 或重建目录，属于用配置掩盖环境问题，违背“不修改业务代码掩盖权限问题”。

结论：**放弃**。它既需要提权，又解决不了构建。

### 方案三：GitHub Actions 或其他隔离构建环境

**本地未验证（无法在本机执行 GitHub Actions），但架构上最安全。**

- 不修改本机任何权限；构建、单测、Playwright 在一次性 Linux runner 上执行。
- 与本地沙箱限制完全解耦，Codex 与 DSH 都可以只提交代码、由 CI 给出权威结果。
- 前提：仓库推到远端、启用 Actions、添加工作流文件；首次必须在分支/PR 上试跑通过后才能作为门禁。
- 工作流模板见 `docs/SECURE_DEVELOPMENT_WORKFLOW.md` 第 8 节（**尚未在真实 runner 上验证**）。

结论：**推荐作为长期构建与测试的权威来源**；在启用前不能宣称已通过。

### 方案四：向 Harness 上游提交问题报告

**建议执行，且是根治路径。** 本机实测到 4 个可复现的上游问题：

1. 预存工作区未递归补齐写授权与完整性标签：根目录被标 Low，但既有子目录仍是 Medium，导致 `EPERM`。
2. 沙箱内禁止带管道的子进程：`execSync`、Vitest、Next build、Playwright 全部 `spawn EPERM`，使 `workspace-write` 无法完成任何真实构建/测试。
3. 禁止创建 junction/重解析点，无法复用主仓库 `node_modules`。
4. `git clone` 依赖的 MSYS `sh` 无法创建信号管道。

报告应附：环境（Windows、Node v24.21.0）、令牌 IL、`whoami /groups` 摘要、上述命令与错误、以及“在 `danger-full-access` 下同一命令成功”的对照。

## 5. 推荐做法（按场景）

| 场景                     | 推荐做法                                                                 |
| ------------------------ | ------------------------------------------------------------------------ |
| 阅读、分析、写文档       | 默认 `workspace-write`；Harness 文件工具可正常写                          |
| 修改源码                 | 默认 `workspace-write`；用文件工具改，改完必须由 CI 或受控会话验证        |
| 类型检查 / ESLint        | 默认沙箱内直接跑（已验证通过）                                           |
| 单元测试 / Playwright    | **不要在默认沙箱内跑**（`spawn EPERM`）；交给 CI                          |
| 生产构建                 | 同上；CI 或一次性受控验证                                                |
| Git 提交                 | 默认沙箱不能写 `.git`；由人提交，或经批准的一次性 `full-access` 提交      |
| 发布                     | 只在 CI 全绿、人工审阅后由人执行；代理不 push、不部署                     |

**明确不做：** 递归降低 `D:\cyberpath` 完整性级别；把 `full-access` 设为默认；关闭 Defender/防火墙；系统级 ACL 修改；为绕过限制改业务代码或构建配置。

## 6. 需要用户手动操作

1. **选择验证路径**（三选一）：
   - A．启用 CI（推荐）：把分支推到远端，添加第 8 节工作流，在 PR 上确认全绿后再合入。
   - B．受控例外：需要构建/测试时，明确批准一次 `full-access` 会话，并在报告中记录命令与结果；不要把该模式设为常态。
   - C．你本人在自己的终端运行 `npm run build` / `npm test` / `npm run test:e2e`，把结果贴回给代理记录。
2. **可选**：把第 4 节方案四整理成 Harness 反馈提交（本机报告已具备证据）。
3. **不要**执行第 3.3 节的回退命令，除非你确认要放弃默认沙箱写入能力。
4. 如启用 CI，确认仓库中无密钥；当前 `git ls-files` 未发现 `.env`/证书类文件，`.gitignore` 已忽略 `.env*`。

## 7. 残余风险

- 默认沙箱下代理**无法独立完成“修改→构建→测试”闭环**，只能完成“修改→静态检查”，验证依赖 CI 或人工放行，存在漏测风险。
- `full-access` 例外会暴露整个用户配置目录，必须一次一授权、限定命令、记录在案。
- 上一阶段 ACL 变更与 Low 标签仍在；虽然不影响功能，但属于安全姿态变化，需定期复核。
- Playwright 的 WebKit iPhone 只是模拟，不等于真机；局域网/公网/部署验收仍未做。
- 多标签页极端并发写入的竞态仍存在，与本次权限治理无关。

## 8. 实验记录（可复现）

```text
# 1) 默认沙箱构建（失败）
cd D:\cyberpath; npm run build
→ EPERM open .next-v2\trace，退出码 1

# 2) 新建 Low 目录写/改/删（成功）
→ 根目录与 test-results 内新建、修改、删除均成功

# 3) worktree（失败）
git worktree add --detach .workflow-wt HEAD
→ could not create leading directories of '.git/worktrees/-workflow-wt': Permission denied

# 4) clone（失败）
git clone --no-hardlinks . .workflow-lab\repo
→ sh.exe: couldn't create signal pipe, Win32 error 5

# 5) 复制仓库到 Low 目录并提交（成功）
robocopy（排除 node_modules/.next*/test-results）→ 全部 Low
git add/commit → 成功（副本内 3a55e5f）

# 6) 副本内构建（失败）
npm run build → Error: spawn EPERM

# 7) 子进程能力
node -e "execSync('cmd /c echo hi')" → EPERM -4048
node -e "spawnSync('cmd',[...],{stdio:'inherit'})" → 成功

# 8) 单元测试与浏览器
npm test → spawn EPERM（Vite 配置加载）
chromium.launch() → spawn EPERM

# 9) 静态检查
npm run typecheck → 0
npm run lint → 0
```

实验目录 `.workflow-lab` 已删除；主仓库工作区保持干净，未留下探针文件或提交。
