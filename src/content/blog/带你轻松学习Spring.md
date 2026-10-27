---
"title": "带你轻松学习Spring"
"link": "dai-ni-qing-song-xue-xi-spring"
"author": "Yilena"
"date": "2025-10-01"
"description": "本文系统讲解了Spring框架的核心机制与设计思想。从IoC（控制反转）与DI（依赖注入）的本质出发，详细剖析了Bean的作用域、创建方式、生命周期及三级缓存解决循环依赖的原理。深入探讨了@Autowired、@Resource等常用注解的注入策略，以及静态代理与动态代理（JDK/CGLIB）的实现差异。此外，全面解析了Spring AOP的切面编程机制与通知类型，并总结了Spring中广泛应用的单例、工厂、装饰器、观察者等七大设计模式，助力开发者夯实Spring底层基础。"
"cover": "https://i-blog.csdnimg.cn/direct/df8a7aa22f4f4f96bd68d84dbe1242c0.png"
"tags":
  - "Spring"
  - "IoC"
  - "AOP"
"categories":
  - "技术笔记"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/152334008?spm=1001.2014.3001.5501"
---

**目录**
 


[一、概述](#%E4%B8%80%E3%80%81%E6%A6%82%E8%BF%B0)
 


[二、控制反转（IoC）与依赖注入（DI）](#t0)
 


[（一）IoC 的本质](#t1)
 


[（二）DI 的三种形式](#t2)
 


[1.字段注入](#t3)
 


[2.Setter 注入](#t4)
 


[3.构造器注入](#t5)
 


[三、Bean](#t6)
 


[（一）作用域](#t7)
 


[1. singleton](#t8)
 


[2. prototype](#t9)
 


[3. request](#t10)
 


[4. session](#t11)
 


[5. application](#t12)
 


[（二）创建方式](#t13)
 


[1. 构造方法](#t14)
 


[2. 静态工厂](#t15)
 


[3. 实例工厂](#t16)
 


[4. FactoryBean](#t17)
 


[（三）生命周期](#t18)
 


[1. 定义](#t19)
 


[2. 实例化](#t20)
 


[3. 注入](#t21)
 


[4. 初始化](#t22)
 


[5. 后置处理](#t23)
 


[6. 可用](#t24)
 


[7. 销毁](#t25)
 


[（四）BeanFactory、FactoryBean 与 ApplicationContext 的区别](#t26)
 


[1. BeanFactory](#t27)
 


[2. ApplicationContext](#t28)
 


[3. FactoryBean](#t29)
 


[（五）懒加载与条件化装配](#t30)
 


[1. 懒加载](#t31)
 


[2. 条件化装配](#t32)
 


[（六）依赖循环问题以及 Spring 的解决策略](#t33)
 


[1. 什么是循环依赖](#t34)
 


[2. Spring 的解决策略](#t35)
 


[四、IoC 注解](#t36)
 


[（一）@Component & @Service & @Repository & @Controller](#t37)
 


[（二）@Autowired & @Qualifier & @Primary](#t38)
 


[（三）@Resource](#t39)
 


[（四）@Value 与 Environment](#t40)
 


[（五）Lombok 配合依赖注入](#t41)
 


[五、代理模式](#t42)
 


[（一）静态代理](#t43)
 


[（二）动态代理](#t44)
 


[1.JDK 动态代理](#t45)
 


[2.CGLIB 动态代理](#t46)
 


[（三）Spring 的代理模式策略](#t47)
 


[六、AOP](#t48)
 


[（一）概念](#t49)
 


[（二）Spring AOP 实现机制](#t50)
 


[（三）常见通知类型](#t51)
 


[1. 前置通知（@Before）](#t52)
 


[2. 后置通知（@After）](#t53)
 


[3. 返回通知（@AfterReturning）](#t54)
 


[4. 异常通知（@AfterThrowing）](#t55)
 


[5. 环绕通知（@Around）](#t56)
 


[七、@Transaction](#t57)
 


[八、Spring 常用设计模式](#t58)
 


[（一）单例模式](#t59)
 


[（二）工厂模式](#t60)
 


[（三）装饰器模式](#t61)
 


[（四）代理模式](#t62)
 


[（五）观察者模式](#t63)
 


[（六）适配器模式](#t64)
 


[（七）模板回调模式](#t65)
 


---
 



 


## 一、概述
 


![](https://i-blog.csdnimg.cn/direct/df8a7aa22f4f4f96bd68d84dbe1242c0.png)
 


 框架是一个开源的 Java 开发框架，它通过 IoC（控制反转）和 AOP（面向切面编程）来简化对象管理和事务处理，提供了包括 Web、数据访问、安全等在内的完整基础设施，帮助开发者更高效地构建松耦合、可扩展的企业级应用。
 


---
 


## 二、控制反转（IoC）与依赖注入（DI）
 


### （一）IoC 的本质
 


在传统编程模式下，对象是由当前栈帧所在的或者方法创建的：
 


```java
class UserService {
    private UserMapper userMapper = new UserMapper(); 
}
```
 


这样会带来两个坏处：
 


1. **强耦合：**UserService 必须要知道且强依赖 UserMapper 的内部具体实现。
2. **违反了 OCP 原则：**如果需要换另一个数据源的 Mapper 实现，需要变动 UserService 的代码，没有做到对修改封闭。
 


IoC 则完美解决了以上两种问题。
 


IoC 的核心思想是：**对象的创建的权利外交给容器来管理**。
 


也就是说对象的创建以及与其他对象之间关系的维护都是由外部容器来做，而我们自己写的代码就只需要进行声明，而无需考虑过程。
 


```java
class UserService {
    private UserMapper userMapper;
    
    public UserService(UserMapper userMapper) {
        this.userMapper= userMapper;
    }
}
```
 


此处 Spring 容器会自动根据对象类型或者名称来帮我们 new 对象来。
 


之所以叫做“控制反转”，就是“谁控制对象的依赖创建”这个权力发生了反转。 
 


### （二）DI 的三种形式
 


如果说 IoC 是一种思想，那么 DI 就是实现该思想的一种具体手段。
 


#### 1.字段注入
 


```java
@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;
}
```
 


这是最简洁的实现方式，但是不支持声明关键字。
 


Spring 直接通过反射机制进行注入。
 


#### 2.Setter 注入
 


```java
@Service
public class UserService {
    private UserMapper userMapper;
    @Autowired
    public void setUserMapper(UserMapper userMapper) {
        this.userMapper= userMapper;
    }
}
```
 


这个方式最为灵活，可以在 Setter 方法里为依赖提供默认值或者进行更改或替换。
 


#### 3.构造器注入
 


```java
@Service
public class UserService {
    private final UserMapper userMapper;
 
    @Autowired
    public UserService(UserMapper userMapper) {
        this.userMapper= userMapper;
    }
}
```
 


这是最为推荐的注入方式，配合 final 保证了依赖不可变，构造方法保证了依赖不为 null。
 


但缺点就是不支持循环依赖。
 


---
 


## 三、Bean
 


### （一）作用域
 


Spring 在创建 Bean 时，可以决定这个 Bean 的范围，这个范围也就是作用域。
 


#### 1. singleton
 


单例模式，容器中只创建一个 Bean 实例，所有地方注入的都是同一个 Bean。
 


这个作用域是默认的，不需要手动声明。
 


适用于大部分无状态的业务类，如 Controller、Service 和 Dao。
 


#### 2. prototype
 


多例模式，每次注入 Bean 都会创建一个新的。
 


需要注意的是，Spring 只负责多例 Bean 的创建，不负责管理和销毁。
 


很少使用，而且有内存泄漏的风险。
 


> 
>  失效场景
当我们把一个多例 Bean 注入到一个单例 Bean 的字段时，会使多例失效。
@Component@Scope("prototype")public class Order {} @Servicepublic class OrderService {    @Autowired    private Order order;}一键获取完整项目代码 java 运行
此处在创建 OrderService 时，初始化注入 Order 的时候，会创建一个新的 Bean 进行注入，这是多例的特性。
但是在创建完成后，由于 OrderService 的单例特性，后续在使用这个 Bean 的时候都会调用初始化创建的 Bean，调用 Order 字段也是一样，会调用初始化注入的 Bean 而不会创建一个新的 Bean。所以此时多例就失效了。
简单理解就是单例的作用域覆盖了多例的作用域。 
> 
 


#### 3 
 


请求模式，每次 HTTP 请求使用到的 Bean 都会创建一个新的，然后在该次请求内共享同一个 Bean。
 


简单理解就是单个请求单例，多个请求多例。
 


#### 4. session
 


会话模式，跟 request 模式差不多，单个会话单例，多个会话多例。
 


#### 5. application
 


应用模式，整个 Web 应用内使用单例模式。
 


### （二）创建方式
 


#### 1. 构造方法
 


```xml
<bean id="userService" class="com.example.UserService"/>
```
 


这是 Spring 默认的 Bean 创建方式。
 


会先解析依赖，然后通过反射机制调用构造方法来创建 Bean。
 


#### 2. 静态工厂
 


```xml
<bean id="userService" class="com.example.UserService" factory-method="createUserService"/>
```
 


当一个类的创建逻辑比较复杂的时候，将其逻辑封装在静态工厂方法中，Spring 就会解析并调用，然后创建 Bean。
 


#### 3. 实例工厂
 


```xml
<bean id="serviceFactory" class="com.example.ServiceFactory"/>
<bean id="userService" factory-bean="serviceFactory" factory-method="createUserService"/>
```
 


该方式的使用常见于静态方法的一致，不同的是我们将工厂也实例化成了一个 Bean，这样一来就可以在工厂 Bean 中注入其他 Bean，扩展性和灵活度也更高。
 


Spring 会先实例化工厂 Bean，再调用其工厂方法创建 Bean。
 


#### 4. FactoryBean
 


```java
public class MyFactoryBean implements FactoryBean<UserService> {
    @Override
    public UserService getObject() {
        return new UserService();
    }
    @Override
    public Class<?> getObjectType() {
        return UserService.class;
    }
}
```
 


```xml
<bean id="userService" class="com.example.MyFactoryBean"/>
```
 


通过实现 FactoryBean 接口，Spring 会调用 getObject()将 Bean 创建出来并返回，但是不会暴露 FactoryBean 这个 Bean。
 


而且该方式的灵活性和可扩展性更高，支持延迟创建、模式等。
 


### （三）生命周期
 


#### 1. 定义
 


当启动 Spring 容器时，Spring 会将类名、作用域、依赖关系、初始化方法等配置信息封装到 BeanDefinition，放入 Spring 容器中。
 


#### 2. 实例化
 


Spring 调用 BeanDefinition 中的初始化方法，创建出一个空对象。
 


#### 3. 注入
 


根据对象中的字段、Setter 和构造参数，进行依赖注入。
 


#### 4. 初始化
 


如果 Bean 实现了 InitializingBean 接口或配置了 init-method 方法，Spring 会在这里执行其中的逻辑。
 


@PostConstruct 作用域下的逻辑也是在此时执行。
 


#### 5. 后置处理
 


容器调用 BeanPostProcessor 对 Bean 进行增强。
 


AOP 的织入时机也是在这里，给 Bean 包上一层代理，进行事务、日志等扩展增强功能的实现。
 


#### 6. 可用
 


此时会把 Bean 正式放入 Spring 容器中，可以通过 getBean()方法获取。
 


#### 7. 销毁
 


如果 Bean 实现了 DisposableBean 接口或配置了 destroy-method 方法，Spring 会在容器销毁时执行其中的逻辑。
 


@PreDestroy 作用于下的逻辑也是在此时执行。
 


需要注意，Spring 并不会自动销毁多例 Bean，即使它实现了以上要求。
 


### （四）BeanFactory、FactoryBean 与 ApplicationContext 的区别
 


#### 1. BeanFactory
 


这是 Spring 最底层的 IoC 容器，负责生产、装配以及管理 Bean。
 


可以理解为一个 Bean 工厂。
 


#### 2. ApplicationContext
 


BeanFactory 的加强版容器，在 BeanFactory 基础上，增加了 AOP、国际化、事件机制、资源访问 等功能。
 


#### 3. FactoryBean
 


这是我们自己写的一个特殊 Bean，Spring 识别到后会将其当作工厂 Bean，不对外暴露。
 


这是我们在 BeanFactory 或 ApplicationContext 中创建的自定义生产 Bean 的一个工厂 Bean，本身也是归属于 Spring 管理的 Bean。
 


### （五）懒加载与条件化装配
 


#### 1. 懒加载
 


正如上面的生命周期所示，Spring 中声明的所有 Bean 都会在 Spring 容器启动时进行实例化，这会让启动变慢，有些 Bean 其实使用频率极低，根本不需要提前就初始化好，这时我们就可以使用懒加载@Lazy 注解：
 


```java
@Lazy
@Service
public class UserService {
    @Lazy
    @Autowired
    private UserMapper userMapper;
}
```
 


加上了这个注解后，Bean 只会在第一次调用 getBean()方法时才会被实例化。
 


不过这会使得第一次使用该 Bean 有一定延迟，所以我们一般用懒加载并不是为了解决启动慢的问题，更多时候都是为了支持循环依赖。
 


#### 2. 条件化装配
 


条件化装配的执行时机并没有变化，只是多了个判断条件，只有满足判断条件才会实例化对应的 Bean。
 


```java
@Configuration
public class MyConfig {
    
    @Bean
    @Conditional(OnWindowsCondition.class) 
    public FileService windowsFileService() {
        return new WindowsFileService();
    }
 
    @Bean
    @Conditional(OnLinuxCondition.class)
    public FileService linuxFileService() {
        return new LinuxFileService();
    }
}
 
public class OnWindowsCondition implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        return System.getProperty("os.name").contains("Windows");
    }
}
```
 


主要的使用场景就是根据不同的操作系统或者其他因素装配不同的 Bean。
 


### （六）依赖循环问题以及 Spring 的解决策略
 


#### 1. 什么是循环依赖
 


循环依赖就是 两个或多个 Bean 互相依赖，形成环。
 


```java
@Component
class A {
    @Autowired
    private B b;
}
 
@Component
class B {
    @Autowired
    private A a;
}
```
 


当 Spring 初始化 A 的 Bean 时，就会先将 B 的 Bean 注入，但是如果要注入 Bean 就得先初始化 B 的 Bean，但此时又需要初始化 A 的 Bean，形成循环。
 


#### 2. Spring 的解决策略
 


Spring 使用了三级缓存来解决这个问题：
 


1. 一级缓存：存放完全初始化好的单例 Bean
2. 二级缓存：存放已经实例化但没有初始化的半成品 Bean
3. 三级缓存：存放对象工厂
 


当 Spring 初始化 A 的时候，会把对应的工厂放入三级缓存中，然后在需要 B 的 Bean 时去先将 B 的 Bean 初始化，B 的 Bean 初始化时需要 A 的 Bean，会从三级缓存中拿到 A 的工厂生成半成品，放入二级缓存后注入给 B，完成 B 的 Bean 初始化后放入一级缓存，再注入到 A，这时 A 的 Bean 初始化也完成了，放入一级缓存后会自动清理掉二、三级缓存对应的数据。
 


> 
>  为什么需要三级缓存而不是二级缓存呢？
设想这样一个二级缓存：一层放完全 Bean，一层放早期半成品 Bean，在 Bean 实例化后就将 Bean 先放入二级缓存，而不是通过工厂创建。
这样一来，当 A 需要注入 B 时，B 又要注入 A 时，B 可以从二级缓存中拿到半成品 Bean 然后进行注入，这样不也解决了循环依赖吗？为什么还需要一个存放工厂的层级呢？
要知道，如果这样操作的话 Bean 只能是原始对象，那么对 A 的 AOP 操作都会全部失效，因为我们拿到的不是 A 的代理对象。
而三级缓存中的第三级缓存中的工厂，则是延迟了生成半成品的曝光操作，工厂自己会调用相关 API 来判断当前对象是否需要被代理，从而返回一个正确的 Bean。 
>   
>  需要注意的是，三级缓存并不能解决所有的循环依赖。
Spring 的三级缓存的核心思想就是先注入一个空参构造创建出来的半成品 Bean，后续再进行依赖的注入。
而如果使用的是构造方法注入，那工厂就会调用有参构造方法直接注入依赖，所以根本无法创建半成品，也就无法解决循环依赖。
总结一句话就是，只有当初始化和依赖注入分开时，三级缓存才能解决循环依赖问题。
除此之外，Spring 的三级缓存只针对单例 Bean 生效，因为多例 Bean 的完整生命周期并不归 Spring 管理。 
> 
 


针对于构造器注入方式的循环依赖问题，我们可以使用之前说的懒加载解决，将循环的依赖加上@Lazy 注解，使其不在初始化的时候注入，而是使用的时候才注入。
 


不过归根结底，还是尽量避免产生循环依赖比较好，因为多数情况下的循环依赖都是因为设计不合理。
 


---
 


## 四、IoC 注解
 


### （一）@ & @Service & @Repository & @Controller
 


后面三个注解其实本质上都是@Component 注解的特化，都是起到标记作用，Spring 会扫描带有这些注解的类并注册为 Bean。
 


### （二）@Autowired & @Qualifier & @Primary
 


@Autowired 表示按类型注入 Bean，可用于构造方法、Setter、字段以及方法参数，如果只有单个构造器的话可以省略该注解。
 


而当需要注入两个相同类型不同实现的 Bean 时，需要使用@Qualifier 注解指定 Bean 的名称。
 


而@Primary 则是表示优先级，如果需要注入两个相同类型不同实现的 Bean 且没有使用@Qualifier 注解指定 Bean 的名称或者有多个相同类型相同名称的 Bean 时，则会优先注入带有@Primary 注解的类。
 


总结一下注入流程如下：
 


1. 按类型查找所有符合条件的 Bean
2. 如果只有一个 Bean 则注入，否则进行下一步
3. 如果有多个候选，则根据@Qualifier 指定的名称进行匹配，若匹配后只有一个则注入，否则进行下一步
4. 查找是否有类带有@Primary 注解，如果只有一个或者存在多个但名称不相同的 Bean 则注入，否则抛出异常
 


最后一个抛出异常可以通过@Autowired(required=false)取消，进行降级处理。
 


### （三）@Resource
 


与@Autowired 不同，@Resource 表示按名称注入 Bean，可用于 Setter、字段以及方法参数上。
 


注入流程如下：
 


1. 先按照 Bean 的名称进行查找，如果有配置注解的 name 属性则按照 name 进行查找，否则按照字段名或属性名去查找。
2. 如果只有一个 Bean 则注入，否则进行下一步
3. 按照类型进行查找，如果找到匹配项则注入，否则抛出异常
 


@Resource 注解是 JDK 自带的注解，而@Autowired 是 Spring 框架提供的，@Autowired 的作用域更广，而且与使用 Spring 框架项目的贴合度更高，灵活度也很好，因此大多数情况下更加推荐使用@Autowired 注解.
 


### （四）@Value 与 Environment
 


@Value 是把单个基本数据结构属性值注入到字段中。
 


可以使用${}占位符注入 yaml 配置文件中的属性值，并加上等号配置默认值，也可以使用 SpEL 注入其他 Bean 的属性值。
 


```java
@Component
public class MyBean {
    @Value("${app.name:MyApp}")           
    private String appName;
 
    @Value("#{T(java.lang.Math).random()}") 
    private double r;
 
    @Value("${server.ports}")       
    private String portsRaw;
}
```
 


而 Environment 则是个类，注入之后可在运行时使用并动态注入属性值，比使用@Value 要更加灵活：
 


```java
@Autowired
private Environment env;
 
String s = env.getProperty("app.name");               
String s2 = env.getProperty("app.name", "default");
Integer p = env.getProperty("server.port", Integer.class);
boolean has = env.containsProperty("some.key");
String[] profiles = env.getActiveProfiles();
```
 


### （五）配合依赖注入
 


Spring 官方推荐的注入方式是@Autowired 构造器注入，因为使用 final 修饰不可变，更加符合依赖倒置原则，只要设计合理并搭配@Lazy 注解就可以完美解决循环依赖问题。
 


但是假如说我有一个 Service 类逻辑很复杂，可能需要注入几十种依赖，那么手写构造器就会变得很麻烦，而且构造方法也会很长，很影响代码阅读以及美观。
 


所以我们可以搭配 Lombok 的@RequiredArgsConstructor 注解，它会自动生成一个构造方法，参数是带有 final 关键字或者@NonNull 注解的字段，这样就不用手写构造器了。
 


```java
@Service
@RequiredArgsConstructor 
public class OrderService {
 
    private final PaymentService paymentService; 
    private final UserMapper userMapper;  
}
```
 


---
 


## 五、
 


### （一）静态代理
 


代理模式的一种实现方式，代理类在编译期就确定，代理类和被代理类需要实现相同的接口。
 


核心思想就是代理类的一种增强实现，通过代理类来调用被代理类的访问接口，并在前后可做一些增强的实现，比如事务或日志记录。
 


```java
// 共同接口
public interface UserService {
    void register(String username);
}
 
// 被代理类
public class UserServiceImpl implements UserService {
    @Override
    public void register(String username) {
        System.out.println("注册用户: " + username);
    }
}
 
// 代理类
public class UserServiceProxy implements UserService {
 
    // 被代理类
    private final UserService target; 
 
    // 通过构造方法注入被代理类
    public UserServiceProxy(UserService target) {
        this.target = target;
    }
 
    @Override
    public void register(String username) {
        System.out.println("日志：准备注册用户...");
        // 调用目标对象方法
        target.register(username);
        System.out.println("日志：注册用户完成。");
    }
}
```
 


通过静态代理，我们可以轻松实现在不改动被代理对象的代码的前提下对被代理对象进行增强处理，符合 OCP 开闭原则。
 


不过针对代理对象可就不一样了，如果被代理对象新增接口时，代理对象也要新增，删除同理，因为它们共用接口，这就不符合 OCP 了。
 


而且，如果我有几百个被代理对象，我就得写几百个代理类，这会造成代码膨胀的问题。
 


### （二）动态代理
 


动态代理的出现，消除了上面所说的静态代理的弊端，也是现在最为广泛使用的代理模式。
 


#### 1.JDK 动态代理
 


这是 Java 内置的，根据传入的参数会动态地生成代理类，我们自己只需要实现一个 InvocationHandler 即可。
 


```java
public interface UserService {
     void register(String u);
}
 
public class UserServiceImpl implements UserService {
    public void register(String u) {
         System.out.println("register " + u); 
    }
}
 
InvocationHandler h = (proxy, method, args) -> {
    System.out.println("before");
    Object r = method.invoke(new UserServiceImpl(), args);
    System.out.println("after");
    return r;
};
 
UserService proxy = (UserService) Proxy.newProxyInstance(
        UserService.class.getClassLoader(),
        new Class[]{UserService.class},
        h);
proxy.register("Alice");
```
 


InvocationHandler 内部实现和我们自己写静态代理类的接口实现是一样的。
 


优点是简单快捷，无需引入第三方依赖；缺点就是只能代理接口。
 


#### 2.CGLIB 动态代理
 


通过字节码创建目标类的子类，子类覆盖可拦截的方法并在方法内调用拦截逻辑。
 


```java
Enhancer e = new Enhancer();
e.setSuperclass(UserServiceImpl.class);
e.setCallback((MethodInterceptor) (obj, method, args, proxy) -> {
    System.out.println("before");
    Object r = proxy.invokeSuper(obj, args);
    System.out.println("after");
    return r;
});
UserServiceImpl proxy = (UserServiceImpl) e.create();
proxy.register("Bob");
```
 


但是该代理方法无法代理带有 final 修饰的方法或类，因为本质上是通过继承实现的，带有 final 关键字的类和方法无法被继承或重写。
 


### （三）Spring 的代理模式策略
 


当目标对象实现了至少一个接口的时候，Spring 会使用 JDK 动态代理，反之则 CGLIB。
 


我们也可以通过@EnableAspectJAutoProxy(proxyTargetClass = true)或 spring.aop.proxy-target-class=true 强制使用 CGLIB。
 


---
 


## 六、AOP
 


### （一）概念
 


AOP，就是面向切面编程，是把横切关注点从业务逻辑中分离出来的编程范式。
 


核心思想就是将非业务逻辑代码在切点织入切面，是一种非侵入式的编程范式。
 


### （二）Spring AOP 实现机制
 


Spring AOP 是基于动态代理实现的，正如我们上面的三级缓存所说的，Spring 的第三级缓存中的工厂在创建提前曝光的半成品 Bean 时会调用相关 API 检测其是否有 AOP 逻辑，如果有就返回一个代理 Bean，最后初始化完成后 Spring 容器中存放的就是代理对象而不是原始对象。
 


然后就通过两种动态代理方式对应的实现来完成个切面的织入。
 


### （三）常见通知类型
 


#### 1. 前置通知（@Before）
 


在目标方法执行之前执行，不能控制是否继续调用目标方法。
 


#### 2. 后置通知（@After）
 


在目标方法执行之后执行，无论正常返回还是抛异常都会执行，相当于 finally。
 


#### 3. 返回通知（@AfterReturning）
 


目标方法正常返回后执行，可以访问返回值。
 


#### 4. 异常通知（@AfterThrowing）
 


当目标方法抛异常时执行，可以访问异常对象。
 


#### 5. 环绕通知（@Around）
 


最强大的通知，可以完全控制方法执行，可决定是否执行目标方法、修改参数、包装返回值、捕获/转换异常等。
 


> 
>  关于执行顺序
如果同一切点有多个通知，执行顺序由 Advice 类型与@Order 决定。
环绕通知包裹最内层（外层 around -> inner advices -> target -> inner after -> outer after）。 
> 
 


---
 


## 七、@Transaction
 


> 
>  详细请见以下博客：
带你轻松学习并掌握@Transactional 的高级用法！-CSDN 博客 
> 
 


---
 


## 八、Spring 常用设计模式
 


### （一）单例模式
 


确保一个类只有一个实例，并提供全局访问点。
 


Spring 容器默认把 bean 的作用域设为单例。
 


优点就是避免重复创建资源，且集中管理有利于线程安全。
 


### （二）工厂模式
 


将对象创建委托给工厂，从而解耦调用方与具体实现的创建逻辑。
 


Spring 中的 BeanFactory、ApplicationContext 和第三级缓存的工厂等等都是使用的工厂模式。
 


优点是可以实现复杂的创建逻辑，且扩展性很强。
 


### （三）装饰器模式
 


在不改变对象接口的前提下，动态地给对象添加职责。
 


Spring 中的 JdbcTemplate 就使用了装饰器模式，可以根据数据源的类型调用对应数据源的接口。
 


优点就是灵活、可扩展性高。
 


### （四）代理模式
 


为另一个对象提供一个代理对象，以控制对原对象的访问，可用于延迟加载、访问控制、日志、事务等。
 


Spring AOP 使用的就是代理模式。
 


优点就是无侵入性、灵活度高、解耦性好。
 


### （五）观察者模式
 


定义对象间的一对多依赖，当一个对象状态改变时，所有依赖者都会收到通知。
 


Spring 中的大多数以 Listener 结尾的类都使用的是观察者模式。
 


优点就是解耦性极高，支持同步/异步操作。
 


### （六）适配器模式
 


把一个类的接口转换成客户期望的另一个接口，使原本由于接口不兼容而不能一起工作的类可以协同工作。
 


Spring AOP 使用的也是适配器模式，只不过使用目的并不是很一致，适配器模式大多解决的是兼容性问题。
 


优点就是可以统一多种不兼容的接口，使程序正常运行。
 


### （七）模板回调模式
 


模板封装固定流程，把可变部分通过回调接口传入，典型是 Template + Callback 的组合。
 


Spring 提供的多种中间件模板都使用了这个模式。例如 JdbcTemplate、RestTemplate。
 


优点就是业务层可以专注业务代码，无需编写重复冗余的资源管理及异常处理代码。
 


---
 


**~码文不易，留个赞再走吧~**

---
> 原文链接: [带你轻松学习 Spring](https://blog.csdn.net/2401_88959292/article/details/152334008?spm=1001.2014.3001.5501)
> 作者: Yilena
