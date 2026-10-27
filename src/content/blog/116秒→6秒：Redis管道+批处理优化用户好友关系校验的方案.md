---
"title": "116秒→6秒：Redis管道+批处理优化用户好友关系校验的方案"
"link": "116miao-6miao-redisguan-dao-pi-chu-li-you-hua-yong-hu-hao-you-guan-xi-xiao-yan-de-fang-an"
"author": "Yilena"
"date": "2025-07-07"
"description": "本文针对社交平台中用户好友关系数据一致性问题，提出了一种高效的定时任务解决方案。通过分析初版方案的性能瓶颈（单线程串行处理导致116秒耗时），逐步优化为多线程并行处理（70秒）和最终版批量预加载策略（6秒）。终版方案的核心改进包括：1）预加载所有关注关系并建立内存映射；2）批量处理好友数据更新；3）使用Redis管道技术减少网络请求。最终将请求次数从35万次降至常数级，同时提供了完整的Java实现代码，包含分片处理、批量数据库操作和Redis管道更新等关键优化技术。"
"cover": "https://i-blog.csdnimg.cn/direct/5c04cb91fc9841329336fe0eb54605e6.png"
"tags":
  - "性能优化"
  - "Redis"
  - "消息队列"
"categories":
  - "业务拆解"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://github.com/emn178/markdown"
---


**目录**
 



 


[一、业务需求](#%E4%B8%80%E3%80%81%E4%B8%9A%E5%8A%A1%E9%9C%80%E6%B1%82)
 


[二、分析](#%E4%BA%8C%E3%80%81%E5%88%86%E6%9E%90)
 


[（一）初版](#%EF%BC%88%E4%B8%80%EF%BC%89%E5%88%9D%E7%89%88)
 


[（二）修改](#%EF%BC%88%E4%BA%8C%EF%BC%89%E4%BF%AE%E6%94%B9)
 


[（三）终版](#%EF%BC%88%E4%B8%89%EF%BC%89%E7%BB%88%E7%89%88)
 


[三、代码实现](#%E4%B8%89%E3%80%81%E4%BB%A3%E7%A0%81%E5%AE%9E%E7%8E%B0)
 


[（一）修改方案](#%EF%BC%88%E4%B8%80%EF%BC%89%E4%BF%AE%E6%94%B9%E6%96%B9%E6%A1%88)
 


[（二）最终方案](#%EF%BC%88%E4%BA%8C%EF%BC%89%E6%9C%80%E7%BB%88%E6%96%B9%E6%A1%88)
 


---
 



 


## 一、业务需求
 


在社交平台中，当用户互相关注时需建立好友关系并写入好友表。
 


但在极端情况下（如插入失败），可能导致**好友关系数据不一致**。
 


需一个**定时任务**，检查并修复所有用户的好友关系数据。
 


已知用户量**约 5 万**。
 


---
 


## 二、分析
 


核心逻辑：对每个用户，计算其关注对象与粉丝对象的**交集**（即应存在的好友关系），与好友表现有数据进行对比并更新。
 


关键在于**优化任务耗时**，应对 5 万量级甚至未来持续增长的数据。
 


### （一）初版
 


![](https://i-blog.csdnimg.cn/direct/5c04cb91fc9841329336fe0eb54605e6.png)
 


初版方案如上所示，核心逻辑是逐个遍历用户，然后遍历的过程中取交集，检查与好友表数据是否一致，不一致则删除好友表对应的数据再插入，同时删除 redis 缓存并更新。
 


初版方案最终耗时为**116s**，可见是非常慢的。
 


为什么会这么慢？初步推断或许是用户数据量太大，**单线程串行处理效率太低**。
 


因此进行修改。
 


### （二）修改
 


![](https://i-blog.csdnimg.cn/direct/6781075c2dcc46219f35c482c2d7b037.png)
 


可以看到在此方案中，我们引入了**线程池进行并行处理**，并且为了防止，在用户 id 处还进行了**游标分页**。
 


修改方案最终耗时为**70s。**
 


虽有提升，但仍不理想。扩大尺寸后耗时未明显降低，排除分页查询次数为主要瓶颈。
 


那只可能在核心逻辑上出了问题，让我们分析整体逻辑，我们每遍历一个用户，就要先查用户关注的对象 id，再查关注用户的对象 id，然后还要查用户好友列表，如果前面两者的交集与好友列表不一致的话则需要先删除好友列表的数据再进行插入，最后再删除缓存并进行更新。
 


一套操作下来，每个用户处理最多会发起 5 次 DB 请求和 2 次 Redis 请求，一共有 5w 用户，累计下来最多会发起
 


5 万用户 * (5 DB + 2 Redis) =** 35 万次**，
 


并且随着用户的增加还会越来越多……
 


显然，这么设计是极其不合理的，因此，再次进行修改。
 


### （三）终版
 


![](https://i-blog.csdnimg.cn/direct/df2eac7b463e43bd9d8ca3d4e1178aef.png)
 


此方案中，**取消了游标分页**，因为整体只有 5w 数据量，占不了多少内存，使用分页反而会增加耗时。但不过在数据量抵达百万甚至更多时最好还是采用游标进行分页，不然可能会引发 oom。
 


除此之外，本方案最大的改动就是遍历用户前查询关注表中所有的数据，并建立关系映射进行分组，好友表也是以每批用户的频率进行查询，然后在遍历的过程中，将要插入的数据放进一个集合当中，这样的话在遍历完成后 DB 和 Redis 就可以拿着这两个集合里的数据进行更新，
 


将原本将近 35w 的请求次数降到了 1 (加载关注) + 1 (加载粉丝) + 1 (批量加载好友) + 1 (批量删除) + 1 (批量插入) + 1（Redis 管道请求） =** 6 次批操作**
 


***请求量从 35 万次降至常数级！***
 


> > 什么是 Redis 的管道？ 
>   
>  Redis 的 管道 是一种优化网络通信的技术，它的核心思想非常简单： 
>   
>  打包发送： 客户端可以将多个需要执行的 Redis 命令一次性收集起来，打包成一个批次。一次传输： 将这个命令批次一次性发送给 Redis 服务器，而不是每个命令都单独发起一次网络请求。批量执行： Redis 服务器接收到这个批次后，会按顺序依次执行其中的所有命令。打包返回： 服务器将所有命令的执行结果一次性收集起来，打包成一个批次。一次接收： 服务器将这个结果批次一次性发送回给客户端。 
> 
 


该方案最终耗时为**6s**，**足足优化了 110s**，因此最终采取该方案。
 


---
 


## 三、流程图总览
 


 ![](https://i-blog.csdnimg.cn/direct/d2809084bb49424ab4e1288dfdaa691f.png)
 


---
 


## 四、代码实现
 


### （一）修改方案
 


```java
@Slf4j
@RequiredArgsConstructor
public class CheckAndUpdateFriendTask {
    private final RedisTemplate<String,Object> redisTemplate;
    private final UserMapper userMapper;
    private final FriendMapper friendMapper;
    private final FollowMapper followMapper;
    private final ThreadPoolExecutor threadPoolExecutor;
 
    @Scheduled(cron = "0 0 2 * * ?")
    public void processCheckAndUpdateFriend() {
        LocalDateTime now = LocalDateTime.now();
        log.info("开始检查用户好友关系并更新，执行时间：{}", now);
 
        // 游标分批获取用户id列表
        // 先查最早注册的用户数据
        LambdaQueryWrapper<User> buildCursor = Wrappers.lambdaQuery(User.class)
                .select(User::getId)
                .orderByAsc(User::getCreateTime)
                .last("limit 1");
 
        User earliestUser = userMapper.selectOne(buildCursor);
 
        // 构造游标
        int batchSize = 1000;
        Long cursor = earliestUser.getId();
 
        List<CompletableFuture<Void>> futures = new ArrayList<>();
        // 游标查询
        while (true) {
            // 构建查询条件
            LambdaQueryWrapper<User> queryWrapper = Wrappers.lambdaQuery(User.class)
                    .select(User::getId)
                    .gt(User::getId, cursor)
                    .orderByAsc(User::getId)
                    .last("limit " + batchSize);
 
            // 查询
            List<Long> batchUserIds = userMapper.selectList(queryWrapper)
                    .stream()
                    .map(User::getId)
                    .toList();
 
            // 如果没有数据则结束查询
            if (batchUserIds.isEmpty()) break;
 
            // 先更新游标，即使后面出错，也不影响后面的查询
            cursor = batchUserIds.getLast();
 
            // 添加到结果列表中
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                try {
                    dealUserIds(batchUserIds);
                } catch (Exception e) {
                    log.error("处理好友关系时出错, batchSize={}", batchUserIds.size(), e);
                }
            }, threadPoolExecutor);
            futures.add(future);
        }
 
        // 统一等待所有批次完成
        ThreadPoolUtil.allFuturesWait(futures);
 
        log.info("用户好友关系检查完成，结束时间：{} , 执行时长：{}", LocalDateTime.now() , Duration.between(now, LocalDateTime.now()).getSeconds());
    }
 
    private void dealUserIds(List<Long> userIds) {
        // 遍历用户id列表，检查用户互关关系，从而得到现在用户应该有的好友关系
        for (Long userId : userIds) {
 
            log.info("开始检查id为：{} 的好友关系", userId);
 
            try {
                // 获取用户当前的关注对象id集合
                LambdaQueryWrapper<Follow> isFollowQueryWrapper = Wrappers.lambdaQuery(Follow.class)
                        .eq(Follow::getMyUserId, userId);
                List<Long> userFollowingIds = followMapper.selectList(isFollowQueryWrapper).stream()
                        .map(Follow::getFollowUserId)
                        .toList();
 
                //  创建用户现在应该有的好友关系的集合
                List<Long> expectedFriendIds = new ArrayList<>();
 
                // 遍历用户关注对象id列表，检查用户是否互相关注
                if (!userFollowingIds.isEmpty()) {
                    // 查询所有互相关注的用户
                    LambdaQueryWrapper<Follow> mutualFollowWrapper = Wrappers.lambdaQuery(Follow.class)
                            .eq(Follow::getFollowUserId, userId)
                            .in(Follow::getMyUserId, userFollowingIds);
                    List<Follow> mutualFollows = followMapper.selectList(mutualFollowWrapper);
 
                    // 提取互相关注的用户ID
                    expectedFriendIds = mutualFollows.stream()
                            .map(Follow::getMyUserId)
                            .toList();
                }
 
                // 比较用户现在应该有的好友关系和用户当前的关注关系，如果不一致，则更新用户好友关系和redis数据
                if(!expectedFriendIds.equals(userFollowingIds)) {
                    // 删除用户好友表并进行更新
                    LambdaQueryWrapper<Friend> deleteByMyUserId = Wrappers.lambdaQuery(Friend.class)
                            .eq(Friend::getMyUserId, userId);
                    friendMapper.delete(deleteByMyUserId);
 
                    // 插入新的好友表数据
                    for (Long expectedFriendId : expectedFriendIds) {
                        Friend friend = Friend.builder()
                                .myUserId(userId)
                                .friendUserId(expectedFriendId)
                                .build();
                        friendMapper.insert(friend);
                    }
 
                    // 删除现在的redis并进行更新
                    redisTemplate.delete(RedisConstant.FRIEND_USER_FOLLOW + userId);
 
                    // 插入新的redis数据
                    if (!expectedFriendIds.isEmpty()) {
                        redisTemplate.opsForSet().add(RedisConstant.FRIEND_USER_FOLLOW + userId, expectedFriendIds.toArray());
                    }
                }
            } catch (Exception e) {
                log.error("检查用户id为{}的好友关系并更新出错：{}",userId, e.getMessage());
            }
        }
    }
}
```
 


### （二）最终方案
 


```java
@Slf4j
@RequiredArgsConstructor
@Component
public class CheckAndUpdateFriendTask {
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserMapper userMapper;
    private final FriendMapper friendMapper;
    private final FollowMapper followMapper;
    private final ThreadPoolExecutor threadPoolExecutor;
 
    // 批量插入大小
    private static final int BATCH_INSERT_SIZE = 1000;
 
    @Transactional
    @Scheduled(cron = "0 0 2 * * ?")
    public void processCheckAndUpdateFriend() {
        LocalDateTime now = LocalDateTime.now();
        log.info("开始检查用户好友关系并更新，执行时间：{}", now);
 
        // 全量加载用户ID(因为数据量不大，所以一次性加载没有问题)
        List<Long> allUserIds = userMapper.selectList(Wrappers.lambdaQuery(User.class)
                .select(User::getId)).stream()
                .map(User::getId)
                .toList();
 
        // 加载所有关注关系
        List<Follow> allFollows = followMapper.selectList(Wrappers.emptyWrapper());
 
        // 构建关系映射
        Map<Long, Set<Long>> followingsMap = new HashMap<>(allUserIds.size());
        Map<Long, Set<Long>> followersMap = new HashMap<>(allUserIds.size());
 
        allFollows.forEach(follow -> {
            followingsMap.computeIfAbsent(follow.getMyUserId(), k -> new HashSet<>())
                    .add(follow.getFollowUserId());
            followersMap.computeIfAbsent(follow.getFollowUserId(), k -> new HashSet<>())
                    .add(follow.getMyUserId());
        });
 
        // 分片处理（每 5000 用户一个分片）
        int sliceSize = 5000;
        List<List<Long>> userSlices = Lists.partition(allUserIds, sliceSize);
 
        // 并行处理分片
        List<CompletableFuture<Void>> futures = userSlices.stream()
                .map(slice -> CompletableFuture.runAsync(() ->
                        processUserSlice(slice, followingsMap, followersMap), threadPoolExecutor))
                .collect(Collectors.toList());
 
        // 等待所有分片完成
        ThreadPoolUtil.allFuturesWait(futures);
 
        log.info("用户好友关系检查完成，结束时间：{} , 执行时长：{}s", LocalDateTime.now(), Duration.between(now, LocalDateTime.now()).getSeconds());
    }
 
    private void processUserSlice(List<Long> userIds, Map<Long, Set<Long>> followingsMap, Map<Long, Set<Long>> followersMap) {
 
        // 获取现有好友关系
        Map<Long, Set<Long>> currentFriendsMap = getCurrentFriends(userIds);
 
        // 记录需要更新的用户
        Set<Long> changedUserIds = new HashSet<>();
        // 需要插入的新数据
        List<Friend> toInsert = new ArrayList<>();
        // 需要更新的Redis数据
        Map<Long, Set<Long>> redisUpdates = new HashMap<>();
 
        for (Long userId : userIds) {
            // 计算互关关系（交集）
            Set<Long> followings = followingsMap.getOrDefault(userId, Collections.emptySet());
            Set<Long> followers = followersMap.getOrDefault(userId, Collections.emptySet());
            Set<Long> mutualFollows = Sets.intersection(followings, followers);
 
            // 检测变更
            Set<Long> currentFriends = currentFriendsMap.getOrDefault(userId, Collections.emptySet());
            if (!mutualFollows.equals(currentFriends)) {
                // 添加变更用户
                changedUserIds.add(userId);
                // 收集数据库更新
                mutualFollows.forEach(friendId ->
                        toInsert.add(Friend.builder()
                                .myUserId(userId)
                                .friendUserId(friendId)
                                .build()));
 
                // 收集Redis更新
                redisUpdates.put(userId, mutualFollows);
            }
        }
 
        // 批量更新数据库
        if (!changedUserIds.isEmpty()) {
            // 批量删除旧数据
            friendMapper.delete(Wrappers.lambdaQuery(Friend.class)
                    .in(Friend::getMyUserId, changedUserIds));
 
            // 批量插入新数据
            if (!toInsert.isEmpty()) {
                List<List<Friend>> batches = Lists.partition(toInsert, BATCH_INSERT_SIZE);
                batches.forEach(batch -> {
                    if (!batch.isEmpty()) {
                        batch.forEach(friendMapper::insert);
                    }
                });
            }
        }
 
        // 批量更新Redis
        if (!redisUpdates.isEmpty()) {
            batchUpdateRedis(redisUpdates);
        }
    }
 
    // 批量获取现有好友关系
    private Map<Long, Set<Long>> getCurrentFriends(List<Long> userIds) {
        if (CollectionUtils.isEmpty(userIds)) {
            return Collections.emptyMap();
        }
 
        Map<Long, Set<Long>> result = new HashMap<>();
        friendMapper.selectList(Wrappers.lambdaQuery(Friend.class)
                        .in(Friend::getMyUserId, userIds))
                .forEach(friend -> result.computeIfAbsent(friend.getMyUserId(), k -> new HashSet<>())
                        .add(friend.getFriendUserId()));
 
        return result;
    }
 
    // 批量更新Redis
    void batchUpdateRedis(Map<Long, Set<Long>> updates) {
        try (RedisConnection connection = Objects.requireNonNull(redisTemplate.getConnectionFactory()).getConnection()) {
            connection.openPipeline();
 
            RedisKeyCommands keyCommands = connection.keyCommands();
            RedisSetCommands setCommands = connection.setCommands();
 
            updates.forEach((userId, friendIds) -> {
                String key = RedisConstant.FRIEND_USER_FOLLOW + userId;
                // 删除旧数据
                keyCommands.del(key.getBytes());
 
                // 插入新数据
                if (!friendIds.isEmpty()) {
                    byte[][] members = friendIds.stream()
                            .map(String::valueOf)
                            .map(String::getBytes)
                            .toArray(byte[][]::new);
                    setCommands.sAdd(key.getBytes(), members);
                }
            });
 
            connection.closePipeline();
        }
    }
}
```
 


---
 


如果你有更好的方案，请在评论区告诉我！
 


**~码文不易，留个赞再走吧~**

---
> 原文链接: [116 秒→6 秒：Redis 管道+批处理优化用户好友关系校验的方案](https://blog.csdn.net/2401_88959292/article/details/148616888?spm=1001.2014.3001.5501)
> 作者: Yilena
