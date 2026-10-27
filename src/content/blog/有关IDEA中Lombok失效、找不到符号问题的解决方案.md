---
"title": "有关IDEA中Lombok失效、找不到符号问题的解决方案"
"link": "you-guan-ideazhong-lombokshi-xiao-zhao-bu-dao-fu-hao-wen-ti-de-jie-jue-fang-an"
"author": "Yilena"
"date": "2025-07-09"
"description": "本文针对在IDEA中使用Lombok时遇到的注解失效及编译时\"找不到符号\"的常见问题，提供了切实有效的解决方案。作者通过实践发现，问题的根源往往在于未明确指定Lombok依赖的版本。文章详细列出了需要在pom.xml中指定Lombok版本号（如1.18.30）的三个关键位置：依赖声明、maven-compiler-plugin的annotationProcessorPaths配置以及excludes配置。此外，还补充了在Spring Boot父工程环境下，通过pluginManagement统一配置编译插件以彻底解决该问题的进阶方法。"
"tags":
  - "Lombok"
  - "IDEA"
  - "故障排查"
"categories":
  - "故障排查"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/145309799?spm=1001.2014.3001.5501"
---

我在使用时发现 Lombok 失效，很多相关无法使用




例如@、@NoArgsConstructor 、@AllArgsConstructor，得自己手动添加 getter、setter 方法




还有@Slf4j，在运行时会报找不到符号的错误，导致无法顺利运行程序




于是我便在网上寻找方法，发现出现相同问题的远不止我一个人，我将网上提供的解决方案都试了一遍




#### **最后发现需要指定 lombok 依赖的版本，而不能使用其默认的版本**




其原因不详，但在指定版本后以上问题都完美解决。




ps：在指定完版本后记得刷新，并运行一下自带的 clean 和 complie 插件




一共三个地方需要指定版本：




```xml
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.30</version>     <——————此处
            <optional>true</optional>
        </dependency>
```




```xml
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                            <version>1.18.30</version>   <——————此处
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
```




```xml
              <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                            <version>1.18.30</version>  <——————此处
                        </exclude>
                    </excludes>
                </configuration>
```









2025.2.10    ——新进行编译时再次发现失效找不到符号









原本的父 pom 的配置如下：




```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <artifactId>spring-boot-starter-parent</artifactId>
        <groupId>org.springframework.boot</groupId>
        <version>2.7.3</version>
    </parent>
    <groupId>com.sky</groupId>
    <artifactId>sky-take-out</artifactId>
    <packaging>pom</packaging>
    <version>1.0-SNAPSHOT</version>
    <modules>
        <module>sky-common</module>
        <module>sky-pojo</module>
        <module>sky-server</module>
    </modules>
    <properties>
        <lombok>1.18.30</lombok>
        <java.version>21</java.version>
    </properties>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok}</version>
            </dependency>
        <----其他依赖项--->
    </dependencyManagement>
</project>
```




这里明明指定了版本号，却还是报错了。




最后加上如下代码成功解决：




```xml
<build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <configuration>
                        <source>1.8</source>
                        <target>1.8</target>
                        <encoding>UTF-8</encoding>
                        <annotationProcessorPaths>
                            <path>
                                <groupId>org.projectlombok</groupId>
                                <artifactId>lombok</artifactId>
                                <version>1.18.30</version>
                            </path>
                        </annotationProcessorPaths>
                    </configuration>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>
```









**~~若有帮助，请留个赞吧~~**

---
> 原文链接: [有关 IDEA 中 Lombok 失效、找不到符号问题的解决方案](https://blog.csdn.net/2401_88959292/article/details/145309799?spm=1001.2014.3001.5501)
> 作者: Yilena
