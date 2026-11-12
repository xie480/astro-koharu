---
"title": "优先队列流式处理 + 多路归并排序：轻松实现DB分表严格有序的分页查询"
"link": "you-xian-dui-lie-liu-shi-chu-li_-_duo-lu-gui-bing-pai-xu-qing-song-shi-xian-dbfen-biao-yan-ge-you-xu-de-fen-ye-cha-xun"
"author": "Yilena"
"date": "2025-08-22"
"description": "本文针对在MySQL分表架构下且磁盘空间紧张的场景，提出了一种高效实现严格有序分页查询的解决方案。面对跨表查询带来的深分页难题，文章摒弃了建立庞大映射表的空间换时间策略，转而采用“优先队列流式处理 + 多路归并排序”的创新方法。通过虚拟线程并行游标查询各分表数据，并利用容量固定的优先队列在内存中实时维护Top-N结果，有效控制了内存占用并避免了OOM风险。文章详细解析了方案的设计思路，并提供了完整的Java代码实现，经测试在万级分表数据下响应时间可达毫秒级。"
"cover": "https://i-blog.csdnimg.cn/direct/3679fa348f1a4b94b7a6961bbcd69aad.png"
"tags":
  - "MySQL"
  - "分库分表"
  - "性能优化"
"categories":
  - "业务拆解"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/150618375?spm=1001.2014.3001.5501"
---

## 一、业务场景
 


你正在开发一款短链接生成平台，用户可在该平台上创建多个分组，并在分组内生成大量短链接。
 


现需开发一个接口，支持用户其创建的所有短链接。该接口需满足以下要求：
 


1. **严格排序**：查询结果必须严格按修改时间倒序排序。
2. **高效查询**：查询速度必须快。
3. **数据库限制**：仅可使用 MySQL 数据库。
 


已知短链接表已通过  以分组 ID (`gId`) 为分片键进行了分表处理。每张分表的数据量均达到万级。同时，当前磁盘空间较为紧张。
 


---
 


## 二、分析
 


该需求初看简单，实则实现难度较高，核心挑战在于避免深分页并确保快速响应。
 


难点主要源于跨表查询：在的场景下，要精确获取 pageSize 条严格按修改时间倒序排列的数据非常困难，因为无法预判每个分表需要查询多少数据才能满足全局排序。
 


此外，还存在以下硬性约束：
 


1. 仅限使用 MySQL，排除了引入 Elasticsearch 等外部方案的可能；
2. 当前磁盘空间紧张，限制了空间换取时间思想的解决方案的应用。
 


### （一）方案一
 


既然问题在于跨表查询，那我们就从根本处解决问题，不跨表就好了。
 


我们可以建立一张映射表，存储短链接 id、gId 和 updateTime，对 gid 和 updateTime 建立联合索引避免回表查询。
 


这样一来我们只要用这条就可以快速查询到下一页数据了：
 


```sql
SELECT id, gid
FROM linkId_and_gid
WHERE updateTime < #{lastUpdateTime}
ORDER BY updateTime DESC
LIMIT #{pageSize}
```
 


其中 #{lastUpdateTime} 为上一页最后一条记录的修改时间（游标）。
 


但是这样的话该表的数据量就会异常庞大，最后还是会陷入深分页问题。
 


为缓解深分页问题，可考虑在映射表中加入 userId 字段并以其作为新的分片键。然而，此方案需要额外创建一张体量巨大的分片表，显著增加存储开销，与当前磁盘空间紧张的约束严重冲突，故不可行。
 


### （二）方案二
 


鉴于无法采用空间换时间的策略，我们转而考虑以一定妥协换取性能提升。
 


根据用户的每个分组 gId，分别到对应的分表里查询 PageSize 条符合条件的数据返回，具体 SQL 如下：
 


```sql
SELECT *
FROM links
WHERE updateTime > #{lastUpdateTime}
  AND gid = #{gid}
ORDER BY updateTime desc
LIMIT #{pageSize}
```
 


然后将查到的数据汇总，通过排序选出前 PageSize 条给返回即可，注意要给 gId 和 updateTime 建立联合索引。
 


但是当用户分组数量极大，查询返回的总数据量 (分组数 * pageSize) 可能非常庞大，存在风险。
 


为避免 OOM，可引入优先队列进行流式：
 


- 队列容量固定为 pageSize + 1。
- 每次从各分片结果集中取出当前最大值加入队列。
- 若队列满，则弹出最小值，始终保持队列中为当前已处理数据中的前 pageSize + 1 大项。
- 此方法确保内存中仅需维护 pageSize  + 1 个元素，有效控制内存占用。
 


> 
>  什么是流式处理？
流式处理是一种数据持续到达时即时处理的计算范式，与传统的等待数据全部到达后全量处理形成鲜明对比。
维度全量处理流式处理数据视野全量数据加载到内存仅处理当前数据片段处理时机数据完整收集后处理数据到达即时处理内存开销 O(全数据集大小) → 可能 OOMO(结果集大小) → 恒定安全结果产出结束时统一输出过程持续优化结果延迟特性高延迟（等待所有数据）低延迟（第一条结果快速产出） 
> 
 


当然除此之外，我们还需要通过限制最大 Pagesize、用户最大可创建分组数以及每个分组最大可创建短链接数来进行数据规模的把控。
 


那这里的主要耗时操作就在于 DB 查询以及排序操作上了。
 


由于 DB 的数据量级非常庞大，所以对于 DB 查询我们可以使用虚拟线程 + structureTaskScope 来并行游标查询；排序的话我们使用优先队列进行多路归并排序即可。
 


> 
>  若对虚拟线程这类新特性还不了解的请阅读下面这篇博客：
带你轻松学习虚拟线程和 StructuredTaskScope-CSDN 博客https://blog.csdn.net/2401_88959292/article/details/150288495?spm=1001.2014.3001.5501 
> 
 


流程图如下：
 


![](https://i-blog.csdnimg.cn/direct/3679fa348f1a4b94b7a6961bbcd69aad.png)
 


经测试该接口在每个分表均为万级数据、pageSize 设置为 30 的情况下响应时间均为毫秒级。
 


---
 


## 三、方案实现
 


```java
@Slf4j
@Service
@RequiredArgsConstructor
public class LinkServiceImpl implements LinkService {
 
    private final ShortLinkMapper shortLinkMapper;
 
    @Override
    public IPage<ShortLinkDO> pageShortLink(List<Long> gidList, Date lastUpdateTime, int pageSize) {
        // 创建优先队列，供控制器使用
        PriorityQueue<ShortLinkDO> minHeap = new PriorityQueue<>(
                Comparator.comparing(ShortLinkDO::getUpdateTime)
                        .thenComparingLong(ShortLinkDO::getId)
        );
 
        // 创建流式处理控制器
        try (StreamProcessor processor = new StreamProcessor(gidList, minHeap, pageSize)) {
            // 并行处理每个分组
            try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
                List<StructuredTaskScope.Subtask<Void>> futures = gidList.stream()
                        .map(gid -> scope.fork((Callable<Void>) () -> {
                            processGroupStream(gid, lastUpdateTime, processor);
                            return null;
                        }))
                        .toList();
 
                // 等待所有任务完成
                scope.join();
                // 抛异常
                scope.throwIfFailed();
            }
        } catch (Exception e) {
            log.error("创建流式控制处理器失败");
            throw new RuntimeException(e);
        }
 
 
        // 构建最终结果
        List<ShortLinkDO> result = new ArrayList<>(minHeap);
        result.sort(Comparator.comparing(ShortLinkDO::getUpdateTime)
                .thenComparingLong(ShortLinkDO::getId)
                .reversed());
 
        // 构建分页响应
        Page<ShortLinkDO> page = new Page<>(1, pageSize);
        page.setRecords(result);
        page.setTotal(result.size());
        return page;
    }
 
    // 流式处理每个分组的数据
    private void processGroupStream(Long gid, Date lastUpdateTime, StreamProcessor processor) {
        int offset = 0;
        // 每次查询的批次大小
        final int batchSize = 50;
 
        // 游标查询
        while (true) {
            List<ShortLinkDO> batch = shortLinkMapper.pageShortLink(gid, lastUpdateTime, batchSize, offset);
 
            // 终止条件
            if (batch.isEmpty()){
                break;
            }
 
            // 处理当前批次
            for (ShortLinkDO item : batch) {
                if (!processor.process(item)) {
                    return;
                }
            }
 
            // 通知完成一个分组
            offset += batchSize;
        }
    }
 
    // 流式处理控制器
    private static class StreamProcessor implements AutoCloseable {
        // 优先队列
        private final PriorityQueue<ShortLinkDO> minHeap;
        // 堆容量
        private final int heapCapacity;
        // 分组同步器
        private final Phaser phaser = new Phaser(1);
        // 是否继续处理
        private volatile boolean shouldContinue = true;
 
        // 每个请求单独创建一个控制器，所以不用担心线程安全问题
        public StreamProcessor(List<Long> gidList,
                               PriorityQueue<ShortLinkDO> minHeap,
                               int heapCapacity) {
            this.minHeap = minHeap;
            this.heapCapacity = heapCapacity;
            phaser.bulkRegister(gidList.size());
        }
 
        // 处理单个记录，直接用同步块保障线程安全，因为这里只需要防住每个请求自己创建的线程，与其他线程无关
        public synchronized boolean process(ShortLinkDO item) {
            // 停止处理
            if (!shouldContinue) {
                return false;
            }
 
            // 添加到堆中
            minHeap.offer(item);
 
            // 维持堆大小
            if (minHeap.size() > heapCapacity) {
                // 移除最小元素
                minHeap.poll();
            }
 
            return true;
        }
 
       
        @Override
        public void close() {
            try {
                // 等待所有分组完成
                phaser.arriveAndAwaitAdvance();
            } finally {
                // 停止处理新数据
                shouldContinue = false;
            }
        }
    }
}
```
 


---
 


我的水平有限，只能想到这两个方案，如果你有更好的方案，请在评论区中告诉我！
 


---
 


**~码文不易，留个赞再走吧~**

---
> 原文链接: [优先队列流式处理 + 多路归并排序：轻松实现 DB 分表严格有序的分页查询](https://blog.csdn.net/2401_88959292/article/details/150618375?spm=1001.2014.3001.5501)
> 作者: Yilena
