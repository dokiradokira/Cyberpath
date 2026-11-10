# CyberPath 职业学习路线与能力验证

- 版本：3.0-planning
- 日期：2026-11-10
- 配套：[课程体系总纲](CURRICULUM_3_0.md)、[知识依赖](KNOWLEDGE_DEPENDENCIES.md)、[项目式学习](PROJECT_BASED_LEARNING.md)、[迁移计划](CURRICULUM_MIGRATION_PLAN.md)

## 0. 先读这一节

1. 岗位要求随时间、地区、行业、公司规模变化。本文件给出的是**能力结构与验证方法**，不是招聘承诺。
2. 完成课程、完成项目、通过内部 rubric，**都不等于**达到某公司录用标准。
3. 本文件不编造任何企业的招聘要求。所有引用的岗位描述都注明来源、访问日期与原文片段；无法核验的内容一律不写。
4. 本文件区分「共同基础」与「专业分支」：共同基础是六条路线都必须具备的能力；专业分支决定你投什么岗位。

## 1. 证据来源与采样方法

### 1.1 本轮实际可核验的来源

公开招聘页面多为 JavaScript 渲染、登录后可见或已下线。本轮尝试了 Greenhouse、Lever、Workable、Ashby、We Work Remotely 等来源：返回 404、仅标题的空壳页或 403，**无法核验 JD 全文**。因此本轮不引用任何具体公司的岗位要求。

可核验的替代来源是 **O\*NET OnLine**（美国劳工部资助的职业信息数据库），其职业画像包含任务、工作活动、工具技术与任职要求，页面标注数据更新年份，可作为「岗位实际做什么」的公开样本。

| 代码 | 职业 | 页面标注 | 本体系对应路线 | 来源（访问日期 2026-11-10） |
| --- | --- | --- | --- | --- |
| 15-1212.00 | Information Security Analysts | Updated 2026 | Cybersecurity Engineer | <https://www.onetonline.org/link/summary/15-1212.00> |
| 15-1252.00 | Software Developers | Updated 2026 | Software / Backend / Cloud-DevOps | <https://www.onetonline.org/link/summary/15-1252.00> |
| 15-1244.00 | Network and Computer Systems Administrators | Updated 2026 | Network / Systems | <https://www.onetonline.org/link/summary/15-1244.00> |
| 15-1299.08 | Computer Systems Engineers/Architects | Updated 2026 | Systems Engineer | <https://www.onetonline.org/link/summary/15-1299.08> |

说明：O\*NET 是美国职业分类数据，不等于中国或欧洲某公司的 JD；它描述的是职业的典型任务集合。使用时必须保留这一限制。

### 1.2 原文摘录（可核验）

**15-1212.00 Information Security Analysts**

> “Plan, implement, upgrade, or monitor security measures for the protection of computer networks and information. Assess system vulnerabilities for security risks and propose and implement risk mitigation strategies. May ensure appropriate security controls are in place… May respond to computer security breaches and viruses.”

任务示例（原文）：“Develop plans to safeguard computer files against accidental or unauthorized modification, destruction, or disclosure…”, “Encrypt data transmissions and erect firewalls…”, “Perform risk assessments and execute tests…”, “Document computer security and emergency measures policies, procedures, and tests.”

**15-1252.00 Software Developers**

> “Research, design, and develop computer and network software or specialized utility programs. Analyze user needs and develop software solutions… Update software or enhance existing software capabilities.”

任务示例：“Analyze user needs and software requirements to determine feasibility of design within time and cost constraints.”, “Develop or direct software system testing or validation procedures, programming, or documentation.”, “Modify existing software to correct errors, adapt it to new hardware, or upgrade interfaces and improve performance.”

**15-1244.00 Network and Computer Systems Administrators**

> “Install, configure, and maintain an organization's local area network (LAN), wide area network (WAN), data communications network, operating systems, and physical and virtual servers. Perform system monitoring and verify the integrity and availability of hardware, network, and server resources… Review system and application logs… including system backups.”

任务示例：“Plan, coordinate, and implement network security measures…”, “Perform data backups and disaster recovery operations.”, “Diagnose, troubleshoot, and resolve hardware, software, or other network and system problems…”, “Monitor network performance to determine whether adjustments are needed…”

**15-1299.08 Computer Systems Engineers/Architects**

> “Design and develop solutions to complex applications problems, system administration issues, or network concerns. Perform systems management and integration functions.”

任务示例：“Verify stability, interoperability, portability, security, or scalability of system architecture.”, “Document design specifications, installation instructions, and other system-related information.”, “Perform security analyses of developed or packaged software components.”, “Develop system engineering, software engineering, system integration, or distributed system architectures.”

### 1.3 共性要求与个别要求（基于上述可核验任务）

| 类别 | 共性要求 | 出现在 |
| --- | --- | --- |
| 文档与沟通 | 记录设计、流程、事件与结论；与同事/客户沟通需求 | 四个职业均出现 |
| 排障与分析 | 诊断、定位、修复系统/网络/软件问题 | 四个职业均出现 |
| 安全 | 实施安全措施、评估风险、分析组件安全性 | 1212、1244、1299.08 明确；1252 通过测试与文档间接要求 |
| 变更与验证 | 测试、验证、回归、发布前检查 | 1252、1299.08 明确 |
| 监控与容量 | 监控性能、资源与可用性 | 1244、1299.08 明确 |

| 类别 | 个别/方向性要求 | 对应路线 |
| --- | --- | --- |
| 风险度量与合规文档 | 风险评估、政策与流程文档、安全意识培训 | Cybersecurity |
| 加密与边界防护 | 加密传输、防火墙、访问控制 | Cybersecurity / Network |
| 备份与灾难恢复 | 备份、恢复演练、硬件维护 | Network / Systems |
| 需求分析与软件测试流程 | 需求可行性、测试与验证程序 | Software / Backend |
| 架构质量属性 | 稳定性、互操作性、可移植性、安全性、可扩展性 | Systems / Cloud |
| 项目计划与预算 | 计划、进度、成本、资源 | Systems（高级） |

> 结论：六条路线的**共同基础**是「能读、能写、能测、能排障、能写清楚、懂安全边界」；差异主要在系统规模、交付方式与风险责任。

### 1.4 后续如何接入真实 JD（可执行流程）

当可以访问真实 JD（用户提供截图、链接或文本，或使用有授权的招聘数据源）时，按以下流程入库：

1. **采集**：字段包括岗位名、公司/行业（可匿名）、地区、经验要求、学历、发布时间、抓取日期、来源 URL、原文。
2. **标注**：把要求拆成技能标签（如 `linux`、`siem`、`kubernetes`、`threat-modeling`），并标记「必备 / 加分 / 仅提及」。
3. **映射**：技能标签映射到模块 ID 与能力项 ID（`CAP-*`）。
4. **统计**：按地区与时间窗口统计出现频率，区分共性（>60%）、常见（30–60%）、个别（<30%）。
5. **差异分析**：对比本体系必修模块，输出「已覆盖 / 部分覆盖 / 未覆盖」。
6. **更新节奏**：每季度复核一次；样本量不足 30 条时只做定性描述，不发布百分比。
7. **合规**：不存储个人信息，不转载需授权的内容，引用时注明来源与日期。

## 2. 六条职业路线

阅读约定：

- 「必修模块」是该路线的**最低知识集合**，不代表全部课程。
- 「必修实验」必须留下可复现记录。
- 「项目」必须在作品集中可访问，且包含运行证据。
- 「能力验证」使用 `CAP-*` 能力项，按四级 rubric 判定（见第 4 节）。
- 「交叉知识」列出与其他路线的重叠，用于换方向时复用。

### 2.1 Cybersecurity Engineer（网络安全工程师）

**职业画像**：负责安全控制的设计与运行、风险评估、检测与响应；在部分组织中也包含应用安全评审与授权测试。

**先修知识**：网络基础（`MOD-NET-01`–`MOD-NET-03`）、操作系统与 Linux（`MOD-OS-01`、`MOD-LNX-01`–`MOD-LNX-03`）、Web 基础（`MOD-WEB-01`–`MOD-WEB-02`）。

**核心技能矩阵**

| 技能 | 覆盖模块 | 证据 |
| --- | --- | --- |
| 威胁建模与风险排序 | `MOD-SEC-01`、`MOD-SEC-06` | 威胁模型图 + 风险登记 |
| 密码学正确使用 | `MOD-SEC-02` | TLS 配置检查报告 |
| 身份与最小权限 | `MOD-SEC-03`、`MOD-SEC-04` | 越权测试与修复记录 |
| Web 漏洞复现与修复 | `MOD-SEC-05` | 修复前后对比 + 回归测试 |
| 检测工程与告警研判 | `MOD-SEC-07`、`MOD-NET-09` | 检测规则 + 告警分析 |
| 事件响应与取证 | `MOD-SEC-08` | 事件时间线 + 复盘 |
| 授权测试与报告 | `MOD-SEC-09`、`MOD-SEC-10` | 授权书 + 报告 + 修复验证 |
| 云与基础设施安全 | `MOD-CLD-03` | 最小权限策略 + 审计证据 |

**建议学习顺序**

1. L1：网络三课 + Linux 命令行 + Web 基础。
2. L2：`MOD-SEC-01`、`MOD-SEC-02`、`MOD-SEC-03`，同时补 `MOD-NET-04`（抓包）。
3. L3：`MOD-SEC-05`、`MOD-SEC-06`、`MOD-SEC-07`，并行 `MOD-LNX-03`。
4. L3–L4：`MOD-SEC-08`、`MOD-SEC-09`、`MOD-SEC-10`，配合 `MOD-CLD-03`。
5. L4：`MOD-ENG-02` 或 `MOD-ENG-03` 作为 Capstone。

**必修实验**：`LAB-NET-02`、`LAB-NET-04`、`LAB-NET-05`、`LAB-WEB-02`、`LAB-SEC-01`、`LAB-SEC-02`、`LAB-SEC-03`、`LAB-LNX-02`。

**代表性项目（4 个）**

| 项目 | 说明 | 证明什么 |
| --- | --- | --- |
| P-09 Linux 服务器加固基线 | 按 CIS 思路加固一台主机并出具前后对比 | 系统加固与可验证配置 |
| P-10 Web 应用安全评估 | 对一个自建应用做威胁建模、测试与修复 | 应用安全全流程 |
| P-11 检测规则与 SIEM 告警 | 为 3 类攻击行为写检测并调优 | 检测工程能力 |
| P-12 事件响应演练报告 | 桌面演练 + 主机取证 + 复盘 | 响应与沟通能力 |

**能力验证标准**

| 能力项 | 达标要求 |
| --- | --- |
| `CAP-SEC-01` 威胁建模 | 能独立产出数据流图、信任边界与 Top 5 风险，并与控制措施对应 |
| `CAP-SEC-02` 漏洞修复 | 能复现至少 3 类 Web 漏洞，修复含回归测试，报告不夸大影响 |
| `CAP-SEC-03` 检测 | 能写出低误报规则，说明假设、覆盖的 ATT&CK 技术与盲区 |
| `CAP-SEC-04` 响应 | 能按阶段组织响应，证据链完整，复盘有可验证改进项 |
| `CAP-SEC-05` 授权测试 | 严格遵守范围与时间窗，报告可执行、可验证 |
| `CAP-SEC-06` 沟通 | 能用非技术语言向管理者解释风险与取舍 |

**交叉知识**：网络工程（流量与分段）、后端（API 与认证）、云（IAM 与审计）、系统（日志与进程）。

**边界**：本路线不培养「未授权入侵」能力；不覆盖逆向工程的高级利用开发（见 `MOD-ADV-04`，且需额外授权与隔离环境）；不承诺通过任何认证考试。

### 2.2 Backend Engineer（后端工程师）

**职业画像**：设计并实现服务端 API、数据模型与业务逻辑，保证正确性、性能与可维护性。

**先修知识**：编程基础（`MOD-PF-01`–`MOD-PF-03`）、网络与 HTTP（`MOD-NET-03`）、数据库基础（`MOD-BE-04`）。

**核心技能矩阵**

| 技能 | 覆盖模块 | 证据 |
| --- | --- | --- |
| HTTP API 设计与校验 | `MOD-BE-01` | OpenAPI 摘要 + 契约测试 |
| 认证、会话与授权 | `MOD-BE-02` | 登录/越权测试记录 |
| 关系建模与 SQL | `MOD-BE-04`、`MOD-BE-05` | 表设计 + 查询计划 |
| 事务与并发 | `MOD-BE-06` | 隔离级别实验记录 |
| 可靠性（重试/幂等/队列） | `MOD-BE-03` | 故障注入报告 |
| 部署与可观测 | `MOD-CLD-06`、`MOD-CLD-08` | 流水线 + 仪表盘 |
| 安全编码 | `MOD-SEC-05`、`MOD-SEC-06` | 安全评审记录 |

**建议学习顺序**

1. L1：`MOD-PF-01`–`MOD-PF-03`、`MOD-PF-06`、`MOD-NET-03`。
2. L2：`MOD-BE-04`、`MOD-BE-01`、`MOD-DSA-01`–`MOD-DSA-02`。
3. L2–L3：`MOD-BE-02`、`MOD-BE-05`、`MOD-BE-06`。
4. L3：`MOD-BE-03`、`MOD-CLD-04`、`MOD-CLD-06`、`MOD-SEC-05`。
5. L4：P-18 或 P-19 作为 Capstone。

**必修实验**：`LAB-DB-01`、`LAB-WEB-02`、`LAB-CLD-01`、`LAB-SEC-01`。

**代表性项目（3 个）**

| 项目 | 说明 | 证明什么 |
| --- | --- | --- |
| P-07 简易 HTTP API + 数据库 | 带校验、认证、分页与迁移的 CRUD 服务 | 后端基本功 |
| P-18 安全加固的全栈服务 | 加入认证授权、安全评审与部署手册 | 端到端交付 |
| P-19 多服务系统与事故复盘 | 拆分服务、加队列与可观测性 | 可靠性与协作 |

**能力验证标准**

| 能力项 | 达标要求 |
| --- | --- |
| `CAP-BE-01` API 设计 | 资源模型清晰、状态码正确、错误可处理、版本可演进 |
| `CAP-BE-02` 数据建模 | 表结构满足约束、索引有依据、迁移可回滚 |
| `CAP-BE-03` 正确性 | 关键路径有测试，边界与失败路径覆盖 |
| `CAP-BE-04` 可靠性 | 超时/重试/幂等/降级经过故障注入验证 |
| `CAP-BE-05` 运维性 | 能部署、回滚、定位慢请求与错误峰值 |

**交叉知识**：软件工程（测试与代码质量）、云（容器与流水线）、安全（注入与认证）、系统（并发与内存）。

**边界**：不覆盖大规模分布式一致性设计（见 `MOD-ADV-01`/`MOD-ADV-02`）；不覆盖前端体验设计。

### 2.3 Software Engineer（软件工程师）

**职业画像**：在明确需求下设计、实现、测试并维护软件；强调代码质量、测试与协作。

**先修知识**：编程基础（`MOD-PF-01`–`MOD-PF-08`）、数据结构（`MOD-DSA-01`–`MOD-DSA-03`）、Web 或后端其一的入门（`MOD-WEB-02` 或 `MOD-BE-01`）。

**核心技能矩阵**

| 技能 | 覆盖模块 | 证据 |
| --- | --- | --- |
| 代码结构与可读性 | `MOD-PF-02`、`MOD-PF-07` | 代码评审记录 |
| 测试设计 | `MOD-PF-07` | 单测覆盖率与失败用例 |
| 数据结构与算法 | `MOD-DSA-01`–`MOD-DSA-06` | 题解 + 基准 |
| 版本控制与协作 | `MOD-PF-06`、`MOD-ENG-06` | 提交历史 + PR 描述 |
| 需求与取舍 | `MOD-ENG-01`、`MOD-ENG-05` | ADR + 答辩 |
| 性能意识 | `MOD-ARC-03` | 剖析报告 |

**建议学习顺序**

1. L1：`MOD-PF-01`–`MOD-PF-08`。
2. L2：`MOD-DSA-01`–`MOD-DSA-05`、`MOD-OS-01`、`MOD-WEB-02` 或 `MOD-BE-01`。
3. L3：`MOD-DSA-06`、`MOD-ARC-03`、`MOD-ENG-01`。
4. L4：P-18 + 代码评审与答辩。

**必修实验**：`LAB-DSA-01`、`LAB-OS-01`、`LAB-WEB-01`、`LAB-ENG-01`。

**代表性项目（4 个）**

| 项目 | 说明 | 证明什么 |
| --- | --- | --- |
| P-02 个人学习档案工具 | 完整 CRUD + 导入导出 + 测试 | 工程完整性 |
| P-08 数据结构可视化 | 交互 + 算法 + 基准 | 抽象与表达能力 |
| P-18 安全加固的全栈服务 | 端到端交付 | 系统整合 |
| P-22 毕业作品集与演讲 | 3 个案例 + 现场答辩 | 职业表达 |

**能力验证标准**

| 能力项 | 达标要求 |
| --- | --- |
| `CAP-SWE-01` 实现 | 代码可读、命名准确、无重复逻辑、边界处理正确 |
| `CAP-SWE-02` 测试 | 关键逻辑有测试，失败用例可复现 |
| `CAP-SWE-03` 调试 | 能在陌生代码中定位缺陷并给出根因 |
| `CAP-SWE-04` 协作 | 提交可评审、PR 描述清晰、能接受并落实意见 |
| `CAP-SWE-05` 表达 | 能讲清设计取舍与替代方案 |

**交叉知识**：后端、前端、系统、安全基础。

**边界**：不覆盖算法竞赛级训练；不承诺通过大厂算法面试。

### 2.4 Network Engineer（网络工程师）

**职业画像**：设计、部署、维护网络，处理连通性、性能与边界安全问题。

**先修知识**：网络三课（`MOD-NET-01`–`MOD-NET-03`）、Linux 基础（`MOD-LNX-01`–`MOD-LNX-02`）。

**核心技能矩阵**

| 技能 | 覆盖模块 | 证据 |
| --- | --- | --- |
| 地址规划与子网 | `MOD-NET-02` | 地址表 + 计算记录 |
| 协议分析 | `MOD-NET-04` | 抓包报告 |
| 交换与 VLAN | `MOD-NET-05` | 拓扑 + 配置 |
| 路由与互联 | `MOD-NET-06` | 路由表 + 排障记录 |
| 网络服务运维 | `MOD-NET-07` | 服务配置 + 监控基线 |
| 边界与分段 | `MOD-NET-08` | 访问矩阵 + 验证 |
| 流量检测 | `MOD-NET-09` | 检测规则 + 告警分析 |

**建议学习顺序**

1. L1：`MOD-NET-01`–`MOD-NET-03`、`MOD-LNX-01`。
2. L2：`MOD-NET-05`、`MOD-NET-06`、`MOD-NET-04`。
3. L3：`MOD-NET-07`、`MOD-NET-08`、`MOD-NET-09`。
4. L3–L4：`MOD-CLD-02`（云网络）+ P-04/P-06 深化。

**必修实验**：`LAB-NET-01`、`LAB-NET-02`、`LAB-NET-03`、`LAB-NET-04`、`LAB-NET-05`、`LAB-NET-06`。

**代表性项目（3 个）**

| 项目 | 说明 | 证明什么 |
| --- | --- | --- |
| P-04 小型局域网设计与文档 | 拓扑、VLAN、地址、设备配置 | 网络设计基本功 |
| P-06 子网规划与地址管理方案 | 多网段规划 + 地址管理 | 规划与文档 |
| P-09 Linux 服务器加固基线 | 主机网络与服务加固 | 端到端运维 |

**能力验证标准**

| 能力项 | 达标要求 |
| --- | --- |
| `CAP-NET-01` 规划 | 地址、VLAN、路由规划自洽，可被他人按文档复现 |
| `CAP-NET-02` 排障 | 能用分层方法定位，结论有证据 |
| `CAP-NET-03` 安全边界 | 访问矩阵默认拒绝，规则可解释 |
| `CAP-NET-04` 文档 | 拓扑、地址表、变更记录齐全 |
| `CAP-NET-05` 监控 | 有基线、阈值与告警处置流程 |

**交叉知识**：安全（分段与检测）、系统（主机网络）、云（VPC）。

**边界**：不覆盖运营商级路由协议调优；实验以模拟器/自有设备为主，不接触未授权网络。

### 2.5 Cloud / DevOps Engineer（云与 DevOps 工程师）

**职业画像**：用代码管理基础设施，构建交付流水线，保证系统可部署、可观测、可恢复。

**先修知识**：Linux（`MOD-LNX-01`–`MOD-LNX-03`）、网络（`MOD-NET-01`–`MOD-NET-02`）、编程（`MOD-PF-01`–`MOD-PF-03`）、Git（`MOD-PF-06`）。

**核心技能矩阵**

| 技能 | 覆盖模块 | 证据 |
| --- | --- | --- |
| 云基础与成本 | `MOD-CLD-01` | 架构图 + 成本估算 |
| 云网络与存储 | `MOD-CLD-02` | VPC/子网/存储配置 |
| 云 IAM 与审计 | `MOD-CLD-03` | 最小权限策略 + 审计日志 |
| 容器 | `MOD-CLD-04` | 镜像 + 扫描报告 |
| Kubernetes | `MOD-CLD-05` | 部署清单 + 滚动更新记录 |
| CI/CD | `MOD-CLD-06` | 流水线 + 回滚演练 |
| IaC | `MOD-CLD-07` | Terraform 代码 + plan 审查 |
| 可观测性与 SRE | `MOD-CLD-08`、`MOD-CLD-09` | SLO + 仪表盘 + 复盘 |

**建议学习顺序**

1. L1：`MOD-LNX-01`–`MOD-LNX-03`、`MOD-NET-01`–`MOD-NET-02`、`MOD-PF-06`。
2. L3：`MOD-CLD-01`–`MOD-CLD-04`。
3. L3–L4：`MOD-CLD-05`–`MOD-CLD-07`。
4. L4：`MOD-CLD-08`、`MOD-CLD-09`，配合 P-14 与 P-17。

**必修实验**：`LAB-LNX-01`、`LAB-CLD-01`、`LAB-CLD-02`、`LAB-SEC-01`。

**代表性项目（4 个）**

| 项目 | 说明 | 证明什么 |
| --- | --- | --- |
| P-14 云上三层架构与 IaC | VPC + 计算 + 数据库 + 最小权限 | 云架构与自动化 |
| P-15 CI/CD 流水线 | 构建、测试、制品、部署、回滚 | 交付工程 |
| P-16 Kubernetes 部署与自愈 | 探针、扩缩容、滚动更新 | 编排运维 |
| P-17 可观测性仪表盘与 SLO | 指标、日志、追踪、错误预算 | 可靠性工程 |

**能力验证标准**

| 能力项 | 达标要求 |
| --- | --- |
| `CAP-CLD-01` 基础设施 | 全部用代码声明，plan 可审查，destroy 可清理 |
| `CAP-CLD-02` 安全 | 无长期根凭据、无公开存储、最小权限 |
| `CAP-CLD-03` 交付 | 流水线门禁有效，回滚在目标时间内完成 |
| `CAP-CLD-04` 可观测 | 告警基于症状，能定位到组件与版本 |
| `CAP-CLD-05` 成本 | 有预算、有闲置资源治理 |

**交叉知识**：系统（进程与资源）、网络（VPC 与路由）、安全（IAM 与供应链）、后端（服务契约）。

**边界**：不绑定单一云厂商认证；不承诺掌握所有托管服务；生产环境操作必须在授权与变更流程下进行。

### 2.6 Systems Engineer（系统工程师）

**职业画像**：在操作系统、硬件与网络之间做集成，保证系统稳定、可维护、可扩展。

**先修知识**：操作系统（`MOD-OS-01`–`MOD-OS-03`）、Linux 管理（`MOD-LNX-01`–`MOD-LNX-04`）、网络基础（`MOD-NET-01`–`MOD-NET-03`）。

**核心技能矩阵**

| 技能 | 覆盖模块 | 证据 |
| --- | --- | --- |
| 系统机制 | `MOD-OS-01`–`MOD-OS-03` | 实验记录 + 机制解释 |
| 主机运维 | `MOD-LNX-02`–`MOD-LNX-04` | 加固基线 + 备份恢复 |
| 自动化 | `MOD-LNX-05`、`MOD-LNX-06` | 脚本 + playbook |
| 性能 | `MOD-ARC-03` | 剖析前后对比 |
| 网络集成 | `MOD-NET-05`–`MOD-NET-07` | 拓扑 + 配置 |
| 容器与编排 | `MOD-CLD-04`、`MOD-CLD-05` | 部署清单 |
| 可观测性 | `MOD-CLD-08` | 仪表盘 + 告警 |
| 安全基线 | `MOD-SEC-01`、`MOD-SEC-07` | 基线检查 + 日志 |

**建议学习顺序**

1. L1–L2：`MOD-LNX-01`–`MOD-LNX-04`、`MOD-OS-01`–`MOD-OS-03`。
2. L2：`MOD-ARC-01`–`MOD-ARC-02`、`MOD-NET-05`–`MOD-NET-07`。
3. L3：`MOD-LNX-05`、`MOD-LNX-06`、`MOD-CLD-04`、`MOD-CLD-05`。
4. L4：`MOD-CLD-08`、`MOD-ENG-03`，配合 P-19。

**必修实验**：`LAB-LNX-01`、`LAB-LNX-02`、`LAB-OS-01`、`LAB-OS-02`、`LAB-ARC-01`、`LAB-CLD-01`。

**代表性项目（3 个）**

| 项目 | 说明 | 证明什么 |
| --- | --- | --- |
| P-09 Linux 服务器加固基线 | 加固 + 审计 + 回滚 | 系统安全与可维护 |
| P-16 Kubernetes 部署与自愈 | 编排与故障恢复 | 平台能力 |
| P-19 多服务系统与事故复盘 | 故障演练与复盘 | 复杂系统运维 |

**能力验证标准**

| 能力项 | 达标要求 |
| --- | --- |
| `CAP-SYS-01` 机制 | 能解释进程/内存/IO 行为并用实验验证 |
| `CAP-SYS-02` 运维 | 变更可回滚，备份可恢复 |
| `CAP-SYS-03` 自动化 | 脚本/配置幂等，有失败处理 |
| `CAP-SYS-04` 性能 | 能定位瓶颈并给出数据支持 |
| `CAP-SYS-05` 稳定 | 有监控、告警与容量计划 |

**交叉知识**：网络、云、安全、后端。

**边界**：不覆盖硬件电路设计；不承诺厂商认证。

## 3. 共同基础与专业分支

### 3.1 共同基础（六条路线都要求）

| 模块 | 能力 | 为什么共同 |
| --- | --- | --- |
| `MOD-CF-01`–`MOD-CF-05` | 计算机与学习能力 | 所有路线的入口 |
| `MOD-PF-01`–`MOD-PF-03` | 编程基础 | 自动化、脚本、排障都需要 |
| `MOD-PF-06`–`MOD-PF-07` | Git、调试与测试 | 工程协作底线 |
| `MOD-NET-01`–`MOD-NET-03` | 网络基础 | 任何系统都联网 |
| `MOD-LNX-01`–`MOD-LNX-02` | Linux 基础 | 服务器与云的事实标准 |
| `MOD-OS-01` | 操作系统机制 | 性能与故障分析的基础 |
| `MOD-SEC-01` | 安全思维 | 所有岗位都要理解风险 |
| `MOD-ENG-01` | 工程方法 | 项目交付与验收 |

### 3.2 专业分支

| 路线 | 分支核心 | 与其他路线的主要差异 |
| --- | --- | --- |
| Cybersecurity | 检测、响应、应用安全、授权测试 | 更强调对手视角与证据链 |
| Backend | API、数据、事务、可靠性 | 更强调正确性与数据一致性 |
| Software | 代码质量、测试、算法、协作 | 更强调通用工程能力 |
| Network | 交换路由、分段、流量 | 更强调拓扑与连通性 |
| Cloud/DevOps | IaC、容器、流水线、SLO | 更强调自动化与可恢复性 |
| Systems | 主机、内核、性能、集成 | 更强调底层机制与稳定性 |

### 3.3 交叉知识矩阵

| 模块组 | SEC | BE | SWE | NET | CLD | SYS |
| --- | --- | --- | --- | --- | --- | --- |
| CF/PF 基础 | ● | ● | ● | ● | ● | ● |
| DSA | ○ | ● | ● | ○ | ○ | ○ |
| OS | ● | ● | ○ | ○ | ● | ● |
| NET | ● | ● | ○ | ● | ● | ● |
| WEB | ● | ● | ● | ○ | ○ | ○ |
| BE/DB | ○ | ● | ● | ○ | ● | ○ |
| SEC | ● | ● | ○ | ● | ● | ● |
| LNX | ● | ● | ○ | ● | ● | ● |
| CLD | ● | ● | ○ | ○ | ● | ● |
| ARC | ○ | ○ | ● | ○ | ○ | ● |
| ENG | ● | ● | ● | ● | ● | ● |

图例：● 必修或强相关；○ 建议或按方向选学。

## 4. 能力验证 rubric

每条 `CAP-*` 按四级判定，取最低项作为该能力项等级。

| 等级 | 名称 | 判定标准 |
| --- | --- | --- |
| 0 | 未达标 | 无法独立完成，或证据缺失，或触发红线 |
| 1 | 基础 | 在模板与提示下完成，能解释主要步骤 |
| 2 | 熟练 | 独立完成，结果正确，文档可复现 |
| 3 | 独立 | 能在新情境中调整方案，说明取舍与局限，能指导他人 |

### 4.1 红线项（任一触发即整体不通过）

1. 在未授权系统测试、扫描或攻击。
2. 提交真实密钥、个人信息或他人数据。
3. 伪造实验输出、测试结果、项目证据或工作经历。
4. 项目无法按文档复现。
5. 抄袭他人项目并声称为自己完成。

### 4.2 证据包格式

每个路线申请等级时提交：

```
evidence/
  README.md            # 索引：项目、实验、报告、答辩记录
  projects/            # 每个项目的仓库链接与运行说明
  labs/                # 实验记录（命令、输出、结论）
  reports/             # 评估报告、复盘、威胁模型
  defense/             # 答辩提纲与问答记录
```

证据必须包含**运行方式**与**失败案例**，只有截图的证据视为不完整。

## 5. 与岗位要求对接的运行机制

1. **不把 JD 直接变课程**：JD 是需求信号，课程是知识结构；两者通过技能标签与 `CAP-*` 映射。
2. **共性优先**：出现频率高的要求优先进入共同基础；个别要求进入分支或选修。
3. **地区差异**：同一岗位在不同地区可能偏「建设」或偏「运维」，路线允许在 L3 后调整分支。
4. **时间衰减**：具体产品与工具名会过时，模块以能力命名（如「检测工程」而不是「某 SIEM 产品」）。
5. **反馈闭环**：学习者面试反馈、招聘方反馈、项目评审记录进入季度复盘，用于调整必修模块。
6. **不承诺**：任何「学完即可就业」「包就业」「保证薪资」的表述都不允许出现在平台文案中。

## 6. 现实预期

- 零基础到可投递初级岗位，通常需要**持续数月到一年以上**的稳定投入，且高度依赖项目质量与表达能力；本文件不给日历承诺。
- 课程与项目能显著提高「可验证能力」，但不能替代真实工作经历、团队协作与业务理解。
- 面试结果受地区、行业、经济周期、岗位竞争度影响，平台不掌握也不承诺这些外部条件。
- 若目标是研究型岗位（如漏洞研究、密码学、机器学习），需要额外的数学与论文训练，本体系的 `MOD-ADV-*` 只是入门。

## 7. 附：本轮来源核验记录

| 来源 | 结果 | 处理 |
| --- | --- | --- |
| `boards.greenhouse.io`（多个岗位） | 404 / 仅页面框架 | 不引用 |
| `jobs.lever.co`（多个岗位） | 404 | 不引用 |
| `apply.workable.com`（多个岗位） | 仅标题，正文未渲染 | 不引用 |
| `jobs.ashbyhq.com` | 404 | 不引用 |
| `weworkremotely.com` | 403（反爬验证） | 不引用 |
| `jobs.sap.com` | 跳转至职位列表，未取得具体 JD | 不引用 |
| `onetonline.org` | 200，任务与职业描述可读，标注 Updated 2026 | 作为公开职业画像引用 |

核验日期：2026-11-10。若后续获得可访问的真实 JD，应按第 1.4 节流程补充，并在本表登记来源与日期。

<!-- END -->