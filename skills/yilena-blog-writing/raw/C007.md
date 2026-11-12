---
"title": "Knife4j未配置却需要登录认证的解决方案"
"link": "knife4jwei-pei-zhi-que-xu-yao-deng-lu-ren-zheng-de-jie-jue-fang-an"
"author": "Yilena"
"date": "2025-08-01"
"description": "本文针对在Spring Boot项目中使用Knife4j时，未配置登录认证却意外弹出登录页面的问题提供了解决方案。通过排查发现，该登录拦截并非来自Knife4j自身配置，而是由项目中引入的Spring Security框架触发。文章给出了两种解决思路：一是直接移除不必要的Spring Security依赖；二是在保留Security框架的前提下，通过配置`SecurityFilterChain`，将Knife4j的核心资源路径（如`/doc.html`、`/v3/api-docs/**`等）加入白名单予以放行，从而完美解决接口文档访问受限的问题。"
"cover": "https://i-blog.csdnimg.cn/direct/b11061432acb4981b9cfbde30fff5878.png"
"tags":
  - "Knife4j"
  - "Spring Security"
  - "故障排查"
"categories":
  - "故障排查"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/149835165?spm=1001.2014.3001.5501"
---

## 一、问题简述




![](https://i-blog.csdnimg.cn/direct/b11061432acb4981b9cfbde30fff5878.png)




当访问 knife4j 网址时出现以上页面，但是 yaml 文件中配置却没有登录认证功能。




配置如下：




```javascript
 
springdoc:
  default-flat-param-object: true
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: alpha
  api-docs:
    path: /v3/api-docs
  group-configs:
    - group: 'default'
      paths-to-match: '/**'
      packages-to-scan: com.Yilena
knife4j:
  enable: true
  setting:
    language: zh_cn
```




一番排查后才发现上面那个登录的页面其实不是 knife4j 的登录认证，而是 Security 框架提供的。




## 二、




### （一）去除依赖




这是最暴力也是最简洁的办法，直接去掉就可以了。




### （二）放行路径




如果项目需要使用到 Spring Security 的话，那可以使用配置对 knife4j 的资源路径进行放行：




```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
 
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // 放行 Knife4j 核心路径
                .requestMatchers(
                    "/doc.html",
                    "/webjars/**",
                    "/v3/api-docs/**",      
                    "/swagger-resources/**", 
                    "/swagger-ui/**"         
                ).permitAll()
                .anyRequest().authenticated() 
            )
            .csrf(csrf -> csrf.disable());    
        return http.build();
    }
}
```




---



**如果还有问题，请在评论区告诉我！**

---
> 原文链接: [Knife4j 未配置却需要登录认证的解决方案](https://blog.csdn.net/2401_88959292/article/details/149835165?spm=1001.2014.3001.5501)
> 作者: Yilena
