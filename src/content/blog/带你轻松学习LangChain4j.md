---
"title": "带你轻松学习LangChain4j"
"link": "dai-ni-qing-song-xue-xi-langchain4j"
"author": "Yilena"
"date": "2026-03-28"
"description": "本文全面介绍了Java生态中的大模型应用开发框架LangChain4j。从其解决的模型调用统一化、Prompt管理规范化等核心痛点出发，详细解析了框架的四层架构与面向抽象、消息优先的设计思想。文章深入讲解了ChatLanguageModel、AiServices等核心模块，剖析了@SystemMessage、@UserMessage等常用注解的驱动机制，并探讨了ChatMemory上下文管理、流式输出及结构化结果解析等高级特性。最后，客观分析了LangChain4j在企业级开发中的优势与当前版本的局限性。"
"cover": "https://i-blog.csdnimg.cn/direct/b7ac45daf6964db48bcf48fcd2c07b02.png"
"tags":
  - "LangChain4j"
  - "大模型"
  - "Java"
"categories":
  - "技术笔记"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/159572345?spm=1001.2014.3001.5501"
---

**目录**
 



 


[一、什么是 LangChain4j？](#t0)
 


[二、LangChain4j 解决的核心问题](#t1)
 


[1. 模型调用统一化](#t2)
 


[2. Prompt 管理规范化](#t3)
 


[3. Java 接口式 AI 开发](#t4)
 


[三、LangChain4j 的整体架构](#t5)
 


[第一层：业务调用层](#t6)
 


[第二层：LangChain4j 使用层](#t7)
 


[第三层：消息与请求组装层](#t8)
 


[第四层：模型实现层](#t9)
 


[四、LangChain4j 的设计思想](#t10)
 


[1. 面向抽象编程](#t11)
 


[2. 消息优先，而不是字符串优先](#t12)
 


[3. 注解驱动开发](#t13)
 


[4. 动态代理生成 AI 服务](#t14)
 


[五、LangChain4j 的核心模块](#t15)
 


[六、ChatLanguageModel](#t16)
 


[七、AiServices](#t17)
 


[底层原理](#t18)
 


[八、常用注解](#t19)
 


[1. @SystemMessage](#t20)
 


[2. @UserMessage](#t21)
 


[3. @V](#t22)
 


[4. @MemoryId](#t23)
 


[5. 注解配合使用示例](#t24)
 


[九、核心类](#t25)
 


[1. ChatLanguageModel](#t26)
 


[2. StreamingChatLanguageModel](#t27)
 


[3. AiServices](#t28)
 


[4. ChatMemory](#t29)
 


[5. MessageWindowChatMemory](#t30)
 


[6. TokenWindowChatMemory](#t31)
 


[7. ChatRequest & ChatResponse](#t32)
 


[8. Prompt](#t33)
 


[十、Message](#t34)
 


[十一、Streaming](#t35)
 


[1. 为什么需要流式输出？](#t36)
 


[2. 基本工作流程](#t37)
 


[十二、结构化输出](#t38)
 


[十三、LangChain4j 的优势与局限](#t39)
 


[（一）优势](#t40)
 


[1. 非常符合 Java 开发习惯](#t41)
 


[2. 统一模型抽象](#t42)
 


[3. AiServices 很适合企业开发](#t43)
 


[4. 框架结构比较清晰](#t44)
 


[（二）局限](#t45)
 


[1. 版本演进较快](#t46)
 


[2. 抽象层越高，越要理解底层](#t47)
 


[3. 高级能力仍需结合业务理解](#t48)
 


---
 



 


## 一、什么是 ？
 


![](https://i-blog.csdnimg.cn/direct/b7ac45daf6964db48bcf48fcd2c07b02.png)
 


在  生态中，如果我们想把大语言模型能力接入业务系统，最直接的方式通常是：
 


- 手动拼接 prompt
- 自己封装 HTTP 请求
- 自己处理上下文消息
- 自己解析返回结果
- 自己写流式输出逻辑
- 自己做不同模型厂商的适配
 


这种方式在小的问题不大，但是一旦项目规模扩大，很快就会暴露问题：
 


- 模型调用代码分散
- Prompt 难维护
- 模型供应商切换成本高
- 业务层和 AI 调用层耦合严重
- 多轮对话、流式输出、结构化结果很难统一处理
 


而 LangChain4j 的价值就在于它提供了一套围绕调用的同意抽象和开发范式。
 


---
 


## 二、LangChain4j 解决的核心问题
 


### 1. 调用统一化
 


不同模型服务的  格式并不一致，LangChain4j 通过统一接口，把底层差异屏蔽起来，让业务层更少感知模型厂商差异。
 


### 2.  管理规范化
 


如果你的项目里全是下面这种代码：
 


```java
String prompt = "下面是最近很火的奶龙圣经，请你分析一下其中的奶龙成分" + text;
String result = model.generate(prompt);
```
 


那么 Prompt 很快就会变得：
 


- 到处散落
- 难以复用
- 难以维护
- 难以做版本管理
 


LangChain4j 通过注解和模板化方式，把 Prompt 组织得更清晰。
 


### 3. Java 接口式 AI 开发
 


LangChain4j 很有特色的一点是它允许我们把 AI 能力定义成接口：
 


```java
public interface Assistant {
    String chat(String message);
}
```
 


然后通过框架生成一个代理对象，像调用普通 service 一样调用它。
 


---
 


## 三、LangChain4j 的整体架构
 


先看一张整体结构图：
 


![](https://i-blog.csdnimg.cn/direct/691659124c9743e4900486f8192dc5d1.png)
 


这张图可以帮助我们理解 LangChain4j 的几个核心层次：
 


### 第一层：业务调用层
 


这一层就是业务代码，比如 Controller、Service...
 


### 第二层：LangChain4j 使用层
 


这一层通常有两种使用方式：
 


**方式一：直接使用`ChatLanguageModel`**
 


适合简单场景、底层控制更强的场景。
 


**方式二：使用`AiServices`**
 


适合大多数业务开发场景，更符合 Java 风格。
 


### 第三层：消息与请求组装层
 


这一层会负责：
 


- 组装 system/user 消息
- 处理模板变量
- 组织消息列表
- 构建请求对象
 


### 第四层：模型实现层
 


这一层是真正连接模型提供商的地方，比如：
 


- `OpenAiChatModel`
- `OllamaChatModel`
- `AzureOpenAiChatModel`
 


---
 


## 四、LangChain4j 的设计思想
 


### 1. 面向抽象编程
 


LangChain4j 非常强调接口抽象。
 


例如：
 


- `ChatLanguageModel`
- `StreamingChatLanguageModel`
- `EmbeddingModel`
- `ChatMemory`
 


其中最重要的是 `ChatLanguageModel`。
 


这意味着业务代码通常依赖接口，而不是直接依赖某个厂商实现。
 


这带来的好处是：
 


- 更容易替换底层模型
- 更方便测试
- 代码结构更清晰
 


### 2. 消息优先，而不是优先
 


有同学经常把调用 LLM 理解成：
 


```matlab
model.generate("你好");
```
 


但 LangChain4j 更完整的思路是：模型接收的是一组消息，而不是一个裸字符串。
 


例如：
 


- SystemMessage：系统角色设定
- UserMessage：用户输入
- AiMessage：模型历史输出
- ToolExecutionResultMessage：工具执行结果
 


### 3. 注解驱动开发
 


LangChain4j 提供了大量很有 Java 风格的注解能力，例如：
 


- `@SystemMessage`
- `@UserMessage`
- `@V`
- `@MemoryId`
 


这些注解可以降低手写 Prompt 代码量、让 AI 功能定义更接近声明式编程并提高代码可读性。
 


### 4. 动态代理生成 AI 服务
 


`AiServices`本质上非常像 Java 里的动态代理机制。
 


你定义一个接口，框架会读取接口上的注解并自动帮你实现这个接口。
 


也就是说，调用接口方法时，底层实际是在拼装 Prompt 并调用模型。
 


---
 


## 五、LangChain4j 的核心模块
 


![](https://i-blog.csdnimg.cn/direct/9dfdff0d237142949f45b89548f39c60.png)
 



 


本文后面主要就是围绕这几个模块进行展开。
 


---
 


## 六、ChatLanguageModel
 


如果你不想一开始就上 `AiServices`，最底层、最直接的用法就是 `ChatLanguageModel`。
 


```java
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
 
public class Demo {
    public static void main(String[] args) {
        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName("gpt-5.4")
                .build();
 
        String result = model.generate("请用一句话介绍 LangChain4j");
        System.out.println(result);
    }
}
```
 


**优点：**
 


- 简单直接
- 容易理解
- 适合写最小 Demo
 


**缺点：**
 


- Prompt 分散
- 不利于大型项目组织
- 很难统一约束风格
- 不适合复杂业务功能抽象
 


这段代码背后本质流程如下：
 


![](https://i-blog.csdnimg.cn/direct/c7f49dcab796437f90916ceb4b9f7104.png)
 


也就是说，`ChatLanguageModel` 是最底层的统一抽象接口之一。
 


---
 


## 七、AiServices
 


如果说 `ChatLanguageModel` 是底层模型调用入口，那么 `AiServices` 就是 LangChain4j 最具代表性的高级能力。
 


它的核心思想很简单：用 Java 接口描述 AI 能力，用框架自动生成实现。
 


```java
-- 定义
 
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
 
public interface Assistant {
 
    @SystemMessage("你是一名资深Java技术专家，回答准确、专业、简洁。")
    String chat(@UserMessage String message);
}
 
 
-- 使用
 
import dev.langchain4j.service.AiServices;
 
Assistant assistant = AiServices.create(Assistant.class, model);
String result = assistant.chat("请解释什么是Java中的多态");
```
 


为什么这种写法很强？因为它把 AI 调用变成了“接口式开发”。
 


这意味着在项目里你可以这样组织代码：
 


- `CodeReviewAssistant`
- `SqlAssistant`
- `JavaTutorAssistant`
- `ApiDocAssistant`
 


每一个 AI 能力都像普通的 Java 服务接口一样清晰。
 


### 底层原理
 


`AiServices` 本质上是：基于接口 + 注解 + 动态代理 的 AI 服务生成器。
 


![](https://i-blog.csdnimg.cn/direct/ffa1e9a89df84ad7bafe13df26b7760b.png)
 


它和 JDK 动态代理很像：定义了接口，但是接口本身没有实现。
 


我们需要在业务代码中调用 AiServices.create()，它会在运行时自动生成一个实现对象。
 


这个对象内部会拦截方法调用，然后做下面几件事：
 


1. 找到当前调用的是哪个方法
2. 读取方法上的注解
3. 读取参数上的注解
4. 生成 Prompt
5. 调用模型
6. 把结果转成返回值
 


---
 


## 八、常用注解
 


### 1. `@SystemMessage`
 


用于定义系统提示词。
 


```java
@SystemMessage("你是一名专业的Java架构师，回答时请先给结论，再给原因。")
```
 


它告诉模型：你的角色是什么？你的回答风格是什么？你的行为规则是什么？
 


一般适合放：角色设定、语气要求、输出格式要求、约束规则。
 


不建议把动态业务输入写到这里，比如用户当前问题、临时参数等。
 


### 2. `@UserMessage`
 


用于声明用户消息。
 


```java
-- 写法一
String chat(@UserMessage String message);
 
-- 写法二
@UserMessage("请解释下面这段代码：{code}")
String explain(@V("code") String code);
```
 


一个是直接将用户输入的文本作为参数，一个是将用户输入的文本注入到模板当中作为参数。
 


### 3. `@V`
 


`@V` 的作用是模板变量绑定。
 


```java
@UserMessage("请把以下内容翻译成{language}：{text}")
String translate(@V("language") String language,
                 @V("text") String text);
```
 


就是把 Java 方法参数映射到 Prompt 模板占位符。
 


### 4. `@MemoryId`
 


如果启用了 Memory 机制，就需要一个 ID 来区分不同会话或不同用户。
 


```java
String chat(@MemoryId String userId, @UserMessage String message);
```
 


它会告诉框架：这个调用属于哪个会话以及哪些历史消息应该被复用。
 


### 5. 注解配合使用示例
 


```java
public interface JavaAssistant {
 
    @SystemMessage("""
            你是一名资深Java开发专家。
            回答时要求：
            1. 先给结论
            2. 再解释原理
            3. 最后给一个简短示例
            """)
    @UserMessage("请解释以下Java问题：{question}")
    String ask(@V("question") String question);
}
```
 


---
 


## 九、核心类
 


### 1. `ChatLanguageModel`
 


上文提到了，这里就简单概括一下：这是最核心最底层的接口之一，是所有模型的统一抽象入口。
 


### 2. `StreamingChatLanguageModel`
 


如果你需要流式输出，就会用到它。
 


- `ChatLanguageModel`：一次性返回完整结果
- `StreamingChatLanguageModel`：分块返回结果
 


### 3. `AiServices`
 


同上，简单概括：这是高层封装的入口，在底层接口的基础上包了一层动态代理。
 


### 4. `ChatMemory`
 


用于保存对话上下文。
 


模型本身默认是“无状态”的。
 如果不把历史消息再次传进去，模型并不知道你上一次说了什么。
 


![](https://i-blog.csdnimg.cn/direct/d73832a3e3704c14884f382a61dfb1f1.png)
 


所以 ChatMemory 可以保存历史消息，并在下次调用时自动注入上下文，实现多轮对话效果。
 


不要把 Memory 理解成模型真的长期记住了你。
 


它本质上是框架在下一次请求时，把历史消息重新带给模型。
 


### 5. `MessageWindowChatMemory`
 


一种典型的 Memory 实现。
 


- 只保留最近若干条消息
- 简单直观
- 适合常见聊天场景
 


为什么需要窗口？因为模型有限，不可能无限传历史消息。
 


### 6. `TokenWindowChatMemory`
 


相比按“消息条数”，它是按 token 数量控制窗口。
 


- 更接近模型真实成本
- 更精细
- 控制更稳定
 


### 7. `ChatRequest` & `ChatResponse`
 


如果从更底层的角度看，模型调用并不是简单的字符串进字符串出，而是有明确请求对象和响应对象的。
 


**`ChatRequest`一般表示：**
 


- 模型名称
- 消息列表
- 温度参数
- 最大 token
- 其他推理参数
 


**`ChatResponse`一般表示：**
 


- 模型输出文本
- token 消耗
- finish reason
- 元信息
 


### 8. `Prompt`
 


在一些更底层的写法中，Prompt 也可以被显式建模，而不是仅仅作为裸字符串。
 


这体现了 LangChain4j 的一个重要理念：Prompt 不是随便拼接的文本，而是一种可管理、可组合的输入结构。
 


当你调用：assistant.explain("什么是依赖注入");
 


框架会做：
 


1. 读取`@SystemMessage`
2. 读取`@UserMessage`
3. 找到模板变量`{concept}`
4. 用参数`"什么是依赖注入"`替换
5. 组装为消息列表
6. 发送给模型
 


---
 


## 十、Message
 


![](https://i-blog.csdnimg.cn/direct/26925d11ecf1431cbb07f5a2c6f83b32.png)
 


Message 的优势：
 


- 结构清晰：不同类型消息职责明确。
- 易于扩展：后续要加历史消息、工具消息时，不需要推倒重来。
- 更符合模型 API 现实：大多数主流模型 API 本来就是 message-based。
 


---
 


## 十一、Streaming
 


### 1. 为什么需要流式输出？
 


如果一次性返回长文本，用户体验往往比较差。
 而流式输出可以让用户更早看到内容。
 


### 2. 基本工作流程
 


![](https://i-blog.csdnimg.cn/direct/47565430ffe04d0fb7a45058fbe1c4fb.png)
 


**普通调用**
 


- 请求一次
- 返回完整文本
 


**流式调用**
 


- 请求一次
- 分段返回内容
- 业务侧需要处理回调
 


---
 


## 十二、输出
 


很多时候我们不是要一段自然语言，而是要一个业务对象，例如：
 


- 分类结果
- 评分结果
- 摘要对象
- 审查结果对象
 


我们希望能够直接获取一个对象结果，而不是自然语言文本，而 LangChain4j 会自动解析模型返回的结构化文本，并映射为对应的对象并填充到回参当中。
 


---
 


## 十三、LangChain4j 的优势与局限
 


### （一）优势
 


#### 1. 非常符合 Java 开发习惯
 


接口、注解、Builder、强类型，Java 开发者上手成本低。
 


#### 2. 统一模型抽象
 


可以降低不同模型供应商之间切换成本。
 


#### 3. AiServices 很适合企业开发
 


相比到处手写 prompt，这种接口式定义更规范。
 


#### 4. 框架结构比较清晰
 


从底层模型到高层代理，各层职责相对明确。
 


---
 


### （二）局限
 


#### 1. 版本演进较快
 


某些 API 在不同版本间可能会调整。
 


#### 2. 抽象层越高，越要理解底层
 


如果只会用注解，不理解消息模型和请求结构，出问题时会比较难排查。
 


#### 3. 高级能力仍需结合业务理解
 


比如 Prompt 设计、流式输出、结构化结果，并不是框架接上就自动完美。
 


---
 


对 Java 开发者来说，LangChain4j 的意义不在于把 AI 接上去这么简单，而在于它提供了一套相对成熟的工程化抽象：接口、注解、消息模型、动态代理、流式输出、类型化返回。这些能力让 LLM 不再只是一个外部 API，而更像一个可以被纳入 Java 应用架构中的标准组件。
 


---
 


**~码文不易，留个赞再走吧~**

---
> 原文链接: [带你轻松学习 LangChain4j](https://blog.csdn.net/2401_88959292/article/details/159572345?spm=1001.2014.3001.5501)
> 作者: Yilena
