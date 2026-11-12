---
"title": "带你轻松学习Caffeine"
"link": "dai-ni-qing-song-xue-xi-caffeine"
"author": "Yilena"
"date": "2025-10-18"
"description": "本文全面介绍了高性能Java本地缓存库Caffeine。从其定位与核心概念（如命中率、淘汰策略、过期与刷新机制）出发，详细对比了本地缓存与分布式缓存的差异。文章深入讲解了Cache、LoadingCache及AsyncLoadingCache的构建与配置，分享了批量缓存加载技巧，并剖析了基于大小与权重的淘汰策略及冷启动预热方案。最后，针对缓存雪崩、击穿、穿透、一致性及OOM风险等常见问题，提供了实用的应对策略，帮助开发者在并发场景下高效、安全地使用Caffeine。"
"cover": "https://i-blog.csdnimg.cn/direct/be3b7518934f48c38c9fc703ae6d16d8.png"
"tags":
  - "Caffeine"
  - "缓存"
  - "Java"
"categories":
  - "技术笔记"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/152605559?spm=1001.2014.3001.5501"
---

**目录**
 


[一、概述](#t0)
 


[（一）定位](#t1)
 


[（二）为什么需要本地缓存](#t2)
 


[（三）本地缓存 VS 分布式缓存](#t3)
 


[二、核心概念](#t4)
 


[（一）命中率（hit/miss）](#t5)
 


[（二）淘汰（eviction）、权重（weight）](#t6)
 


[（三）过期（expire）、刷新（refresh）](#t7)
 


[（四）Loading vs AsyncLoading](#t8)
 


[（五）RemovalListener](#t9)
 


[（六）CacheStats](#t10)
 


[三、构建缓存](#t11)
 


[（一）Cache & LoadingCache & AsyncLoadingCache](#t12)
 


[（二）Builder 配置](#t13)
 


[四、批量缓存加载技巧](#t14)
 


[五、淘汰策略与容量控制](#t15)
 


[（一）基于 size 与基于 weight 的淘汰](#t16)
 


[（二）weigher 的实现细节](#t17)
 


[（三）冷启动与预热策略](#t18)
 


[六、常见问题](#t19)
 


[（一）雪崩、击穿与穿透](#t20)
 


[（二）缓存一致性](#t21)
 


[（三）OOM 风险](#t22)
 


---
 



 


![](https://i-blog.csdnimg.cn/direct/be3b7518934f48c38c9fc703ae6d16d8.png)
 


## 一、概述
 


### （一）定位
 


 是一个高性能的 Java 本地库，目标是替代早期常用的 Guava Cache，提供更好的吞吐量、延迟和内存利用率。
 


它在 JVM 堆内管理缓存条目，采用现代的近似 LFU/ 混合驱逐算法，并针对并发场景做了大量优化以减少锁竞争。适用于需要低延迟读、短期热点数据缓存、以及作为缓存前的本地 L1 缓存。
 


### （二）为什么需要本地缓存
 


- **降低延迟**：本地内存访问的延迟远小于网络往返或磁盘 IO，读操作可以在微秒级完成。
- **减轻下游依赖**：缓存热点数据可减少对数据库或远程服务的请求压力，提高系统稳定性。
- **降低成本**：减少远程调用与数据库负载，节省带宽和计算资源。
- **高并发吞吐**：本地缓存可作为热点缓冲区，避免后端在瞬时高并发时被压垮。
 


### （三）本地缓存 VS 分布式缓存
 


- **访问延迟**：本地缓存最快；分布式缓存次之；数据库最慢。
- **一致性**：分布式缓存可以被集群共享，容易实现一致性策略；本地缓存存在每个进程的独立副本，保持一致性更难。
- **容量与持久化**：分布式缓存通常内存更大、可以做持久化；本地缓存受单机内存限制且通常不持久。
- **可用性与扩展性**：分布式缓存通过集群扩展容量和高可用；本地缓存需要在横向扩容时同步或接受更高的缓存失效率。
- **典型使用方式**：常见做法是双层缓存 —— 本地 Caffeine 作 L1（低延迟、热点缓存），Redis 作 L2（共享、容量大、持久化），并通过失效通知或 TTL 控制一致性和容错。
 


---
 


## 二、核心概念
 


### （一）命中率（hit/miss）
 


hit 指请求的 Key 再缓存中找到了有效值，也就是命中；而 miss 则是反之，未命中。
 


通常使用二者累计计数之比表示命中率：hit rate = hitCount  /  (hitCount + missCount)。
 


命中率直接影响后端压力与延迟，命中率越高代表平均响应延迟越低，后端压力越小。
 


### （二）淘汰（eviction）、权重（weight）
 


淘汰指的是当缓存容量达到阈值时，caffeine 会驱逐条目以腾出空间，但是被驱逐的条目会通过 RemovalListener 通知，因此我们可以根据业务情况进行回写或是释放操作。
 


caffeine 使用的缓存淘汰是近似 LFU/LRU 混合驱逐算法，这点在后文会详细展开。
 


而权重则是用于平衡缓存条目数量和内存占用两个数值的，传统按条目数量驱逐策略会将大对象和小对象视作等价，导致占用不均衡。而使用权重的话则可以解决这一问题，我们将阈值设置为权重而不是条目数量，然后驱逐时优先驱逐同等条件下的大权重对象，可操作性大大增强，我们可以根据条目字节分配权重或是业务类型分配权重，这样一来就可以优先淘汰占用内存更大的条目亦或是非热点业务条目。
 


### （三）过期（expire）、刷新（）
 


**1. expire**
 


caffeine 提供了两种计算 TTL 的策略：
 


- **expireAfterWrite(duration)：**自写入/刷新完成后开始计时，超过时长则被视为过期，下一次 访问会被当作未命中。
- **expireAfterAccess(duration)：**自最后一次访问后开始计时，超过则过期。适合长期未被访问就丢弃的场景。
 


当条目过期后则会触发加载策略，下文会展开细讲。
 


**2. refresh**
 


除了传统的过期 TTL，caffeine 还提供了一个刷新策略 refreshAfterWrite(duration)，该 TTL 计时完成后如果再次访问，并不会像 expire 一样触发加载策略，而是刷新。
 


刷新其实就是加载前的一层缓冲层，如果 TTL 结束后访问该 Key 时还存在旧值，则先返回旧值，同时异步触发加载策略，反之则是直接同步触发加载策略。
 


所以 refresh 更适合热点数据，承受更高的并发量的同时也失去了部分数据实时性，不过大部分业务其实都是可以容忍毫秒级脏读的。
 


### （四）Loading vs AsyncLoading
 


**1. LoadingCache**
 


构建条目时会提供一个同步加载函数，当 miss 后则会同步调用该函数进行加载。
 


在并发场景下，该 Key 的同步加载函数正在被调用的期间，如果有其他线程也对该 Key 发起了访问请求，那么不会发起多次加载，而是共享正在调用的同步加载函数返回的结果。简单来说就是同一时刻只会发起一次加载。
 


**2. AsyncLoadingCache**
 


构建条目时会提供一个 CompletableFuture 异步回调函数，当 miss 后会触发该函数。
 


注意不要在 CompletableFuture 调用 join()，不然还是会阻塞请求线程。
 


> 
>  当下 JDK25，我们迎来了 MVC 架构下的虚拟线程非阻塞并发编程的新范式，所以更多情况下，针对于必须强一致的数据推荐使用 expireAfterWrite + LoadingCache；而对于有短时脏读容忍度的最终一致的数据则推荐使用 refreshAfterWrite + LoadingCache。
由于本地缓存使用的是堆内存，所以不推荐使用 expireAfterAccess，会长时间占用堆内存导致 GC 频繁，影响程序整体性能。 
> 
 


### （五）RemovalListener
 


当监听条目被显示删除、回收、过期、驱逐或是替换时接收通知，一般用于资源释放、回写、记录日志等等。
 


```java
Caffeine.newBuilder()
    .removalListener((K key, V value, RemovalCause cause) -> {
    })
    .build();
```
 


注意不要在监听器中做大量耗时操作，如果必须要做，那么推荐将监听器作为 MQ 或是异步线程的一个转发站。
 


### （六）CacheStats
 


这是一个统计收集器，用于一些指标计数。
 


常见方法：命中计数 hitCount()、未命中计数 missCount()、加载成功计数 loadSuccessCount()、加载失败计数 loadFailureCount()、总加载时间计数 totalLoadTime()、淘汰计数 evictionCount() 等。
 


虽然开启统计会带有额外的时间和空间开销，不过这些开销通常很小，且统计的数据很有价值，所以还是建议开启该功能，便于监控和维护。
 


---
 


## 三、构建缓存
 


### （一）Cache & LoadingCache & AsyncLoadingCache
 


**1. Cache&lt;K,V&gt;**
 


只是一个本地键值对存储，不包含自动加载逻辑。
 


适用于旁路缓存模式，手动控制加载和刷新逻辑。
 


```java
Cache<String, User> cache = Caffeine.newBuilder()
    .maximumSize(10_000)
    .expireAfterWrite(Duration.ofMinutes(30))
    .build();
 
User u = cache.getIfPresent("u123");
if (u == null) {
    u = userRepository.findById("u123");
    if (u != null) cache.put("u123", u);
}
```
 


**2. LoadingCache&lt;K,V&gt;**
 


上文已讲解过，这里不再做赘述。
 


```java
LoadingCache<String, User> loading = Caffeine.newBuilder()
    .maximumSize(5000)
    .refreshAfterWrite(Duration.ofMinutes(5))
    .build(key -> userRepository.findById(key)); 
 
User u = loading.get("u123"); 
```
 


**3. AsyncLoadingCache&lt;K,V&gt;**
 


```java
AsyncLoadingCache<String, Data> asyncCache = Caffeine.newBuilder()
    .expireAfterAccess(Duration.ofMinutes(10))
    .buildAsync(key -> CompletableFuture.supplyAsync(() -> remoteCall(key)));
 
CompletableFuture<Data> fut = asyncCache.get("k1");
fut.thenAccept(data -> {
                    // 省略
                });
```
 


### （二）配置
 


- **initialCapacity(int)**
  - 初始哈希表容量，避免频繁扩容。建议一开始设置较大，然后统计一段期间内的平均条目数量后设置合适的容量。
- **maximumSize(long)**
  - 以条目数为限。简单、常用，但对象大小差异大时不够精确。
- **maximumWeight(long) + weigher(Weigher&lt;K,V&gt;)**
  - 按权重限制，更准确控制内存占用。
  - weigher 要快且稳定（同一条目权重不应随时间剧烈变化）。
- **expireAfterWrite(Duration)**
  - 写入后过期策略。用于数据有明确时效性的场景。
- **expireAfterAccess(Duration)**
  - 最后一次访问后过期。用于长期未访问则丢弃的场景。
- **refreshAfterWrite(Duration)**
  - 到期后在下一次访问触发异步刷新，同时 get 可以返回旧值直到新值准备好。适合避免击穿并保持可用性。
- **weakKeys() / weakValues() / softValues()**
  - 使用弱/软引用，允许 GC 回收。慎用：可能导致条目被 GC 回收得很频繁，且对统计/一致性有影响。weakKeys 只有当 key 没有其他强引用时才会被回收，适合缓存外部强引用的大对象的场景。
- **removalListener(RemovalListener&lt;K,V&gt;)**
  - 注册移除监听器，用于写回、资源释放、日志记录等。
  - 监听器应保持轻量，耗时操作异步化。
- **executor(Executor)**
  - 指定用于异步加载/刷新任务的线程池；默认使用 ForkJoinPool。建议在高负载场景下提供专用线程池以避免与业务线程争抢资源。
- **recordStats()**
  - 打开统计收集功能。
- **ticker(Ticker)**
  - 用于测试或自定义时间源。
 


---
 


## 四、批量缓存加载技巧
 


在批处理或者一次请求需要操作多个 Key 的情况下，可能出现多个 Key 缺失需要加载的情况，这个时候让每个 Key 触发各自的加载策略会浪费 n 次网络 IO，所以我们一般将其成一次批量请求。
 


我们会从缓存中取出已经命中的子集，然后获取出未命中的 Key，并发起一次批量加载后将结果 putAll 到缓存。
 


```java
Cache<String, Value> cache = Caffeine.newBuilder().build();
 
Map<String, Value> getAll(Set<String> keys) {
    // 命中键值对
    Map<String, Value> present = new HashMap<>();
    // 未命中Key
    Set<String> missing = new HashSet<>();
 
    // 筛选
    for (String k : keys) {
        Value v = cache.getIfPresent(k);
        if (v != null) present.put(k, v);
        else missing.add(k);
    }
    
    // 批量加载
    if (!missing.isEmpty()) {
        Map<String, Value> loaded = db.batchLoad(missing); 
        cache.putAll(loaded);
        present.putAll(loaded);
    }
    return present;
}
```
 


不过上面这个针对的是单线程，如果在并发场景下想使用批量加载则很复杂，因为我们需要考虑到多个线程对同一个 Key 同时触发加载策略的情况，所以我们要进行手动的合并。
 


```java
public class BatchingSingleflight<K, V> {
    // 只有首次触发加载的线程会创建 future，其他并发到达者会复用这个 future。
    private final ConcurrentHashMap<K, CompletableFuture<V>> inflight = new ConcurrentHashMap<>();
 
    // 用于收集待批量加载的 key，保持插入顺序
    private final ConcurrentLinkedQueue<K> pendingQueue = new ConcurrentLinkedQueue<>();
 
    // 与queue配合用于去重
    private final Set<K> pendingSet = ConcurrentHashMap.newKeySet(); 
 
    // 用于执行批量加载任务
    private final ScheduledExecutorService scheduler;
 
    // 用于执行实际的任务或立即触发drain的普通executor
    private final Executor executor;
 
    private final Cache<K,V> cache;
 
    // 批量加载函数
    private final Function<Set<K>, Map<K, V>> batchLoader; 
 
    // 最大批次大小
    private final int maxBatchSize;
 
    // 时窗（ms）
    private final long windowMillis;
 
    // 表示是否已经调度了一个drain任务（防止重复调度）
    private final AtomicBoolean drainScheduled = new AtomicBoolean(false);
 
    // 用于判断当前Key是否已经正在加载中
    public CompletableFuture<V> get(K key) {
        V cached = cache == null ? null : cache.getIfPresent(key);
        if (cached != null){
            // 正在加载则共享回调结果
             return CompletableFuture.completedFuture(cached);
        }
        // 反之则开始加载
        CompletableFuture<V> fut = inflight.computeIfAbsent(key, k -> {
            CompletableFuture<V> newF = new CompletableFuture<>();
            // 去重
            if (pendingSet.add(k)) { 
                收集
                pendingQueue.add(k);
            }
            // 开启时间窗口
            scheduleDrainIfNeeded();
            return newF;
        });
 
        // 在回调完成后释放资源，防止内存泄漏
        fut.whenComplete((v, ex) -> inflight.remove(key, fut));
        return fut;
    }
 
    // 判断是否需要时间窗口
    private void scheduleDrainIfNeeded() {
        // 当前Key数量是否已经达到阈值
        if (pendingSet.size() >= maxBatchSize) {
            // 当前是否已经调度过了，避免并发问题
            if (drainScheduled.compareAndSet(false, true)) {
                // 立即执行
                executor.execute(this::drain);
            }
        } else {
            if (drainScheduled.compareAndSet(false, true)) {
                // 开启时间窗口
                scheduler.schedule(this::drain, windowMillis, TimeUnit.MILLISECONDS);
            }
        }
    }
 
    private void drain() {
        try {
            List<K> batchKeys = new ArrayList<>(maxBatchSize);
            // 获取需要加载的Keys
            while (batchKeys.size() < maxBatchSize) {
                K k = pendingQueue.poll(); 
                if (k == null) break;
                if (pendingSet.remove(k)) {
                    // 仅当成功移除时才真正加入，防止重复
                    batchKeys.add(k);
                }
            }
            // 为空则无需加载
            if (batchKeys.isEmpty()) return;
            // 进一步去重
            Set<K> keySet = new HashSet<>(batchKeys);
 
            CompletableFuture
                    // 执行加载函数
                    .supplyAsync(() -> batchLoader.apply(keySet), executor)
                    .whenComplete((map, ex) -> {
                        if (ex != null) {
                            // 获取结果
                            for (K k : keySet) {
                                CompletableFuture<V> f = inflight.get(k);
                                if (f != null) f.completeExceptionally(ex);
                            }
                        } else {
                            for (K k : keySet) {
                                CompletableFuture<V> f = inflight.get(k);
                                V value = map.get(k);
                                if (value != null) {
                                    // 写回本地缓存
                                    if (cache != null) cache.put(k, value);
                                    if (f != null) f.complete(value);
                                } else {
                                     // 库中也没有则需要做缓存穿透的防御
                                }
                            }
                        }
                        
                        // 这里再做一次检查并清理中已经完成的future
                        for (K k : keySet) {
                            CompletableFuture<V> f = inflight.get(k);
                            if (f != null && f.isDone()) {
                                inflight.remove(k, f);
                            }
                        }
                    });
        } finally {
            // 回滚状态
            drainScheduled.set(false);
            // 如果还有剩余Key则再次加载
            if (!pendingSet.isEmpty()) scheduleDrainIfNeeded();
        }
    }
}
```
 


简单讲述一下流程：
 


当一个请求查询缓存 miss 后，我们会先检查这些 Keys 是否已经正在加载中，如果是则共享回调结果，反之则创建一个 CompletableFuture，并把 Key 加入 Set 中，然后根据当前 Set 大小决定是否要立即执行 drain 还是需要开一个时间窗口。如果需要开一个时间窗口，那么这个窗口内的所有请求都会共享这次批加载的结果。
 


drain 方法里，先是取出本次批次 Keys，然后调用批量加载函数。触发回调后对于每个 Key，有值则回写缓存，反之则进行穿透防御策略。最后在 finally 块中回滚状态并对未处理的 Key 进行再加载。
 


---
 


## 五、淘汰策略与容量控制
 


### （一）基于 size 与基于 weight 的淘汰
 


详细的上面也已经提到过，这里就简单讲一下选型。
 


其实也就一句话，对象大小差异小就基于 size，反之就基于 weight。
 


### （二）weigher 的实现细节
 


针对于 weigher，首先内部实现逻辑必须轻量且，而且最好 0 阻塞操作，因为每次写操作都会调用。然后对于同一键值对，短时间内返回的权重必须是稳定的，而且要注意避免数值溢出。
 


常见的实现方法如下：
 


- **精确测量（较慢）**
  - 使用 Instrumentation.getObjectSize() 精确测量对象浅层大小，再递归测量引用对象。准确但开销大，通常不适合放在 weigher 中实时调用。
- **序列化测量（慢且昂贵）**
  - 把对象序列化成 byte[] 看长度， 准确但非常耗 CPU 与内存，不能作为实时 weigher。
- **字段/估算法（常用）**
  - 根据对象的业务字段估算（例如 int 占 4 字节，long 8 字节，字符串按字符 *2 + 对象头），快速且近似。
- **采样式/渐进估算（常用）**
  - 在加载/刷新时对一部分条目做精确测量，更新一个移动平均值。weigher 仅返回该移动平均值或用该平均和某些字段比例计算权重。
  - 这样既保持 weigher 快速，又能近似反映真实分布。
 


> 
>  如何估算 maximumWeight / maximumSize？
假设 JVM 的堆内存大小为 8g，那么我们拿 1g 来做缓存，1024*1024*1024 = 1073741824 bytes。
然后使用估算法，假设估算的平均大小为 2048bytes，那么 maximumSize = 1073741824 / 2048 = 524288；
maximumWeight 就直接取 1073741824 就行了，我们基于字段大小给予权重。
之后启用 recordStats()采集数据，根据采样数据进行调整即可。 
> 
 


### （三）冷启动与预热策略
 


caffeine 本地缓存最大的缺点就是冷启动问题，当服务实例启动时本地缓存是空的，在这段时间内会导致大量请求击穿雪崩。
 


而解决方案也有很多：
 


- **主动预热：**
  - 启动时主动加载热点业务 Key 到缓存。
  - 但是如果热点业务 Key 很大，预热会阻塞线程资源并影响启动速度。
- **渐进式预热：**
  - 把热点集分成小批次，每秒加载一批。
  - 会减小对线程资源的占用问题，但是牺牲了预热效率，击穿的概率增加。
- **L2 缓存层：**
  - 依靠 Redis 作为 L2 缓存层，避免请求全部打到 DB。
- **限流与熔断：**
  - 当冷启动或者后端负载峰值时，启用限流，并在压力突破阈值时熔断拒绝请求。
 


---
 


## 六、常见问题
 


### （一）雪崩、击穿与穿透
 


**1. 雪崩**
 


- TTL 范围随机化
- 渐进式预热
- L1/L2 双层缓存
- 限流熔断
 


**2. 击穿**
 


- 对于同一 Key 加载，合并同时间内的请求，避免反复加载。
- 使用 refreshAfterWrite，避免缓存失效后直接打到 DB 的情况。
- 降级限流
 


针对 caffeine 不推荐加锁，因为分布式锁需要浪费网络 IO，反而浪费了 caffeine 微秒级响应的优点。
 


**3. 穿透**
 


- 参数校验，拦截明显非法请求
- 布隆过滤器
- 缓存空结果，需要注意 caffeine 使用键值对，value 不能缓存 null，所以我们要使用 Optional 类。
- 限流风控
 


### （二）缓存一致性
 


L1/L2 双层缓存最大的痛点就在于缓存一致性，L1 本地缓存是每个实例私有的，不共享。
 


目前最为常用的解决方案就是消息通知：
 


先更新 DB，再删除 L2 缓存，然后通过 MQ 或者 Reids 订阅发布模型通知所有实例删除 L1 缓存。
 


这个方案虽然最为常用，但是并不能百分百保证缓存一致性，不过能大幅度降低脏值回写或是脏读的时间窗口。
 


需要考虑消息丢失的情况，做好降级策略。
 


如果必须要强一致的话，则推荐该部分业务直接弃用 L1，只用 L2 即可。
 


### （三）风险
 


因为 caffeine 使用的是本地堆内存，所以尤其是要注意 OOM。
 


- 注意不要使用无界缓存，一定要设置 maximumSize / maximumWeight
- weigher 一定要返回正整数而且不要溢出
- 尽量不要在 L1 层缓存大对象，可能会导致 GC 频繁或者因为内存碎片化导致 OOM
 


---
 


**~码文不易，留个赞再走吧~**

---
> 原文链接: [带你轻松学习 Caffeine](https://blog.csdn.net/2401_88959292/article/details/152605559?spm=1001.2014.3001.5501)
> 作者: Yilena
