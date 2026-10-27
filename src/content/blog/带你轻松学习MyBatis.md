---
"title": "带你轻松学习MyBatis"
"link": "dai-ni-qing-song-xue-xi-mybatis"
"author": "Yilena"
"date": "2025-10-05"
"description": "本文系统讲解了半自动持久层框架MyBatis及其增强工具MyBatis-Plus的核心知识。从ORM思想出发，详细解析了SqlSession工厂模式、Mapper接口与XML映射基础，对比了#{}与${}的安全性差异。深入探讨了XML与注解方式的动态SQL实现，以及MyBatis的一级、二级缓存机制与一致性问题。此外，全面介绍了MyBatis-Plus带来的ActiveRecord模式、自动CRUD、乐观锁、逻辑删除、元对象自动填充及内置分页等高效增强功能，助力开发者提升数据库操作效率。"
"cover": "https://i-blog.csdnimg.cn/direct/9eabb674b4824328b590450810062638.png"
"tags":
  - "MyBatis"
  - "ORM"
  - "Java"
"categories":
  - "技术笔记"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/152415907?spm=1001.2014.3001.5501"
---

**目录**
 


[一、概述](#%E4%B8%80%E3%80%81%E6%A6%82%E8%BF%B0)
 


[二、ORM](#t0)
 


[三、映射基础](#t1)
 


[（一）SqlSession & SqlSessionFactory](#t2)
 


[（二）Mapper 接口以及 XML 映射](#t3)
 


[（三）注解方式](#t4)
 


[（四）ResultMap](#t5)
 


[（五）#{}与${}](#t6)
 


[四、动态 SQL](#t7)
 


[（一）XML 动态标签](#t8)
 


[（二）注解方式](#t9)
 


[（三）MyBatis-Plus 的条件构造器](#t10)
 


[五、事务管理](#t11)
 


[六、缓存机制](#t12)
 


[（一）一级缓存](#t13)
 


[（二）二级缓存](#t14)
 


[（三）线程安全与缓存一致性](#t15)
 


[七、MyBatis-Plus 的增强功能](#t16)
 


[（一）ActiveRecord](#t17)
 


[（二）自动 CRUD](#t18)
 


[（三）乐观锁](#t19)
 


[（四）逻辑删除](#t20)
 


[（五）元对象自动填充](#t21)
 


[（六）内置分页](#t22)
 


---
 



 


## 一、概述
 


![](https://i-blog.csdnimg.cn/direct/9eabb674b4824328b590450810062638.png)
 


MyBatis 是一个半自动的持久层框架，用来把 SQL、存储过程和 Java 对象映射起来。
 


---
 


## 二、ORM
 


ORM（对象-关系映射）把程序里的对象和数据库表之间建立映射，让我们用面向对象的方式读写数据库，而不是手写大量 SQL。
 


这种思想可以显著地提升我们对数据库操作的效率，但是对于比较复杂的还是推荐手写 SQL。
 


---
 


## 三、映射基础
 


### （一）SqlSession & SqlSessionFactory
 


SqlSessionFactory 是工厂，负责创建 SqlSession。通常由 SqlSessionFactoryBuilder 从 mybatis-config.或 Configuration 构建。线程安全，整个应用应只创建一次，是单例模式。
 


SqlSession 是 Mybatis 核心操作的句柄，用于执行映射语句、管理事务以及获取。非线程安全，应该每次请求都创建一个新的，是多例模式。
 


> 
>  Spring 容器中使用了 SqlSessionTemplate 替代了 SqlSession，是线程安全且更加便于 Spring 管理的模板句柄。
而在 Spring Boot 框架中通常使用 mybatis-spring-boot-starter，而不手动构造 SqlSessionFactory。 
> 
 


### （二）Mapper 接口以及 XML 映射
 


Mapper 接口定义方法签名，对应的 XML 文件中实现 SQL，并根据 SQL 语句的 ID 与 Mapper 接口的方法对应起来。Mybatis 要求 namespace 是 Mapper 接口的全限定类名，而 id 对应方法名，不然 getMapper 会无法找到映射。
 


Mybatis 的底层简单来说就是为我们动态编写 JDBC 的模板代码，我们只需关注 SQL 实现，而无需编写资源管理或异常处理的代码，是模板回调的设计模式思想。
 


```java
public interface UserMapper {
    User selectById(Long id);
    int insert(User user);
}
```
 


```xml
<mapper namespace="com.example.mapper.UserMapper">
  <select id="selectById" parameterType="long" resultType="com.example.model.User">
    SELECT id, username, email FROM users WHERE id = #{id}
  </select>
 
  <insert id="insert" parameterType="com.example.model.User" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO users(username,email) VALUES(#{username},#{email})
  </insert>
</mapper>
```
 


useGeneratedKeys="true" 与 keyProperty 用于自增主键回填。
 


### （三）注解方式
 


MyBatis 支持在 Mapper 接口上用注解写 SQL（@Select、@、@Update、@Delete），以及用@Results/@Result 做映射。适合简单 SQL。
 


```java
public interface UserMapper {
 
  @Select("SELECT id, username, email FROM users WHERE id = #{id}")
  User selectById(@Param("id") Long id);
 
  @Insert("INSERT INTO users(username,email) VALUES(#{username},#{email})")
  @Options(useGeneratedKeys=true, keyProperty="id")
  int insert(User user);
}
```
 


不过还是推荐无论简单还是复杂 SQL 都统一使用 XML 实现，便于维护和管理。
 


### （四）ResultMap
 


ResultType 只适合简单唯一的对象。但是当列名和对象字段名不一致或者嵌套查询时，使用 ResultMap 配置返回对象会更加灵活。
 


```xml
<resultMap id="UserResultMap" type="com.example.model.User">
  <id column="id" property="id"/>
  <result column="username" property="username"/>
  <result column="email" property="email"/>
  <collection property="posts" ofType="com.example.model.Post">
    <id column="post_id" property="id"/>
    <result column="post_title" property="title"/>
  </collection>
</resultMap>
 
<select id="selectUserWithPosts" resultMap="UserResultMap" parameterType="long">
  SELECT u.id, u.username, u.email,
         p.id AS post_id, p.title AS post_title
  FROM users u LEFT JOIN posts p ON p.user_id = u.id
  WHERE u.id = #{id}
</select>
```
 


不过最好还是使用别名，便于维护。
 


### （五）#{}与${}
 


#{}是预编译占位符，会先将参数使用问号占位然后预编译 SQL 语句后才替换参数。
 


${}是替换符，是直接将参数拼接到 SQL 语句后编译，会有 SQL 注入风险，并不安全。
 


最佳实践是使用#{}进行动态传参，使用${}进行关键字的动态替换，例如 ASC/DESC。
 


---
 


## 四、动态 SQL
 


### （一）XML 动态标签
 


把 SQL 作为可组合的模板写在 XML 里，并在运行时根据参数拼接出最终 SQL。MyBatis 动态标签能避免手工拼字符串、并自动把参数用#{}绑定为预编译参数。
 


常见的动态标签如下：
 


- <if test="...">：按条件包含 SQL 片段。
- <where>：智能添加 WHERE 并自动去除多余前导 AND/OR。
- &lt;trim&gt;：更通用的前后缀/前导处理。
- <set>：用于 UPDATE 的 SET 子句，自动处理末尾逗号。
- &lt;foreach&gt;：遍历集合。
- &lt;choose&gt; &lt;when&gt; &lt;otherwise&gt;：switch/if-else-if 结构。
- &lt;bind name="xxx" value="someExp"/&gt;：绑定一个变量，便于复用或构造 %...%。
- &lt;sql id="xxx"&gt; / &lt;include refid="xxx"/&gt;：复用 SQL 片段。
 


### （二）注解方式
 


Mybatis 同样支持以注解的方式编写动态 SQL 语句。
 


```java
@Select({
  "<script>",
  "SELECT * FROM users",
  "<where>",
  "  <if test='name != null and name != \"\"'> AND username LIKE #{name} </if>",
  "  <if test='status != null'> AND status = #{status} </if>",
  "</where>",
  "</script>"
})
List<User> search(@Param("name") String name, @Param("status") Integer status);
```
 


不过可读性和可维护性都很差，不推荐这么写。
 


但 Mybatis 还支持使用 Java 静态方法编写动态 SQL 语句，不过更加麻烦，不如直接使用 XML。
 


### （三）的条件构造器
 


MyBatis-Plus 提供链式、类型安全的条件构造器，大幅简化动态查询。
 


主要分为两种：QueryWrapper 和 LambdaQueryWrapper。
 


QueryWrapper 是通过字符串映射字段名，在重构或增强的时候都得变动这个条件构造器，违反了开闭原则。
 


而 LambdaQueryWrapper 支持使用 lambda 表达式映射字段名，便于重构和增强。
 


这两种条件构造器都支持链式调用 API 动态编写 SQL 语句，无需使用 XML 和注释，方便又美观。
 


---
 


## 五、事务管理
 


MyBatis 本身通过 SqlSession 本地事务。在单独使用 MyBatis 时我们需要手动控制事务。
 


不过如果是在 Spring 环境下，还是建议将 Mybatis 的事务管理权交给 Spring 容器进行统一管理，所以这里并没有太多需要说明的点，因为 Mybatis 原生的事务管理极少使用。
 


---
 


## 六、缓存机制
 


### （一）一级缓存
 


一级缓存是 MyBatis 内置的、每个 SqlSession 范围的缓存。只要使用同一个 SqlSession 多次执行相同查询，MyBatis 会返回缓存结果，从而节省磁盘和网络 IO。
 


但在以下情况下，一级缓存会失效或是被清空：
 


- 在同一个 SqlSession 中执行了 insert/update/delete 语句。
- 手动调用 sqlSession.clearCache()。
- 使用了不同的查询参数或不同的 SQL 语句 ID。
- 配置 localCacheScope=STATEMENT。
 


注意不要将一级缓存跨线程使用，因为 SqlSession 是多例，会造成线程污染或者逻辑错误问题。
 


### （二）二级缓存
 


二级缓存是 MyBatis 提供的可选缓存，按 Mapper 的 namespace 为单位共享。缓存跨 SqlSession、跨请求有效。
 


### （三）与缓存一致性
 


一级缓存是单线程有效，天然线程安全且保障缓存一致性。
 


二级缓存虽然可以跨线程，但是仅限于单 JVM。在分布式架构下会出现脏读问题：节点 A 缓存了旧值，节点 B 清理了旧值，那么两个节点执行同一个 SQL 语句就可能出现查询结果不一致的情况。
 


虽然也有解决办法，但是比较麻烦且效果并不是很好，所以我们一般不启用 Mybatis 的二级缓存，而是使用 Redis 作为核心缓存层。
 


---
 


## 七、MyBatis-Plus 的增强功能
 


### （一）ActiveRecord
 


ActiveRecord 是一种把“数据 + 持久化方法”放在同一个实体类里的风格。MyBatis-Plus 提供了 Model<T>基类，实体继承后可以直接调用 insert()、updateById()、selectById()、deleteById()等方法，从而省去写 Mapper/Service 的部分样板代码。
 


```java
public class User extends Model<User> {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String email;
}
```
 


```java
User u = new User();
u.setUsername("alice");
u.setEmail("a@example.com");
u.insert();                 
 
User db = new User().selectById(1L);  
db.setEmail("b@example.com");
db.updateById();            
```
 


虽然确实很方便简洁，但是违反了我们的单一职责原则，不应该在 pojo 层缝合进 dao 层，而是应该做到职责分层。
 


只推荐开发个人项目图方便时使用，大型项目还是规范编码为重。
 


### （二）自动 CRUD
 


MyBatis-Plus 的 BaseMapper<T>提供一整套通用方法，只需定义 Mapper 接口继承它即可复用 CRUD。
 


```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
}
 
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper,User> implements UserService {
    @Autowired
    private UserMapper userMapper;
 
    private UserVO findUser(Lonh userId){
        User u = userMapper.selectById(userId);
        return BeanUtil.toBean(u, User.class);
    }
}
 
```
 


使用这个方式可以无需手动编写 SQL 语句，上文提到的条件构造器也是相同的效果。
 


### （三）乐观锁
 


只要在实体和数据表中加上版本号字段，注册一个 OptimisticLockerInnerInterceptor 后，每当使用 Mybatis-Plus 自带的 update 方法，Mybatis-Plus 就会自动在查询条件中带上 version，并且在执行成功后自动更新 version。
 


```java
public class User {
    private Long id;
    private String name;
    @Version
    private Integer version; 
}
```
 


```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
    return interceptor;
}
```
 


### （四）逻辑删除
 


通过标记字段而不是物理删除记录。MyBatis-Plus 自动在查询中附加 deleted = 0 条件，并在删除操作时执行更新修改删除标志，而不会真的删除元数据。
 


```java
public class User {
    private Long id;
    private String name;
    @TableLogic(value = "0", delval = "1")
    private Integer deleted;
}
```
 


MyBatis-Plus 在执行 deleteById(id)的时候，会执行 UPDATE table SET deleted = delval WHERE id = ?这条语句，而不是 DELETE。
 


需要物理删除的话则需要自己编写额外的 SQL 语句。
 


### （五）元对象自动填充
 


通过配置，Mybatis-Plus 会用于自动填充 createTime、updateTime 等字段，避免在每个 insert/update 中重复赋值。
 


```java
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
 
    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
}
```
 


```java
@TableField(fill = FieldFill.INSERT)
private LocalDateTime createTime;
 
@TableField(fill = FieldFill.INSERT_UPDATE)
private LocalDateTime updateTime;
```
 


### （六）内置分页
 


分页基于 Page<T>与 IPage<T>，需注册分页内置拦截器。
 


```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
    return interceptor;
}
 
 
public IPage<User> pageUser(int pageNo, int pageSize){
    Page<User> page = new Page<>(pageNo, pageSize);
    IPage<User> result = userMapper.selectPage(page, Wrappers.    <User>lambdaQuery().eq(User::getStatus, 1));
    List<User> records = result.getRecords();
    long total = result.getTotal();
    result.setRecord(records);
    rsult.setTotal(total);
    return result;
}
```
 


---
 


**~码文不易，留个赞再走吧~**

---
> 原文链接: [带你轻松学习 MyBatis](https://blog.csdn.net/2401_88959292/article/details/152415907?spm=1001.2014.3001.5501)
> 作者: Yilena
