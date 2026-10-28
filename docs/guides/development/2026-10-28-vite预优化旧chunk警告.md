# Vite 预优化旧 chunk 警告排查

## 1. 现象与影响

开发服务输出：

```text
[vite] The file does not exist at ".../node_modules/.vite/deps/client-ClCrJDOD.js"
which is in the optimize deps directory. The dependency might be incompatible with the dep optimizer.
```

请求一个已失效的预优化模块地址会失败，当前开发页面可能有依赖该模块的客户端代码加载失败。该路径属于 Vite 开发服务器的 `node_modules/.vite/deps` 缓存，不是生产构建产物，因此这条警告本身不表示线上页面也会失败。

本次追加排查中，导航悬停指示、右下角全局工具栏、文章页随机文章和全局歌单同时失效。这些位置均依赖客户端交互或 React hydration，符合共享客户端 chunk 加载失败的表现。

## 2. 排查证据

- 当前 `node_modules/.vite/deps/_metadata.json` 登记的 `client` chunk 是 `client-DyUe96fv.js`，没有 `client-ClCrJDOD.js`。
- 在本机服务可连接的检查窗口中，旧 hash 地址返回 HTTP 404，新 hash 地址返回 HTTP 200。
- 同一检查窗口中，首页和 `/music` 页面返回 HTTP 200；首页 HTML 没有引用旧 hash。
- 后续检查时，`localhost:4321` 已无监听进程；重新启动开发服务后首页返回 HTTP 200。
- 在新建的独立浏览器会话中，页面加载了当前 chunk `client-DyUe96fv.js`，没有出现 Vite error overlay。首页可见随机文章列表；悬停“关于”后导航指示器更新为 `translate: 490.031px`。
- 点击“背景音乐”后，播放器处于 `bgm-panel-ready` 状态，显示 3 个歌单分组和 269 首歌曲，没有进入空列表或错误状态。
- 代码路径确认：导航指示器由 `Navigator` React 组件响应指针事件；随机文章组件在 hydration 前通过 `useIsMounted()` 返回空列表；全局播放器依赖 React 状态加载面板和歌单。因此同一 React 客户端 chunk 失效可以同时解释这几处现象。

## 3. 判断

**已确认：** 日志请求的旧 chunk 不存在于当前优化缓存；当前缓存登记了不同 hash 的 chunk。

**合理推断：** 旧浏览器标签页仍引用缓存重新生成前的旧 hash，导致 React islands 未完成 hydration。新会话使用当前 hash 后相关交互恢复。现有证据不足以判断某个依赖确实与预优化器不兼容，也没有依据把某个包加入 `optimizeDeps.exclude`。

## 4. 处理方案

本次已重新启动本地开发服务，并用独立新会话验证交互恢复。对仍停留在旧页面的原浏览器标签执行强制刷新（Windows：`Ctrl+Shift+R`），使其重新请求当前优化模块。未改 Vite 配置或依赖版本，也未清理缓存：当前缓存登记的 chunk 可正常加载，强行排除 `@astrojs/react` 或删除缓存没有证据支持，且可能造成额外重优化。

## 5. 验证边界

缓存元数据、旧/新 chunk 状态及新会话中的首页、导航 hover、随机文章和全局歌单已验证。新会话验证不等于操作了用户原有 Chrome 标签页；该标签页需要执行一次强制刷新。强刷后是否仍复现尚待用户原标签验证。该问题目前限定为开发服务器的旧 hash/客户端缓存问题，生产构建未在本次重新验证。
