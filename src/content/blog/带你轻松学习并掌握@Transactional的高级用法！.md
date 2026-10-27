---
"title": "带你轻松学习并掌握@Transactional的高级用法！"
"link": "dai-ni-qing-song-xue-xi-bing-zhang-wo-transactionalde-gao-ji-yong-fa"
"author": "Yilena"
"date": "2025-09-30"
"description": "本文深入探讨了Spring框架中@Transactional注解的高级用法，帮助开发者突破仅使用基础回滚功能的局限。文章详细解析了七种事务传播行为（如REQUIRED、REQUIRES_NEW等）及其适用场景，介绍了如何灵活配置四种隔离级别以平衡并发性能与数据一致性。此外，还讲解了自定义回滚规则（rollbackFor与noRollbackFor）、事务超时设置以及读写权限控制（readOnly）的实际应用。最后，针对类内部方法自调用导致事务失效的常见陷阱，提出了通过注入自身代理对象并结合@Lazy注解进行懒加载的有效解决方案。"
"tags":
  - "Spring"
  - "事务管理"
  - "Java"
"categories":
  - "技术笔记"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/150223993?spm=1001.2014.3001.5501"
---

**目录**
 


[一、传播行为](#t0)
 


[二、隔离级别](#t1)
 


[三、自定义回滚规则](#t2)
 


[四、超时](#t3)
 


[五、读写权限](#t4)
 


[六、避免类内部自调用事务失效](#t5)
 


---
 



 


 的 @Transactional 注解是实现声明式事务管理的核心，像我一样水平还不是很高的同学可能也只会使用其事务回滚功能，而对其扩展用法一无所知，那么在这篇文章我们就来了解一下@Transactional 的高级用法吧。
 


## 一、传播行为
 


| 传播行为类型 | 说明 | 适用场景 |
| --- | --- | --- |
| REQUIRED (默认) | 当前方法必须在事务中运行：加入已有事务或新建事务 | 通用场景 |
| REQUIRES_NEW | 挂起当前事务，始终启动独立新事务 | 独立业务 |
| NESTED | 在当前事务内创建嵌套事务 | 可部分回滚的子操作 |
| SUPPORTS | 有事务则加入，无事务则以非事务运行 | 查询方法适应性兼容 |
| MANDATORY | 必须在已有事务中运行，否则抛出异常 | 强制要求事务上下文的场景 |
| NOT_SUPPORTED | 挂起当前事务，以非事务方式运行 | 强制非事务操作 |
| NEVER | 必须在非事务环境下运行，否则抛出异常 | 禁止事务的敏感操作 |

 


```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void test() {
}
```
 


当我们直接使用 @Transactional 的时候默认配置的就是`REQUIRED。`
 


这些型结合使用场景应该就能明白其作用，所以不做过多的说明了。
 


## 二、隔离级别
 


这里的隔离级别指的就是的四种隔离级别：
 


- READ_UNCOMMITTED
- READ_COMMITTED
- REPEATABLE_READ
- SERIALIZABLE
 


我们可以手动更改注解作用域下的隔离级别：
 


```java
@Transactional(isolation = Isolation.SERIALIZABLE)
public void test() {
}
```
 


比如说当前方法我完全不怕脏读、幻读和不可重复读，那我大可改成 READ_UNCOMMITTED 级别来提升并发性能，可谓非常灵活了。
 


## 三、自定义回滚规则
 


可以配置其在抛出指定异常时才会触发回滚操作或者才不会触发回滚操作。
 


```java
@Transactional(
    // 指定回滚的异常
    rollbackFor = { BusinessException.class }, 
    // 指定不回滚的异常
    noRollbackFor = { ValidationException.class } 
)
public void test() throws BusinessException {
}
```
 


## 四、超时
 


可以配置注释作用域的执行最大时间，如果超时则会强制回滚，单位为秒。
 


```java
@Transactional(timeout = 5)
public void test() {
}
```
 


## 五、读写权限
 


可以指定当前事务的权限为只读或者只写。
 


```java
@Transactional(readOnly = true)
public void test() {
}
```
 


但至于是否强制生效则取决于当前使用的栈，比如说我们最常用的 Spring  JDBC 或 Mybatis 连接 MySQL 时，进行写操作时就会抛出异常终止程序向下运行。
 


那有同学可能有疑问纯读为何还需要添加事务？实际上确实没有必要添加事务，但是由于 Spring 对于只读事务是由效率优化的，可以加快响应速度，所以还是推荐加上事务并标注。
 


## 六、避免类内部自调用事务失效
 


```java
@Service
public class TestServiceImpl {
 
    @Lazy
    @Autowired
    private TestServiceImpl testService;
 
    public void test1() {
        testService.test2()
    }
 
    @Transactional
    public void test2() {
    }
}
```
 


@Transactional 只会在代理对象调用时生效，但如果我们在类内部调用带有此注解的方法的时候，是直接对象进行调用，所以该事务会失效。
 


为这个问题，我们一般会主动注入类本身，因为注入的 Bean 都是代理对象，然后用这个代理对象调用的话事务就会生效，但这样就会造成依赖循环，所以我们加上了@Lazy 进行懒加载。
 


---
 


**~码文不易，留个赞再走吧~**

---
> 原文链接: [带你轻松学习并掌握@Transactional 的高级用法！](https://blog.csdn.net/2401_88959292/article/details/150223993?spm=1001.2014.3001.5501)
> 作者: Yilena
