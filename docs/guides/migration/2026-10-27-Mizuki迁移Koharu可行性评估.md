# Mizuki → Koharu 数据迁移实施记录

更新日期：2026-10-27。本文件记录实际迁移结果。第 1～6 节保留初次数据迁移及封面修复的历史记录；用户随后提出的完整个性化和新增模块要求、当前实现与验证见第 7 节。

## 1. 范围与数据来源

按用户确认，仅迁移文章、封面引用、头像、背景图、favicon、时间线、GitHub 链接和项目数据；不迁移动态/日记、友链、旧站 UI、Live2D 或其它未配置功能。不改 Koharu 配色。项目与时间线作为数据文件迁入，暂不新增展示页面或导航。

源版本为 Mizuki Git HEAD **faedd425f5df3896a09117a92faa623c17f7fd09**。源工作区原有 580 个 Git 跟踪文件处于删除状态。本次只从 Git HEAD 读取，未恢复或改写 Mizuki。未发现独立的被忽略 content 仓库目录，故以该 Git HEAD 为当前迁移基准；若另有更新内容快照，本次不包含。

目标 Koharu 原有 37 篇多语言示例文章在删除前已核实为干净的受跟踪文件，并在本机迁移快照中备份。源文件、目标样例归档、转换暂存文件均留在本机快照目录。项目内 **src/data/mizuki/migration-manifest.json** 记录源提交、文章与资源映射及哈希。

## 2. 迁移结果

### 2.1 文章与封面

58 篇文章导入 **src/content/blog/**，替换了 37 篇示例文章。frontmatter 映射：published/date/pubDate → date；image → cover；category → categories 单元素数组；pinned → sticky。title、description、tags、author、draft、licenseName、sourceLink 等字段保留；每篇生成稳定 link，映射见 manifest。

文章数量与分类数量：技术笔记 31、业务拆解 15、故障排查 7、杂记 5。一对正文完全相同的 JDK25 文章均保留。48 篇文章仍引用原有 CSDN 外链封面，10 篇没有封面。正文 220 次图片引用、219 个唯一 URL 均未重写；外链可用性未逐条在线验证。没有创建旧 URL 的 301 重定向，因为这会涉及路由或部署规则，超出数据迁移范围。

### 2.2 静态资源与站点数据

- 源头像文件扩展名为 webp，实际格式为 JPEG。按真实格式原字节保存为 **public/img/mizuki/avatar.jpg**，并更新 **config/site.yaml** 的 avatar 和 defaultOgImage。
- 复制旧配置引用的 12 张背景原图至 **public/img/mizuki/backgrounds/**。以旧配置第一张 **6.png** 生成 Koharu 现有头图资源的 WebP 变体：800×448、1200×672、1600×896、1928×1080。只替换现有图片资源，不改头图组件或布局，其它背景保留为资源、不启用轮播。
- 6 张去重后的项目图原样复制到 **public/img/mizuki/projects/**，项目数据中的图片路径作对应映射。
- favicon 保留此前应用户单独要求由 Yilena 字标制作的粉色 Y 图标 **public/favicon.ico**；本轮迁移没有修改其实现代码。
- **config/site.yaml** 中的 GitHub 地址更新为 **https://github.com/xie480**，并加入 4 个源分类对应的 Koharu 分类映射。
- 8 条项目迁入 **src/data/mizuki/projects.json**；20 条时间线迁入 **src/data/mizuki/timeline.json**。字段内容逐条保留，项目图路径除外。没有添加展示代码，因此 JSON 目前不会自动显示在页面上。

## 3. 明确未迁移的内容

未迁移动态/日记和友链；未迁入旧站布局、配色、组件、交互及 Live2D；未清理 Koharu 未被点名的示例导航和其它示例配置。文章外链图片未本地化，旧文章 URL 重定向未建立。后续需要展示项目/时间线、旧地址跳转或清理示例入口时，应另行评估应用层改动。

## 4. 完整性核验与结果

- 58/58 篇文章的源/目标正文哈希及正文内容一致；标题、作者、日期、link、置顶/草稿、分类、标签、封面、许可证、来源字段逐项核对通过。
- manifest 中 23 项资源的 SHA-256 核对通过；直接复制资源与源文件哈希一致。头像格式确认是 JPEG；四个头图变体尺寸符合目标资源。
- 8 条项目和 20 条时间线与源记录逐项比对；图片路径映射以外字段一致。
- YAML 解析成功；头像、默认 OG、GitHub、分类映射和 LQIP 目标值核对通过。
- 本地 Astro 服务中，首页以及有封面和无封面的抽查文章均返回 HTTP 200，响应包含对应标题。
- git diff --check 通过。Mizuki 源工作区仍为原有 580 项删除状态，本次未写入源工作区。
- Astro check 在 Node 22.13.1 和 bundled Node 24.22.1 下均在加载 Astro 配置时失败，错误位置为依赖 extend/index.js，提示 module is not defined。无法据此确认完整类型检查或生产构建成功；生产构建未执行。

### OG 缓存完整性例外

本地页面请求触发开发服务写入 **.cache/og-data.json**，新增外链缓存并更新了缓存时间戳。检查后已移除本次页面请求新增的条目并恢复时间戳，但工作区没有迁移前备份。恢复后的内容与仓库跟踪内容一致；无法证明它与迁移前记下的 SHA-256 **DFBF2E7BBB1DE6A2C6E41984A99507635EAE68D19A29057108F2FC3C440F944A** 完全相同，因此原工作区差异可能未能保留。这是本轮唯一已知的文件完整性例外，须如实说明；其它迁移文件均按清单核对通过。

## 5. 回滚与交付状态

本机迁移快照保留 Mizuki 迁移源包、Koharu 迁移前样例归档、源提取目录和转换暂存目录；manifest 提供逐项核验映射。需要回滚时可据此恢复文章、资源与配置。不要用快照覆盖 OG 缓存，因为未保存该文件的迁移前版本。

本轮未创建 Git commit、未部署。迁移后的示例文章删除和新内容均保留在当前工作区，供审阅。

## 6. 文章卡片封面热链修复

### 现象与判断

用户反馈首页文章卡片封面不显示。检查迁移文章后确认 frontmatter 中存在合法的 CSDN cover URL，Koharu 的 ResponsiveImage 对远程 URL 会回退为普通 img。浏览器中带站点来源显示时，多张卡片图为空；同一 CSDN 图片直接访问可以加载。结合两种表现，判断是源站按 Referer 拦截站外图片请求，属于热链限制，而非封面字段转换丢失。

附件日志中的 **#4.MQ** 错误来自正文独立锚点被链接预览插件按完整 URL 解析，与封面资源请求不是同一条链路，本修复未改动该功能。

### 修改与验证

在 **src/components/post/PostItemCard.astro** 的封面 ResponsiveImage 上设置 **referrerpolicy="no-referrer"**，避免请求 CSDN 封面时发送 Koharu 页面来源；图片地址、封面数据和卡片布局保持不变。

在用户提供的本地页面重新加载后，原先空白的 Vector Database、LangGraph 等卡片封面重新显示；直接访问 CSDN 原图也成功。对修改文件运行 Biome lint，1 个文件通过；git diff --check 通过。OG 缓存在调试开始前备份，验证后哈希一致，没有因本次修复继续产生缓存变化。

### 边界

该修改解决当前复现的 CSDN Referer 热链问题。被删除、失效或源站完全不可访问的图片仍需逐个确认；这些图片不会由 no-referrer 自动恢复。

## 7. 完整个性化与功能接入（2026-10-27）

用户随后授权 UI 与模块改造，当前阶段以本节为准，前六节保留初次迁移的历史范围与证据。本轮继续使用 Astro 7、React、Tailwind 及 Koharu 的颜色、布局 token，没有引入新的 UI 框架或数据库。

### 7.1 需求与实现对应

| 需求 | 实际处理 |
| --- | --- |
| 全部文章退出置顶 | 58 篇 sticky 均改为 false，进入普通文章列表并使用现有分页；正文不变，manifest 的目标文件哈希同步更新 |
| Yilena Logo | 使用用户此前提供的 2172×724 透明 PNG 原文件，桌面与手机共用 public/img/yilena-logo.png；favicon 继续保留此前 Y 图标 |
| 旧背景轮播 | 按旧配置 6、9、5、4、8、7、11、10、3、12、1、2 的顺序轮播，间隔 3500ms；12 张原图仍保留，新增 800/1920 两档 WebP 共 24 个文件，合计约 4.07 MB |
| 旧标题与打字机 | 使用“夢の終着駅”、旧 Memory 副标题及原 5 句日文；100ms 输入、20ms 删除、2000ms 停留。支持暂停、减少动效静态回退和页面切换清理 |
| 个人资料 | Yilena 名称、旧日文简介、80ms 一次性简介打字、原头像、GitHub 和源 About 中的邮箱。关于页正文也从旧 Git 源恢复 |
| 文章分类 | 分类映射与精选分类均为技术笔记 31、业务拆解 15、故障排查 7、杂记 5；删除示例分类映射。无专属封面的 10 篇文章使用旧背景图池作为默认图 |
| 文章图片 | no-referrer 同时覆盖封面、正文普通/链接/已有 figure 图片及灯箱；保留显式策略。片段锚点和相对链接不再进入 OG 预览请求 |
| Astro 调试栏 | astro.config.mjs 的 devToolbar.enabled=false |
| 取消友链、周刊、追番 | 删除友链/追番根页面与 locale 镜像，移除导航及 Bangumi 配置，featuredSeries=[] 停用周刊生成 |
| 时间线与项目 | /timeline 展示原 20 条事件；/projects 展示原 8 个项目，保留 showImage=false，支持分类/状态筛选和 URL 状态 |
| 私藏推荐 | /recommendations 提供分类、搜索、推荐顺序/评分/最近收录排序；条目支持可选图片、链接、作者、描述、0～10 个人评分、日期、标签；真实数据仍为空，没有编造推荐 |
| 页尾 | 恢复“本站由 ♥ 与梦想全力驱动中……”、Yilena 版权、RSS/Atom/Sitemap；技术署名准确标明 Astro 与 Koharu，保留迁自 Mizuki 的来源链接 |

### 7.2 模块与配置边界

- 个人品牌动效数据位于 config/site.yaml 的 identity，由 src/lib/config/identity.ts 纯函数归一化，经 src/lib/config/site.ts 统一组装。
- 轮播只保留两个显示缓冲图；下一张解码成功后切换，失败时继续显示当前图。暂停、悬停、键盘焦点、后台页面和减少动效均会停止自动切换。
- TypewriterText 作为独立组件复用于横幅和简介；屏幕阅读器读取完整静态文案，不跟随逐字播报。
- 项目/时间线使用 src/data/mizuki/ 的原数据。推荐内容维护在 src/data/recommendations.json；字段示例与维护规则见 src/features/recommendations/README.md，示例明确标为虚构且不进入页面。
- 新增 /atom.xml 及 locale 镜像，返回真实 Atom 1.0 XML，使用与 RSS 相同的文章 permalink 和加密内容保护。
- 站点 URL 采用此前实际旧站地址 https://blog.yilena.cloud，替换 Koharu 示例域名；关闭了原本指向 stats.example.com 的示例统计配置。
- 架构变动限定为页面级静态模块与品牌配置，已有内容集合、文章路由和主题技术栈保持。

### 7.3 设计参考与取舍

私藏推荐参考 [NeoDB 官方仓库](https://github.com/neodb-social/neodb) 的跨媒介收藏与个人评价、[Karakeep 官方仓库](https://github.com/karakeep-app/karakeep) 的收藏分类及搜索方式，只借鉴产品组织，不复制其代码。采用静态 JSON 与 React 筛选岛，适合个人博客维护，避免引入账户和数据库。

UI 按 ui-ux-pro-max 的可访问性、移动端和动效控制规则实现，并依据 [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md) 审查。视觉以用户提供的旧站素材和当前 Koharu 主题为约束，不新增随机配色或营销式版式。

### 7.4 已执行验证与环境问题

- 第一轮全项目 Astro check：653 个文件，0 errors、0 warnings、2 个既有 execCommand 弃用提示。
- 第一轮生产 Astro build 完成：651 个页面，生成 sitemap 和 Pagefind 索引；仅有现有大分块体积提示。
- 配置归一化、Atom、推荐筛选和图片/锚点纯回归合计 21/21 通过；额外轮播/打字状态回归 8/8 通过，原链接卡片回归亦通过。
- 本地桌面与 390px 手机视口：文章列表、资料、分类、项目、时间线、私藏推荐均无横向溢出；项目筛选为 2/8 后浏览器返回恢复 8/8；推荐评分排序写入 URL 且返回恢复。
- JUC 正文插图与灯箱实际加载成功，两处请求均为 no-referrer。正文仍采用源站外链，未逐一证明全部远程图片永久可用。
- 原沙箱内 Astro 命令的 extend/module is not defined 报错，在获准的本机执行环境下消失。构建/检查并行使用了 Vite 缓存后，旧开发进程出现预构建 @iconify/react 504，导致 React 岛初始化失败；确认监听 4321 的进程归属后已重启，随后推荐交互与灯箱恢复。开发服务继续在 localhost:4321 提供预览。
- pnpm 包装器为 11.25.0，直接运行脚本触发其依赖安装检查并因无交互终端退出，未同意清空 node_modules；改用已安装的 Biome/Astro/tsx 入口执行对应检查。整库只读 Biome 检查发现大量既有 CRLF 格式问题，未批量格式化无关文件；本轮相关文件定向自动修复与检查通过。
- 最终复查 Astro check 仍为 653 个文件、0 errors、0 warnings、2 个既有提示；最终生产构建成功，651 页，用时 36.42 秒，Pagefind 索引 655 页。推荐、动效、配置、Atom、图片和链接回归共 43/43 通过。
- Knip 已执行：compact reporter 自身发生参数类型错误；Node 24 下 JSON reporter 能输出结果，报告 95 个未使用文件、64 组问题，包含已关闭的 Bangumi/友链组件、可选 Moments 和浏览器测试文件，也把由 Markdown frontmatter 引用的 PageLayout 标为未使用。未据此自动删除主题基础代码。
- 完整性复核：58/58 文章正文与本轮改造前逐字一致，所有文章非置顶；48 个资源目标 SHA-256 通过，Logo 与附件原字节一致；原 48 个文章封面 URL 不变。8 项目、20 时间线、4 分类及空推荐数据核对通过。源 Mizuki 仍只有原先的 580 个删除状态，没有新增修改。
- 当前阶段开始前已备份 .cache/og-data.json 和文章/config 到本机 before-personalization 快照。收尾已恢复缓存且 SHA-256 与本轮开始时一致：FAE33E8C6DE14DD200ABDC4963C0AFEE2E5DC623341B0D65E5927A4B6A5CF1B4。初次迁移的历史缓存例外仍按第 4 节记录，不把本轮备份描述成初次迁移前的原文件。
- 最终桌面预览中推荐岛已完成 hydration，最近收录排序写入 sort=newest；首页无置顶区和 Astro 调试栏。390px 手机菜单在等待其 client:media 初始化后正常展开，菜单含时间线/项目/私藏推荐而无已取消的三项。RSS、Atom、Sitemap 构建产物均通过 XML 解析。

## 8. 个人页面与动态页尾优化（2026-10-27）

### 8.1 目标与确认事实

用户新增七项 UI 优化要求。本节接续第 7 节，允许修改页面展示，但不改变文章、原项目和时间线数据以及现有 Astro / React / Tailwind 架构。

- 搜索框已有普通状态的边框和阴影覆盖；浏览器实测定位为 Pagefind 后注入的 :focus-visible 规则，以 0 0 0 2px 蓝色 box-shadow 覆盖了普通状态。焦点态单独覆盖阴影与 outline，以 2px 深品牌色下划线表示输入焦点，保留其他控件的键盘焦点。
- 时间线成果按条数决定是否展开，且列表没有显式 list-style，在全局 reset 下看不到圆点。将统一默认展开、显示项目符号。
- 项目网格按整行占高，即便卡片本身高度自然，下一行仍从最高卡片之后开始。将采用保持 DOM 顺序的测量式 masonry，手机与无脚本回退自然高度网格。
- 旧站 Git 源 src/FooterConfig.html 确认包含 4 秒文字流光、1.5 秒心跳和浮动樱花；恢复这些表现，并增加暂停及减少动效支持。按新要求移除界面的技术署名行，源码许可证不变。
- 推荐分类为小说、漫画、番剧、开源项目、其他；每类加入一条 demo 数据和明确的演示评分标记，不作为用户真实推荐或评价。

### 8.2 实施与验证

| 模块 | 实际修改与取舍 |
| --- | --- |
| 搜索 | src/styles/components/pagefind.css 的焦点规则增加足够 specificity，覆盖 Pagefind 后注入的蓝色阴影；焦点使用 2px 深品牌色下划线，不影响其他按钮和链接 |
| 页尾 | Footer.astro 独立 animated-footer 元素，流光 4s、心跳 1.5s、樱花 6/8s；离屏、后台、手动暂停及 reduced-motion 停止动效，换页释放监听；44px 暂停按钮，较深链接色；去掉技术署名行 |
| 时间线 | Timeline.astro + timeline-motion.ts；17 个有成果的事件区块全部 open，显式 disc 列表；20 条事件按项目/学习/里程碑等使用不同表面、边框、大图标和文字类型；移除地点渲染，保留源 JSON 字段；一次性滚动入场、时间轨进度和当前年份状态 |
| 项目 | ProjectCatalog.astro + project-catalog.ts/.css；封面上浮分类/状态、标题精选标记及独立操作区；桌面测量真实高度写入 1px 虚拟网格行跨度，保留 DOM 顺序；图片、字体、筛选、返回和 resize 重新计算；手机单列、无 JS 自然高度回退；原 8 条数据及 showImage=false 均保留 |
| 私藏推荐 | 小说《小王子》、漫画《SPY×FAMILY》、番剧《葬送的芙莉莲》、开源项目 Astro 和虚构“其他”各一条 demo:true；4 张本地 SVG 明确为示例封面，“其他”展示无图片/链接/评分；评分均标注“演示评分”，缺省 demo:false，维护说明在 src/features/recommendations/README.md |

### 8.3 已执行验证

- Astro check：655 个文件、0 errors、0 warnings，保留 2 个既有 execCommand 提示。
- 推荐模型、全站 motion-level 与旧轮播/打字回归合计 17/17；页尾另有 6/6 生命周期回归，覆盖可见性、手动暂停、减少动效、重连、Astro 换页与陈旧 observer 回调。
- 本轮相关 14 个源码/数据文件定向 Biome check --write 通过；页尾新增测试另行通过 Biome。pnpm 包装器和整库 CRLF 限制沿用第 7.4 节，未批量格式化无关文件。
- 桌面 1280px 与手机 390px 实测搜索输入焦点：box-shadow:none、outline:none、2px 品牌色下划线；搜索返回结果正常，Escape 关闭正常。
- 桌面项目卡片实测 Luna 高 721px、Werewolf 高 563px；Werewolf 下方 Nyami 从 y=1133 开始，与其底部相隔约 25px；无需等待 Luna 结束。分类筛选 8→2，浏览器返回恢复 8；手机单列自然高度，切回桌面恢复独立列布局，无横向溢出。
- 时间线 20 条、成果区 17 个、闭合成果区 0 个，computed list-style 为 disc，地点标签 0 个；年份导航正确定位，时间轨随滚动变化（实际读取 scaleY 变化），手机长文本不溢出。
- 五类推荐按钮逐一实测均为 1 条，4 张本地图片均加载；评分排序为 9.5→9.2→9.0→8.7→未评分，搜索无结果与重置恢复 5 条正常；手机单列无溢出。
- 页尾实际读取动画为 running，文字 4s、心跳 1.5s、樱花 6/8s；点击暂停后变 paused，继续后恢复；DOM 中不含 Powered by。减少动效与换页清理已做运行级回归；未声称已通过浏览器系统级 OS 偏好模拟。
- 完整性：58 篇文章、48 个资源和 projects/timeline 两组数据，全部目标 SHA-256 与 migration-manifest 一致；本轮没有改动它们。新增推荐示例独立于原迁移数据。
- 浏览器仍观察到原 ThemeToggle title 与 MenuIcon 初始滚动 class 的 hydration 提示；对应组件本轮未改。其余本轮页面功能按上述实际结果记录，不把这些提示描述为已消除。
- 最终生产构建完成：651 页，用时 33.43s，Pagefind 索引 655 页；最终 15 个相关源码/数据/测试文件 Biome 复查通过。旧 Mizuki worktree 仍为原 580 个删除状态，未新增修改。开发服务在构建结束后重新启动，避免复用构建阶段的 Vite 预构建状态。
- 收尾重新确认 localhost:4321/projects 返回 200，Navigator 已 hydration，搜索无蓝色阴影、项目 masonry 已初始化且共 8 条；缓存恢复为本阶段开始前备份，SHA-256 为 FAE33E8C6DE14DD200ABDC4963C0AFEE2E5DC623341B0D65E5927A4B6A5CF1B4，git diff --check 通过。

## 9. 新增 Velora 与 MemGuardian 项目（2026-10-28）

### 9.1 内容变更

- 项目数据从 8 条增加到 10 条，使用既有 `projects.json` 字段及项目卡片，不修改 UI 组件。
- Velora 采用用户提供的简介和 GitHub 链接，使用附件截图作为项目图，保存至 `public/img/mizuki/projects/velora.png`。
- MemGuardian 采用用户提供的简介和 GitHub 链接，不设置图片，因此沿用现有无图卡片表现。
- 两个项目归入“桌面应用”。Velora 技术标签依据用户描述及本机项目依赖清单；MemGuardian 使用 Python、Windows 与任务计划程序标签。
- `startDate` 用对应本机仓库的首次 Git 提交日期满足现有排序字段，不代表项目公开或上线日期。新增时两个项目暂记为“进行中”；后续状态调整见 9.3。

### 9.2 完整性与验证

- 附件复制前后 SHA-256 一致：`93E1AB0FFFE01E53D4CFE3F2BB46167F84C1A61EE0BBC9A6F339F8B4ECE83760`。
- 项目 JSON 的 Biome 检查通过，PowerShell JSON 解析确认 10 条记录且 ID 唯一；迁移文档的 lint-md 检查通过，`git diff --check` 通过。
- 未运行测试套件或浏览器截图核验；本次仅变更项目数据、图片和迁移记录，没有改动 UI 代码。

### 9.3 项目状态与封面调整（2026-10-28）

- 根据用户要求，9 个非 Velora 项目状态均设为“已完成”，仅 Velora 保持“进行中”。
- Luna 和 Nyami 的项目数据分别改用 `luna-cover.png`、`nyami-cover.png`；附件以 PNG 原样复制，SHA-256 与源附件一致：Luna `B3E803CA8A71AE9A3B505FC82FBFAF096D839AC2F43FB9F579DFF88889A8F4EF`，Nyami `6DA725DBA2C4FD11A91764D2456D395BAEF0DFF49001F83EA536436E5C9D6A3F`。
- 原始迁移封面文件保留，`migration-manifest.json` 不变，避免破坏初次迁移的资源校验记录。

## 10. 新增 2026 年求职与项目时间线（2026-10-28）

### 10.1 内容与展示约定

- 新增 12 条记录：4 月 15 日清华大学 AI 实验室 Java 面试；6 月 27 日虎牙 AI 算法岗面试；7 月 24–29 日格物致新、道一云面试与第一段实习开始；9 月 27 日至 10 月 20 日 Nyami v2.0 升级；10 月 3 日 MemGuardian 改良；10 月 9–26 日腾讯 CSIG Agent 开发实习岗面试流程。
- 面试与实习事件使用 `work` 类型，Nyami、MemGuardian 更新使用 `project` 类型；组织、职位、OC 结果、个人复盘和项目链接按现有时间线字段呈现。
- 继续沿用页面现有的最新日期优先排序；没有改动时间线组件或排序逻辑。

### 10.2 验证

- 时间线 JSON 的 Biome 检查通过；解析后 32 条记录 ID 均唯一，新增 12 条日期与用户给定时间一致。
- 本次没有改动 UI 代码；未运行测试套件或浏览器核验。


## 11. 首页背景轮播替换为本地壁纸（2026-10-28）

- 从用户提供的壁纸目录读取全部 210 张图片（195 张 PNG、15 张 JPG）；Sharp 元数据读取未发现损坏文件。源目录中的原图保持不变。
- 每张图片按 800px 与 1920px 两档转为 WebP，写入 `public/img/home-carousel/`；共生成 420 张文件，合计 55.32 MiB。文件按中文文件名排序后使用连续编号，配置引用全部 210 张 1920px 版本。
- 首页继续使用既有 3500ms 轮播间隔与现有响应式加载逻辑。旧迁移轮播资源、`defaultCoverList` 和 UI 组件均未修改。
- 配置解析核对确认 210 条轮播引用、420 个派生文件全部存在且均为有效 WebP；`git diff --check` 与 `lint-md` 通过。桌面视口确认 `wallpaper-025-1920.webp` 正常显示并可切换，390×844 移动视口确认 `wallpaper-046-800.webp` 正常加载。
- `astro check` 未完成：加载 Astro 配置时，`extend` 依赖在 Vite module runner 中报 `module is not defined`；本轮未获得 Astro 类型检查或生产构建结果。

## 12. 每次访问随机排列首页壁纸（2026-10-28）

- 轮播组件每次连接时复制配置中的壁纸列表并执行 Fisher–Yates 洗牌；当前访问的首图和后续播放顺序都来自同一份随机排列，图片不会重复抽取或遗漏。
- 随机首图先在第二个缓冲图中加载并完成解码，再交叉淡入；失败时继续显示服务端首图。自动播放、暂停、减少动效和现有轮播间隔沿用原行为。
- 组件重新连接时重置缓冲区索引并重新洗牌，避免 Astro 页面切换后逻辑序号与画面状态错位。
- 本地浏览器连续重载两次，随机首图分别为 `wallpaper-076-800.webp` 和 `wallpaper-209-800.webp`；两次均处于 `1 / 210`，图片自然宽度有效且暂停控件正常。
- `pnpm check` 检查 656 个文件，0 错误、0 警告、2 条 `document.execCommand` 弃用提示。`pnpm build` 成功生成 651 个页面；Vite 提示存在超过 500 kB 的 chunk，构建仍完成。
