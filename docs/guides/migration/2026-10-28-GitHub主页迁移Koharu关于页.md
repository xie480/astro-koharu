# GitHub 个人主页内容迁移到 Koharu 关于页

## 1. 背景与目标

将 `E:\YilenaCode\xie480` 中 GitHub Profile README 的可见内容迁入 Koharu 的「关于」页，并把原先指向博客的主要按钮改为指向 GitHub 个人主页。范围仅涉及 Markdown 页面与公开展示素材，不改 Koharu 组件架构、全局配色或主题框架。

## 2. 来源与迁移范围

来源为 `xie480/xie480` 仓库的 `README.md` 和 `assets/`。本次迁入：

- Yilena 封面、邮箱按钮、Insights / Activity 动效标题及其减少动态效果静态图、签名图、樱花河 GIF。
- 账号概览、贡献趋势、连续贡献、语言分布、基础指标和提交时段统计卡片；保留已有桌面 / 手机组合图。
- GitHub 贡献蛇的亮色和暗色 SVG 快照。
- 原 README 计数器 URL 与参数。
- Stats 组件附带的两份 MIT 许可证。

GitHub CTA 使用与旧按钮统一视觉的新 SVG；原 `Blog` 按钮的博客链接和文案不再迁入。空的 Metrics 标记区没有实际内容，因此不生成占位卡片。GitHub README 的工作流、生成脚本、`theme.css` 和动画关键帧属于构建 / 维护工具，不是页面展示内容，本次不迁入。

## 3. 页面组织与实现

在 `src/pages/about.md` 顶部加入封面、GitHub 主页按钮、邮箱按钮和原计数器；保留 Koharu 已有的个人档案正文；在正文后加入 GitHub Insights、Activity、签名图、樱花河动画和结束语。统计图片区按原 README 的 `max-width: 600px` 断点切换手机 SVG；章节标题在 `prefers-reduced-motion: reduce` 下改用静态 SVG。

素材复制到 `public/img/github-profile/`，保持源文件原字节，不重编码封面、统计 SVG 和 GIF。贡献蛇从旧 README 使用的公开 `output` 分支地址下载亮色 / 暗色版本，作为本地快照。Stats 授权文本与资产一起保存。

原博客按钮迁为“GitHub 个人主页 · xie480”，链接地址为 `https://github.com/xie480`。`config/site.yaml` 中的 `site.url` 仍指向实际博客域名 `https://blog.yilena.cloud`；该字段用于 RSS、站点地图和 SEO，不是 README 按钮目标，因此保持不变。

## 4. 风险与影响

- 统计 SVG 和贡献蛇现在是本地快照。旧仓库的 GitHub Actions 不会自动更新 Koharu 里的副本；若需要持续刷新，后续应明确配置同步机制。
- GitHub 个人主页并未直接请求计数器源站：当前 README HTML 将原始地址改写为 `camo.githubusercontent.com` 图片代理。当前环境请求计数器源站返回 HTTP 403，而 GitHub Camo 代理返回 HTTP 200、`image/svg+xml`；关于页现复用该代理展示图片，点击图片仍打开原始计数器地址。代理由 GitHub 提供，其缓存和可用性不由 Koharu 控制；不把 `num=3194927054` 解释为真实访问量。
- 樱花河 GIF 保持原始 6,454,538 字节 / 128 帧；About 页对其使用 lazy loading，但首次进入附近区域仍会下载约 6.45 MB。
- 页面沿用 Koharu 主题样式；Profile README 的 GitHub Actions、脚本和页面级样式没有进入站点运行时。

## 5. 验证

迁移后的 19 个本地源文件逐项与旧仓库对比 SHA-256，全部相同；两张贡献蛇来自旧 README 的公开输出地址。16 个本地 SVG 均解析为有效 XML。`pnpm check` 通过（0 errors、0 warnings、2 个既有弃用提示），最终 `pnpm build` 通过并生成 651 个页面。

本地 `http://localhost:4321/about` 在 1440×1000 与 390×844 视口检查。统计图片在桌面命中 `profile-details.svg` / `grid.svg`，在手机命中 `profile-mobile.svg` / `grid-mobile.svg`；封面、按钮、统计、贡献蛇、签名和樱花河图片均成功加载。文档宽度分别为 1432px 和 382px，没有超过各自视口宽度。深色和浅色主题下均查看了页面；章节标题支持减少动态效果时选择静态 SVG。计数器源站在当前环境返回 403，GitHub 个人主页当前使用的 Camo URL 返回 200、内容类型为 SVG；本轮本地浏览器确认关于页图片加载完成，自然尺寸为 450×100，图片点击仍跳转至源计数器地址。

全仓 `pnpm lint:fix` 退出码为 0，但 Biome 因当前 Windows 工作区 CRLF 与其 LF 预期的差异改写了 718 个既有文件，且产生无关图片删除标记；这些格式改动已恢复。恢复后只读 `pnpm lint` 仍报告相同的仓库级换行格式问题。全仓 lint 因此不能判定通过；本次没有把无关格式变化带入迁移，也没有运行自动化测试。

## 6. 最终结果

关于页保留原个人档案，并加入 GitHub Profile README 的可见封面、按钮、统计、贡献活动和收尾素材。主按钮现在打开 GitHub 个人主页；博客的站点 URL 配置保持正确。自动统计同步和外部计数器可用性留作后续事项。
