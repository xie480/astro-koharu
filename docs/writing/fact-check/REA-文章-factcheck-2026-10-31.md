# REA 文章事实核查

- 文章：`src/content/blog/GitHub爆火的REA是什么？从工作原理到实战，带你搞懂AI如何逆向工程软件.md`
- 核查日期：2026-10-31
- 核查方式：文章完成后单独核查；优先检查 REA、MCP、Ghidra 与 Microsoft 的一手资料。
- 总体可信度：高。REA 的核心定位、安装和目标支持、MCP 角色、计算器示例均有官方资料支持。星数是核查日页面快照；工具支持范围和版本要求可能继续变化。

## 声明核查记录

| 声明 | 类别 / 结论 | 核查证据与说明 |
| --- | --- | --- |
| REA 是面向 coding agent 的逆向分析工具；Agent 通过 MCP 调用它，REA 返回带证据的分析结果，Agent 可继续追问或尝试重建。 | 定义 / 已确认，高 | [REA 官方 README](https://github.com/morluto/rea)说明其定位、MCP 工作方式及返回 evidence 的工作流。文章把它概括为连接 Agent 与分析工具的工具层，是对官方工作流的归纳。 |
| 2026-10-31 REA GitHub 仓库约有 41.3 万 stars。 | 数值 / 已确认，高 | 核查时 [官方仓库页面](https://github.com/morluto/rea)显示 412.6k stars。文章保留核查日期并标为约数，已从 41.2 万修正为 41.3 万。该数字会变化。 |
| REA 支持原生二进制、JavaScript/Electron、网站、.NET、Android APK、固件等分析，且各目标依赖不同。 | 能力 / 已确认，高 | [官方 README 的目标能力表](https://github.com/morluto/rea#readme)列出这些目标与结果；原生深度分析需要相应 Hopper、Ghidra、IDA 或 Kuna Provider；静态 JS 与 .NET 不要求原生分析引擎；网站需要 Chrome 系浏览器；Android APK 反编译需要 JADX 和 JDK。 |
| 安装命令为 `npx rea-agents@latest setup`；Agent 配置需检查和批准后重启；CLI 命令为 `npx -y rea-agents@latest analyze-javascript-application <path> --json`。 | 命令 / 已确认，高 | 命令和 setup 步骤见 [REA 官方首页](https://rea.tools/)；JavaScript CLI 命令见 [官方 README](https://github.com/morluto/rea#quick-start)。文章在命令中为路径加引号，适用于包含空格的 shell 路径。 |
| REA 当前要求 Node.js 22.23.4 及以上、24.22.1 及以上或 26.12.1 及以上，并需要 npm。 | 版本 / 已确认，高 | [REA 官方 README](https://github.com/morluto/rea#quick-start)当前列出的运行时要求与文章一致。因版本会更新，文章明确写为“当前”要求。 |
| MCP Host、Client、Server 的职责分别是 AI 应用、连接管理组件和提供上下文/工具的程序；MCP 不决定模型如何推理。 | 架构 / 已确认，高 | [MCP 官方架构文档](https://modelcontextprotocol.io/docs/learn/architecture)定义 Host、Client、Server 及协议范围；文章对其进行了中文转述。 |
| Ghidra 是 NSA Research Directorate 创建和维护的软件逆向工程框架，包含反汇编、反编译、图形和脚本能力。 | 定义 / 已确认，高 | [Ghidra 官方 GitHub README](https://github.com/NationalSecurityAgency/ghidra)明确写出机构归属和功能。 |
| Windows 计算器的百分号规则在乘除与其他运算符下不同；`200 + 10%` 为 220。 | 行为 / 已确认，高 | [REA 官方案例](https://rea.tools/)展示加法和乘法两条规则，并标注该案例基于 REA 4.1.0、Windows Calculator 11.2508.4.0 x64；[Microsoft 源码](https://github.com/microsoft/calculator/blob/d125246a4e19842ce1332e6c7839cf0e110027d8/src/CalcManager/CEngine/scifunc.cpp)直接说明乘除使用 `rat / 100`，其他运算使用 `rat * (m_lastVal / 100)`。文章注明是在复述官方案例，未声称本地复测。 |
| REA 本地分析目标，但 Agent 会接收工具结果；模型提供方另有自己的数据策略。 | 隐私 / 已确认，高 | [REA 官方 README FAQ](https://github.com/morluto/rea#readme)对此有明确说明。文章提醒检查 Agent 与模型提供方配置，没有把“本地分析”误写为“结果绝不外传”。 |
| 静态分析不能单独证明某条代码在一次真实操作中执行；动态观察也不保证覆盖其他状态。 | 技术解释 / 合理概括，中高 | 这是静态与动态分析的通用边界说明，和文章中对 REA 工作流及结果限制的表述一致。它不是某个 REA 自动测试的量化结论，文章未给出覆盖率或准确率指标。 |
| JavaScript 搜索代码、输入边界列表和复现流程展示的是教程方法，不是 REA 对真实应用运行得到的结果。 | 归属 / 已确认，高 | 文章已明确把搜索代码标注为教学样例，并把计算器案例标注为官网公布的过程。 |

## 修正与限制

- 将 GitHub 星标约数从 `41.2 万` 改为 `41.3 万`，并同时写明核查页面显示 `412.6k`。
- 为 Node.js 版本要求补充直达 REA 官方 README 的链接。
- 本次没有本机安装 REA、执行 CLI、运行 Windows Calculator 或生成本地 REA 分析证据；文章已明确披露这一点。
- Astro 构建暂不可用：`pnpm build` 返回 `[ERROR] fetch failed`；直接运行本地 Astro CLI 在加载 `extend@3.0.2` 时因 `module is not defined` 退出。因此无法在本次核查中验证发布页面最终渲染。
