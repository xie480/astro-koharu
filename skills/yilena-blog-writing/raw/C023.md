---
"title": "如何应对海量Key带来的redis内存占用问题？"
"link": "ru-he-ying-dui-hai-liang-keydai-lai-de-redisnei-cun-zhan-yong-wen-ti"
"author": "Yilena"
"date": "2025-08-23"
"description": "本文针对海量Key导致的Redis内存占用过高问题，深入分析了内存碎片化与元数据开销的根源，并提出了五种切实可行的解决方案。从基础的合并小Key（利用Hash结构）与临时添加TTL救急，到架构层面的Redis集群模式与Redis on Flash（内存+SSD）降本方案，再到结合MySQL的冷热数据分离策略（全量/冷数据存DB，热数据存Redis）。文章通过详实的流程图与优劣对比，帮助开发者在不同预算与业务场景下，科学应对Redis内存瓶颈。"
"cover": "https://i-blog.csdnimg.cn/direct/a8fcaaad8b334809b0237906889199fc.png"
"tags":
  - "Redis"
  - "性能优化"
  - "架构设计"
"categories":
  - "业务拆解"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/150641500?spm=1001.2014.3001.5501"
---

**目录**
 


[一、业务场景](#%E4%B8%80%E3%80%81%E4%B8%9A%E5%8A%A1%E5%9C%BA%E6%99%AF)
 


[二、解决方案](#t0)
 


[（一）合并小 Key](#t1)
 


[（二）临时添加 TTL](#t2)
 


[（三）集群模式](#t3)
 


[（四）Redis on Flash 方案](#t4)
 


[（五）冷热数据分离（MySQL + Redis）](#t5)
 


[三、总结](#t6)
 


---
 



 


## 一、业务场景
 


当前你的项目的内存不足，请你提供解决方案。
 


---
 


## 二、
 


### （一）合并小 Key
 


为什么大量小 Key 存在会占用大量空间？
 


**（1）内存碎片化：**
 


Redis 使用内存分配器来管理内存。大量的小内存分配请求会导致内存分配器难以找到连续且大小合适的空闲块，从而产生大量内存碎片。这些碎片虽然总量可能不小，但由于不连续，无法被有效利用，导致实际可用内存减少。
 


虽然每个键存储的数据很小，但 Redis 为每个键分配内存时，会包含键本身的名字、Redis 对象结构以及实际数据结构的开销。
 


**（2）元数据开销占比过大：**
 


每个 Redis 键值对都有固定的元数据开销，大约在 90-100 字节左右。
 


如果一个键存储的值只有 10 字节，那么元数据开销则几乎占了总内存的全部，有效的数据密度非常低。
 



 


同时大量小 Key 存在也会使遍历键操作的执行时间边长，影响整体性能。
 


所以我们才需要通过合并小 key，让它们共享元数据开销并减少内存碎片的产生。
 


那么如何合并？我们通常会使用 Hash 结构，因为 Hash 结构底层是由优化的，使用的是压缩列表，占有的内存非常小。
 


不过缺点就是 Hash 无法给单个字段设置 TTL，只能给整个 Key 设置，这样可能会发生雪崩问题，需要程序应用层上做相应的熔断降级限流处理。
 


### （二）临时添加 TTL
 


我们需要给一些非关键业务数据 Key 加上 TTL，一般是通过 SCAN 扫描过滤掉关键业务数据 Key 来操作。
 


但这只是救急，是为了在保证服务不中断的前提下为后续优化操作争取时间窗口。
 


### （三）模式
 


关于 Redis 的三种集群模式我在下面这篇博客的最后针对其原理做了详细讲解：
 


[带你轻松学习 Redis_redis 的运行机制-CSDN 博客 https://blog.csdn.net/2401_88959292/article/details/149565343?spm=1001.2014.3001.5502](https://blog.csdn.net/2401_88959292/article/details/149565343?spm=1001.2014.3001.5502)
 


### （四）Redis on Flash 方案
 


Redis on Flash (RoF) 是 Redis 开发的专有解决方案，其核心目标是在保证较高性能的前提下，显著降低 Redis 存储海量数据的成本，从而解决由内存价格昂贵导致的内存不足或成本过高问题。
 


它本质上是一种内存 + 闪存（ + SSD） 架构。
 


**（1）架构组成**
 


- **RAM(内存层):**用于存储最热的键值数据以及所有键名和元数据。这是保证超低延迟访问的关键。
- **Flash(闪存层):**使用 SSD 存储访问频率较低的数据。键名和指向在 SSD 上位置的指针仍然保存在 RAM 中。
 


**（2）工作机制**
 


**A. 写入**
 


所有新写入的数据首先进入 RAM 层，被视为热数据。
 


**B. 读取**
 


如果请求的 Key 的 Value 在 RAM 中，则直接从 RAM 返回。
 


如果请求的 Key 的 Value 在上（即已被降级），则触发数据升级策略。
 


**C. 数据降级**
 


当 Redis 的内存使用达到配置的 RAM 阈值时，RoF 的智能算法开始工作。基于访问频率、最近访问时间、数据大小等因素，识别 RAM 中相对冷的数据，并将这些冷数据异步移动到 SSD 层。
 


- 关键点：
  - Key 永远不会被移除 RAM， 只有大的 Value 会被移动。
  - 移动后，RAM 中保留 Key 和一个指向 SSD 上 Value 的小指针，释放内存空间。
 


**D. 数据升级**
 


当一个被降级到 SSD 的 Value 被访问时，它会被加载回 RAM。
 


如果该 Value 后续被频繁访问，它会保持在 RAM 中。
 


如果 RAM 空间不足，它可能再次成为降级的候选者。
 


### （五）冷热数据分离（ + Redis）
 


这个方案和第四个的很像，都是一个思想。
 


可以提供两个方案，一个是 MySQL 存储全量数据，一个是 MySQL 只存储冷数据。
 


这两个方案都需要我们提前在 MySQL 中创建一张持久化表：
 


```sql
CREATE TABLE `redis_data`
(
    `id`               bigint       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `key`              varchar(255) NOT NULL COMMENT '键',
    `value`            varchar(255) NOT NULL COMMENT '值',
    `todayAccessCount` int          NOT NULL DEFAULT '0' COMMENT '今日访问次数',
    `totalAccessCount` int          NOT NULL DEFAULT '0' COMMENT '总访问次数',
    `createTime`       datetime     NOT NULL COMMENT '创建时间'
) COMMENT 'redis数据表';
```
 


**（1）Redis 存储热数据，MySQL 存储全量数据**
 


当写入数据时，最先写入 MySQL，再写入 Redis，同时写入 Redis 的 Key 全部带有 TTL。
 


当读取时先访问 Redis，Redis 不存在则继续查 MySQL，若查到数据则开启异步线程给 DB 的该数据行的当日访问次数和累计访问次数+1（当日访问次数每日定时任务自动清零），然后检查访问次数是否达到阈值，若达到则写入 Redis 作为热数据。
 


然后每天会有定时任务定期扫描 MySQL，根据 createTime 创建时间和 totalAccessCount 累计访问次数字段来判断无用数据并进行删除。
 


当然，异步线程和定期扫描只针对于存储在缓存持久化表里的数据，因为有些缓存数据是用于预热分担 MySQL 压力的，它们原本就是存储在 MySQL 当中的。
 


具体流程如下：
 


![](https://i-blog.csdnimg.cn/direct/a8fcaaad8b334809b0237906889199fc.png)
 


这样的话 Redis 中的冷数据直接随着 TTL 到期而被删除，而 MySQL 的冷数据升级也可以根据原本数据的用途而灵活配置。
 


**（2）Redis 存储热数据，MySQL 只存储冷数据**
 


跟上一个方案一样，Redis 中的所有数据都带有 TTL。
 


但是写入操作只需写入 Redis 即可。同时引入 Redis 过期监听器，在监听器中对非核心业务的 Key 进行过滤，将核心业务过期的 Key 存入 MySQL 作为冷数据存储。
 


读取操作如果 Redis 有值，则异步更新 TTL；反之则直接查 MySQL，后面与上个方案的流程一样。
 


这个方案优化的点就在于提升了写入速度以及降低了 MySQL 的占用空间。
 


流程图如下：
 


![](https://i-blog.csdnimg.cn/direct/eed64e1bfddd44f1be9f8cdd96ab6dfa.png)
 


---
 


## 三、总结
 


如果经费充裕的情况下肯定使用集群 + ROF 方案是最佳选择。
 


但是反之就建议先临时添加 TTL 救急，然后合并小 Key，最后使用冷热数据分离方案。
 


---
 


**~码文不易，留个赞再走吧~**

---
> 原文链接: [如何应对海量 Key 带来的 redis 内存占用问题？](https://blog.csdn.net/2401_88959292/article/details/150641500?spm=1001.2014.3001.5501)
> 作者: Yilena
