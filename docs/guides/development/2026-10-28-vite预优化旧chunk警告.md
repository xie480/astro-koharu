# Vite 预优化旧 chunk 警告排查

## 1. 现象与影响

开发服务输出：

```text
[vite] The file does not exist at ".../node_modules/.vite/deps/client-ClCrJDOD.js"
which is in the optimize deps directory. The dependency might be incompatible with the dep optimizer.
```

请求一个已失效的预优化模块地址会失败，当前开发页面可能有依赖该模块的客户端代码加载失败。该路径属于 Vite 开发服务器的 `node_modules/.vite/deps` 缓存，不是生产构建产物，因此这条警告本身不表示线上页面也会失败。

## 2. 排查证据

- 当前 `node_modules/.vite/deps/_metadata.json` 登记的 `client` chunk 是 `client-DyUe96fv.js`，没有 `client-ClCrJDOD.js`。
- 在本机服务可连接的检查窗口中，旧 hash 地址返回 HTTP 404，新 hash 地址返回 HTTP 200。
- 同一检查窗口中，首页和 `/music` 页面返回 HTTP 200；首页 HTML 没有引用旧 hash。
- 后续再次检查时，`localhost:4321` 连接被拒绝，故不能据此确认开发服务持续稳定，也没有完成真实浏览器刷新验证。

## 3. 判断

**已确认：** 日志请求的旧 chunk 不存在于当前优化缓存；当前缓存登记了不同 hash 的 chunk。

**合理推断：** 浏览器标签页或 Vite 内存中的模块图仍引用了缓存重新生成前的旧 hash。刷新后页面会重新读取当前模块图。现有证据不足以判断某个依赖确实与预优化器不兼容，也没有依据把某个包加入 `optimizeDeps.exclude`。

## 4. 处理方案

本次没有改 Vite 配置或依赖版本，避免对错误组件做永久性排除。先对开发页面执行强制刷新（Windows：`Ctrl+Shift+R`）。若在新页面加载后仍重复出现同一警告，再停止开发服务器、清理 `node_modules/.vite` 缓存并重启；若仍复现，需结合触发页面和失败模块的完整请求链定位具体依赖。

## 5. 验证边界

缓存元数据和 chunk HTTP 状态已核对；由于开发服务后续无法连接，强制刷新后的页面交互和警告是否复现暂未验证。
