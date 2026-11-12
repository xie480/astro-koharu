---
"title": "带你轻松学习JUC"
"link": "dai-ni-qing-song-xue-xi-juc"
"author": "Yilena"
"date": "2025-10-15"
"description": "本文系统讲解了Java并发编程核心工具包JUC。从线程基础、状态转换及活跃性问题（死锁、活锁、饥饿）入手，深入剖析了线程安全判断、逃逸分析及AQS底层原理。详细对比了synchronized的锁升级机制与ReentrantLock的核心特性，解析了volatile的可见性与Happens-Before规则。此外，还全面介绍了CAS机制、各类原子类、并发同步器（CountDownLatch等）、线程池原理及多种线程安全集合，为开发者构建了完整的Java高并发知识体系。"
"cover": "https://i-blog.csdnimg.cn/direct/f092fedf7e454ea1b773257b9f9ef198.png"
"tags":
  - "JUC"
  - "并发编程"
  - "Java"
"categories":
  - "技术笔记"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/149500338?spm=1001.2014.3001.5501"
---

**目录**
 


[一、什么是 JUC？](#%E4%B8%80%E3%80%81%E4%BB%80%E4%B9%88%E6%98%AFJUC%EF%BC%9F)
 


[二、线程的定义以及常用方法](#%E4%BA%8C%E3%80%81%E7%BA%BF%E7%A8%8B%E7%9A%84%E5%AE%9A%E4%B9%89%E4%BB%A5%E5%8F%8A%E5%B8%B8%E7%94%A8%E6%96%B9%E6%B3%95)
 


[（一）定义](#%EF%BC%88%E4%B8%80%EF%BC%89%E5%AE%9A%E4%B9%89)
 


[（二）常用方法](#%EF%BC%88%E4%BA%8C%EF%BC%89%E5%B8%B8%E7%94%A8%E6%96%B9%E6%B3%95)
 


[三、线程的六种状态转换](#%E4%B8%89%E3%80%81%E7%BA%BF%E7%A8%8B%E7%9A%84%E5%85%AD%E7%A7%8D%E7%8A%B6%E6%80%81%E8%BD%AC%E6%8D%A2)
 


[四、线程活跃性](#%E5%9B%9B%E3%80%81%E7%BA%BF%E7%A8%8B%E6%B4%BB%E8%B7%83%E6%80%A7)
 


[（一）死锁](#%EF%BC%88%E4%B8%80%EF%BC%89%E6%AD%BB%E9%94%81)
 


[（二）活锁](#%EF%BC%88%E4%BA%8C%EF%BC%89%E6%B4%BB%E9%94%81)
 


[（三）饥饿](#%EF%BC%88%E4%B8%89%EF%BC%89%E9%A5%A5%E9%A5%BF)
 


[五、如何判断代码是否线程安全？](#%E4%BA%94%E3%80%81%E5%A6%82%E4%BD%95%E5%88%A4%E6%96%AD%E4%BB%A3%E7%A0%81%E6%98%AF%E5%90%A6%E7%BA%BF%E7%A8%8B%E5%AE%89%E5%85%A8%EF%BC%9F)
 


[（一）变量的线程安全分析](#%EF%BC%88%E4%B8%80%EF%BC%89%E5%8F%98%E9%87%8F%E7%9A%84%E7%BA%BF%E7%A8%8B%E5%AE%89%E5%85%A8%E5%88%86%E6%9E%90)
 


[（二）线程八锁](#%EF%BC%88%E4%BA%8C%EF%BC%89%E7%BA%BF%E7%A8%8B%E5%85%AB%E9%94%81)
 


[（三）逃逸分析](#%EF%BC%88%E4%B8%89%EF%BC%89%E9%80%83%E9%80%B8%E5%88%86%E6%9E%90)
 


[六、AQS](#%E5%85%AD%E3%80%81AQS)
 


[（一）底层实现原理](#%EF%BC%88%E4%B8%80%EF%BC%89%E5%BA%95%E5%B1%82%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86)
 


[七、synchronized](#%E4%B8%83%E3%80%81synchronized)
 


[（一）对象头](#%EF%BC%88%E4%B8%80%EF%BC%89%E5%AF%B9%E8%B1%A1%E5%A4%B4)
 


[（二）Monitor](#%EF%BC%88%E4%BA%8C%EF%BC%89Monitor)
 


[（三）锁升级机制](#%EF%BC%88%E4%B8%89%EF%BC%89%E9%94%81%E5%8D%87%E7%BA%A7%E6%9C%BA%E5%88%B6)
 


[（四）优劣](#%EF%BC%88%E5%9B%9B%EF%BC%89%E4%BC%98%E5%8A%A3)
 


[八、ReentrantLock](#%E5%85%AB%E3%80%81ReentrantLock)
 


[（一）核心特性](#%EF%BC%88%E4%B8%80%EF%BC%89%E6%A0%B8%E5%BF%83%E7%89%B9%E6%80%A7)
 


[（二）核心方法](#%EF%BC%88%E4%BA%8C%EF%BC%89%E6%A0%B8%E5%BF%83%E6%96%B9%E6%B3%95)
 


[（三）底层实现原理](#%EF%BC%88%E4%B8%89%EF%BC%89%E5%BA%95%E5%B1%82%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86)
 


[（四）与 synchronized 对比](#%EF%BC%88%E5%9B%9B%EF%BC%89%E4%B8%8Esynchronized%E5%AF%B9%E6%AF%94)
 


[九、volatile](#%E4%B9%9D%E3%80%81volatile%C2%A0)
 


[（一）核心特性](#%EF%BC%88%E4%B8%80%EF%BC%89%E6%A0%B8%E5%BF%83%E7%89%B9%E6%80%A7)
 


[十、Happens-Before 规则](#%E5%8D%81%E3%80%81Happens-Before%E8%A7%84%E5%88%99)
 


[十一、CAS](#%E5%8D%81%E4%B8%80%E3%80%81CAS%C2%A0)
 


[（一）核心特性](#%EF%BC%88%E4%B8%80%EF%BC%89%E6%A0%B8%E5%BF%83%E7%89%B9%E6%80%A7)
 


[（二）底层实现原理](#%EF%BC%88%E4%BA%8C%EF%BC%89%E5%BA%95%E5%B1%82%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86)
 


[（三）ABA 问题](#%EF%BC%88%E4%B8%89%EF%BC%89ABA%E9%97%AE%E9%A2%98)
 


[十二、原子类](#%E5%8D%81%E4%BA%8C%E3%80%81%E5%8E%9F%E5%AD%90%E7%B1%BB)
 


[（一）原子整数](#%EF%BC%88%E4%B8%80%EF%BC%89%E5%8E%9F%E5%AD%90%E6%95%B4%E6%95%B0)
 


[（二）原子引用](#%EF%BC%88%E4%BA%8C%EF%BC%89%E5%8E%9F%E5%AD%90%E5%BC%95%E7%94%A8)
 


[（三）原子数组](#%EF%BC%88%E4%B8%89%EF%BC%89%E5%8E%9F%E5%AD%90%E6%95%B0%E7%BB%84)
 


[（四）原子更新器](#%EF%BC%88%E5%9B%9B%EF%BC%89%E5%8E%9F%E5%AD%90%E6%9B%B4%E6%96%B0%E5%99%A8)
 


[（五）原子累加器（LongAdder）](#%EF%BC%88%E4%BA%94%EF%BC%89%E5%8E%9F%E5%AD%90%E7%B4%AF%E5%8A%A0%E5%99%A8%EF%BC%88LongAdder%EF%BC%89)
 


[十三、CountDownLatch &CyclicBarrier & Semaphore](#%E5%8D%81%E4%B8%89%E3%80%81CountDownLatch%20%26CyclicBarrier%20%26%C2%A0Semaphore)
 


[（一）CountDownLatch](#%EF%BC%88%E4%B8%80%EF%BC%89CountDownLatch)
 


[（二）CyclicBarrier](#%EF%BC%88%E4%BA%8C%EF%BC%89CyclicBarrier)
 


[（三）Semaphore](#%EF%BC%88%E4%B8%89%EF%BC%89Semaphore)
 


[（四）对比](#%EF%BC%88%E5%9B%9B%EF%BC%89%E5%AF%B9%E6%AF%94)
 


[十四、线程池](#%E5%8D%81%E5%9B%9B%E3%80%81%E7%BA%BF%E7%A8%8B%E6%B1%A0)
 


[（一）ThreadPoolExecutor](#%EF%BC%88%E4%B8%80%EF%BC%89ThreadPoolExecutor)
 


[（二）Executors](#%EF%BC%88%E4%BA%8C%EF%BC%89Executors)
 


[（三）如何确定线程池的最大线程数？](#%EF%BC%88%E4%B8%89%EF%BC%89%E5%A6%82%E4%BD%95%E7%A1%AE%E5%AE%9A%E7%BA%BF%E7%A8%8B%E6%B1%A0%E7%9A%84%E6%9C%80%E5%A4%A7%E7%BA%BF%E7%A8%8B%E6%95%B0%EF%BC%9F)
 


[（四）Tomcat 线程池](#%EF%BC%88%E5%9B%9B%EF%BC%89Tomcat%E7%BA%BF%E7%A8%8B%E6%B1%A0)
 


[（五）Fork/Join 框架](#%EF%BC%88%E4%BA%94%EF%BC%89Fork%2FJoin%E6%A1%86%E6%9E%B6)
 


[（六）CompletableFuture](#%EF%BC%88%E5%85%AD%EF%BC%89CompletableFuture)
 


[十五、ReentrantReadWriteLock &StampedLock](#%E5%8D%81%E4%BA%94%E3%80%81ReentrantReadWriteLock%20%26StampedLock)
 


[（一）ReentrantReadWriteLock](#%EF%BC%88%E4%B8%80%EF%BC%89ReentrantReadWriteLock)
 


[（二）StampedLock](#%EF%BC%88%E4%BA%8C%EF%BC%89StampedLock)
 


[十六、线程安全集合](#%E5%8D%81%E5%85%AD%E3%80%81%E7%BA%BF%E7%A8%8B%E5%AE%89%E5%85%A8%E9%9B%86%E5%90%88)
 


[（一）ArrayList&Vector & CopyOnWriteArrayList](#%EF%BC%88%E4%B8%80%EF%BC%89ArrayList%26Vector%20%26%C2%A0CopyOnWriteArrayList)
 


[（二）HashMap & HashTable & ConcurrentHashMap & ConcurrentSkipListMap](#%EF%BC%88%E4%BA%8C%EF%BC%89HashMap%20%26%20HashTable%20%26%C2%A0ConcurrentHashMap%20%26%C2%A0ConcurrentSkipListMap)
 


[（三）HashSet & ConcurrentSkipListSet & CopyOnWriteArraySet](#%EF%BC%88%E4%B8%89%EF%BC%89HashSet%20%26%C2%A0ConcurrentSkipListSet%20%26%20CopyOnWriteArraySet)
 


[（四）Queue & ConcurrentLinkedQueue & LinkedBlockingQueue](#%EF%BC%88%E5%9B%9B%EF%BC%89Queue%20%26%20ConcurrentLinkedQueue%20%26%C2%A0LinkedBlockingQueue)
 


[（五）Deque & LinkedBlockingDeque & ConcurrentLinkedDeque](#%EF%BC%88%E4%BA%94%EF%BC%89Deque%20%26%C2%A0LinkedBlockingDeque%20%26%20ConcurrentLinkedDeque)
 


[十七、设计模式](#%E5%8D%81%E4%B8%83%E3%80%81%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F)
 


[（一）两阶段终止](#%EF%BC%88%E4%B8%80%EF%BC%89%E4%B8%A4%E9%98%B6%E6%AE%B5%E7%BB%88%E6%AD%A2)
 


[（二）保护式暂停](#%EF%BC%88%E4%BA%8C%EF%BC%89%E4%BF%9D%E6%8A%A4%E5%BC%8F%E6%9A%82%E5%81%9C)
 


[（三）生产者与消费者](#%EF%BC%88%E4%B8%89%EF%BC%89%E7%94%9F%E4%BA%A7%E8%80%85%E4%B8%8E%E6%B6%88%E8%B4%B9%E8%80%85)
 


[（四）固定运行顺序](#%EF%BC%88%E5%9B%9B%EF%BC%89%E5%9B%BA%E5%AE%9A%E8%BF%90%E8%A1%8C%E9%A1%BA%E5%BA%8F)
 


[（五）犹豫模式](#%EF%BC%88%E4%BA%94%EF%BC%89%E7%8A%B9%E8%B1%AB%E6%A8%A1%E5%BC%8F)
 


[（六）不可变对象](#%EF%BC%88%E5%85%AD%EF%BC%89%E4%B8%8D%E5%8F%AF%E5%8F%98%E5%AF%B9%E8%B1%A1)
 


[（七）享元模式](#%EF%BC%88%E4%B8%83%EF%BC%89%E4%BA%AB%E5%85%83%E6%A8%A1%E5%BC%8F)
 


[十八、ThreadLocal](#%EF%BC%88%E5%85%AB%EF%BC%89ThreadLocal)
 


[（一）set 方法](#%EF%BC%88%E4%B8%80%EF%BC%89set%E6%96%B9%E6%B3%95)
 


[（二）get 方法](#%EF%BC%88%E4%BA%8C%EF%BC%89get%E6%96%B9%E6%B3%95)
 


[（三）remove 方法](#%EF%BC%88%E4%B8%89%EF%BC%89remove%E6%96%B9%E6%B3%95)
 


---
 


 
 


## 一、什么是 JUC？
 


JUC（ Util Concurrent） 是 Java 中处理并发编程的核心工具包，全称为 java.util.concurrent。它提供了一套强大的 API，用于简化开发，解决并发场景下的线程安全、性能优化和线程协作问题。JDK 1.5 引入，是构建高并发系统的基石。
 


---
 


## 二、线程的定义以及常用方法
 


### （一）定义
 


线程是 CPU 调度的最小执行单位，是进程的执行单元。
 


创建方式如下：
 


| 方式 | 实现逻辑 | 优势 |
| --- | --- | --- |
| 继承 Thread 类 | 重写 run()方法，调用 start()启动线程 | 代码简单 |
| 实现 Runnable 接口 | 实现 run()方法，实例作为参数传入 Thread 构造器 | 灵活，可继承其他类或实现更多接口 |
| 实现  Callable+Future | 实现 call()方法（有返回值），配合 FutureTask | 支持返回结果和异常处理 |

 


### （二）常用方法
 


**1.启动与终止**
 


- start()：启动线程，触发 run()方法异步执行（只能调用一次）
- run()：定义线程任务逻辑（直接调用会变为普通方法执行，也就不会启用另一个线程）
- interrupt()：中断线程（设置中断标志）
- isInterrupted()：检查中断状态（不清除标志）
 


**2.线程阻塞与唤醒**
 


- sleep(long millis)： 当前线程休眠指定毫秒，进入 TIMED_WAITING 状态，不释放锁，抛出异常响应中断
- join() / join(long millis)： 阻塞当前线程，等待目标线程终止
- yield()： 主动让出 CPU 时间片，进入就绪状态
 


**3.线程优先级**
 


- setPriority(int priority)：设置优先级（1~10，默认 5）
- getPriority()：获取优先级
 


> 
>  注意线程优先级只是起到参考作用，增加一定调度概率，不能保证绝对顺序。 
> 
 


**4.守护线程**
 


- setDaemon(true)：设为守护线程（需在 start()前调用）
- isDaemon()：检查是否为守护线程
 


> 
>  一般创建的线程都是非守护线程，而守护线程顾名思义就是守护这些非守护线程，当所有非守护线程终止时，守护线程也会随之终止。 
> 
 


**5.****对象锁操作（需在 synchronized 块内调用）**
 


- wait() / wait(long timeout)： 释放当前对象锁，线程进入 WAITING/TIMED_WAITING 状态
- notify() / notifyAll()： 唤醒在此对象锁上等待的单个/所有线程，唤醒后的线程需要重新竞争锁
 


> 
>  注意！wait&notify 的使用存在以下两个风险：
1.虚假唤醒
操作系统调度和 JVM 是存在无故唤醒线程的概率的，这样的唤醒就叫虚假唤醒。为了防止虚假唤醒执行线程逻辑，所以需要用 while 循环包裹 wait 语句来检查是否满足了唤醒条件。
2.锁对象变更
如果锁对象被重赋值了，会导致 wait 和 notify 语句所处的同步块所关联的对象不一致，从而导致线程永久阻塞。所以我们应该用 final 修饰锁对象。
3.线程饥饿
由于 notify 是随机唤醒等待线程，可能存在部分线程一直抢占不到锁从而导致饥饿。 
>   
>  wait 对比 sleep 
>   
>    特性  wait()  sleep()  锁释放  释放锁  不释放锁  调用位置  必须在同步块内  任意位置  唤醒方式  被通知/超时/中断  仅超时/中断  所属类  Object  Thread  
>   
> 
 


而 park/unpark 则优化了 wait/notify 的以上这些问题 ：
 


- park() / parkNanos(long nanos): 线程进入 WAITING/TIMED_WAITING 状态
- unpark(Thread thread):  唤醒指定线程
 


> 
>  相比 wait/notify 具备以下优势： 
>  无需锁关联：不依赖 synchronized 块，可直接操作目标线程。精准唤醒：通过 Thread 对象指定唤醒线程。时序灵活性：unpark 先于 park 调用时，park 不会阻塞（免死锁）。 
>   
>    特性  park/unpark  wait/notify  锁依赖  无需锁  必须在 synchronized 块内  精准控制  可指定唤醒线程  随机唤醒（notify）或全部唤醒  时序容错  unpark 先于 park 可避免阻塞  先 notify 后 wait 会永久阻塞  所属类  LockSupport  Object  超时控制  支持纳秒级超时  仅支持毫秒级超时  异常机制  中断抛 InterruptedException  中断抛 InterruptedException  
>    
>   实现原理：
使用一次 unpark 会给该线程补充一次许可，而 park 会消耗一次许可，当使用 park 时不存在许可的时候就会进入等待状态。许可的数量上限只有一次。 
>   
> 
 


---
 


## 三、线程的六种状态转换
 


![](https://i-blog.csdnimg.cn/direct/f092fedf7e454ea1b773257b9f9ef198.png)
 


**1.各状态说明**
 


- NEW（新建）
  - 线程实例化后，start() 方法未调用
  - 系统资源已分配但未执行线程逻辑
- RUNNABLE（可运行）
  - 包含操作系统的 就绪（READY） 和 运行中（RUNNING）
  - 调用 start() 后进入此状态，等待或占用 CPU 资源
- BLOCKED（阻塞）
  - 唯一触发场景：竞争 synchronized 锁失败
  - 等待其他线程释放对象监视器（Monitor）
- WAITING（无限等待）
  - 需其他线程显式唤醒（无超时机制）
  - 触发方法：wait / join / park
- TIMED_WAITING（超时等待）
  - 有限时长等待，超时自动恢复
  - 触发方法：sleep(time)/ wait(timeout) / join(timeout)
- TERMINATED（终止）
  - run() 方法执行完毕或抛出未捕获异常
  - 线程生命周期结束
 


**2.状态转换**
 


1. NEW → RUNNABLE
 


- 唯一触发方式：start()
 


2. RUNNABLE ↔ BLOCKED
 


- 进入阻塞：尝试获取已被占用的 synchronized 锁
- 恢复运行：锁释放后，重新竞争成功（需经过操作系统调度）
 


3. RUNNABLE → WAITING
 


- wait()：释放锁并进入等待队列（需在同步块内调用）
- join()：底层通过 wait() 实现
 


4. RUNNABLE → TIMED_WAITING
 


- sleep(time)：不释放锁，单纯暂停执行
- wait(timeout)：释放锁并设置超时
 


5. 等待 → RUNNABLE
 
 
 

| 等待状态 | 唤醒条件 | 后续动作 |
| --- | --- | --- |
| WAITING | notify()/notifyAll() | 进入 BLOCKED 竞争锁 |
| TIMED_WAITING | 超时 / notify() / interrupt() | 进入 BLOCKED 竞争锁 |

 
 


6. → TERMINATED
 


- 正常终止：run() 方法执行到末尾
- 异常终止：未捕获异常导致线程退出
 


---
 


## 四、线程活跃性
 


线程活跃性指线程因外部原因无法正常终止或推进的状态。当线程逻辑代码有限，但由于资源竞争或调度问题导致长期无法完成执行任务时，即发生活跃性问题。活跃性障碍主要分为三类：
 


- 死锁（Deadlock）：多线程因循环等待资源而永久阻塞
- 活锁（Livelock）：线程持续响应冲突但无法推进任务
- 饥饿（Starvation）：线程长期无法获取所需资源
 


### （一）死锁
 


**1.发生条件（需同时满足）**
 


1. 互斥：资源同一时间仅能被一个线程持有
2. 持有并等待：线程持有资源时继续申请新资源
3. 不可抢占：资源只能由持有线程主动释放
4. 循环等待：线程间形成资源等待环
 


```java
// 筷子类（共享资源）
class Chopstick {}
// 哲学家线程
class Philosopher extends Thread {
    private Chopstick left, right;
    public void run() {
        synchronized(left) {          // 获取左筷子
            synchronized(right) {     // 试图获取右筷子
                eat();                // 若右筷子被占则阻塞
            }
        }
    }
}
// 若所有哲学家同时拿起左侧筷子 → 循环等待右侧筷子 → 死锁
```
 


**2.解决方案**
 


- 顺序加锁：统一资源获取顺序
- 超时释放：tryLock(timeout)打破无限等待
- 资源剥夺：设定优先级，强制回收部分资源
 


### （二）活锁
 


**1.特征**
 


- 线程未被阻塞，但任务无实质进展
- 常因冲突处理逻辑设计不当引起
 


**2.典型场景**
 


1. 消息处理失败循环：
  - 线程处理失败 → 消息回滚至队列开头 → 重复失败
2. 过度礼让冲突：

```java
  // 线程A
   while (!acquireLock()) {
       Thread.sleep(randTime); // 随机退避
   }
   // 线程B逻辑相同，若退避时间巧合仍可能持续冲突
```

 


**3.解决策略**
 


- 引入随机性：冲突时随机等待时间
- 限制重试次数：超出阈值后移交任务至错误处理逻辑
 


### （三）饥饿
 


**1.成因**
 


- 线程优先级失衡：高优先级线程持续占用资源
- 锁机制不公平
- 资源持有时间过长：某线程长期占用关键资源
 


```java
synchronized(lock) {
    // 长时间操作（>10s）
    processBatchData(); 
} 
// 等待线程在此期间无法获得锁
```
 


**2.解决策略**
 


- 使用公平锁：ReentranLock 一类
- 进行任务均分：让线程池轮询执行小任务
 


---
 


## 五、如何判断代码是否？
 


### （一）变量的线程安全分析
 


首先需要了解线程安全的三大特性：原子性、可见性和有序性。
 


- 原子性需要保障组合操作只需一步完成，避免不同线程指令交错引发的并发问题
- 可见性需要保障线程内存和主内存数据一致，防止线程读取的缓存数据与主内存新数据不一致
- 有序性需要防止 JVM 的指令重排序引发的并发问题
 


只有同时满足以上三个性质才能保证线程安全。
 


让我们来看看如何判断对一个变量的操作是否满足线程安全的条件。
 


**1.成员变量/静态变量**
 


- 未共享：线程安全，因为只有当前线程才能访问，自然不会有并发问题。
- 被共享时：
  - 仅读：线程安全
  - 含写：线程不安全，需要加锁或者使用原子类。
 


**2.局部变量**
 


- 基本数据类型：线程安全，每个线程独享栈帧。
- 引用对象：
  - 始终在局部方法作用域中：线程安全。
  - 逃逸（可以被其他线程访问）：线程不安全，需要加锁或者使用原子类。
 


### （二）线程八锁
 


以下八个场景，请分析最后输出的结果顺序如何。
 


**1.同对象两个同步方法**
 


```java
class Phone {
    public synchronized void sendEmail() {
        System.out.println("**sendEmail");
    }
    public synchronized void sendSMS() {
        System.out.println("**sendSMS");
    }
}
public static void main(String[] args) {
    Phone phone = new Phone();
    new Thread(() -> phone.sendEmail()).start();
    new Thread(() -> phone.sendSMS()).start();
}
```
 


由于两个方法的同步块所关联的锁对象是一致的，所以一定时互斥执行，但无法保证一定的执行顺序。
 


执行结果：随机。
 


**2.同对象同步方法含延迟**
 


```java
class Phone {
    public synchronized void sendEmail() {
        Thread.sleep(400); 
        System.out.println("**sendEmail");
    }
    public synchronized void sendSMS() {
        System.out.println("**sendSMS");
    }
}
```
 


即使加入了延迟，关联的锁对象一致的本质依旧存在，因此执行顺序与原因和场景 1 完全一致。
 


执行结果：随机。
 


**3.同步+普通**
 


```java
class Phone {
    public synchronized void sendEmail() {
        Thread.sleep(400);
        System.out.println("**sendEmail");
    }
    public void sayHello() { // 普通方法
        System.out.println("**sayHello");
    }
}
public static void main(String[] args) {
    Phone phone = new Phone();
    new Thread(() -> phone.sendEmail()).start();
    new Thread(() -> phone.sayHello()).start(); // 调用普通方法
}
```
 


只有一个线程调用同步方法，因此同步块失效，由于存在休眠时间，所以一定先打印普通方法的结果。
 


执行结果： 先 Hello 后 Email
 


**4.不同对象调用同步方法**
 


```java
public static void main(String[] args) {
    Phone phone1 = new Phone();
    Phone phone2 = new Phone();
    // 此处的两个方法都加了同步块，关联实例对象，同场景1
    new Thread(() -> phone1.sendEmail()).start();
    new Thread(() -> phone2.sendSMS()).start(); 
}
```
 


不同实例，因此同步块失效，不存在竞争，并行结果打印顺序取决于线程执行速度。
 


执行结果：随机。
 


**5.同对象两个静态同步方法**
 


```java
class Phone {
    public static synchronized void sendEmail() {
        Thread.sleep(400);
        System.out.println("**sendEmail");
    }
    public static synchronized void sendSMS() {
        System.out.println("**sendSMS");
    }
}
public static void main(String[] args) {
    Phone phone = new Phone();
    new Thread(() -> phone.sendEmail()).start();
    new Thread(() -> phone.sendSMS()).start();
}
```
 


关联 Phone 类对象，全局唯一因此互斥竞争。
 


执行结果：随机。
 


**6.两个对象调用静态同步方法**
 


```java
public static void main(String[] args) {
    Phone phone1 = new Phone();
    Phone phone2 = new Phone();
    // 方法实现同场景5
    new Thread(() -> phone1.sendEmail()).start(); 
    new Thread(() -> phone2.sendSMS()).start(); 
}
```
 


执行顺序与理由与场景 5 完全一致，静态同步块关联的是类对象，与实例无关。
 


执行结果：随机。
 


**7.同对象调用静态同步+普通同步**
 


```java
class Phone {
    public static synchronized void sendEmail() {
        Thread.sleep(400);
        System.out.println("**sendEmail");
    }
    public synchronized void sendSMS() { // 实例同步方法
        System.out.println("**sendSMS");
    }
}
public static void main(String[] args) {
    Phone phone = new Phone();
    new Thread(() -> phone.sendEmail()).start(); // 类锁
    new Thread(() -> phone.sendSMS()).start();   // 实例锁
}
```
 


一个关联实例对象一个关联类对象，不存在竞争，并行执行。
 


执行结果：先 SMS 后 Email。
 


**8.两个对象调用静态同步 + 普通同步方法**
 


```java
public static void main(String[] args) {
    Phone phone1 = new Phone();
    Phone phone2 = new Phone();
    // 三个方法均无延迟
    new Thread(() -> phone1.sendEmail()).start(); // 静态方法（类锁）
    new Thread(() -> phone2.sendSMS()).start();   // 实例方法（实例锁）
    new Thread(() -> phone2.sayHello()).start();  // 普通方法（无锁）
}
```
 


 一个关联类对象一个关联实例对象一个无锁，三个线程无竞争关系。
 


执行结果：随机。
 


### （三）逃逸分析
 


![](https://i-blog.csdnimg.cn/direct/e0cc574d42804a47b6b30ccc00f5cbe4.png)
 


**1.无逃逸对象：天然线程安全**
 


- **原理**：对象仅在方法内部创建和使用（未返回、未存入共享变量、未跨线程传递），引用完全私有于当前线程。
- **线程安全结论**：此类对象无需同步，其他线程无法访问其数据
- **优化效果**：
  - **栈上分配**：对象直接分配在栈帧中，方法结束即销毁，无堆分配与 GC 压力。
  - **标量替换**：对象拆解为基本类型变量（如`int x`替代`Point.x`），消除对象内存占比。
 


**2.方法逃逸：需同步保障**
 


- **场景**：对象被方法返回、存入静态集合或作为参数传递至外部方法。
- **风险**：多线程可能通过共享引用访问同一对象，需显式同步。
- **优化失效**：对象必须在堆上分配，无法应用栈分配或标量替换 。
 


**3.线程逃逸：强制强同步**
 


- **场景**：对象一定被多线程共享（如赋值给全局静态变量）。
- **风险**：高并发竞争需锁或原子类保障。
- **优化完全失效**：对象只能在堆分配，且同步操作不可消除 。
 


| 逃逸类型 | 对象作用域 | 线程安全风险 | 优化策略 | 同步必要性 |
| --- | --- | --- | --- | --- |
| 无逃逸 | 当前方法内 | 无竞争 | 栈分配、标量替换、锁消除 | 无需同步 |
| 方法逃逸 | 跨方法但单线程 | 潜在竞争 | 无优化，堆分配 | 按需同步 |
| 线程逃逸 | 多线程共享 | 高竞争风险 | 无优化，堆分配 | 必须强同步 |

 


---
 


## 六、AQS
 


AQS 是构建 Java 并发锁和同步器的基础框架，通过 FIFO 队列管理线程排队，以 int 状态变量（state） 表示同步状态（如锁是否被占用）。
 


其核心思想是：
 


- 共享资源空闲时，立即分配线程并锁定资源。
- 资源被占用时，将线程封装为节点加入队列阻塞等待唤醒。
 


### （一）底层实现原理
 


![](https://i-blog.csdnimg.cn/direct/973e6e72ae6642d48e982ccba6ff9656.png)
 


首先了解几个概念：
 


**1. 同步状态（State）**
 


- **volatile int state**：标识资源占用状态（如 ReentrantLock 中 0=未锁定，≥1=锁定次数）。
- **原子操作**：通过 CAS 修改状态，确保线程安全。
 


**2. CLH 变体队列**
 


- **虚拟双向链表**（FIFO），存储线程的`Node`节点。
- **Node 结构**：
  - `waitStatus`：节点状态 
     

| 状态值 | 值 | 含义 |
| --- | --- | --- |
| CANCELLED | 1 | 线程已超时或中断，节点将被移除 |
| SIGNAL | -1 | 后继节点需被唤醒 |
| CONDITION | -2 | 节点在条件队列等待 |
| PROPAGATE | -3 | 共享模式下唤醒需向后传播 |
| 0 | 0 | 初始状态 |

 
    
  - `prev`,`next`：前后节点指针。
  - `thread`：绑定等待线程。
 


然后让我们结合源码分析一下 AQS 的独占锁流程：
 


**1.尝试获取锁（tryAcquire）：**
 


- 非公平锁直接使用 CAS 修改 state，成功则抢到锁或重入，否则进入队列等待。

```matlab
if (compareAndSetState(0, 1))  // CAS直接抢锁
    setExclusiveOwnerThread(Thread.currentThread());
else
    acquire(1);  // 进入队列
```

- 公平锁先检查队列，如果没有节点就抢锁，否则就进入队列等待，保证队列顺序绝对一致。

```matlab
protected boolean tryAcquire(int acquires) {
    if (getState() == 0) {
        if (!hasQueuedPredecessors() &&  // 关键：检查队列是否有等待线程
            compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(currentThread());
            return true;
        }
    }
    // 重入逻辑与非公平锁相同
}
```
 
   

| 特性 | 公平锁 | 非公平锁 (默认) |
| --- | --- | --- |
| 获取顺序 | 严格遵循 CLH 队列 FIFO 顺序 | 允许新线程插队竞争锁 |
| 实现差异点 | tryAcquire() 中调用 hasQueuedPredecessors() 校验队列 | 直接 CAS 抢占，无视队列 |
| 性能对比 | 上下文切换频繁，吞吐量低 | 减少线程唤醒开销，吞吐量高 |
| 饥饿问题 | 不会发生线程饥饿 | 高竞争下可能导致线程长时间等待 |

 
  
- 注意下面的流程是未抢到锁为前提的。
 


**2.构造节点并入队**
 


- 将当前线程封装为`Node`。
- **入队逻辑**：
  - 若队列已初始化，CAS 插入队尾。
  - 若队列未初始化，调用`enq()`自旋初始化队列并插入：

```matlab
    for (;;) {
        Node t = tail;
        if (t == null) {  // 初始化头节点（哨兵节点）
            if (compareAndSetHead(new Node())) 
                tail = head;
        } else {
            node.prev = t;
            if (compareAndSetTail(t, node)) {  // CAS插入队尾
                t.next = node;
                return t;
            }
        }
    }
```

 


** 3.队列中的自旋等待**
 


```matlab
for (;;) {
    Node p = node.predecessor();
    if (p == head && tryAcquire(arg)) {  // 前驱为头节点且抢锁成功
        setHead(node);  // 当前节点设为新头节点（移除原头节点）
        p.next = null;  // 移除原头节点引用
        return interrupted;
    }
    if (shouldParkAfterFailedAcquire(p, node))  // 检查是否需要阻塞
        interrupted |= parkAndCheckInterrupt();  
}
```
 


- 只有前驱节点是头节点时才尝试获取锁。
- `shouldParkAfterFailedAcquire()`：
  - 若前驱节点状态为`SIGNAL（-1）`，返回`true`（表示可安全阻塞）。
  - 若前驱节点状态为`CANCELLED（1）`，剔除无效节点并重试。
  - 否则，CAS 设置前驱节点为`SIGNAL`（确保后续能唤醒自己）。
- `parkAndCheckInterrupt()`：调用`park()`阻塞线程。
 


**4.后继节点唤醒**
 


当前驱节点释放锁后，调用`unparkSuccessor()`：
 


```matlab
    Node s = node.next;
    if (s != null && s.waitStatus <= 0)
        LockSupport.unpark(s.thread);  // 唤醒后继节点
```
 


被唤醒的节点会再次重试步骤 3 的流程来获取锁。 
 


---
 


## 七、
 


### （一）对象头
 


![](https://i-blog.csdnimg.cn/direct/4f07a36ff6b04051becad2e6f569b6b4.png)
 


 对象头（Object Header）是 Java 对象在堆内存中的元数据部分，存储对象的核心运行时信息，每个 Java 对象都包含对象头。
 


其结构由 JVM 实现决定，主要包括三部分：
 


1. Mark Word：存储对象自身的运行时数据（如哈希码、锁状态等）。
2. Klass Pointer（类型指针）：指向方法区中的类元数据，用于标识对象类型。
3. Array Length（数组长度）：仅数组对象独有，记录数组长度。
 


而对象头的核心就在于 Mark Word：
 
 
 

| 锁状态 | 存储内容（64 位） | 标志位 |
| --- | --- | --- |
| 无锁 | 未使用（25 位）、哈希码（31 位）、分代年龄（4 位） | 01 |
| 偏向锁 | 线程 ID（54 位）、时间戳（2 位）、分代年龄（4 位） | 01 |
| 轻量级锁 | 指向栈中锁记录的指针（62 位） | 00 |
| 重量级锁 | 指向 Monitor 的指针（62 位） | 10 |
| GC 标记 | 空（用于垃圾回收） | 11 |

 
 

这里的分代年龄指的是对象经历的 GC 次数。
 
 

>    那么对象头到底有什么作用呢？
管理锁状态，方便处理锁升级和冲突对象每在 GC 存活一次分代年龄就+1，达到 15 阈值则晋升老年代哈希码提供对象唯一标识类型指针方便 JVM 标识对象类型数组长度记录方便快速获取长度 
>  
 
 


### （二）Monitor
 


![](https://i-blog.csdnimg.cn/direct/2cd970cb9b384c708bfbc864e4a41449.png)
 


Monitor（监视器/管程） 是 Java 并发编程的核心同步机制，用于实现线程互斥与协作。
 


内部结构：
 


- Owner：持有锁的线程（同一时刻仅一个线程可成为 Owner）。
- EntrySet（阻塞队列）：竞争锁失败的线程在此等待（BLOCKED 状态）。
- WaitSet（等待队列）：调用 wait() 的线程在此等待（WAITING 状态）。
 


当使用 synchronized 同步块时，所关联的对象的对象头的 MarkWord 会记录指向 Monitor 的指针。
 


简单说一下 Monitor 的工作流程：
 


1. 当线程执行 synchronized（obj）时
  1. owner 为 null：owner 记录线程并执行同步块内代码
  2. owner 不为 null：线程进入 entryList 等待
2. 当 owner 线程执行完逻辑退出同步块的时候，会唤醒 entryList 中所有的线程，让其进行非公平竞争
3. 当 owner 线程调用 wait()时会释放锁，进入 waitSet 等待；直到其他线程唤醒后，该线程才会转移至 entrySet 进行竞争
 


### （三）锁升级机制
 


之所以 synchronized 需要升级优化，是因为其原本是重量级锁，粒度较大，性能开销大，所以这是为了平衡性能与线程安全，避免直接使用重量级锁的开销。
 


具体是否要升级取决于线程竞争剧烈程度以及对象头中 MarkWord 的动态结构。
 


**1.无锁状态**
 


此时一般是线程刚开始创建，暂无线程竞争的时候。
 


此时锁对象 MarkWord 存储哈希码、分代年龄，锁标志位为 01。
 


- 升级条件：首次访问同步块
 


**2.偏向锁**
 


此时一般是单线程重复访问同步块的时候。
 


当线程首次访问同步块的时候，锁对象 MarkWord 会记录该线程 ID，锁标志位依旧为 01。
 


等同一线程再次进入时，只要与记录的线程 ID 一致就直接执行同步块内的逻辑，无需同步操作。
 


当其他线程竞争时，发现 ID 不一致就会撤销偏向锁，当撤销次数超过 20 后就会重新将偏向锁给新的对象（重偏向）。 
 


- 升级条件：撤销次数超过 40 会禁用偏向锁，直接升级为轻量级锁
 


注意：JDK15 后就默认关闭偏向锁，因为多线程场景下偏向锁的撤销成本太高，远不如直接升级为轻量级锁。
 


**3.轻量级锁**
 


此时一般是低并发场景。
 


线程栈帧会创造一个锁记录，记录锁对象的 MarkWord，方便解锁时恢复锁对象元数据。
 


然后会通过操作尝试将锁对象 MarkWord 替换成指向该线程栈帧所记录的指针，锁标志位置为 00。
 


若成功则获取锁，失败则会进行自旋重试。
 


- 升级条件：
  - 自旋次数超过阈值（默认为 10，但 JVM 会进行自适应调整）
  - 竞争的线程数大于 2
 


**4.重量级锁**
 


此时一般是高并发、长临界区操作（同步块内即为临界区）。
 


锁对象的 MarkWord 会记录指向 Monitor 的指针进行关联，锁标志位置为 10，同时 owner 会记录该线程标识已占用锁。
 


此时竞争线程则会进入 entryList 进行阻塞等待。
 


### （四）优劣
 


**1.优点**
 


- 语法简洁，维护成本低
- 自动释放锁，避免造成死锁
- JVM 的性能优化
- 支持重入，通过计数器实现
 


**2.缺点**
 


- 无法实现读写分离
- 锁的粒度太大，高并发性能较差
- 等待锁的线程无法中断，容易引发死锁
- 无法设置锁的等待时间
- 无法获取锁的状态
 


> 
>  其实 JVM 对于 synchronized 的优化除了锁升级机制以外，主要还有三点：
如果当前不存在竞争，JVM 会消除同步块代码。如果同一线程短时间内多次对同一对象进行加锁解锁，JVM 会将这些所合并成一个粒度更大的锁，从而只需要一次加锁一次解锁。如果线程竞争锁失败，不会立刻挂起阻塞，而是会进行自旋重试，目的在于减少锁释放之前的用户态/内核态上下文转换的开销。 
> 
 


---
 


## 八、ReentrantLock
 


### （一）核心特性
 


- 可重入性：同一线程可重复获取同一把锁
- 公平性：支持公平锁和非公平锁
- 灵活性：支持尝试获取锁、超时锁、可中断锁等高级功能
- 条件变量：支持更加精细的线程等待/唤醒机制
 


### （二）核心方法
 
 
 

| 方法 | 描述 |
| --- | --- |
| lock() | 获取锁，阻塞直到成功（不可中断）。 |
| unlock() | 释放锁（必须在 finally 块中调用）。 |
| tryLock() | 尝试非阻塞获取锁，成功返回 true。 |
| tryLock(long timeout, TimeUnit unit) | 在指定时间内尝试获取锁，可响应中断。 |
| lockInterruptibly() | 获取锁，阻塞过程可响应中断。 |
| newCondition() | 创建绑定到当前锁的 Condition 对象。 |

 
 


### （三）底层实现原理
 


**1.核心设计思想**
 


ReentrantLock 基于 AQS 实现，因此内存很相似，其中 state 为 0 时表示锁未被占有，大于 1 时表示的是锁重入的次数。
 


通过 AQS 模型实现了独占模式、可重入以及公平锁与非公平锁机制。
 


**2.锁获取和释放机制**
 


基本实现与 AQS 一致，无论是公平锁还是非公平锁。
 


其中获取锁时是直接给 state++实现可重入，释放时是直到 state 减为 0 才会释放。
 


**3.可中断机制**
 


底层调用 acquireInterruptibly()，内部通过 interrupted()来检测中断信号。
 


**4.超时等待机制**
 


底层是结合 parkNanos 实现的精准无锁阻塞。
 


**5.条件变量 (Condition)**
 


每个条件变量内部都维护了一个单项条件队列，当使用 await()就会释放锁然后将线程加入条件队列进行等待，使用 signal()则会将队列头节点转移至 AQS 同步队列中进行阻塞竞争。
 


### （四）与 synchronized 对比
 
 
 

| 特性 | ReentrantLock | synchronized |
| --- | --- | --- |
| 锁机制 | 显式锁（需手动 lock/unlock） | 隐式锁（自动加锁解锁） |
| 实现方式 | Java API 实现（基于 AQS） | JVM 原生支持（对象头+Monitor） |
| 公平性 | ✅ 支持公平/非公平锁 | ❌ 仅非公平锁 |
| 锁中断 | ✅ | ❌ |
| 超时控制 | ✅ | ❌ |
| 条件变量 | 支持多个 Condition | 仅一个等待队列（notify 随机唤醒） |
| 锁状态检测 | ✅ | ❌ |
| 锁释放 | 必须 finally 中手动 unlock() | 自动释放 |
| 性能特点 | 高竞争场景更优 | 低竞争场景更优 |
| 锁升级 | ❌ 无锁升级机制 | ✅ 支持锁升级（偏向→轻量→重量） |
| 适用场景 | 高并发复杂逻辑 | 简单同步场景 |

 
 


---
 


## 九、 
 


volatile 是 Java 提供的轻量级同步机制，主要多线程环境下的可见性和有序性问题，但不保证原子性。
 


### （一）核心特性
 


**1.保证可见性**
 


线程操作共享变量时，会将变量从主内存复制到线程本地内存。若线程 A 修改了变量值未及时写回主内存，线程 B 可能读取旧值。
 


volatile 的解决方案：
 


- 写操作：立即将修改刷新到主内存
- 读操作：直接读取主内存的最新值，跳过本地缓存
 


**2.禁止指令重排序**
 


JVM 或处理器可能对指令重排序优化，重排序后会导致 DCL 问题。
 


> 
>  什么是 DCL 问题？
标准双重检查锁定（Double-Cheacked Locking）实现代码如下：
public class Singleton {      private static Singleton instance;      public static Singleton getInstance() {          if (instance == null) {                  // 第一次检查（无锁）              synchronized (Singleton.class) {      // 加锁                  if (instance == null) {            // 第二次检查（有锁）                      instance = new Singleton();    // 问题根源在此！                  }              }          }          return instance;      }  }  一键获取完整项目代码 java 运行
对 instance = new Singleton()语句进行拆分：
分配对象内存空间调用构造函数初始化对象将 instance 指向内存地址
然后 JVM 的重排序可能导致 2、3 步替换，导致其他线程判断 instance 不为 null 后进入同步块中，可此时对象还没有初始化，从而使得该线程抛出空指针异常或者拿到初始化不完全的对象。 
>   
>  指令重排序不会影响运行结果吗？ 
>  正如刚才所说的，指令重排序在多线程指令交错的情况下会影响运行结果，但如果是单线程则不会，因为指令重排序也是有条件的： 
>  单线程下排序后不会影响运行结果排序操作之间不存在数据依赖关系 
>  因此单线程模式下指令重排序并不会影响运行结果。 
> 
 


volatile 的解决方案：
 


- 写屏障：确保写操作前的指令不会重排到写之后，屏障前所有变量的修改对 volatile 读线程可见
- 读屏障：确保读操作后的指令不会重排到读之前，屏障后所有变量的读取从主内存加载最新值
 


> 
>  但其实 synchronized 也可以保障可见性与有序性：
在释放锁后会立刻刷新主存同步块保障单线程串行执行，因此指令重排序不会有任何影响
让我们对比一下： 
>   
>    特性  volatile  synchronized  原子性  仅单次读/写  完整代码块  可见性  立即刷新主存  锁释放时刷新主存  有序性  禁止指令重排序  串行执行保证顺序  性能开销  低（无上下文切换）  高（锁竞争可能阻塞线程）  适用场景  状态标志、独立观察  复合操作、临界区保护  
>   所以 volatile 无法保障原子性，需要配合 CAS 和原子类进行线程安全的操作。 
>   
> 
 


---
 


## 十、Happens-Before 规则
 


Happens-Before 是 Java 内存模型定义的跨线程内存可见性保证的核心规则，用于解决多线程环境下的指令重排序和内存可见性问题。
 


其核心要点：
 


1. 可见性保证：若操作 A Happens-Before 操作 B，则 A 的执行结果对 B 一定可见。
2. 非时间顺序：Happens-Before 不要求物理时间上的先后执行，仅确保逻辑上的“结果可见性”。
3. 重排序约束：允许编译器/处理器重排序指令，但重排后的结果必须与 Happens-Before 规则下的执行结果一致。
 


主要有 8 大规则：
 


**（一）单线程规则**
 


同一线程内，代码书写顺序前的操作 Happens-Before 后续操作。
 


即单线程禁用了指令重排序。
 


**（二）锁规则**
 


同一锁的解锁操作 Happens-Before 后续对该锁的加锁操作。
 


即 synchronized 同步块执行完成后会立即刷新主存确保对后续获取同一锁的线程可见。
 


**（三）volatile 规则**
 


volatile 变量的写操作 Happens-Before 后续任意线程对该变量的读操作。
 


避免线程本地内存导致的可见性线程不安全问题。
 


**（四）线程启动规则**
 


start()调用 Happens-Before 新线程内的任何操作。
 


即父线程在 start()前的修改对子线程可见。
 


**（五）线程终止规则**
 


线程中所有操作 Happens-Before 其他线程通过 join()或 isAlive()检测到该线程终止。
 


即保证线程终止后其终止前的所有操作对其他线程可见。
 **（六）线程中断规则**
 


调用 interrupt()Happens-Before 被中断线程检测到中断。
 


确保中断操作一定在检测逻辑之前，避免空检测。
 


**（七）对象终结规则**
 


对象构造函数结束 Happens-Before 其 finalize()方法的开始。
 


即保证对象在初始化完成后再执行终结逻辑。
 


**（八）传递性规则**
 


若 A Happens-Before B，且 B Happens-Before C，则 A Happens-Before C。
 


即如果一个人比你父亲大，你父亲比你大，那么那个人一定比你大。
 


---
 


## 十一、CAS 
 


### （一）核心特性
 


CAS（Compare And Swap）：一种无锁并发原子操作。
 


包含三个操作数：
 


- 内存位置（V）：待更新的共享变量地址
- 期望值（A）：变量当前读到的值
- 新值（B）：拟写入的值
 


操作逻辑：仅当 V == A 时，将 V 更新为 B；否则放弃操作。整个流程保障原子性。
 


因为本质上没有强同步的开销，所以我们通常称 CAS 为乐观锁。
 
 
 

| 特性 | 悲观锁（如 synchronized） | CAS 乐观锁 |
| --- | --- | --- |
| 线程阻塞 | 未获锁线程进入阻塞状态 | 线程通过自旋重试，无阻塞 |
| 性能开销 | 上下文切换成本高 | 无上下文切换，CPU 密集自旋 |
| 适用场景 | 高竞争、临界区复杂操作 | 低竞争、简单原子操作 |

 
 


> 
>  为何乐观锁不适用于高并发场景？  
>  因为乐观锁本身拥有自旋机制，如果在对比值时发现原值被其他线程更改后则会自旋重试，高并发场景下原值被更改的概率大大增加，因此此时再使用乐观锁会增加大量自旋开销，成功率小。 
> 
 


### （二）底层实现原理
 


Java 层调用 AtomicInteger.compareAndSet()，其底层是使用 unsafe 类对内存直接操作，通过加锁总线保证了多核的原子性，所以 CAS 的原子性实际是由操作硬件指令来保障的。
 


工作流程也很简单，先比较后更新：
 


![](https://i-blog.csdnimg.cn/direct/59e3f2d886ca488b825a232977f2b157.png)
 


### （三）ABA 问题
 


在了解完 CAS 的工作流程后，我们来看下面这个场景：
 


线程 1 读取内存值 A → 线程 2 将值改为 B 后又改回 A → 线程 1 执行 CAS 成功。
 


![](https://i-blog.csdnimg.cn/direct/acd712ae5278482682e7ad77ef88fce3.png)
 


这就是 ABA 问题，我们可以发现 CAS 无法解决该问题。
 


那 ABA 问题又会带来什么后果呢？
 


虽然大部分业务只看结果态，因此 ABA 问题造成不了实质影响；但是对于关系过程态的业务来说则会带来致命性的漏洞（如银行转账）。
 


> 
>  除了 ABA 问题以外，CAS 还存在其他问题吗？
是的，除了 ABA 问题以外，CAS 主要还存在以下两个问题：
高并发场景下的自旋重试次数多，CPU 开销大，这点只能改为悲观锁进行解决只能对一个共享变量进行原子保障 
>   
>  还有两个问题该如何解决？我们就要使用到下面要讲的原子类了。 
> 
 


---
 


## 十二、原子类
 


### （一）原子整数
 


核心类：AtomicInteger、AtomicLong
 


```java
public class AtomicInteger extends Number {
    // volatile保证可见性
    private volatile int value;  
    // Unsafe实例
    private static final Unsafe unsafe = Unsafe.getUnsafe();
     // 内存偏移量
    private static final long valueOffset; 
    
    static {
        try {
            // 获取value字段的内存偏移量
            valueOffset = unsafe.objectFieldOffset
                (AtomicInteger.class.getDeclaredField("value"));
        } catch (Exception ex) { throw new Error(ex); }
    }
    
    // CAS核心方法
    public final boolean compareAndSet(int expect, int update) {
        return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
    }
    
    // 原子递增
    public final int getAndIncrement() {
        return unsafe.getAndAddInt(this, valueOffset, 1);
    }
    
    // 原子加法
    public final int getAndAdd(int delta) {
        return unsafe.getAndAddInt(this, valueOffset, delta);
    }
}
```
 


 这是最为基础的 CAS 操作，适用于低并发的整数操作。
 


### （二）原子引用
 


核心类：AtomicReference、AtomicStampedReference、AtomicMarkableReference
 


```java
// 以AtomicStampedReference为例
public class AtomicStampedReference<V> {
    private static class Pair<T> {
        final T reference;
        // 版本号
        final int stamp;
        private Pair(T ref, int stamp) {
            this.reference = ref;
            this.stamp = stamp;
        }
    }
    
    private volatile Pair<V> pair;
    
    // 带版本号的CAS操作
    public boolean compareAndSet(V expectedReference,
                                 V newReference,
                                 int expectedStamp,
                                 int newStamp) {
        Pair<V> current = pair;
        return
            expectedReference == current.reference &&
            expectedStamp == current.stamp &&
            ((newReference == current.reference &&
              newStamp == current.stamp) ||
             casPair(current, Pair.of(newReference, newStamp)));
    }
    
    // Unsafe操作
    private boolean casPair(Pair<V> cmp, Pair<V> val) {
        return UNSAFE.compareAndSwapObject(this, pairOffset, cmp, val);
    }
}
```
 


 AtomicReference 用于原子更新对象引用，可以将多个共享变量封装到一个对象种，解决了基础 CAS 的只能对单个变量进行操作的问题，但依旧无法解决 ABA 问题。
 


而 AtomicStampedReference 通过每次修改版本号递增的方式进行了解决，每次 CAS 操作只需要对比版本号是否相同即可。
 


最后 AtomicMarkableReference 则是通过 boolean 变量记录，其不在乎被修改了多少次，仅在乎对象是否被修改过。
 


最后两种原子引用均能解决 ABA 问题和仅能对单一变量操作的问题。
 


### （三）原子数组
 


核心类：AtomicIntegerArray、AtomicLongArray、AtomicReferenceArray
 


```java
public class AtomicIntegerArray implements java.io.Serializable {
    // 底层数组
    private final int[] array;
    private static final Unsafe unsafe = Unsafe.getUnsafe();
    private static final int base = unsafe.arrayBaseOffset(int[].class);
    
    // 计算元素偏移量
    private long checkedByteOffset(int i) {
        if (i < 0 || i >= array.length)
            throw new IndexOutOfBoundsException("index " + i);
        return byteOffset(i);
    }
    
    // CAS更新指定索引
    public final boolean compareAndSet(int i, int expect, int update) {
        return unsafe.compareAndSwapInt(array, checkedByteOffset(i), expect, update);
    }
}
```
 


可以原子操作数组中的单个元素，通过 unsafe 计算元素内存偏移量来指定索引。 
 


### （四）原子更新器
 


核心类：AtomicReferenceFieldUpdater、AtomicIntegerFieldUpdater
 


```java
public abstract class AtomicIntegerFieldUpdater<T> {
    // 创建更新器
    public static <U> AtomicIntegerFieldUpdater<U> newUpdater(
        Class<U> tclass, String fieldName) {
        
        return new AtomicIntegerFieldUpdaterImpl<U>(tclass, fieldName);
    }
    
    // 实现类
    private static final class AtomicIntegerFieldUpdaterImpl<T>
        extends AtomicIntegerFieldUpdater<T> {
        // 字段偏移量
        private final long offset;  
        // 目标类
        private final Class<?> cclass;      
        
        // CAS操作
        public boolean compareAndSet(T obj, int expect, int update) {
            return unsafe.compareAndSwapInt(obj, offset, expect, update);
        }
    }
}
```
 


 一般用来原子更新对象的字段，但是存在约束：
 


目标字段必须有 volatile 关键字修饰且权限不能为 private。
 


但是秉持面向对象扩展开放修改封闭原则，在日常开发中对共享字段的并发更新通常还是会进行手动加锁处理。
 


### （五）原子累加器（LongAdder）
 


核心类：LongAdder
 


```java
public class LongAdder extends Striped64 {
    // 无竞争时直接更新base
    public void add(long x) {
        Cell[] as; long b, v; int m; Cell a;
        if ((as = cells) != null || !casBase(b = base, b + x)) {
            // 存在竞争时使用Cell分段
            boolean uncontended = true;
            if (as == null || (m = as.length - 1) < 0 ||
                (a = as[getProbe() & m]) == null ||
                !(uncontended = a.cas(v = a.value, v + x)))
                longAccumulate(x, null, uncontended);
        }
    }
    
    // 最终结果 = base + ∑cells[i]
    public long sum() {
        Cell[] as = cells; Cell a;
        long sum = base;
        if (as != null) {
            for (int i = 0; i < as.length; ++i) {
                if ((a = as[i]) != null)
                    sum += a.value;
            }
        }
        return sum;
    }
}
```
 


由于原子整数在累加的时候容易 CAS 失败进入自旋，开销大。
 


![](https://i-blog.csdnimg.cn/direct/db96092c53724c6e97e9e57fce25afe6.png)
 


而 LongAddr 则采用了分段累加的思想，将竞争分散到多个 cell 减少 CAS 冲突，增大成功概率，最后再将各个分段的累加值合并即可。
 
 
 

| 场景 | AtomicLong | LongAdder |
| --- | --- | --- |
| 低并发写 | 优 | 稍差（有额外开销） |
| 高并发写 | 性能骤降（自旋重试） | 接近常数级性能 |
| 读操作频率 | 快（直接返回值） | 较慢（需合并 Cell） |

 
 


---
 


## 十三、CountDownLatch &CyclicBarrier & Semaphore
 


### （一）CountDownLatch
 


**1. 核心特性**
 


- 一次性同步工具：初始化后计数器固定，不可重置。
- 等待多线程完成：主线程等待其他 N 个线程完成任务（通过 countDown()减少计数），当计数器归零时唤醒等待线程。
- 基于 AQS 共享锁：内部通过 Sync 类继承 AQS，用 state 字段存储计数。
- 线程阻塞与唤醒：调用 await()的线程被阻塞，直到计数器归零后一次性释放所有等待线程。
 


**2.核心方法**
 


| 方法 | 作用 |
| --- | --- |
| CountDownLatch(int count) | 构造方法，初始化计数器值（count > 0）。 |
| await() | 阻塞当前线程，直到计数器归零（可被中断）。 |
| await(long timeout, TimeUnit unit) | 带超时的等待，超时后无论计数是否归零都继续执行。 |
| countDown() | 计数器减 1（AQS 保障线程安全），计数归零时唤醒所有等待线程。 |
| getCount() | 返回当前计数器值。 |

 


**3.弊端**
 


- **不可重用**：计数器归零后失效，若需重复使用需重新创建实例。
- **计数不可逆**：仅支持递减操作，无法重置或增加计数。
- **异常处理缺失**：若等待线程被中断，会抛出异常但不会自动恢复计数状态。
 


### （二）CyclicBarrier
 


**1. 核心特性**
 


- 可重用同步屏障：计数器归零后自动重置，支持多轮同步。
- 多线程相互等待：一组线程需同时到达屏障点才能集体继续执行。
- 可选屏障任务：构造函数可传入 Runnable，当所有线程到达屏障时由最后一个到达的线程执行该任务。
- 基于 ReentrantLock：内部使用 ReentrantLock 和 Condition 实现线程阻塞与唤醒。
 


**2. 核心方法**
 


| 方法 | 作用 |
| --- | --- |
| CyclicBarrier(int parties) | 构造方法，指定需等待的线程数。 |
| CyclicBarrier(int parties, Runnable barrierAction) | 指定线程数和屏障触发任务。 |
| await() | 线程到达屏障点并阻塞，直到所有线程都到达。 |
| await(long timeout, TimeUnit unit) | 带超时的等待，超时或中断抛出异常。 |
| reset() | 手动重置屏障（会打断当前等待线程，抛出异常）。 |
| isBroken() | 检查屏障是否被破坏。 |

 


### （三）Semaphore
 


**1.核心特性**
 


- 资源许可证控制：限制同时访问共享资源的线程数量。
- 公平/非公平模式：
  - 公平模式：按线程请求顺序分配许可证。
  - 非公平模式（默认模式）：允许插队。
- 许可证动态调整：支持获取和释放许可证，数量可动态变化。
- 基于 AQS 共享锁：通过 state 字段记录可用许可证数量。
 


**2. 核心方法**
 


| 方法 | 作用 |
| --- | --- |
| Semaphore(int permits) | 构造方法，指定许可证数量（非公平模式）。 |
| Semaphore(int permits, boolean fair) | 指定许可证数量和公平性。 |
| acquire() | 获取 1 个许可证（阻塞直到可用或中断）。 |
| acquire(int permits) | 获取多个许可证。 |
| tryAcquire() | 尝试获取许可证（立即返回成功/失败）。 |
| tryAcquire(long timeout, TimeUnit unit) | 带超时的尝试获取。 |
| release() | 释放 1 个许可证。 |
| release(int permits) | 释放多个许可证。 |
| availablePermits() | 返回当前可用许可证数量。 |

 


### （四）对比
 


| 特性 | CountDownLatch | CyclicBarrier | Semaphore |
| --- | --- | --- | --- |
| 设计目的 | 主线程等待子线程完成 | 多线程相互等待至屏障点 | 控制资源并发访问数 |
| 重用性 | 一次性（计数器归零后失效） | 可重用（自动重置计数器） | 可重用（许可证可释放） |
| 计数器方向 | 单向递减 | 单向递减后重置 | 可增减（许可证获取/释放） |
| 内部锁机制 | AQS 共享锁 | ReentrantLock + Condition | AQS 共享锁 |
| 唤醒机制 | 计数器归零时唤醒所有等待线程 | 所有线程到达屏障点后唤醒全部线程 | 释放许可证时唤醒一个等待线程 |
| 典型场景 | 服务启动依赖检查、批量任务汇总 | 并行计算分阶段同步、多回合游戏 | 数据库连接池、流量控制 |
| 异常处理 | 中断后需手动处理计数 | 中断或重置触发 BrokenBarrierException | 支持超时和中断响应 |

 


CountDownLatch 和 CyclicBarrier 偏向于各阶段的汇总检查，而 Semaphore 更注重于最大操作线程的个数限制。
 


---
 


## 十四、线程池
 


### （一）ThreadPoolExecutor
 


**1.核心定位**
 


ThreadPoolExecutor 是 Java 并发包中线程池的核心实现类，采用生产者-消费者模型解决资源调度问题：
 


- 生产者：提交任务的线程
- 消费者：Worker 线程池
- 缓冲区：阻塞队列（BlockingQueue）
 


设计目标：
 


1. 降低资源开销：复用线程避免频繁创建/销毁
2. 提升响应速度：任务到达时立即分配空闲线程
3. 流量削峰：队列缓冲突发流量
4. 精细控制：支持线程数/队列/拒绝策略定制
 


**2.构造函数**
 


```java
public ThreadPoolExecutor(
    int corePoolSize,          // 核心线程数
    int maximumPoolSize,       // 最大线程数
    long keepAliveTime,        // 非核心线程空闲存活时间
    TimeUnit unit,             // 时间单位
    BlockingQueue<Runnable> workQueue, // 任务队列
    ThreadFactory threadFactory,       // 线程工厂
    RejectedExecutionHandler handler   // 拒绝策略
)
```
 
 
 

| 参数 | 作用 | 默认风险 |
| --- | --- | --- |
| corePoolSize | 常驻核心线程数（即使空闲也不回收） | 过低导致队列积压 |
| maximumPoolSize | 线程池最大容量（含核心线程） | 过高引发频繁上下文切换 |
| keepAliveTime | 非核心线程（救急线程）空闲存活时长 | 配置不当导致资源浪费或频繁回收 |
| workQueue | 任务缓冲队列 | 无界队列可能引发 OOM |
| threadFactory | 定制线程属性（名称/优先级/守护模式） | 未命名线程难定位问题 |
| rejectedExecutionHandler | 队列满时的处理策略 | 策略不当导致数据丢失 |

 
 


**3.任务调度流程**
 


（1）当当前 worker 数量小于最大线程数，则创建新的 worker 进行消费；
 


（2）当当前队列未满时，任务进队等待。
 


（3）当队列已满且 worker 数量未到最大线程数时，创建救急线程分担压力。
 


（4）当当前队列已满且 worker 已到最大线程数时，则会执行拒绝策略。
 


**4.底层实现机制**
 


首先让我们看看 worker 到底封装了些什么属性：
 


```java
private final class Worker extends AbstractQueuedSynchronizer implements Runnable {
    final Thread thread;          // 实际执行线程
    Runnable firstTask;           // 初始任务
    volatile long completedTasks; // 完成计数
}
```
 


当 worker 初始化时会直接分配一个任务并执行，之后就循环调用 getTask()从队列中获取任务继续执行，在这个过程中即使抛出了异常，worker 也会继续存活。
 


```java
Runnable getTask() {
    boolean timedOut = false;
    for (;;) {
        int c = ctl.get();
        // 1. 检查线程池状态
        if (runStateAtLeast(c, SHUTDOWN) && (runStateAtLeast(c, STOP) || workQueue.isEmpty()))
            return null;
        
        // 2. 根据配置判断是否超时回收
        boolean timed = allowCoreThreadTimeOut || wc > corePoolSize;
        if ((wc > maximumPoolSize || (timed && timedOut)) && (wc > 1 || workQueue.isEmpty())) {
            if (compareAndDecrementWorkerCount(c)) return null;
            continue;
        }
        // 3. 从队列取任务
        Runnable r = timed ? 
            workQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS) : 
            workQueue.take();
        if (r != null) return r;
        timedOut = true;
    }
}
```
 


**5.线程池状态管理**
 


**（1）状态说明**
 
 
 

| 状态 | 值 | 描述 |
| --- | --- | --- |
| RUNNING | 111 | 接收新任务并处理队列任务 |
| SHUTDOWN | 000 | 不接收新任务，但处理队列剩余任务 |
| STOP | 001 | 中断所有任务，丢弃队列任务 |
| TIDYING | 010 | 所有任务终止，即将执行 terminated() |
| TERMINATED | 011 | terminated()执行完毕 |

 
 

**（2）状态转换**
 
 

- RUNNING → SHUTDOWN：调用 shutdown()
- (RUNNING or SHUTDOWN) → STOP：调用 shutdownNow()
- SHUTDOWN → TIDYING：队列空且线程数为 0
- STOP → TIDYING：线程数为 0
- TIDYING → TERMINATED：执行完 terminated()
 
 


**6.拒绝策略**
 


**（1）AbortPolicy（默认策略）**
 


直接抛出异常，中断任务提交流程，强制人工处理异常。
 


适用于敏感业务，需要立即处理提交失败的任务。
 


**（2）CallerRunsPolicy（调用者运行策略）**
 


被拒绝的任务会交给调用线程池的父线程执行，这会阻塞新任务的提交，但在线程池资源恢复后即可正常提交。
 


适用于任务丢失 0 容忍、并发较低的业务。
 


**（3）DiscardPolicy（静默丢弃策略）**
 


直接将被拒绝的任务丢弃掉，不做任何处理。
 


适用于可容忍任务丢失且无需反馈的业务。
 


**（4）DiscardOldestPolicy（丢弃最旧策略）**
 


将任务队列的队头任务出队丢弃，然后被拒绝的任务入队尾。
 


适用于时间敏感业务，新任务优先级大于旧任务。
 


| 策略 | 触发条件 | 行为 | 适用场景 |
| --- | --- | --- | --- |
| AbortPolicy | 线程池饱和 | 抛异常中断流程 | 需严格保证任务执行的系统 |
| CallerRunsPolicy | 线程池饱和 | 调用线程直接执行任务 | 不允许失败但低并发的业务 |
| DiscardPolicy | 线程池饱和 | 静默丢弃任务 | 非核心任务（如日志记录） |
| DiscardOldestPolicy | 线程池饱和 | 丢弃队列头部任务并重试新任务 | 新任务优先级高的场景（如实时消息） |

 


### （二）Executors
 


Executors 是 JUC 包提供的线程池工厂类，封装了 ThreadPoolExecutor 的复杂配置过程，通过静态方法快速创建预定义线程池。
 


这个类一共提供了以下几种预定义线程池：
 


**（1）可缓存线程池 (newCachedThreadPool)**
 


```java
ExecutorService executor = Executors.newCachedThreadPool();
```
 


参数配置：
 


- corePoolSize=0（不设置核心线程）
- maximumPoolSize=Integer.MAX_VALUE（线程数无上限）
- keepAliveTime=60s（空闲线程存活时间）
- 队列：SynchronousQueue（直接传递任务，不缓存）
 


当有新任务到达时优先复用空闲线程而不是创建新线程（即使线程数未满），只有无可用线程时才会立即创建新线程。所有线程均救急线程，存活时间有限。
 


适用于大量小任务且任务执行频率不定的业务。
 


**风险：高并发时可能创建过多线程导致 OOM**
 


**（2）固定大小线程池 (newFixedThreadPool)**
 


```java
ExecutorService executor = Executors.newFixedThreadPool(5); 
```
 


参数配置：
 


- corePoolSize = maximumPoolSize = nThreads（固定线程数）
- keepAliveTime=0（核心线程永不销毁）
- 队列：LinkedBlockingQueue（无界队列）
 


线程数固定，线程均为核心线程，永久存活。
 


适用于长期运行的重负载以及需要控制并发数的资源敏感业务。
 


**风险：无界队列可能因任务堆积速度过快导致 OOM**
 


**（3） 单线程线程池 (newSingleThreadExecutor)**
 


```java
ExecutorService executor = Executors.newSingleThreadExecutor();
```
 


参数配置：
 


- corePoolSize = maximumPoolSize = 1（仅 1 个工作线程）
- 队列：LinkedBlockingQueue（无界队列）
 


因为只有一个核心线程，所以所有任务都严格按照提交顺序串行执行，线程抛出异常后也会自动重建。
 


适用于需要顺序写且低并发的业务。
 


**风险：性能瓶颈明显，无法承受高吞吐**
 


**（4）定时任务线程池 (newScheduledThreadPool)**
 


```java
ScheduledExecutorService executor = Executors.newScheduledThreadPool(3);
```
 


参数配置：
 


- 继承 ThreadPoolExecutor 特性
- 使用 DelayedWorkQueue（延迟队列）
 


工作机制与 ThreadPoolExecutor 相同，但是在此基础上添加了延迟功能：
 


- 延迟执行：schedule(task, delay, timeUnit)
- 周期执行：scheduleAtFixedRate(initialDelay, period)
 


适用于定时任务调度、有周期性的业务。
 


**（5） 工作窃取线程池 (newWorkStealingPool****)**
 


```java
ExecutorService executor = Executors.newWorkStealingPool(4);
```
 


底层机制：
 


- 基于 Fork/Join 框架实现
- 默认并行度=CPU 核心数
 


每个线程会维护一个自己的任务队列，空闲线程会主动窃取其他线程的任务。
 


适用于计算密集型并行业务。
 


> 
>  但是实际开发中不推荐使用 Executors 的预制线程，最典型的就是 newFixedThreadPool 和 newCachedThreadPool，极易导致 OOM 从而出现重大生产事故。
因此最好根据业务的实际情况来自定义线程池，选择合适的队列类型、拒绝策略以及最大核心线程数。
除此之外呢，最好再对线程池进行监控，可以提前发现并解决问题。 
>   
>  这里还需要说明的一点时，newScheduledThreadPool 定时任务线程池在创建线程的时候是不会自动给线程设置上下文类加载器的，得自己手动添加，不然会无法读取配置文件导致初始化失败。
具体请见以下博客：
Sharding-JDBC 定时任务 SQL 无响应的解决方案-CSDN 博客https://blog.csdn.net/2401_88959292/article/details/148366254?spm=1001.2014.3001.5502 
> 
 


### （三）如何确定线程池的最大线程数？
 


线程池大小的确定本质是平衡 CPU 利用率、内存消耗、上下文切换开销，核心依据是任务的资源消耗特征。
 


需先将任务分为三类：CPU 密集型、IO 密集型、混合型，再分别应用不同的计算逻辑。
 


**（1）CPU 密集型**
 


 任务特征
 


- 主要消耗 CPU 资源（如复杂计算、加密、排序、正则匹配）
- 任务执行时间长，几乎无等待（IO 操作极少）
 


计算逻辑
 


- 核心公式：线程池大小 = CPU 核心数 ± 1
 


因为 CPU 密集型需要充分利用 CPU，如果线程数超过核心数会导致线程饥饿，因此最好配置线程数和 CPU 核心数相同，然后额外预留一个饥饿线程处理突发状况。
 


**（2）IO 密集型**
 


 任务特征
 


- 主要消耗 IO 资源（如数据库查询、网络请求、文件读写、RPC 调用）
- 任务执行时间中，等待 IO 完成的时间占比高
 


计算逻辑
 


- 核心公式：线程池大小 = CPU 核心数 × (1 + 平均等待时间/平均执行时间)
 


因为 IO 密集型的线程在大部分时间中都是空闲的，需要等待 IO 结果，因此我们可以让 CPU 在空闲时处理其他任务，充分利用 CPU。
 


**（3）混合型**
 


任务特征
 


- 任务包含 CPU 密集部分和 IO 密集部分（如查询数据库+数据处理）
- 直接使用单一公式计算会导致线程池大小不合理（如 CPU 部分需要小线程数，IO 部分需要大线程数）
 


由于 IO 密集型和 CPU 密集型任务的线程数处于两个极端，一个少一个多，所以同时使用会很难决定线程数。
 


因此解决思路就是将任务拆分成 IO 密集型和 CPU 密集型然后分别启用两个线程池即可。
 


### （四）Tomcat 线程池
 


Tomcat 线程池通过自定义线程池解决了 Web 服务器场景下的特殊需求，其核心设计在于动态线程创建逻辑和增强的拒绝策略。
 


让我们从源码层面分析一下其原理：
 


**1.初始化配置**
 


```java
protected void startInternal() throws LifecycleException {
    taskqueue = new TaskQueue(maxQueueSize); // 任务队列（默认容量Integer.MAX_VALUE）
    TaskThreadFactory tf = new TaskThreadFactory(namePrefix, daemon, getThreadPriority());
    executor = new ThreadPoolExecutor(
        getMinSpareThreads(),   // 核心线程数（默认25）
        getMaxThreads(),        // 最大线程数（默认200）
        maxIdleTime,           // 线程空闲时间（默认60s）
        TimeUnit.MILLISECONDS,
        taskqueue,             // 自定义队列TaskQueue
        tf
    );
    taskqueue.setParent(executor); // 关键：关联队列与线程池
    if (prestartminSpareThreads) {
        executor.prestartAllCoreThreads(); // 预热核心线程
    }
}
```
 


 可以看到 Tomcat 使用的时无界队列，因为 Web 服务器需要处理大量短时间的网络请求，所以使用无界队列可以防止任务提交失败。
 


**2.任务执行逻辑**
 


```java
public void execute(Runnable command, long timeout, TimeUnit unit) {
    submittedCount.incrementAndGet(); // 原子计数器+1（记录待处理任务数）
    try {
        super.execute(command); // 调用JDK原生execute()
    } catch (RejectedExecutionException rx) {
        if (super.getQueue() instanceof TaskQueue) {
            TaskQueue queue = (TaskQueue) super.getQueue();
            if (!queue.force(command, timeout, unit)) { // 尝试二次入队
                submittedCount.decrementAndGet();
                throw new RejectedExecutionException("Queue full");
            }
        } else {
            submittedCount.decrementAndGet();
            throw rx;
        }
    }
}
```
 


 可以看到 Tomcat 的线程池在核心执行逻辑上做了扩展，新增了一个记录待处理任务数的计数器，然后在处理过程中若线程数和队列已满则会抛出异常，首次抛出会尝试再次入队，若此时再失败就抛出拒绝异常采用拒绝策略。
 


其目的是为了延迟充实入队代替直接拒绝，由此提高吞吐量。
 


**3.任务队列**
 


```java
public boolean offer(Runnable o) {
    if (parent == null) return super.offer(o);
    
    // 情况1：线程数已达maxThreads，直接入队
    if (parent.getPoolSize() == parent.getMaximumPoolSize()) 
        return super.offer(o);
    
    // 情况2：待处理任务数 ≤ 当前线程数，说明有空闲线程，入队等待
    if (parent.getSubmittedCount() <= parent.getPoolSize()) 
        return super.offer(o);
    
    // 情况3：线程数未达maxThreads，返回false触发创建新线程
    if (parent.getPoolSize() < parent.getMaximumPoolSize()) 
        return false;
    
    // 其他情况：入队
    return super.offer(o);
}
```
 


 原生线程池的入队策略是如果线程数已满就直接入队，队列也满的话就会启用救急线程。
 


但是 Tomcat 则根据上面的原子计数器，其所记录的待处理任务数若超过了当前线程数，即使队列未满也创建新的核心线程，目的是为了在高并发场景下优先将线程数加满，避免无界队列的任务堆积导致 OOM。
 


**4.线程池周期管理**
 


**（1）线程回收**：
 


空闲时间超过 `maxIdleTime`（默认 60s）且线程数 &gt; `minSpareThreads` 时，回收线程。
 


**（2）线程预热**：
 


若 `prestartminSpareThreads=true`，启动时直接创建 `minSpareThreads` 个核心线程。
 


**（3）线程重建**：
 


通过 `threadRenewalDelay`（默认 1s）控制线程重建间隔，避免瞬时大量线程创建。
 


> 
>  以上设计此设计使 Tomcat 在高并发场景下比原生线程池具备更强的请求处理能力，同时避免因无界队列导致的 OOM。 
> 
 


### （五）Fork/Join 框架
 


**1. 核心设计思想**
 


（1）分治算法
 


- 递归分解：将大规模任务拆分为结构相同的子任务，直至达到可直接计算的阈值。
- 结果合并：通过 fork()异步执行子任务，join()阻塞等待并合并结果，形成递归计算树。
- 时间复杂度优化：如二分法将 O(n)降至 O(log n)，适用于排序、求和等场景。
 


（2）工作窃取
 


- 双端队列：
  - 每个工作线程维护私有双端队列，队尾处理自有任务，队头则供其他线程窃取任务。
  - 优势：
    - 负载均衡：空闲线程从繁忙线程队头窃取任务，避免线程闲置。
    - 减少竞争：自有任务操作无需加锁，仅窃取时需 CAS 保证线程安全。
- 动态调度：任务队列为空时，线程随机扫描其他队列窃取任务，提升 CPU 利用率 。
 


**2. 使用示例**
 


```java
class SumTask extends RecursiveTask<Long> {  
    private final long[] array;  
    private final int start, end;  
    // 分治阈值  
    private static final int THRESHOLD = 10_000;
    @Override  
    protected Long compute() {  
         // 最小任务计算
        if (end - start <= THRESHOLD) {  
            long sum = 0;  
            for (int i = start; i < end; i++) sum += array[i];  
            return sum;  
        }  
        int mid = (start + end) >>> 1;  
        SumTask left = new SumTask(array, start, mid);  
        SumTask right = new SumTask(array, mid, end);  
         // 异步执行左子任务  
        left.fork();         
        // 同步计算右任务+合并左结果           
        return right.compute() + left.join(); 
    }  
}  
// 调用  
ForkJoinPool pool = new ForkJoinPool();  
long result = pool.invoke(new SumTask(array, 0, array.length));  
```
 


其核心就是递归操作，同时也有 DP 思想，需要计算最小任务。
 


然后使用二分将一个子任务进一步拆分，避免任务之间形成直接依赖链从而降低并行度，反而无法充分利用多线程的优势。
 


由于递归分治的设计思路，该框架更适用于 CPU 密集型的数据处理业务。
 


### （六）**CompletableFuture**
 


CompletableFuture 是 Java 8 引入的异步编程神器，它不仅仅是一个 Future 的增强版，更是一个声明式、函数式、链式的异步编程框架。
 


**1. 核心特性**
 


- 持有异步计算结果
- 支持链式添加处理逻辑
- 内置线程池调度能力
- 提供丰富的任务组合方法
 


**2. 核心功能**
 


**（1）任务的创建与启动**
 


```java
// 带返回值的异步任务
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    return "Hello, World!";
});
 
// 无返回值的异步任务
CompletableFuture<Void> task = CompletableFuture.runAsync(() -> {
    System.out.println("Task running");
});
```
 


**（2）链式处理**
 


```java
CompletableFuture.supplyAsync(() -> fetchData(userId))
    .thenApply(data -> transformData(data))         // 同步转换
    .thenApplyAsync(result -> enrichResult(result)) // 异步转换
    .thenAccept(finalResult -> saveResult(finalResult)); // 最终消费
```
 


** （3）任务组合**
 


```java
// 等待所有任务完成
CompletableFuture<Void> allFutures = CompletableFuture.allOf(
    future1, future2, future3
);
 
// 任一任务完成即触发
CompletableFuture<Object> anyFuture = CompletableFuture.anyOf(
    futureA, futureB, futureC
);
 
// 合并两个任务结果
CompletableFuture<String> combined = future1.thenCombine(future2, 
    (result1, result2) -> result1 + " & " + result2);
```
 


** （4）异常处理**
 


```java
CompletableFuture.supplyAsync(() -> riskyOperation())
    .exceptionally(ex -> {
        // 异常恢复
        return "Fallback value"; 
    })
    .handle((result, ex) -> {
        // 统一处理结果和异常
        return ex != null ? "Error occurred" : result;
    });
```
 


** 3. 解决回调地狱**
 


```java
// 传统回调地狱
service.getUser(userId, user -> {
    service.getOrders(user, orders -> {
        service.getRecommendations(orders, recs -> {
            // 处理逻辑...
        });
    });
});
 
// CompletableFuture解决方案
CompletableFuture.supplyAsync(() -> getUser(userId))
    // 链式合并
    .thenCompose(user -> getOrders(user))
    .thenCompose(orders -> getRecommendations(orders))
    // 同步消费结果
    .thenAccept(recs -> processResult(recs));
```
 


 CompletableFuture 可以把原本的回调嵌套改造成链式流水线工程，可读性更高。
 


可以将每个回调看作一个节点，然后节点间可以调用异常处理或超时处理的 API 来维护代码的健壮性。
 


> 
>   CompletableFuture 使用的线程池是 ForkJoinPool，因此适合 CPU 密集型的任务，但如果想要使用 IO 密集型也可以自定义线程池。
ExecutorService ioPool = Executors.newCachedThreadPool();CompletableFuture.supplyAsync(() -> ioOperation(), ioPool);一键获取完整项目代码 java 运行 
> 
 


---
 


## 十五、ReentrantReadWriteLock &StampedLock
 


### （一）ReentrantReadWriteLock
 


**1. 核心特性**
 


ReentrantReadWriteLock 是基于 AQS 实现的，采取了读写分离的策略：
 


- 读锁共享：允许多个线程同时获取读锁
- 写锁独占：写锁被获取时阻塞所有的读写线程
 


同时采取了锁复用机制，将 AQS 模型中 32 位的 state 分成两个部分，高 16 位表示读锁总数，低 16 位表示写锁重入次数。因此可以同时维护读写状态。
 


**2.核心逻辑实现**
 


**（1）写锁获取流程**
 


```java
protected final boolean tryAcquire(int acquires) {
    Thread current = Thread.currentThread();
    int c = getState();
    // 1. 计算当前写锁重入次数
    int w = exclusiveCount(c);
    
    if (c != 0) { // 锁已被占用
        // 情形1：存在读锁（w=0但c≠0）
        // 情形2：写锁被其他线程占用
        if (w == 0 || current != getExclusiveOwnerThread())
            return false; // 获取失败
        // 重入次数检查
        if (w + acquires > MAX_COUNT)
            throw new Error("超过最大锁计数");
    }
    // 2. 公平策略检查（是否阻塞）
    if (writerShouldBlock() || 
        !compareAndSetState(c, c + acquires))
        return false; // CAS竞争失败
    
    // 3. 设置锁持有线程
    setExclusiveOwnerThread(current);
    return true;
} 
```
 


**（2）读锁获取流程**
 


```java
protected final int tryAcquireShared(int unused) {
    Thread current = Thread.currentThread();
    int c = getState();
    
    // 写锁被其他线程持有，获取失败
    if (exclusiveCount(c) != 0 && 
        getExclusiveOwnerThread() != current)
        return -1;
        
    int r = sharedCount(c); // 读锁计数
    if (!readerShouldBlock() && // 公平性检查
        r < MAX_COUNT &&
        compareAndSetState(c, c + SHARED_UNIT)) {
        
        // 第一个读线程
        if (r == 0) {
            firstReader = current;
            firstReaderHoldCount = 1;
        } 
        // 第一个读线程重入
        else if (firstReader == current) {
            firstReaderHoldCount++;
        }
        // 其他读线程计数
        else {
            HoldCounter rh = cachedHoldCounter;
            if (rh == null || rh.tid != getThreadId(current))
                cachedHoldCounter = rh = readHolds.get();
            else if (rh.count == 0)
                readHolds.set(rh);
            rh.count++;
        }
        return 1; // 获取成功
    }
    return fullTryAcquireShared(current);
}
```
 


### （二）StampedLock
 


**1.核心特性**
 


为了解决 ReentrantReadWriteLock 再读多写少的写线程饥饿问题，引入了 StampedLock，而作为高性能锁，StampedLock 也牺牲了部分的功能扩展性。
 


它在 ReentrantReadWriteLock 的读写锁基础上加入了乐观读锁，这是一种无锁的快照读，引入了 stamp 机制：
 


- 进行锁操作时会返回一个 long 类型的 stamp 作为凭证
- 当解锁或者验证锁时必须提供正确的 stamp，否则锁升级
 


**2.核心逻辑**
 


写锁实现与 ReentrantReadWriteLock 类似，但是在释放锁之后会使 state 的版本号递增，也就是 stamp 值。
 


悲观读锁的实现也与 ReentrantReadWriteLock 类似，但是通过 CLH 队列避免了写线程饥饿。
 


> 
>  CLH 队列 
>  等待队列：自旋锁实现，节点类型区分读写调度策略： 
>    队列头为写节点时，新读线程排队队列头为读节点时，允许写线程插队（防写饥饿）    
> 
 


核心还是乐观读锁：
 


```java
// 获取乐观读的stamp
long stamp = sl.tryOptimisticRead(); 
  // 读取共享数据
  readData();    
  // 验证 stamp 有效性                       
  if (!sl.validate(stamp)) {   
      // 失效则升级为悲观读                
      stamp = sl.readLock();     
      try { 
           // 再次读取数据
            readData(); 
          } finally {
             sl.unlockRead(stamp); 
          }
  }                           
```
 


 同时也支持锁转换：
 


```java
public long tryConvertToWriteLock(long stamp) {
    long a = stamp & ABITS, m, s, next;
    while (((s = state) & SBITS) == (stamp & SBITS)) {
        // 无锁状态
        if ((m = s & ABITS) == 0L) { 
            if (a != 0L) break;
            next = (s + WBIT) & ~RBITS;
            if (casState(s, next)) return next;
        }
        // 已是写锁
        else if (m == WBIT) { 
            if (a != m) break;
            // 直接返回
            return stamp; 
        }
        // 单个读锁
        else if (m == RUNIT && a != 0L) { 
            // 转换为写锁
            next = s - RUNIT + WBIT; 
            if (casState(s, next)) return next;
        }
        else
            break;
    }
    // 转换失败
    return 0L; 
}
```
 


- 已是写锁：直接返回当前 stamp
- 无其他读锁存在：读锁升级写锁
- 乐观读模式且锁空闲：获取写锁
 


 
 


| 特性 | ReentrantReadWriteLock | StampedLock |
| --- | --- | --- |
| 锁模式 | 悲观读+写锁 | 悲观读+写锁+乐观读 |
| 可重入性 | ✅ 读锁/写锁均支持重入 | ❌ 不可重入 |
| Condition 支持 | ✅ 提供条件等待队列 | ❌ 不支持 |
| 锁升级 | ❌ 禁止读锁升级写锁 | ✅ 支持 tryConvertToWriteLock() |
| 公平性策略 | ✅ 支持公平/非公平模式 | ❌ 仅非公平模式 |
| 适用场景 | 传统读多写少 | 极高读并发+少量写 |

 


---
 


## 十六、线程安全集合
 


### （一）ArrayList&Vector & CopyOnWriteArrayList
 


**1.ArrayList 会引发的线程安全问问题**
 


- **内存可见性问题**： ArrayList 的内部数组`elementData`未被`volatile`修饰。当线程 A 修改数组元素（如`add`操作）后，新值可能仅更新到线程 A 的工作内存，未及时刷回主内存。线程 B 读取时可能仍看到旧值，导致脏读。
- **操作非原子性**：
  - **扩容与赋值非原子**：`add`方法中的`ensureCapacity`（扩容）和`elementData[size++] = e`（赋值）非原子操作。若线程 A 扩容后挂起，线程 B 同时扩容并赋值，可能导致数组越界或数据覆盖。
  - **size++非原子**：`size++`实际包含读取、增加、写入三步，多线程同时执行会导致实际大小与预期不符（部分写入丢失）。
- **并发修改异常**： 迭代过程中若其他线程修改列表结构（如删除元素），会触发`ConcurrentModificationException`。原因是迭代器内部记录的`modCount`（修改次数）与当前列表状态不一致，破坏了迭代器状态。
 


**2.Vector**
 


Vector 通过以下方式保证线程安全：
 


- **全局锁机制**： 所有公共方法均添加`synchronized同步块`。同一时间仅一个线程能操作 Vector 实例，其他线程阻塞。
- **内存可见性保障**：`synchronized`不仅保证原子性，还会在锁释放时将工作内存的变量值强制刷回主内存，并在获取锁时清空工作内存，确保读取最新值。
- **扩容策略**： 扩容时容量默认翻倍（原容量×2），扩容操作也在`synchronized`块内完成，避免多线程同时扩容导致的数据错乱。
 


但是全局锁导致高并发场景下大量线程竞争同一把锁，频繁上下文切换，效率显著降低，现在不推荐使用。
 


**3.CopyOnWriteArrayList**
 


![](https://i-blog.csdnimg.cn/direct/e8b7682fa2ab4128a23c66e61a8012ac.png)
 


CopyOnWriteArrayList 采用写时复制+读写分离机制保障高并发场景的线程安全：
 


- **volatile 数组引用**： 数据存储在`volatile Object[] array`中。`volatile`保证数组引用的可见性：写线程修改引用后，读线程能立即感知新数组地址。
- **写操作加锁与复制**：
  - 写操作使用`ReentrantLock`保证原子性，执行流程：
    1. 复制原数组生成新数组副本。
    2. 在新数组上修改。
    3. 将`volatile array`指向新数组。
- **读操作无锁**： 读操作直接访问`volatile array`，无需加锁。
 


虽然保障了线程安全，但仍存在缺点：
 


- **内存占用大**：写操作复制整个数组，大对象频繁修改易引发 OOM。
- **数据弱一致性**：读操作可能读到旧数据（写完成前），不适用于实时性要求高的场景。
- **写性能差**：复制数组+加锁，开销显著。
 


> >  三种 List 的对比总结
特性 ArrayListVectorCopyOnWriteArrayList 线程安全❌ 不安全✅ synchronized 锁✅ 写时复制+volatile 锁机制无锁全局锁（性能差）写操作加锁，读操作无锁内存可见性无保障 synchronized 保障 volatile 引用+volatile 内存屏障扩容策略 1.5 倍 2 倍每次写操作创建新数组适用场景单线程低并发读多写少的高并发场景 
> 
 


### （二）HashMap & HashTable & ConcurrentHashMap & **ConcurrentSkipListMap**
 


**1.HashMap 会引发的线程安全问题**
 


HashMap 在 JDK1.7 时插入采用头插法，且底层是数组+链表；1.8 时优化为了尾插法，且底层链表长度超过 8 时自动转换为红黑树。
 


**（1）JDK 1.7 扩容死循环与数据丢失**
 


- 扩容时采用头插法迁移数据，链表顺序翻转。
- 多线程并发扩容时，线程 A 挂起后恢复操作旧指针，可能形成环形链表导致死循环。
- 环形链表导致部分节点遍历不到，元素丢失。
 


**（2） JDK 1.8 数据覆盖与计数错误**
 


- 线程 A 判断桶为空后挂起，线程 B 插入元素；线程 A 恢复后直接覆盖 B 的数据。
- `size++`非原子操作，多线程同时执行导致部分写入丢失。
 


**2.HashTable**
 


HashTable 通过以下方式保障线程安全：
 


- **全局锁机制**：所有方法用`synchronized`修饰，锁住整个实例。
- **内存可见性**：`synchronized`保证锁释放时强制刷新工作内存到主内存。
 


但是全局锁导致高并发场景下大量线程竞争同一把锁，频繁上下文切换，效率显著降低，现在不推荐使用，而且禁止键值为 null 避免同步抛出空指针异常。
 


**3.ConcurrentHashMap **
 


![](https://i-blog.csdnimg.cn/direct/257b6809518e4fa0bd441ebc41fad038.png)
 


**（1）JDK 1.7：分段锁（Segment）**
 


- **设计思想**：数据分为 16 个 Segment，每个 Segment 独立加锁。
- **内存可见性**：`ReentrantLock`锁释放时通过内存屏障保证数据可见性。
 


**（2）JDK 1.8：CAS + synchronized 细粒度锁**
 


- **锁粒度优化**：空桶通过 CAS 插入；非空桶用`synchronized`锁头节点。
- **并发控制升级**：
  - `volatile`修饰`Node`的`val`和`next`，保证可见性。
  - `sizeCtl`通过 CAS 控制扩容状态。
 


其实 ConcurrentHashMap 就是把锁的粒度不断地最小化从而达到高并发时的线程安全。
 


**4.ConcurrentSkipListMap**
 


![](https://i-blog.csdnimg.cn/direct/7ad72680ccf54dc6992c33781e2a4645.png)
 


- **跳表结构**：多层链表，上层为下层索引，查询复杂度`O(log n)`。
- **无锁读 + CAS 写**：
  - 读操作无锁，通过`volatile`保证可见性。
  - 写操作使用 CAS+层次锁。
 


写性能低于 HashMap，而且索引内存占用大。
 


 ConcurrentHashMap 和 ConcurrentSkipListMap 之所以可以在高并发场景下使用 CAS，就是因为他们操作对象的粒度很小，自旋成本低。
 


> 
>   四种 Map 的对比总结
特性 HashMapHashTableConcurrentHashMapConcurrentSkipListMap 线程安全❌ 不安全✅ 全局锁✅ 分段锁/CAS+细粒度锁✅ 跳表+CAS 有序性❌ 无序❌ 无序❌ 无序✅ 有序适用场景单线程低并发系统高并发读写高并发有序查询 
> 
 


### 
 （三）HashSet & **ConcurrentSkipListSet & CopyOnWriteArraySet**
 


** 1.HashSet 会引发的线程安全问题**
 


HashSet 底层实现是基于 HashMap 的，所以两者线程不安全的原因都一致：
 


- JDK1.7 有环形链表和数据丢失问题
- JDK1.8 有数据覆盖和计数错误问题
 


**2.ConcurrentSkipListSet **
 


与 ConcurrentSkipListMap 基本一致。
 


**3.CopyOnWriteArraySet**
 


与 CopyOnWriteArrayList 基本一致。
 


> >  三种 Set 对比总结
特性 HashSetConcurrentSkipListSetCopyOnWriteArraySet 线程安全❌ 不安全✅ 跳表+CAS 分层锁✅ 写时复制+volatile 有序性❌ 无序✅ 按比较器排序❌ 无序读性能 O(1)O(log n)O(n)写性能 O(1)O(log n)O(n)适用场景单线程/低并发高并发有序访问极小规模、读多写少 
> 
 


### **（四）Queue & ConcurrentLinkedQueue & **LinkedBlockingQueue
 


** 1.Queue 会引发的线程安全问题**
 


- **数据覆盖与丢失**： 多线程同时执行入队或出队时：
  - **非原子操作**：队列的`tail`指针修改（入队）与`head`指针修改（出队）非原子。线程 A 修改`tail`后挂起，线程 B 覆盖写入，导致 A 的数据丢失。
  - **size 计数错误**：`size++`和`size--`非原子操作，多线程并发导致实际元素数量与`size`不一致。
- **可见性问题**： 队列节点未用`volatile`修饰。线程 A 修改节点指针后未刷回主内存，线程 B 读取到旧指针，造成脏读或空指针异常。
- **状态不一致**： 队列空时执行`poll()`应返回`null`，但多线程并发下可能出现：
  - 队列空但`poll()`返回非`null`（读取到未更新的中间状态）。
  - 队列非空但却抛出异常（头节点被其他线程移除但未同步）。
 


**2.ConcurrentLinkedQueue **
 


基于 CAS 实现：
 


- **CAS 原子操作**：
  - 节点类`Node`的`item`和`next`用`volatile`修饰，保证可见性。
  - 入队和出队通过原子引用实现原子指针更新。
- **无锁设计**：
  - **入队流程**：
    1. 定位尾节点（实际为“近似尾节点”，允许延迟更新）。
    2. CAS 修改尾节点的`next`指针指向新节点。
    3. CAS 失败则重试（自旋）。
  - **出队流程**：
    1. 定位头节点（实际为“近似头节点”）。
    2. CAS 将头节点的`item`置为`null`（标记已移除）。
    3. 更新`head`指针。
 


**3.LinkedBlockingQueue**
 


![](https://i-blog.csdnimg.cn/direct/512789110faf46a78e4f1642996db7fa.png)
 


基于“两把锁+条件等待”的阻塞算法，分离生产者与消费者同步。
 


- **读写分离设计**：
  - **写锁**：控制入队操作，绑定`notFull`条件（队列满时阻塞生产者）。
  - **读锁**：控制出队操作，绑定`notEmpty`条件（队列空时阻塞消费者）。
 


这是如何做到的呢？让我们分析一下源码：
 


**（1）入队**
 


```java
    putLock.lock();  
    try {  
        while (count == capacity) {  
             // 队列满时挂起生产者  
            notFull.await();
        }  
        // 入队  
        enqueue(node); 
        c = count.getAndIncrement();  
        // 队列未满则唤醒其他生产者  
        if (c + 1 < capacity) notFull.signal(); 
    } finally {  
        putLock.unlock();  
    }  
    // 若原队列为空，唤醒消费者  
    if (c == 0) signalNotEmpty(); 
```
 


** （2）出队**
 


```java
    takeLock.lock();  
    try {  
        while (count == 0) {  
            // 队列空时挂起消费者  
            notEmpty.await(); 
        }  
        // 出队  
        E x = dequeue(); 
        c = count.getAndDecrement();  
        // 队列非空则唤醒其他消费者
        if (c > 1) notEmpty.signal();   
    } finally {  
        takeLock.unlock();  
    }  
     // 若原队列满，唤醒生产者 
    if (c == capacity) signalNotFull(); 
```
 


 可以看到是基于 ReentrantLock 的多条件变量实现的。
 


- **优点**：
  - **高吞吐**：读写锁分离，生产者和消费者可并行操作。
  - **容量可控**：支持有界队列。
- **缺点**：
  - **锁竞争**：同一把写锁下的生产者仍会竞争。
  - **内存占用**：链表节点额外存储指针，内存开销大于数组队列。
 


> 
>  三种 Queue 对比总结
特性普通 QueueConcurrentLinkedQueueLinkedBlockingQueue 线程安全❌ 不安全✅ CAS 无锁✅ 双锁阻塞阻塞支持❌ 不支持❌ 非阻塞✅ 条件等待阻塞吞吐量低（单线程）极高（无竞争）高（读写分离）容量无界无界有界（默认 Integer.MAX_VALUE）适用场景单线程/低并发超高并发读写的非阻塞场景生产者-消费者解耦的阻塞场景 
> 
 


### （五）Deque & **LinkedBlockingDeque & ConcurrentLinkedDeque**
 


** 1.Deque 会引发的线程安全问题**
 


- 同时执行`addFirst()`和`addLast()`时，头尾指针修改冲突导致数据丢失或索引越界
- `size++`非原子操作，多线程并发导致实际元素数量与计数不一致
- 底层节点未用`volatile`修饰，线程修改后其他线程可能读取过期数据
- 局部静态变量被多个线程共享时引发并发修改
 


**2.LinkedBlockingDeque **
 


![](https://i-blog.csdnimg.cn/direct/fa0d132d630847cc8dcd1bb30daf74bf.png)
 


与 LinkedBlockingQueue 一致的点是读写队列阻塞机制。
 


但是 LinkedBlockingDeque 的 ReentrantLock 粒度是全局的，不能读写并行进行，因为双端队列对同一个节点都可读可写。
 


因此吞吐量也有一定限制。
 


**3.ConcurrentLinkedDeque**
 


与 ConcurrentLinkedQueue 基本一致，都是通过链表+CAS 实现，只不过 Deque 需要多操作一个指针而已。
 


> 
>  三种 Deque 对比总结
特性普通 DequeLinkedBlockingDequeConcurrentLinkedDeque 线程安全❌ 不安全✅ 全局锁阻塞✅ CAS 无锁阻塞支持❌ 不支持✅ 条件等待❌ 非阻塞吞吐量低中极高容量控制无界可选有界无界适用场景单线程资源受限系统高并发事件分发 
> 
 


---
 


## 十七、设计模式
 


### （一）两阶段终止
 


该模式的目的是为了在线程处理完当前任务并释放资源后再终止，避免数据损坏或死锁。
 


```java
class TwoPhaseTermination {
    private Thread workerThread;
    // 终止标志
    private volatile boolean terminated = false; 
    public void start() {
        terminated = false;
        workerThread = new Thread(() -> {
            // 检查终止标志
            while (!terminated) {  
                try {
                    // 执行任务
                    System.out.println("执行任务中...");
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    // 中断时重设标志（确保退出循环）
                    Thread.currentThread().interrupt(); 
                }
            }
            // 清理资源
            System.out.println("执行资源清理...");
        });
        workerThread.start();
    }
    // 发起终止请求  
    public void stop() {
        // 设置标志位
        terminated = true;          
         // 中断阻塞（加速终止）
        workerThread.interrupt();  
    }
}
```
 


 使用 volatile 保障终止标志更新可见。
 


当线程非阻塞时可以通过 while 循环检查标志从而退出；阻塞时直接通过 interrupt()中断阻塞状态抛出异常，再在 catch 块中重置中断状态（虽然 volatile 写屏障保障了不会先中断再更改标志状态，但这里还是重置状态留个保险，预防中断后 while 条件判断为 false 再次挂起）。
 


### （二）保护式暂停
 


该模式用于解决 “当线程执行条件不满足时，循环检查等待条件直到满足” 的场景。其核心思想是通过阻塞等待与条件唤醒机制，实现线程的安全协作，避免忙等待造成的资源浪费。
 


```java
class GuardedObject {
     // 保护的结果
    private Object response;
    
    // 获取结果（条件不满足时阻塞）
    public synchronized Object get() {
        // 循环检查警戒条件
        while (response == null) { 
            try {
                 // 释放锁并等待
                this.wait();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        return response;
    }
    
    // 设置结果并唤醒等待线程
    public synchronized void complete(Object response) {
        this.response = response;
        this.notifyAll(); 
    }
}
 
public class DownloadExample {
    public static void main(String[] args) {
        GuardedObject guardedObject = new GuardedObject();
        
        // 等待线程（消费者）
        new Thread(() -> {
            System.out.println("等待下载结果...");
            Object result = guardedObject.get();
            System.out.println("收到结果: " + result);
        }, "Consumer").start();
        
        // 生产线程（生产者）
        new Thread(() -> {
            System.out.println("开始下载...");
            String data = downloadData(); 
            // 设置结果并唤醒
            guardedObject.complete(data); 
        }, "Producer").start();
    }
    
    static String downloadData() {
        try { Thread.sleep(2000); } 
        catch (InterruptedException e) { /* ... */ }
        return "Data Content";
    }
}
 
```
 


 消费者调用 get()方法后条件不满足，直接挂起等待。
 


生产者下载完成后调用 complete()唤醒消费者。
 


消费者被唤醒后开始消费。
 


### （三）生产者与消费者
 


生产者-消费者模式通过共享缓冲区解耦数据生成与消费过程：
 


- 生产者：生成数据并存入缓冲区（如队列）。
- 消费者：从缓冲区取出并处理数据。
- 缓冲区：平衡生产与消费速度差异，避免资源争抢。
 


核心目的是为了解耦读写操作。
 


```java
class MessageBuffer {
    private final LinkedList<String> queue = new LinkedList<>();
    private final int capacity;
    public MessageBuffer(int capacity) { this.capacity = capacity; }
    public synchronized void put(String message) throws InterruptedException {
        // 用while防御虚假唤醒
        while (queue.size() == capacity) { 
            // 缓冲区满时阻塞生产者
            wait(); 
        }
        queue.add(message);
        // 唤醒所有等待线程（生产者或消费者）
        notifyAll(); 
    }
    public synchronized String take() throws InterruptedException {
        while (queue.isEmpty()) {
            // 缓冲区空时阻塞消费者
            wait(); 
        }
        String message = queue.removeFirst();
        // 唤醒生产者
        notifyAll(); 
        return message;
    }
}
```
 


这是手动同步的一种实现方式，但是锁的粒度大而且操作精细度不够，实现效果并不理想。
 


而我们在讲解线程安全集合的时候，有一个数据结构刚好适合生产者-消费者解耦模型：** **LinkedBlockingQueue，很多线程池的任务队列使用的也是它。
 


### （四）固定运行顺序
 


该模式处理的是需要多个线程按预设顺序依次执行的场景。
 


可以使用 wait/notify 实现交替打印奇偶数：
 


```java
public class OddEvenPrinter {
    private static int count = 0;
    private static final Object lock = new Object();
    public static void main(String[] args) {
        new Thread(() -> {
            while (true) {
                synchronized (lock) {
                    // 偶数线程执行条件
                    if (count % 2 == 0) { 
                        System.out.println("Even: " + count);
                        count++;
                         // 唤醒奇数线程
                        lock.notify();
                    } else {
                        try { lock.wait(); } 
                        catch (InterruptedException e) { e.printStackTrace(); }
                    }
                }
            }
        }).start();
        new Thread(() -> {
            while (true) {
                synchronized (lock) {
                     // 奇数线程执行条件
                    if (count % 2 != 0) {
                        System.out.println("Odd: " + count);
                        count++;
                        // 唤醒偶数线程
                        lock.notify(); 
                    } else {
                        try { lock.wait(); } 
                        catch (InterruptedException e) { e.printStackTrace(); }
                    }
                }
            }
        }).start();
    }
}
```
 


但是同样有锁粒度大、操作精细度小的问题，因此通常是使用 ReentrantLock 来实现：
 


```java
public class OddEvenPrinter {
    private static int count = 0;
    private static final ReentrantLock lock = new ReentrantLock();
    // 偶数线程的等待条件（当count为奇数时等待）
    private static final Condition evenCondition = lock.newCondition();
    // 奇数线程的等待条件（当count为偶数时等待）
    private static final Condition oddCondition = lock.newCondition();
 
    public static void main(String[] args) {
        new Thread(() -> {
            while (true) {
                lock.lock(); 
                try {
                    // 循环检查条件（防止虚假唤醒）
                    while (count % 2 != 0) {
                        // 释放锁，进入等待队列
                        evenCondition.await(); 
                    }
                    
                    System.out.println("Even: " + count);
                    count++; 
                    // 唤醒奇数线程（精确唤醒，避免不必要的线程唤醒）
                    oddCondition.signal();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt(); 
                } finally {
                    lock.unlock();
                }
            }
        }).start();
 
        new Thread(() -> {
            while (true) {
                lock.lock();
                try {
                    while (count % 2 == 0) {
                        // 释放锁，进入等待队列
                        oddCondition.await(); 
                    }
                    System.out.println("Odd: " + count);
                    count++; 
                    // 唤醒偶数线程（精确唤醒）
                    evenCondition.signal();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt(); 
                } finally {
                    lock.unlock();
                }
            }
        }).start();
    }
}
```
 


 这样既可以实现精准唤醒，也可以保证高性能。
 


### （五）犹豫模式
 


该模式是为了当线程检测到某个操作已被执行或系统状态不满足条件时，立即放弃执行并返回，避免重复操作或无效操作。
 


一般用于监控线程，保证操作只被执行一次。
 


```java
public class MonitorService {
    private Thread monitorThread;
    private volatile boolean stop = false;
     // 状态标志
    private boolean starting = false;
    public void start() {
        synchronized (this) { 
            // 保护条件检查
            if (starting) {   
                 // 已启动则放弃执行
                return;      
            }
            // 更新状态
            starting = true;  
        }
        // 同步块外启动线程（减少锁持有时间）
        monitorThread = new Thread(() -> {
            while (!stop) {
                // 执行监控任务（如日志记录）
            }
        }, "monitor");
        monitorThread.start();
    }
    public void stop() {
        stop = true;
        monitorThread.interrupt();
    }
}
```
 


 使用 synchronized 进行并发控制，保证单线程执行临界区。
 


双重检查防止获取锁后状态被更改。
 


volatile 保证状态更改及时可见。
 


### （六）不可变对象
 


不可变对象是实例化后状态不可被修改的对象。任何修改操作都会创建新对象而非改变原对象。
 


由此来保障强线程安全。
 


```java
// final类阻止继承
public final class ImmutablePerson { 
    // final字段
    private final String name;     
    private final LocalDate birthDate; 
    // 引用可变对象需特殊处理
    private final List<String> addresses; 
    // 构造器初始化所有状态
    public ImmutablePerson(String name, LocalDate birthDate, List<String> addresses) {
        this.name = name;
        this.birthDate = birthDate;
        // 防御性拷贝
        this.addresses = Collections.unmodifiableList(new ArrayList<>(addresses)); 
    }
}
```
 


之所以引用可变对象需要防御性拷贝，是因为如果不这么做的话可能会出现多线程同时操作同一个引用地址，从而出现并发问题（即浅拷贝问题）。
 


对于引用可变对象的处理：
 
 
 

| 场景 | 正确处理方式 | 错误方式 |
| --- | --- | --- |
| 构造器接收集合 | 创建拷贝 + 不可变包装 | 直接赋值原始引用 |
| 返回集合给客户端 | 返回不可变视图或深拷贝 | 返回原始引用 |
| 包含数组字段 | 克隆数组 + 返回克隆副本 | 直接暴露内部数组 |

 
 


### （七）享元模式
 


享元模式是一种结构型设计模式，通过共享相同对象减少内存占用并提高性能，复用已存在的对象，避免大量相似对象的创建开销。
 


工作队列、Integer 等包装类的内部缓存池就是享元模式的体现。
 


```java
// 抽象享元
interface ChessPiece {
     // 外部状态作为参数
    void draw(int x, int y); 
}
// 具体享元（黑棋）
class BlackChess implements ChessPiece {
    // 内部状态
    private final String color = "BLACK";  
    
    @Override
    public void draw(int x, int y) {
        System.out.println("绘制黑棋 at ("+x+","+y+")");
    }
}
// 享元工长缓存池
class ChessFactory {
    private static final Map<String, ChessPiece> pool = new HashMap<>();
    
    public static ChessPiece getChess(String color) {
        return pool.computeIfAbsent(color, c -> 
            c.equals("BLACK") ? new BlackChess() : new WhiteChess()
        );
    }
}
// 客户端
class Client {
    public static void main(String[] args) {
        ChessPiece p1 = ChessFactory.getChess("BLACK");
        // 设置外部状态
        p1.draw(10, 20);  
        
        ChessPiece p2 = ChessFactory.getChess("BLACK");
        // 输出true（同一对象）
        System.out.println(p1 == p2);  
    }
}
```
 


## 十八、ThreadLocal
 


因为共享变量容易导致线程不安全，所以 ThreadLocal 允许每个线程持有一个独立的变量副本，线程间的副本互不干扰，以此来避免该问题。
 


让我们来分析一下 ThreadLocal 是如何实现的：
 


ThreadLocal 的核心是 Thread 类中的 threadLocals 变量，它是一个 ThreadLocalMap，用于存储当前线程的所有 ThreadLocal 副本，本质是哈希表。
 


```java
  static class ThreadLocalMap {
      // 存储键值对的数组，每个Entry是键值对
      private Entry[] table;
      static class Entry extends WeakReference<ThreadLocal<?>> {
          Object value;
          Entry(ThreadLocal<?> k, Object v) {
              // key是弱引用
              super(k);
              value = v;
          }
      }
  }
```
 


> 
>  什么是弱引用？
 强引用：最常见的引用类型（如 Object obj = new Object()），只要强引用存在，对象永远不会被 GC 回收（即使 OOM）。软引用：由 SoftReference 实现，当内存不足时，GC 会回收软引用指向的对象（适用于缓存）。弱引用：由 WeakReference 实现，当对象只有弱引用指向它时，无论内存是否充足，GC 下次回收时必然会收集该对象。虚引用：由 PhantomReference 实现，最弱的引用类型，无法通过虚引用获取对象，仅用于监听对象被 GC 回收的事件。 
>   
>  为什么这里要用弱引用？
其目的是避免 ThreadLocal 实例无法被回收，确保 ThreadLocal 实例引用会在下次 GC 回收时进行清理。 
> 
 


### （一）set 方法
 


1. 获取当前线程的`ThreadLocalMap`
2. 如果`ThreadLocalMap`不存在，则初始化一个
3. 将当前`ThreadLocal`实例作为 key，`value`作为值，存入`ThreadLocalMap`
 


```java
  public void set(T value) {
      Thread t = Thread.currentThread();
      ThreadLocalMap map = getMap(t);
      if (map != null) {
          map.set(this, value); 
      } else {
          createMap(t, value); 
  }
```
 


### （二）get 方法
 


1. 获取当前线程的`ThreadLocalMap`
2. 如果`ThreadLocalMap`存在，用当前`ThreadLocal`实例作为 key 取 value
3. 如果 value 不存在，调用`initialValue()`方法初始化（默认返回`null`）
 


```java
  public T get() {
      Thread t = Thread.currentThread();
      ThreadLocalMap map = getMap(t);
      if (map != null) {
          ThreadLocalMap.Entry e = map.getEntry(this);
          if (e != null) {
              @SuppressWarnings("unchecked")
              T result = (T) e.value;
              return result;
          }
      }
      return setInitialValue(); 
  }
```
 


### （三）remove 方法
 


1. 获取当前线程的`ThreadLocalMap`；
2. 如果`ThreadLocalMap`存在，删除当前`ThreadLocal`对应的 entry。
 


```java
  public void remove() {
      ThreadLocalMap m = getMap(Thread.currentThread());
      if (m != null) {
          m.remove(this);
      }
  }
```
 


> 
>  关于 ThreadLocal 的 OOM 问题
ThreadLocalMap 中 value 引用属于强引用，即无法被 GC 回收。
因此如果 ThreadLocal 实例被回收（key 为 null），而线程仍在运行，Entry 的 value 会一直存在，导致内存泄漏。
所以在用完 ThreadLocal 后必须调用 remove()手动清理，删除 ThreadLocalMap 中的 entry，释放 value 的引用。 
>   
>  ThreadLocal 的应用场景有哪些？
用户上下文存储 spring 事务上下文存储日志追踪中的 traceId 传递 
> 
 


---
 


**~码文不易，留个赞再走吧~**

---
> 原文链接: [带你轻松学习 JUC](https://blog.csdn.net/2401_88959292/article/details/149500338?spm=1001.2014.3001.5501)
> 作者: Yilena
