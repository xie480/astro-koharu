---
"title": "FastJson日期类无法解析的解决方案"
"link": "fastjsonri-qi-lei-wu-fa-jie-xi-de-jie-jue-fang-an"
"author": "Yilena"
"date": "2025-08-01"
"description": "本文针对在Spring Boot项目中引入FastJson2依赖后，实体类日期字段（如Date类型）解析失败并抛出MethodArgumentNotValidException异常的问题，进行了深入分析。指出问题根源在于Spring MVC默认的日期转换器覆盖了FastJson的配置，导致非JSON请求体与JSON请求体的转换逻辑分离。文章提供了两种有效的解决方案：一是通过在字段上添加`@DateTimeFormat`注解指定解析格式；二是通过实现`WebMvcConfigurer`接口全局配置日期转换器（DateFormatter），以统一处理日期格式的解析与格式化。"
"cover": "https://i-blog.csdnimg.cn/direct/3aa3c70c5d244e53b6d163d75848f378.png"
"tags":
  - "FastJson"
  - "Spring Boot"
  - "故障排查"
"categories":
  - "故障排查"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/149837897?spm=1001.2014.3001.5501"
---

## 一、问题简述




```js
        <dependency>
            <groupId>com.alibaba.fastjson2</groupId>
            <artifactId>fastjson2</artifactId>
            <version>2.0.36</version>
        </dependency>
```




当我们引入阿里的依赖时，在实体类的日期字段上加了注释指定了日期格式，但在前端传入数据后却报错：




> 
> 2025-08-01T17:04:24.402+08:00  WARN 864 --- [io-10044-exec-1] .w.s.m.s.DefaultHandlerExceptionResolver : Resolved [org.springframework.web.bind.MethodArgumentNotValidException: Validation failed for argument [0] in public com.Yilena.Coupon.framework.result.Result<java.lang.Void> com.Yilena.MyOneCoupon.merchantAdmin.controller.CouponTemplateController.createCouponTemplate(com.Yilena.MyOneCoupon.merchantAdmin.entry.DTO.request.CouponTemplateSaveReqDTO) with 2 errors: [Field error in object 'couponTemplateSaveReqDTO' on field 'validEndTime': rejected value [2025-07-08 12:00:00]; codes [typeMismatch.couponTemplateSaveReqDTO.validEndTime,typeMismatch.validEndTime,typeMismatch.java.util.Date,typeMismatch]; arguments [org.springframework.context.support.DefaultMessageSourceResolvable: codes [couponTemplateSaveReqDTO.validEndTime,validEndTime]; arguments []; default message [validEndTime]]; default message [Failed to convert property value of type 'java.lang.String' to required type 'java.util.Date' for property 'validEndTime'; Failed to convert from type [java.lang.String] to type [@com.fasterxml.jackson.annotation.JsonFormat @io.swagger.v3.oas.annotations.media.Schema java.util.Date] for value [2025-07-08 12:00:00]]] [Field error in object 'couponTemplateSaveReqDTO' on field 'validStartTime': rejected value [2024-07-08 12:00:00]; codes [typeMismatch.couponTemplateSaveReqDTO.validStartTime,typeMismatch.validStartTime,typeMismatch.java.util.Date,typeMismatch]; arguments [org.springframework.context.support.DefaultMessageSourceResolvable: codes [couponTemplateSaveReqDTO.validStartTime,validStartTime]; arguments []; default message [validStartTime]]; default message [Failed to convert property value of type 'java.lang.String' to required type 'java.util.Date' for property 'validStartTime'; Failed to convert from type [java.lang.String] to type [@com.fasterxml.jackson.annotation.JsonFormat @io.swagger.v3.oas.annotations.media.Schema java.util.Date] for value [2024-07-08 12:00:00]]] ]
>  
> 




报错很长，但仔细看一下就会发现是日期的格式解析失败，也就是日期格式期望不一致，让我们看看的对应字段的代码：




```java
    @Schema(description = "有效期开始时间",
            example = "2024-07-08 12:00:00",
            required = true)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date validStartTime;
```




![](https://i-blog.csdnimg.cn/direct/3aa3c70c5d244e53b6d163d75848f378.png)




可以看到指定的格式和传入的格式是一样的，那为什么会报错呢？




这里其实是 MVC 的默认日期转化器将 FastJson 给覆盖了，底层是将非 Json 请求体和 Json 请求体的转换给分隔开的。




## 二、




### （一）添加指定 Spring 底层转化器的解析格式




在字段上加上**@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")**注释即可。




### （二）配置全局日期




```java
package com.Yilena.MyOneCoupon.merchantAdmin.config;
 
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.text.SimpleDateFormat;
import java.util.Date;
 
/**
 * 配置日期转换器的类
 * 用于统一日期格式的解析和格式化
 */
@Configuration
public class DateConverterConfiguration implements WebMvcConfigurer {
 
    /**
     * 向FormatterRegistry中添加日期格式的转换器
     * 这样可以全局配置日期格式的解析和格式化方式
     */
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addFormatterForFieldType(Date.class, new DateFormatter());
    }
 
    /**
     * 日期格式转换器类
     * 用于将日期字符串转换为Date对象，或将Date对象转换为日期字符串
     * 格式为"yyyy-MM-dd HH:mm:ss"，时区为GMT+8
     */
    static class DateFormatter implements org.springframework.format.Formatter<Date> {
        private final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
 
        /**
         * 将日期字符串解析为Date对象
         * 在解析过程中设置时区为GMT+8，以确保时间的正确性
         */
        @Override
        public Date parse(String text, java.util.Locale locale) throws java.text.ParseException {
            format.setTimeZone(java.util.TimeZone.getTimeZone("GMT+8"));
            return format.parse(text);
        }
 
        /**
         * 将Date对象格式化为日期字符串
         * 在格式化过程中设置时区为GMT+8，以确保时间的正确性
         */
        @Override
        public String print(Date object, java.util.Locale locale) {
            format.setTimeZone(java.util.TimeZone.getTimeZone("GMT+8"));
            return format.format(object);
        }
    }
}
```




如果只有部分字段需要特殊格式则推荐采用方案一，反之方案二。




---



**如果还有问题，请在评论区告诉我！**

---
> 原文链接: [FastJson 日期类无法解析的解决方案](https://blog.csdn.net/2401_88959292/article/details/149837897?spm=1001.2014.3001.5501)
> 作者: Yilena
