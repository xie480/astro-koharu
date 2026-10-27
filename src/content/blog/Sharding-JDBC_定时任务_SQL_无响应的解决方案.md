---
"title": "Sharding-JDBC 定时任务 SQL 无响应的解决方案"
"link": "sharding-jdbc_ding-shi-ren-wu_sql_wu-xiang-ying-de-jie-jue-fang-an"
"author": "Yilena"
"date": "2025-07-07"
"description": "本文针对在使用Sharding-JDBC进行分库分表时，定时任务中SQL执行无响应且无明显报错的问题进行了深度排查与解决。通过调整日志级别，发现问题根源在于Spring定时任务默认使用的`ScheduledThreadPoolExecutor`线程池未自动设置上下文类加载器，导致Sharding-JDBC在初始化配置时抛出空指针异常并阻塞线程。文章给出了简洁有效的解决方案：在定时任务执行逻辑起始处，通过`Thread.currentThread().setContextClassLoader()`显式设置当前类的类加载器，从而成功恢复Sharding-JDBC的正常运行与SQL输出。"
"cover": "https://i-blog.csdnimg.cn/direct/36edb66aba674133af1b87d807df7588.png"
"tags":
  - "Sharding-JDBC"
  - "定时任务"
  - "故障排查"
"categories":
  - "故障排查"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/148366254?spm=1001.2014.3001.5501"
---

我在使-进行分库分表的时候遇到了这样一个问题：




明明和数据库连接都确认无误，但在**定时任务**中执行的时候出现了问题。




![](https://i-blog.csdnimg.cn/direct/36edb66aba674133af1b87d807df7588.png)




打印都很正常对吧。




按理说接下来就会打印 sql 语句以及对应的参数和返回结果，可是代码在执行到这似乎就停下来了，控制台也没有进一步的输出，也没有抛出任何异常，就像**线程阻塞**了一样。




于是我就开始排查寻找问题所在，可是找来找去似乎都没有任何问题。




这时我考虑到可能是**日志级别**屏蔽了错误信息，所以我在配置文件调整了日志输出级别，果不其然，控制台打印出来了报错信息：




> 
> java.lang.NullPointerException: Cannot invoke "java.lang.ClassLoader.getResourceAsStream(String)" because the return value of "java.lang.Thread.getContextClassLoader()" is null
> 




可以看到这个报错信息是**Sharding-JDBC 在尝试获取类加载器的时候获取到了 null 值从而抛出的空指针异常**。也就是说当前线程并没有对应的加载器。




Sharding-JDBC 依赖类加载器来加载和解析配置文件等资源。**如果无法获取到有效的类加载器，即使配置文件本身完全正确，Sharding-JDBC 也无法成功读取和初始化配置，其行为就会如同配置缺失一样。** 这就是为什么程序看似“卡住”而没有预期输出——核心功能初始化失败了。




> 
> 为什么当前线程没有对应的类加载器呢？
> 
> 
> 
> 在 Tomcat 容器中处理普通请求的线程，在创建时通常会被容器显式设置一个默认的类加载器。这确保了线程在执行应用代码时能正确加载所需的类。
> 
> 然而，定时任务线程的情况则不同。Spring 框架在执行定时任务时，默认使用的是内置的 ScheduledThreadPoolExecutor 线程池。关键点在于：ScheduledThreadPoolExecutor 在创建新的工作线程时，并不会自动设置线程的上下文类加载器。
> 




既然根本原因是当前线程缺少上下文类加载器，解决方案就是**显式地为该线程设置一个有效的类加载器**。在的执行逻辑开始处，添加以下代码：




```java
// 显式设置类加载器
Thread.currentThread().setContextClassLoader(this.getClass().getClassLoader());
```




添加上述代码后，Sharding-JDBC 能够成功获取到所需的类加载器，顺利加载配置并初始化。程序随即恢复正常运行，预期的 SQL 日志和执行结果都能在控制台正确输出。

---
> 原文链接: [Sharding-JDBC 定时任务 SQL 无响应的解决方案](https://blog.csdn.net/2401_88959292/article/details/148366254?spm=1001.2014.3001.5501)
> 作者: Yilena
