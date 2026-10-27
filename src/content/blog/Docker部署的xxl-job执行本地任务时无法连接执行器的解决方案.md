---
"title": "Docker部署的xxl-job执行本地任务时无法连接执行器的解决方案"
"link": "dockerbu-shu-de-xxl-jobzhi-xing-ben-di-ren-wu-shi-wu-fa-lian-jie-zhi-xing-qi-de-jie-jue-fang-an"
"author": "Yilena"
"date": "2025-08-09"
"description": "本文针对使用Docker部署xxl-job并调度宿主机本地任务时出现的“无法连接执行器”及连接超时问题，进行了深入的原因分析与解决。指出问题根源在于Docker默认创建的虚拟网卡导致跨网段不可达，使得自动注册的执行器IP无法被外部访问。文章提供了两种切实可行的解决方案：一是手动将执行器IP配置为宿主机的公网可路由地址；二是在启动Docker容器时通过`--network=host`参数指定网络命名空间，使容器共享宿主机网段，从而彻底解决网络隔离带来的调度失败问题。"
"cover": "https://i-blog.csdnimg.cn/direct/1239eb525ef64e3c86e7b5551fc5f150.png"
"tags":
  - "Docker"
  - "xxl-job"
  - "故障排查"
"categories":
  - "故障排查"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/149883341?spm=1001.2014.3001.5501"
---

## 一、问题简述




我是用部署的 xxl-job，然后用在了宿主机的本地项目上。




执行器我选的是自动，所以执行器的地址也就和本地项目上的有关：




```js
xxl-job:
  access-token: Yilena
  admin:
    addresses: http://192.168.xx.xx:9001/xxl-job-admin
  executor:
    application-name: test-executor
    log-retention-days: 30
    port: 19999
```




但是手动执行任务时一直失败：




![](https://i-blog.csdnimg.cn/direct/1239eb525ef64e3c86e7b5551fc5f150.png)




一番查阅后找到了具体原因：




时会给其创建一个虚拟网卡，该 IP 属于内部网段，是无法被外部服务所访问的。而执行器自动注册的话默认是到这个网段里面去寻找端口的，因跨网段不可达，所以返回连接超时报错。




## **二、解决方案**




### （一）手动更改




既然无法访问虚拟网卡，那我们直接手动配置为宿主机的 IP 就好了，宿主机的网段是公网可路由地址，可以被外部服务所访问到，可以在配置宿主机 IP 或者直接在 xxl-job 的后台网页上手动配置执行器的 IP。




```js
xxl-job:
  access-token: Yilena
  admin:
    addresses: http://192.168.xx.xx:9001/xxl-job-admin
  executor:
    ip: 192.168.xx.xx(宿主机IP)
    application-name: test-executor
    log-retention-days: 30
    port: 19999
```




### ![](https://i-blog.csdnimg.cn/direct/925ecf81c8044cf1a9092965d047bd5c.png)




### （二）更改 Docker 网段




在启动 Dokcer 容器时指定网络命名空间：**--network=host**




让该容器共享宿主机的网段即可。




> 
> 注意宿主机的 ip 如果设置了自动获取的话，那隔一段时间就会发生变化，请定期更改执行器的 ip！
> 




---



**如果还有其他问题，请在评论区告诉我！**

---
> 原文链接: [Docker 部署的 xxl-job 执行本地任务时无法连接执行器的解决方案](https://blog.csdn.net/2401_88959292/article/details/149883341?spm=1001.2014.3001.5501)
> 作者: Yilena
