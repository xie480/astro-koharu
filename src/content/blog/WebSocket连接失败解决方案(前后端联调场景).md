---
"title": "WebSocket连接失败解决方案(前后端联调场景)"
"link": "websocketlian-jie-shi-bai-jie-jue-fang-an-qian-hou-duan-lian-diao-chang-jing"
"author": "Yilena"
"date": "2025-07-07"
"description": "本文针对前后端联调场景中常见的WebSocket连接失败问题提供了实用的排查与解决方案。当使用Apifox等工具可正常连接，而前端代码请求失败时，文章指出首要原因是前端连接地址未包含项目上下文路径，需确保前后端路径格式严格一致（如`ws://localhost:80/{项目名称}/webSocket/1`）。此外，文章还特别提醒开发者注意Spring Boot版本差异导致的依赖包冲突问题：Spring Boot 3.x及以上版本需使用`jakarta.websocket`，而2.x及以下版本则对应`javax.websocket`，为解决顽固的连接异常提供了关键思路。"
"tags":
  - "WebSocket"
  - "故障排查"
  - "前后端联调"
"categories":
  - "故障排查"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/147055264?spm=1001.2014.3001.5501"
---

**问题现象:**




- 使用 Apifox 等接口测试工具可正常建立 WebSocket 连接
- 前端代码发起 WebSocket 连接请求失败




**解决方案:**




在的  连接地址中加入项目上下文路径。




*错误示例:* `ws://localhost:80/webSocket/1`




*正确格式:* `ws://localhost:80/{项目名称}/webSocket/1` (请将 {名称} 替换为实际部署的上下文路径)




然后确保 WebSocket 接口路径同样包含项目上下文路径，保持前后端路径一致性。









如果还解决不了的并且搜索了很多都未能解决的，请检查是否是后端版本的问题！

 




- **Spring Boot 3.x 及以上版本**需使用`jakarta.websocket`相关依赖包
- **Spring Boot 2.x 及以下版本**需使用`javax.websocket`相关依赖包

---
> 原文链接: [WebSocket 连接失败解决方案(前后端联调场景)](https://blog.csdn.net/2401_88959292/article/details/147055264?spm=1001.2014.3001.5501)
> 作者: Yilena
