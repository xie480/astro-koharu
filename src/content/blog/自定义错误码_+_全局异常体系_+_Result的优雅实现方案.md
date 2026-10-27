---
"title": "自定义错误码 + 全局异常体系 + Result的优雅实现方案"
"link": "zi-ding-yi-cuo-wu-ma_-_quan-ju-yi-chang-ti-xi_-_resultde-you-ya-shi-xian-fang-an"
"author": "Yilena"
"date": "2025-08-16"
"description": "本文详细介绍了一套适用于大型微服务项目的优雅错误处理方案。通过分析枚举类在规模化项目中的局限性，提出采用常量类结合接口抽象的方式设计静态与动态错误码。文章深入讲解了如何构建基础异常类及其具体实现，并展示了利用@RestControllerAdvice和@ExceptionHandler打造全局异常拦截器的完整代码。此外，还提供了标准化的Result响应封装及反馈类设计，帮助开发者实现前后端交互中错误码、异常与响应结果的统一规范与高效管理。"
"tags":
  - "Spring"
  - "异常处理"
  - "架构设计"
"categories":
  - "业务拆解"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/150211691?spm=1001.2014.3001.5501"
---

**目录**
 


[一、业务需求](#t0)
 


[二、分析](#t1)
 


[三、实现方案](#t2)
 


[（一）错误码相关](#t3)
 


[1. 错误码接口](#t4)
 


[2. 抽象基础错误码](#t5)
 


[3. 错误码类型](#t6)
 


[4. 错误码具体实现](#t7)
 


[（二）异常相关](#t8)
 


[1. 抽象基础异常](#t9)
 


[2. 异常具体实现](#t10)
 


[3. 全局异常拦截器](#t11)
 


[（三）Result 相关](#t12)
 


[1. Result 封装](#t13)
 


[2. Result 反馈类](#t14)
 


---
 



 


## 一、业务需求
 


你的团队需承担一个采用的大型新项目，现需设计一套错误码、异常以及 Result 方案。
 


---
 


## 二、分析
 


对于错误码方案，我们一般会用枚举类或者常量类来设计，针对本项目特点让我们来分析一下：
 


首先这个项目是大规模的，那肯定会使用到成百甚至上千的错误码，枚举类是单例的，也就是说我们要将这成百上千的错误码都写到一个枚举类里面，先不说团队协作的易冲突性或者管理的复杂性，是编译时间就会大大增加。那有同学可能会想使用多个枚举类不就好了，这样是可以，但是枚举类是不适合常规类那一套继承体系的，它天生就是用来管理体量小的常量的。
 


其次，微服务架构强调。枚举类难以构建复杂的层级关系，无法很好地契合模块内业务进一步细分的需求。采用枚举类管理跨模块的错误码，其的复杂性同样会显著增加。
 


总结而言，枚举类适用于体量小、无需精细模块划分的项目。综合考量项目规模庞大、微服务架构对模块化和错误码管理的要求，以及错误码唯一性校验的必要性，常量类方案是本项目更适宜的选择。
 


而对于异常和 Result 的话则不作分析了，因为基本都是一个套路，这里要做的只是兼容我们的错误码方案即可。
 


---
 


## 三、实现方案
 


### （一）错误码相关
 


#### 1. 错误码接口
 


```java
public interface IErrorCode {
    String code();
    String message();
}
```
 


这里确定我们错误码的，由一个错误码和具体错误信息组成。
 


#### 2. 抽象基础错误码
 


```java
public abstract class AbsErrorCode implements IErrorCode {
    protected final String code;
    protected final String message;
    
    protected AbsErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }
    
    @Override
    public String code() {
        return code;
    }
    
    @Override
    public String message() {
        return message;
    }
}
```
 


用于实现错误码的架构。
 


#### 3. 错误码类型
 


```java
// 静态错误码实现
public class StaticErrorCode extends AbsErrorCode {
    public StaticErrorCode(String code, String message) {
        super(code, message);
    }
}
```
 


```java
// 动态错误码实现
public class DynamicErrorCode extends AbsErrorCode {
    private final String template;
 
    public DynamicErrorCode(String code, String template) {
        super(code, template);
        this.template = template;
    }
 
    @Override
    public String message() {
        return template;
    }
 
    public DynamicErrorCode formatMessage(Object... args) {
            return new DynamicErrorCode(code,MessageFormat.format(template, args));
    }
}
```
 


用于创建错误码对象，我们把错误码分为了两种，一动一静。
 


静态错误码就是写死的那种，直接用就可以；动态错误码中是有占位符的，根据传入的参数进行动态填充，更加灵活。
 


#### 4. 错误码具体实现
 


```java
public final class UserErrorCodes {
 
    public static final StaticErrorCode USER_ERROR = new StaticErrorCode("U000001", "请稍后再试~");
    public static final DynamicErrorCode USERNAME_ALREADY_EXIST = new DynamicErrorCode("U000002", "[{0}]已存在");
    public static final StaticErrorCode USER_NOT_EXIST = new StaticErrorCode("U000003", "用户不存在");
}
```
 


```java
public final class SystemErrorCodes {
    public static final StaticErrorCode SYSTEM_ERROR = new StaticErrorCode("S000001", "系统繁忙~");
}
```
 


```java
public final class RemoteErrorCodes {
    public static final StaticErrorCode REMOTE_ERROR = new StaticErrorCode("R000001", "系统繁忙~");
}
```
 


可以像我这样将错误码分为三大类供全局使用，也可以给每个模块分一个类型单独使用。
 


### （二）异常相关
 


错误码一般都是放入异常抛出，然后被全局异常给拦截。
 


#### 1. 抽象基础异常
 


```java
@Getter
public abstract class AbstractException extends RuntimeException {
 
    public final String errorCode;
 
    public final String errorMessage;
 
    public AbstractException(String message, Throwable throwable, IErrorCode errorCode) {
        super(message, throwable);
        this.errorCode = errorCode.code();
        this.errorMessage = Optional.ofNullable(StringUtils.hasLength(message) ? message : null).orElse(errorCode.message());
    }
}
```
 


提供异常对象的基础架构，跟错误码对象一致。
 


#### 2. 异常具体实现
 


```java
public class UserException extends AbstractException {
 
    public UserException (IErrorCode errorCode) {
        this(null, null, errorCode);
    }
 
    public UserException (String message) {
        this(message, null, UserErrorCodes.USER_ERROR);
    }
 
    public UserException (String message, IErrorCode errorCode) {
        this(message, null, errorCode);
    }
 
    public UserException (String message, Throwable throwable, IErrorCode errorCode) {
        super(message, throwable, errorCode);
    }
 
    @Override
    public String toString() {
        return "ClientException{" +
                "code='" + errorCode + "'," +
                "message='" + errorMessage + "'" +
                '}';
    }
}
```
 


```java
public class ServiceException extends AbstractException {
 
    public ServiceException(String message) {
        this(message, null, SystemErrorCodes.SERVICE_ERROR);
    }
 
    public ServiceException(IErrorCode errorCode) {
        this(null, errorCode);
    }
 
    public ServiceException(String message, IErrorCode errorCode) {
        this(message, null, errorCode);
    }
 
    public ServiceException(String message, Throwable throwable, IErrorCode errorCode) {
        super(Optional.ofNullable(message).orElse(errorCode.message()), throwable, errorCode);
    }
 
    @Override
    public String toString() {
        return "ServiceException{" +
                "code='" + errorCode + "'," +
                "message='" + errorMessage + "'" +
                '}';
    }
}
```
 


```java
public class RemoteException extends AbstractException {
 
    public RemoteException(String message) {
        this(message, null, RemoteErrorCodes.REMOTE_ERROR);
    }
 
    public RemoteException(String message, IErrorCode errorCode) {
        this(message, null, errorCode);
    }
 
    public RemoteException(String message, Throwable throwable, IErrorCode errorCode) {
        super(message, throwable, errorCode);
    }
 
    @Override
    public String toString() {
        return "RemoteException{" +
                "code='" + errorCode + "'," +
                "message='" + errorMessage + "'" +
                '}';
    }
}
```
 


每个异常要提供三种构造方法，便于应对各种情况。
 


#### 3. 全局异常拦截器
 


```java
@Slf4j
@RestControllerAdvice(basePackages = "com.Yilena.Global")
public class GlobalExceptionHandler {
    
    // 拦截参数验证异常
    @SneakyThrows
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public Result validExceptionHandler(HttpServletRequest request, MethodArgumentNotValidException ex) {
           // 获取绑定结果，用于后续处理验证错误信息
        BindingResult bindingResult = ex.getBindingResult();
        // 从绑定结果中获取第一个字段错误信息，以便后续处理
        FieldError firstFieldError = CollectionUtil.getFirst(bindingResult.getFieldErrors());
        // 使用Optional处理可能为null的错误信息，以避免空指针异常
        // 如果存在错误信息，则获取默认的错误消息；否则使用空字符串
        String exceptionStr = Optional.ofNullable(firstFieldError)
                .map(FieldError::getDefaultMessage)
                .orElse(StrUtil.EMPTY);
        // 记录错误日志，包括请求方法、请求URL和错误信息
        log.error("[{}] {} [ex] {}", request.getMethod(), getUrl(request), exceptionStr);
        // 返回包含错误代码和错误信息的响应结果
        return Results.failure(UserErrorCodes.CLIENT_ERROR.code(), exceptionStr);
    }
 
    
    // 拦截应用内抛出的异常
    @ExceptionHandler(value = {AbstractException.class})
    public Result abstractException(HttpServletRequest request, AbstractException ex) {
        // 检查异常的原因是否为空
        if (ex.getCause() != null) {
            // 如果原因不为空，记录包含原因的错误日志，并返回失败结果
            log.error("[{}] {} [ex] {}", request.getMethod(), request.getRequestURL().toString(), ex, ex.getCause());
            return Results.failure(ex);
        }
        // 创建一个StringBuilder来构建异常的堆栈跟踪信息
        StringBuilder stackTraceBuilder = new StringBuilder();
        // 添加异常的类名和错误消息到StringBuilder中
        stackTraceBuilder.append(ex.getClass().getName()).append(": ").append(ex.getErrorMessage()).append("\n");
        // 获取异常的堆栈跟踪元素
        StackTraceElement[] stackTrace = ex.getStackTrace();
        // 遍历堆栈跟踪的前五个元素（或全部，如果少于五个），并添加到StringBuilder中
        for (int i = 0; i < Math.min(5, stackTrace.length); i++) {
            stackTraceBuilder.append("\tat ").append(stackTrace[i]).append("\n");
        }
        // 记录包含异常堆栈跟踪信息的详细错误日志，并返回失败结果
        log.error("[{}] {} [ex] {} \n\n{}", request.getMethod(), request.getRequestURL().toString(), ex, stackTraceBuilder);
        return Results.failure(ex);
    }
 
    
    // 拦截自定义以外的异常
    @ExceptionHandler(value = Throwable.class)
    public Result defaultErrorHandler(HttpServletRequest request, Throwable throwable) {
        log.error("[{}] {} ", request.getMethod(), getUrl(request), throwable);
        return Results.failure();
    }
 
    // 获取请求的url
    private String getUrl(HttpServletRequest request) {
        if (StrUtil.isEmpty(request.getQueryString())) {
            return request.getRequestURL().toString();
        }
        return request.getRequestURL().toString() + "?" + request.getQueryString();
    }
}
```
 


着重需要注意拦截后对报错信息的处理，传参异常就得返回其错误的字段信息；自定义异常就得返回其报错原因，至于自定义以外的异常就简单处理即可，因为一般核心异常我们都会使用自定义异常对象进行处理。
 


### （三）Result 相关
 


#### 1. Result 封装
 


```java
@Data
@Accessors(chain = true)
public class Result<T> implements Serializable {
 
    @Serial
    private static final long serialVersionUID = 5679018624309023727L;
 
    
    // 正确返回码
    public static final String SUCCESS_CODE = "0";
 
    
    //返回码
    private String code;
 
    
    // 返回消息
    private String message;
 
    
    // 响应数据
    private T data;
 
    
    // 请求ID
    private String requestId;
 
    // 判断是否成功
    public boolean isSuccess() {
        return SUCCESS_CODE.equals(code);
    }
}
```
 


serialVersionUID 是用来保证序列化和过程中的版本一致性的，如果不显式声明的话 JVM 会根据类的结构自动生成一个版本号出来，但是一旦类的结构发生变化，其生成的版本号也会变化，序列化和反序列化过程中发现前后版本号不一致就会抛出异常。
 


所以建议给所有实现 Serializable 接口的类都显式声明版本号。
 


#### 2. Result 反馈类
 


```java
public final class Results {
 
    /**
     * 创建一个表示成功的 Result 对象，不包含任何数据
     */
    public static Result<Void> success() {
        return new Result<Void>()
                .setCode(Result.SUCCESS_CODE);
    }
 
    /**
     * 创建一个表示成功的 Result 对象，包含指定的数据
     */
    public static <T> Result<T> success(T data) {
        return new Result<T>()
                .setCode(Result.SUCCESS_CODE)
                .setData(data);
    }
 
    /**
     * 创建一个表示失败的 Result 对象，使用默认的错误代码和消息
     */
    public static Result<Void> failure() {
        return new Result<Void>()
                .setCode(SystemErrorCodes.SERVICE_ERROR.code())
                .setMessage(SystemErrorCodes.SERVICE_ERROR.message());
    }
 
    /**
     * 根据给定的异常创建一个表示失败的 Result 对象，如果异常的错误代码或消息为空，则使用默认的错误代码和消息
     */
    static Result<Void> failure(AbstractException abstractException) {
        String errorCode = Optional.ofNullable(abstractException.getErrorCode())
                .orElse(SystemErrorCodes.SERVICE_ERROR.code());
        String errorMessage = Optional.ofNullable(abstractException.getErrorMessage())
                .orElse(SystemErrorCodes.SERVICE_ERROR.message());
        return new Result<Void>()
                .setCode(errorCode)
                .setMessage(errorMessage);
    }
 
    /**
     * 创建一个表示失败的 Result 对象，使用指定的错误代码和消息
     */
    static Result<Void> failure(String errorCode, String errorMessage) {
        return new Result<Void>()
                .setCode(errorCode)
                .setMessage(errorMessage);
    }
}
```
 


---
 


**~码文不易，留个赞再走吧~**

---
> 原文链接: [自定义错误码 + 全局异常体系 + Result 的优雅实现方案](https://blog.csdn.net/2401_88959292/article/details/150211691?spm=1001.2014.3001.5501)
> 作者: Yilena
