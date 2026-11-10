# CyberPath Curriculum 3.0 迁移计划

- 版本：3.0-planning
- 日期：2026-11-10
- 基线分支：`planning/curriculum-3.0`，基于 `origin/feature/v2.2-learning-experience`（`e9716a0`）
- 配套：[课程体系总纲](CURRICULUM_3_0.md)、[知识依赖](KNOWLEDGE_DEPENDENCIES.md)、[职业路线](CAREER_TRACKS.md)、[项目式学习](PROJECT_BASED_LEARNING.md)

> 本文件是**计划**。本轮没有修改课程注册表、存储结构、应用源码、README、AGENTS.md、PROJECT_STATUS.md 或 AGENT_HANDOFF.md。文中出现的文件名是建议路径，不代表已创建。

## 1. 现状基线（2026-11-10，提交 `e9716a0`）

### 1.1 内容

| 项目 | 事实 |
| --- | --- |
| 可学课程 | 3 节：`network-foundations`、`dns-tcp-web`、`ip-subnets-nat` |
| 章节 | 20 个稳定 section ID |
| 测验 | 15 题（每课 5 题），题目 ID `n1–n5`、`w1–w5`、`i1–i5` |
| 词汇 | 34 个中英术语 |
| 实验 | 4 个浏览器模拟：`tcp`、`dns`、`subnet`、`nat` |
| 预告课程 | 5 个：`security-fundamentals`、`web-security`、`identity-access`、`defensive-tools`、`security-practice`（`available: false`） |
| 内容修订号 | `Lesson.introducedIn`，缺省为 1；`contentVersion` 取可用课程的最大值 |

### 1.2 存储与数据

| 项目 | 事实 |
| --- | --- |
| 存储键 | `cyberpath.v1`（`src/lib/storage.ts`） |
| schema | `version: 1`，未变更 |
| 课程记录 | `Progress.lessons[lessonId]`：完成、最近/最高分、错题、章节位置、时间字段 |
| 词汇复习 | `Progress.reviews[word]`：known/attempts/correct |
| 学习历史 | `Progress.study.history`（V2.2-C 起保留完整测验历史） |
| 导入保护 | F01 严格校验、F02 原始数据保护、F03 队列可继续 |
| 多标签 | 快照变化检测，暂停保存，不提供原子合并 |

### 1.3 测试与流水线

- 单元测试：README 记录 9 个文件、87 个用例通过（本地历史结果）。
- 浏览器回归：Chromium + WebKit iPhone 模拟；LAN 用例在无非回环网卡时明确 skip。
- CI：`.github/workflows/ci.yml`，任意分支 push 触发，权限 `contents: read`，无部署步骤。
- 本轮为纯文档变更，未运行构建或浏览器测试；不以历史绿色结果代表本次提交。

## 2. 兼容原则

1. **现有课程 ID 永久保留**：`network-foundations`、`dns-tcp-web`、`ip-subnets-nat` 不改名、不删除。
2. **题目与章节 ID 永久保留**：`n1–n5`、`w1–w5`、`i1–i5` 与 20 个 section ID 不复用。
3. **存储键不变**：继续使用 `cyberpath.v1`；不新建 key，不做破坏性迁移。
4. **schema 1 保持**：优先新增可选字段；确需升版时提供 `1 → 2` 迁移器与原文备份。
5. **旧档案可读**：新版本必须能读旧备份；旧版本不必能读新课程（已知限制，需在发布说明中写明）。
6. **增量内容修订**：新课程用 `introducedIn` 标记；旧备份缺少新课记录属于合法情况。
7. **F01/F02/F03 不回退**：任何改动都不得放宽导入校验、不得自动覆盖原文、不得让复习队列卡死。
8. **课程记录与能力证据分离**：完成课程不自动升级；升级需要项目证据。

## 3. 目标架构（建议）

### 3.1 内容分层

```
src/content/
  curriculum/                 # 新增：体系元数据，不含正文
    domains.ts                # D01–D13
    tracks.ts                 # T-*
    modules.ts                # MOD-*、难度、实验、项目、验证
    prerequisites.ts          # 硬边/软边
    index.ts                  # 聚合与查询
  lessons/
    index.ts                  # 现有课程数组（保持兼容）
    <domain>/<lesson>.ts      # 未来按领域拆分正文
  vocabulary.ts               # 词库（按课程增量扩展）
```

### 3.2 类型建议

```ts
type CurriculumDomain = {
  id: string;            // D05
  code: string;          // NET
  title: string;         // Computer Networking
  tracks: string[];      // T-NET-01 …
};

type CurriculumModule = {
  id: string;            // MOD-NET-04
  track: string;
  title: string;
  level: 0 | 1 | 2 | 3 | 4 | 5;
  prerequisiteIds: string[];
  advisoryIds?: string[];
  labIds: string[];
  projectIds: string[];
  lessonIds: string[];
  assessment: string;
};

type LessonLink = {
  curriculumId: string;  // L-NET-0401
  contentId: string;     // 应用内课程 ID
};
```

约束：

- 元数据是**只读数据**，不参与 localStorage 结构。
- 现有 `Lesson` 类型不删字段；新增字段一律可选。
- 课程 ID 与 `L-*` 的映射独立存放，避免把展示编号写进存储。

### 3.3 运行时影响

- 元数据只用于路线图、先修提示、能力面板；不改变现有阅读、测验、复习、导入导出行为。
- 首页与课程页的渲染路径保持现状；新增页面在 Phase 4 之后再评估。

## 4. 兼容映射

### 4.1 现有课程 → 新体系

| 现有 contentId | 新模块 | 新课程（候选） | 处理 |
| --- | --- | --- | --- |
| `network-foundations` | `MOD-NET-01` | `L-NET-0101`–`L-NET-0103` | 保留原 ID 与 6 个 section；作为模块主课程 |
| `dns-tcp-web` | `MOD-NET-03` | `L-NET-0301`–`L-NET-0304` | 保留原 ID 与 7 个 section |
| `ip-subnets-nat` | `MOD-NET-02` | `L-NET-0201`–`L-NET-0203` | 保留原 ID 与 7 个 section |
| `security-fundamentals` | `MOD-SEC-01` | — | 保留为预告/别名 |
| `web-security` | `MOD-SEC-05` | — | 保留为预告/别名 |
| `identity-access` | `MOD-SEC-03` | — | 保留为预告/别名 |
| `defensive-tools` | `MOD-SEC-07` | — | 保留为预告/别名 |
| `security-practice` | `MOD-SEC-08` | — | 保留为预告/别名（综合演练） |

映射规则：

- 一个现有课程可以映射到一个模块；一个模块可以包含多个未来课程。
- 现有课程的 `number` 不因新体系改变；新课程使用后续编号。
- 现有 4 个实验 ID（`tcp`、`dns`、`subnet`、`nat`）保留，新增实验使用 `LAB-*` 命名并在元数据中映射到旧的 lab id。

### 4.2 词汇兼容

- 34 个现有词条不删、不改拼写。
- 新词条按「课程首次出现」加入；同词多义时保留原词条并增加释义版本，不覆盖旧释义。
- 复习记录以 `word` 为键，因此不得重命名现有词条；如需更名，必须提供别名映射并保留旧键的可读性。

### 4.3 进度兼容

- `Progress.lessons` 以 `lessonId` 为键。新增课程只在发布时加入；旧档案缺失新键是合法的。
- `contentVersion` 随 `introducedIn` 递增；导入时允许「旧版本缺少更新课程」。
- 不允许因为新增模块而重置 `reviews`、`notes`、`study.history`。

## 5. 分阶段实施计划

### Phase 0 — 规划（本轮，已完成）

| 项目 | 内容 |
| --- | --- |
| 范围 | 5 份规划文档，零代码改动 |
| 交付 | `CURRICULUM_3_0.md`、`KNOWLEDGE_DEPENDENCIES.md`、`CAREER_TRACKS.md`、`PROJECT_BASED_LEARNING.md`、本文件 |
| 验收 | 文档互相引用一致；86 模块 / 294 课 / 0 环；现有 ID 映射完整 |
| 回滚 | 删除文档即可，无运行时影响 |

### Phase 1 — V2.3-A 课程元数据层（不改 UI）

| 项目 | 内容 |
| --- | --- |
| 目标 | 把领域、Track、模块、先修关系变成可校验数据 |
| 建议文件 | `src/content/curriculum/*.ts`、`tests/curriculum.test.ts` |
| 工作项 | ① 建类型与 13 领域、41 Track、86 模块的最小元数据；② ID 唯一性与引用完整性校验；③ 环检测单元测试；④ 课程↔模块映射校验 |
| 验收 | 现有测试全绿；新增测试覆盖重复 ID、悬空先修、环、缺失课程映射；构建产物无变化 |
| 风险 | 元数据与文档漂移 → 用同一份数据生成文档表格或加一致性测试 |
| 回滚 | 删除新增文件与测试，不影响运行时 |

### Phase 2 — V2.3-B 首批内容扩展（网络方向）

| 项目 | 内容 |
| --- | --- |
| 目标 | 验证「新增课程 + 旧档案兼容」流程 |
| 范围 | 新增 `MOD-NET-04` 的 4 节课与 1 个实验（`LAB-NET-05` 抓包分析），`introducedIn: 2` |
| 不改 | 现有 3 节课、20 个 section、15 题、34 词、4 个实验 |
| 验收 | 旧备份可导入；旧课程成绩不变；新课程可读、可测、可复习；`contentVersion` 正确；无 schema 变更 |
| 风险 | 词库增长导致复习队列变化 → 新词条默认进入待学，不改变已掌握状态 |
| 回滚 | 下架新课程（`available: false`），保留数据读取；不删除用户记录 |

### Phase 3 — V2.4-A 存储演进（仅在确有需要时）

| 项目 | 内容 |
| --- | --- |
| 触发条件 | 需要记录模块级进度、能力证据引用或跨课程先修状态 |
| 方案 | 优先在 schema 1 增加可选字段；若必须升版，提供 `1 → 2` 迁移器 |
| 迁移要求 | 迁移前自动备份原文；迁移失败保留原 key；迁移可重复执行；不删除未知字段 |
| 验收 | 旧档案 100% 可读；失败路径有测试；导出/导入往返一致；F01/F02/F03 用例不削弱 |
| 回滚 | 保留 schema 1 读取路径；发布前导出样例档案做回归 |

### Phase 4 — V2.4-B 分批内容上线

建议批次（每批必须包含：课程 + 实验/练习 + 项目规格 + 评审）：

| 批次 | 内容 | 依赖 |
| --- | --- | --- |
| B1 | 网络补全：`MOD-NET-04`–`MOD-NET-09` | Phase 2 |
| B2 | Linux 与系统管理：`MOD-LNX-01`–`MOD-LNX-06` | B1 的日志/网络内容 |
| B3 | 操作系统与体系结构：`MOD-OS-01`–`MOD-OS-05`、`MOD-ARC-01`–`MOD-ARC-04` | B2 |
| B4 | 安全基础与应用安全：`MOD-SEC-01`–`MOD-SEC-06` | B1、B3 |
| B5 | 后端与数据库：`MOD-BE-01`–`MOD-BE-06` | 编程基础已存在 |
| B6 | Web 工程：`MOD-WEB-01`–`MOD-WEB-05` | B5 |
| B7 | 云与 DevOps：`MOD-CLD-01`–`MOD-CLD-09` | B2、B4 |
| B8 | 数据结构与算法：`MOD-DSA-01`–`MOD-DSA-06` | 编程基础 |
| B9 | 防御运营与响应：`MOD-SEC-07`–`MOD-SEC-11` | B4、B7 |
| B10 | 高级专题与职业模块：`MOD-ADV-*`、`MOD-ENG-*` | 前置批次 |
| B11 | 项目与证据平台 | B1–B10 |

每批上线前检查：

- [ ] 先修模块已上线或已存在等价内容
- [ ] 测验 ID 唯一、答案唯一
- [ ] 词条不重名、释义不冲突
- [ ] 实验可在浏览器或本地环境完成
- [ ] 项目 rubric 可执行
- [ ] 旧档案回归通过

### Phase 5 — V2.5 实验与项目平台

| 项目 | 内容 |
| --- | --- |
| 实验运行时 | 浏览器内模拟器（沿用现有模式）；需要本地环境的实验提供脚本与校验清单，不在浏览器执行任意命令 |
| 项目证据 | 外链仓库 + 结构化元数据（不托管代码、不存储密钥） |
| 评审 | 自评 + 同伴评审 + 抽样复核 |
| 职业映射 | 技能标签、`CAP-*` 能力项、JD 采样流程 |
| 验收 | 证据可追溯、可撤销授权、无个人信息泄露 |

## 6. 数据迁移设计（若启用 schema 2）

### 6.1 迁移规则

1. 读取 `cyberpath.v1` → 校验 schema 1 → 复制为迁移输入（原文保留）。
2. 逐字段转换：保留未知字段；新增字段给默认值；不推断缺失的历史时间。
3. 写入新结构前先写临时键（如 `cyberpath.v2.migrating`），成功后切换；失败则保留原键。
4. 迁移结果记录 `migratedAt`、`fromVersion`，便于排障。
5. 用户可在进度页导出原文；不提供「一键清空」作为修复手段。

### 6.2 迁移测试矩阵

| 输入 | 期望 |
| --- | --- |
| 无数据（首次使用） | 初始化 schema 2，不报错 |
| 合法 schema 1（含笔记/复习/历史） | 全量保留，字段语义不变 |
| schema 1 缺可选字段 | 使用默认值，不报错 |
| 损坏 JSON | 保留原文，提示导出，不覆盖 |
| 未来版本（version 3） | 拒绝导入并保留原文 |
| 超大文件（>1 MB） | 拒绝并提示 |

### 6.3 回滚

- 代码回滚到 schema 1 读取路径。
- 数据回滚使用迁移前备份；不回写未知字段。
- 回滚演练必须在发布前完成一次。

## 7. 发布门禁

### 7.1 内容门禁

- 英文正文经语言评审（术语、时态、可读性）。
- 中文释义准确，不引入未解释的新术语。
- 每个目标可被至少一种证据验证。
- 安全内容有授权与隔离说明。

### 7.2 工程门禁

- `npm run typecheck`、`npm run lint`、单元测试、构建、浏览器回归按 CI 顺序通过。
- 新增课程不改变现有课程 ID、题目 ID、section ID。
- 导入/导出回归覆盖旧档案。
- 不以「本地通过」代替 CI；不以旧 SHA 的绿色结果代替本次提交。

### 7.3 发布说明必须写

- 新增了哪些课程/实验/项目。
- 旧档案是否兼容，如何备份。
- 已知限制（旧版本无法读取新课程、实验环境要求）。

## 8. 风险登记

| 风险 | 影响 | 概率 | 缓解 |
| --- | --- | --- | --- |
| 元数据与文档漂移 | 先修提示错误 | 中 | 单一数据源 + 一致性测试 |
| 课程 ID 冲突 | 档案串课 | 低 | ID 唯一性测试 + 别名表 |
| 词条重名/多义 | 复习记录错配 | 中 | 词条不可重命名；多义用别名 |
| schema 升级失败 | 学习记录损坏 | 低 | 备份 + 临时键 + 回滚演练 |
| 内容量过大导致质量下降 | 学习者流失 | 中 | 分批上线 + 每批评审 |
| 实验环境成本 | 无法完成实验 | 中 | 优先浏览器模拟；本地脚本可选 |
| 攻击性内容被滥用 | 法律与伦理风险 | 低 | 授权、隔离、禁止真实目标 |
| 项目证据造假 | 能力判定失真 | 中 | 现场变体 + 历史检查 + 抽样复核 |
| 岗位信息过时 | 路线误导 | 高 | 季度复核 + 来源标注 + 不承诺就业 |

## 9. 本轮明确不做

- 不修改 `src/content/lessons/index.ts`。
- 不新增页面、路由、组件。
- 不修改 `src/lib/storage.ts`、`src/types/index.ts`。
- 不修改 `README.md`、`AGENTS.md`、`docs/PROJECT_STATUS.md`、`docs/AGENT_HANDOFF.md`。
- 不创建新实验、不接入项目提交。
- 不合并 `master`、不打标签、不部署。

## 10. 交接清单

下一阶段接手时按顺序确认：

1. 当前分支与 SHA：`planning/curriculum-3.0`。
2. 本轮只新增 5 个文档，`git status` 应只有 `docs/curriculum/`。
3. 现有课程、存储键、schema 未变。
4. 下一阶段（V2.3-A）只做元数据层，不动 UI 与存储。
5. 若先做内容扩展，优先 `MOD-NET-04`，因为它复用现有网络主题与实验模式。
6. 发布前重新核对 CI 与旧档案导入。

<!-- END -->