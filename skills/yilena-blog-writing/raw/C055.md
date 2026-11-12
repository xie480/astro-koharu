---
"title": "记录：Java阶段性项目（拼图小游戏）"
"link": "ji-lu-javajie-duan-xing-xiang-mu-pin-tu-xiao-you-xi"
"author": "Yilena"
"date": "2025-03-07"
"description": "本文详细记录了一个基于Java Swing的拼图小游戏阶段性项目的开发全过程。项目包含登录、注册及游戏三大核心界面，涵盖了GUI组件应用、事件监听（鼠标、键盘、动作、窗口）、图片打乱与移动逻辑、计步器及胜利条件判断等丰富功能。文章不仅分享了密码解密、验证码生成等实用技巧，还介绍了如何通过适配器类简化事件处理，并巧妙融入了作弊功能与小彩蛋，为Java初学者提供了一个兼具趣味性与实战价值的面向对象编程学习范例。"
"cover": "https://i-blog.csdnimg.cn/direct/7fcf9ed5984c4f29b11f2c5b451e0440.jpeg"
"tags":
  - "Java"
  - "游戏开发"
  - "Swing"
"categories":
  - "杂记"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/144153828?spm=1001.2014.3001.5501"
---

---
 


## 目录
 


[目录](#%E7%9B%AE%E5%BD%95)
 


[一、写在开头](#%E4%B8%80%E3%80%81%E5%86%99%E5%9C%A8%E5%BC%80%E5%A4%B4)
 


[二、关于项目](#%E4%BA%8C%E3%80%81%E9%A1%B9%E7%9B%AE%E5%8E%86%E7%A8%8B)
 


[（一）项目介绍](#%EF%BC%88%E4%B8%80%EF%BC%89%E9%A1%B9%E7%9B%AE%E4%BB%8B%E7%BB%8D)
 


[（二）项目实现](#%EF%BC%88%E4%BA%8C%EF%BC%89%E9%A1%B9%E7%9B%AE%E5%AE%9E%E7%8E%B0)
 


 
 


[1.游戏界面](#1.%E6%B8%B8%E6%88%8F%E7%95%8C%E9%9D%A2)
 


[（1）界面初始化](#%EF%BC%881%EF%BC%89%E7%95%8C%E9%9D%A2%E5%88%9D%E5%A7%8B%E5%8C%96)
 


[A.窗体](#A.%E7%AA%97%E4%BD%93)
 


 
 


[B.菜单栏](#B.%E8%8F%9C%E5%8D%95%E6%A0%8F)
 


[（2）拼图的生成以及载入](#%EF%BC%882%EF%BC%89%E6%8B%BC%E5%9B%BE%E7%9A%84%E7%94%9F%E6%88%90%E4%BB%A5%E5%8F%8A%E8%BD%BD%E5%85%A5)
 


[A.添加图片](#A.%E6%B7%BB%E5%8A%A0%E5%9B%BE%E7%89%87)
 


[B.图片顺序的打乱](#B.%E5%9B%BE%E7%89%87%E9%A1%BA%E5%BA%8F%E7%9A%84%E6%89%93%E4%B9%B1)
 


[（3）选择图片功能的实现](#%EF%BC%883%EF%BC%89%E9%80%89%E6%8B%A9%E5%9B%BE%E7%89%87%E5%8A%9F%E8%83%BD%E7%9A%84%E5%AE%9E%E7%8E%B0)
 


[（4）移动图片功能的实现](#%EF%BC%884%EF%BC%89%E7%A7%BB%E5%8A%A8%E5%9B%BE%E7%89%87%E5%8A%9F%E8%83%BD%E7%9A%84%E5%AE%9E%E7%8E%B0)
 


[（5）计步器功能的实现](#%EF%BC%885%EF%BC%89%E8%AE%A1%E6%AD%A5%E5%99%A8%E5%8A%9F%E8%83%BD%E7%9A%84%E5%AE%9E%E7%8E%B0)
 


[（6）胜利条件的判断](#%EF%BC%886%EF%BC%89%E8%83%9C%E5%88%A9%E6%9D%A1%E4%BB%B6%E7%9A%84%E5%88%A4%E6%96%AD)
 


[（7）作弊功能的实现](#%EF%BC%887%EF%BC%89%E4%BD%9C%E5%BC%8A%E5%8A%9F%E8%83%BD%E7%9A%84%E5%AE%9E%E7%8E%B0)
 


[（8）菜单功能的实现](#%EF%BC%888%EF%BC%89%E8%8F%9C%E5%8D%95%E5%8A%9F%E8%83%BD%E7%9A%84%E5%AE%9E%E7%8E%B0)
 


[A.更换图片](#A.%E6%9B%B4%E6%8D%A2%E5%9B%BE%E7%89%87)
 


[B.重新游玩](#B.%E9%87%8D%E6%96%B0%E6%B8%B8%E7%8E%A9)
 


[C.重新登录](#C.%E9%87%8D%E6%96%B0%E7%99%BB%E5%BD%95)
 


[D.游戏规则](#D.%E6%B8%B8%E6%88%8F%E8%A7%84%E5%88%99)
 


[（9）游戏退出弹窗功能的实现](#%EF%BC%889%EF%BC%89%E6%B8%B8%E6%88%8F%E9%80%80%E5%87%BA%E5%BC%B9%E7%AA%97%E5%8A%9F%E8%83%BD%E7%9A%84%E5%AE%9E%E7%8E%B0)
 


[（10）小彩蛋](#%EF%BC%8810%EF%BC%89%E5%B0%8F%E5%BD%A9%E8%9B%8B)
 


[2.注册界面](#2.%E6%B3%A8%E5%86%8C%E7%95%8C%E9%9D%A2)
 


[（1）界面初始化](#%EF%BC%881%EF%BC%89%E7%95%8C%E9%9D%A2%E5%88%9D%E5%A7%8B%E5%8C%96)
 


[A.窗体](#A.%E7%AA%97%E4%BD%93)
 


[B.图片、文本输入框以及按钮的添加](#B.%E5%9B%BE%E7%89%87%E3%80%81%E6%96%87%E6%9C%AC%E8%BE%93%E5%85%A5%E6%A1%86%E4%BB%A5%E5%8F%8A%E6%8C%89%E9%92%AE%E7%9A%84%E6%B7%BB%E5%8A%A0)
 


[（2）密码解密功能的实现](#%EF%BC%882%EF%BC%89%E5%AF%86%E7%A0%81%E8%A7%A3%E5%AF%86%E5%8A%9F%E8%83%BD%E7%9A%84%E5%AE%9E%E7%8E%B0)
 


[（3）重置功能的实现](#%EF%BC%883%EF%BC%89%E9%87%8D%E7%BD%AE%E5%8A%9F%E8%83%BD%E7%9A%84%E5%AE%9E%E7%8E%B0)
 


[（4）记录用户数据](#%EF%BC%884%EF%BC%89%E8%AE%B0%E5%BD%95%E7%94%A8%E6%88%B7%E6%95%B0%E6%8D%AE)
 


[（5）确认输入正确性功能的实现](#%EF%BC%885%EF%BC%89%E7%A1%AE%E8%AE%A4%E8%BE%93%E5%85%A5%E6%AD%A3%E7%A1%AE%E6%80%A7%E5%8A%9F%E8%83%BD%E7%9A%84%E5%AE%9E%E7%8E%B0)
 


[（6）返回登录界面功能计时器的实现](#%EF%BC%886%EF%BC%89%E8%BF%94%E5%9B%9E%E7%99%BB%E5%BD%95%E7%95%8C%E9%9D%A2%E5%8A%9F%E8%83%BD%E8%AE%A1%E6%97%B6%E5%99%A8%E7%9A%84%E5%AE%9E%E7%8E%B0)
 


[3.登录界面](#3.%E7%99%BB%E5%BD%95%E7%95%8C%E9%9D%A2)
 


[（1）界面初始化](#%EF%BC%881%EF%BC%89%E7%95%8C%E9%9D%A2%E5%88%9D%E5%A7%8B%E5%8C%96)
 


[A.窗体](#A.%E7%AA%97%E4%BD%93)
 


[B.图片、文本输入框以及按钮的添加以及密码解密功能的实现](#B.%E5%9B%BE%E7%89%87%E3%80%81%E6%96%87%E6%9C%AC%E8%BE%93%E5%85%A5%E6%A1%86%E4%BB%A5%E5%8F%8A%E6%8C%89%E9%92%AE%E7%9A%84%E6%B7%BB%E5%8A%A0%E4%BB%A5%E5%8F%8A%E5%AF%86%E7%A0%81%E8%A7%A3%E5%AF%86%E5%8A%9F%E8%83%BD%E7%9A%84%E5%AE%9E%E7%8E%B0)
 


[（2）验证码的生成](#%EF%BC%882%EF%BC%89%E9%AA%8C%E8%AF%81%E7%A0%81%E7%9A%84%E7%94%9F%E6%88%90)
 


[（3）确认输入正确性功能的实现](#%EF%BC%883%EF%BC%89%E7%A1%AE%E8%AE%A4%E8%BE%93%E5%85%A5%E6%AD%A3%E7%A1%AE%E6%80%A7%E5%8A%9F%E8%83%BD%E7%9A%84%E5%AE%9E%E7%8E%B0)
 


[（4）注册界面和游戏界面的跳转](#%EF%BC%884%EF%BC%89%E6%B3%A8%E5%86%8C%E7%95%8C%E9%9D%A2%E5%92%8C%E6%B8%B8%E6%88%8F%E7%95%8C%E9%9D%A2%E7%9A%84%E8%B7%B3%E8%BD%AC)
 


[（三）最终代码（省略了方法的内部实现）](#%EF%BC%88%E4%B8%89%EF%BC%89%E6%9C%80%E7%BB%88%E4%BB%A3%E7%A0%81%EF%BC%88%E7%9C%81%E7%95%A5%E4%BA%86%E6%96%B9%E6%B3%95%E7%9A%84%E5%86%85%E9%83%A8%E5%AE%9E%E7%8E%B0%EF%BC%89)
 


[三、想说的话](#%E4%B8%89%E3%80%81%E6%83%B3%E8%AF%B4%E7%9A%84%E8%AF%9D)
 


---
 


## 一、写在开头
 


 
 


~这是本人的第一篇博客，如有不足之处还望多多包涵~
 


![](https://i-blog.csdnimg.cn/direct/7fcf9ed5984c4f29b11f2c5b451e0440.jpeg)
 


本人目前还只是一名软件工程专业的大一新生，也是上了大学才开始接触编程语言，首次学习的语言是 C++，我一开始也是不知道学习路线晕头转向的，在各种渠道进行了大量的查询了解，最终才确定了学习路线。
 


我跟着 oiwiki 网站上的学习路线进行学习，现在已经掌握了 CSP-J 入门级的七八成内容，并且在洛谷、力扣等平台上做了许多相关题，参加了一些难度较低的算法比赛。
 


然而，后来偶然看到一篇关于就业方向的文章，我才意识到自己一直专注于算法，C++的核心——*面向对象编程（OOP）*几乎没有接触过。我逐渐明白自己可能不适合走竞赛路线，因此决定转向学习面向对象的相关知识。
 


就在这时，我也产生了一个疑问：
 


**——以后就业到底什么编程语言更吃香？**
 


对此，我一无所知。
 


所以我开始了解机目前的就业情况，目前国内市场最热门的三个语言便是 C++、Python 和，Python 的岗位相对较少又比较卡学历，而其他类似 go 和 rust 这种在未来有一定趋势成为热门的语言在国内发展并不成熟，岗位更是少之又少，所以我便把目光专向 C++和 Java。
 


在了解一番后，我发现目前网上正铺天盖地地宣传这两种语言就业的一个趋势：
 


“Java 已经在走下坡路，劝诫毕业生走 C++路线”
 


——可事实是否真是如此？非也！
 


经过一番深入的调研，我得出了一些结论：目前市场上，Java 岗位的需求依然远超 C++，而且两种语言的应用领域和学习难度各有不同，因此到底选择哪一条路线，还是得根据个人兴趣和职业规划来决定。对于我这样的普通双非院校学生来说，Java 依旧是一个更为理性的选择。
 


> 
>  关于分析 Java 和 C++就业现状的文章，这一篇我认为很有参考价值~~
2023 下半年，Java 和 C++现状_java 行情-CSDN 博客​​​​​​ 
> 
 


最近，看到许多视频和文章在大量宣传计算机行业的“饱和”和“就业困难”之类的说法。对此，我并不认同，因为我认为计算机行业最看重的还是硬技术，只要自己具备足够的技术实力，焦虑又何须存在？与其担心不如付诸行动！于是，我决定开始学习 Java。
 


我的入门学习是跟着 B 站 up 主“黑马程序员”的教程一步一步进行的。由于之前已经初步掌握 C++，所以 Java 的学习进展相对较快。目前，我已经跟随视频课程学到了一个阶段性项目的部分内容。正好在这个节点，我突发奇想，想通过写博客的方式来记录自己完成首个阶段性项目的学习过程，于是这篇博客也就这样诞生了……
 


![](https://i-blog.csdnimg.cn/direct/520d780c4c8449fc906ad821dcdd1d3d.jpeg)
 


那么废话不多说，赶紧进入正文吧！
 


 
 


---
 


## 二、关于项目
 


*ps：原项目来自 b 站 up 主“黑马程序员”，本项目是创新改良版*
 


### （一）项目介绍
 


![](https://i-blog.csdnimg.cn/direct/f1e1152d32a2480f86b51e607eaf3ced.png)
 


演示如下：
 


![](https://i-blog.csdnimg.cn/direct/62c1a0dd1a544d84b5c979322fc17c01.gif)
 


 
 


这个项目是一个拼图小游戏，这个项目有以下几个部分组成：
 


1. 登录界面
2. 注册界面
3. 游戏界面
 


而这三个界面的搭建则分别由以下步骤实现：
 


 
 


登录界面：
 


- 界面初始化
- 密码解密功能的实现
- 验证码的生成
- 确认输入正确性功能的实现
- 注册界面和游戏界面的跳转
 


注册界面：
 


- 界面初始化
- 密码解密功能的实现
- 重置功能的实现
- 记录用户数据
- 确认输入正确性功能的实现
- 返回登录界面功能计时器的实现
 


游戏界面：
 


- 界面初始化
- 菜单栏初始化
- 拼图的生成以及载入
- 选择图片功能的实现
- 移动图片功能的实现
- 计步器功能的实现
- 胜利条件的判断
- 作弊功能的实现
- 菜单功能的实现
- 游戏退出弹窗确认功能的实现
- 小彩蛋
 


 
 


由于游戏界面才是整个项目的核心内容，所以我会先从这个部分开始说明。
 


由于此项目涉及到 GUI 相关的知识，相信有很多像我一样的初学者在接触这个项目的时候还不知道什么是 GUI，所以我先在这里简短说明一下~
 


> 
>  GUI 是一种通过图形元素（如按钮、文本框、菜单、标签等）来与用户进行交互的界面方式。
 
Java 中的 GUI 程序是基于 事件驱动模型，意味着程序根据用户的操作（如点击按钮、输入文本等）触发不同的事件，进而执行相应的操作。Java 提供了多个工具和库来创建和管理 GUI，其中最常用的是 Swing 和 JavaFX
 
Java GUI 程序通常由以下几个基本组件构成：
窗口（Window）：应用的最基本显示区域，通常是一个框架（Frame）或对话框（Dialog）。面板（Panel）：容器，用来组织其他组件。按钮（Button）：可点击的按钮，通常用于触发某个动作。标签（Label）：用于显示文本。文本框（TextField）：用于输入和显示单行文本。文本区域（TextArea）：用于输入和显示多行文本。复选框（Checkbox）：用于选择或取消选择。单选按钮（RadioButton）：用于选择一个选项。菜单（Menu）：提供一系列操作选项。
Swing 组件是基于 容器 和 组件 的概念进行组织的。
容器是用来组织和管理组件的对象，而组件是显示在 GUI 上的各个界面元素。
 
在此项目中，我们会多次运用到这些知识来实现我们的小游戏，我会在讲述项目实现的过程中对用到的组件进行详细的讲解。
  
>   
> 
 


 
 


### （二）项目实现
 


####  
 


#### 1.游戏界面
 


 
 


（1）界面
 


 
 


A.窗体
 


 
 


对于一个游戏的界面，我们首先得有一个窗口来装载各种各样的功能，那我们该如何创建一个可视化窗口呢？这里我们就要用到 Swing 库里的 JFrame（框架）容器来实现了。
 


> 
>  JFrame
JFrame 是一个可调节大小、可最小化、最大化、关闭的窗口，通常用于表示一个完整的桌面应用程序窗口。
 
常用方法：
 
setTitle(String title)//设置窗口的标题 setSize(int width, int height)//设置窗口的大小 setLocation(int x, int y)//设置窗口的位置 setLocationRelativeTo(Component c)//设置窗口相对于指定组件的位置 setVisible(boolean visible)//显示或隐藏窗口 setResizable(boolean resizable)//设置窗口是否可调整大小 setDefaultCloseOperation(int operation)//设置窗口关闭时的操作 getContentPane()//获取 JFrame 的内容面板，用于添加组件
 
如果我们要用这些方法，就得继承 JFrame 类才能使用。 
> 
 


实现代码如下：
 


```java
private void initJFrame() {
 
        //设置页面大小
        this.setSize(603,680);
 
        //设置页面标题
        this.setTitle("拼拼拼！拼图大作战！");
 
        /*设置页面居中
          参数为null时表示默认居中显示，
          为组件名称时则表示位于给定组件的中心位置*/
        this.setLocationRelativeTo(null);
 
        //设置页面置顶
        this.setAlwaysOnTop(true);
 
        /*设置页面关闭后也将程序一并关闭
          JFrame.DO_NOTHING_ON_CLOSE(0): 关闭窗口时不做任何操作。
          JFrame.HIDE_ON_CLOSE(1): 关闭窗口时仅隐藏窗口，程序继续运行。
          JFrame.DISPOSE_ON_CLOSE(2): 关闭窗口时销毁窗口并释放资源。
          JFrame.EXIT_ON_CLOSE(3): 关闭窗口时退出整个应用程序。*/
        this.setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
 
        //取消默认居中放置
        this.setLayout(null);
    }
```
 


B.
 


 
 


对于菜单栏的实现，我们需要用到 JMenuBar、JMenu、JMenItem 三个组件；
 


> 
>  1. JMenuBar 
>  JMenuBar 是一个容器，用于在窗口中显示菜单条。它承载一个或多个 JMenu 对象。 
>  主要功能： 
>   JMenuBar 负责包含并管理多个 JMenu 对象。  它通常会被设置为 JFrame 的菜单栏。  
>   
2. JMenu
JMenu 是菜单栏中的一个菜单项，它本身是一个容器，包含多个 JMenuItem 或子菜单。每个 JMenu 都会在 JMenuBar 上显示为一个菜单项，点击时展开显示它的内容。
主要功能：
JMenu 可以包含多个 JMenuItem 或嵌套的 JMenu。  JMenu 可以定义不同的菜单操作。  
>    
>  3. JMenuItem 
>  JMenuItem 是菜单中的单个项，表示一个可以选择的菜单命令。 
>  主要功能： 
>   JMenuItem 表示菜单中的一个选择项，用户点击该菜单项时可以触发某个操作。  可以是常规的命令项，也可以是具有快捷键或图标的命令。  
>   
三者是按照等级依次包含的关系，JMenuBar 和 JMenu 都只是容器，只有 JMenuItem 才能与事件监听器关联。 
> 
 


实现代码如下：
 


```java
public class GameJFrame extends JFrame {
 
   //创建菜单栏对象
    JMenuBar menuBar = new JMenuBar();
 
 
    //创建菜单项对象
    JMenu functionMenu = new JMenu("功能");
    JMenu AboutUsMenu = new JMenu("关于作者");
    JMenu changePicture = new JMenu("更换图片");
 
    //创建子菜单对象
    JMenuItem replayJMenuItem = new JMenuItem("重新游玩");
    JMenuItem reloginJMenuItem = new JMenuItem("重新登录");
    JMenuItem WriterMenuItem = new JMenuItem("作者主页");
    JMenuItem Animal = new JMenuItem("动物");
    JMenuItem Girl = new JMenuItem("女孩");
    JMenuItem Sport = new JMenuItem("运动");
    JMenuItem RuleMenuItem = new JMenuItem("游戏规则");
 
  private void initMenu() {
 
        //将子菜单添加到对应菜单项
        functionMenu.add(changePicture);
        functionMenu.add(replayJMenuItem);
        functionMenu.add(reloginJMenuItem);
        functionMenu.add(RuleMenuItem);
        AboutUsMenu.add(WriterMenuItem);
        changePicture.add(Animal);
        changePicture.add(Girl);
        changePicture.add(Sport);
 
        //将菜单项添加到菜单栏
        menuBar.add(functionMenu);
        menuBar.add(AboutUsMenu);
        //设置菜单栏
        this.setJMenuBar(menuBar);
    }
}
```
 


由于后续我们要对菜单栏添加事件监听器，所以我们需要在方法外部创建对象，也就是创建成员对象，方便后续调用。
 


---
 


（2）拼图的生成以及载入
 


 
 


A.添加图片
 


 
 


我们目前只是生成了一个窗体以及菜单栏，窗体内部还没有任何图片，所以我们接下来就要先添加游戏的背景图片，在这里我们需要用到 ImageIcon 类的相关方法。
 


> 
>  ImageIcon
ImageIcon 是 Java Swing 库中的一个类，主要用于将图片作为图标显示在图形用户界面（GUI）中。
 
常用方法：
 
getImage()：返回 Image 对象。setImage(Image image)：设置图标的图像。getIconWidth() 和 getIconHeight()：获取图标的宽度和高度。
 
而在构造 ImageIcon 对象时，我们就可以将图片路径传入参数中进行加载。
然后我们再将此对象放入 JLabel 容器中，就可以将其放入窗体进行显示了。 
> 
 


而在此项目中，为了方便后续对每个图片进行具体操作，所以我创建了一个二维的 JLabel 数组，将 16 宫格的每张图片都放入该容器。
 


为了美化界面，我设置了图片边框，需要构造一个 BevelBorder 对象来实现。
 


> 
>  BevelBorder 
>  BevelBorder 是 Java Swing 中用于创建边框效果的类，它实现了 Border 接口，能够为组件添加凹陷或凸起的边框效果。它常用于按钮、面板等组件中，提供一种立体的外观，模拟不同光照条件下的边缘效果。 
>    
>  构造方法： 
>    
>  BevelBorder(int type, Color highlight, Color shadow, Color topLine, Color bottomLine) 
>    
>  参数说明： 
>    
>  type: 边框类型，通常使用 BevelBorder.RAISED 或 BevelBorder.LOWERED，分别表示凸起和凹陷效果。highlight: 高亮颜色，通常是光源方向的颜色。对于凸起的边框，光源来自上方；对于凹陷的边框，光源来自下方。shadow: 阴影颜色，通常是光源的反向颜色。对于凸起的边框，阴影部分通常位于边框的底部；对于凹陷的边框，阴影位于顶部。topLine: 顶部线条的颜色（可选），当你需要特定的颜色来处理顶部边框线条时使用。bottomLine: 底部线条的颜色（可选），用于设置底部边框线条的颜色。 
> 
 


实现代码如下：
 


```java
//将每张图片都放入二维数组方便进行事件监听
    JLabel[][] picturelabels = new JLabel[4][4];
 
private void AddPicture(){
  //外循环为行数
  for(int i = 0;i < 4;++i)
            //内循环为列数
            for(int j = 0;j < 4;++j) {
                //先创建一个空参ImageIcon对象，再用链式思维创建一个JLabel对象
                picturelabels[i][j] = new JLabel(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
                //设置每个图片的位置，因为要移到正中央，所以设置了偏移量
                picturelabels[i][j].setBounds(105*j+83, 105*i+134, 105, 105);
                //设置凹陷边框
                picturelabels[i][j].setBorder(new BevelBorder(BevelBorder.LOWERED,Color.orange,Color.ORANGE,Color.green,Color.RED));
                 //添加图片到JFrame容器
                this.getContentPane().add(picturelabels[i][j]);
            }
        //设置背景图片
        JLabel backdrop = new JLabel(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
        backdrop.setBounds(40,40,508,560);
        this.getContentPane().add(backdrop);
        //刷新
        this.getContentPane().repaint();
    }
```
 


**——为什么我们要先加载拼图再加载背景图片呢？**
 


其实这里有一个小知识：先添加到容器的图片会在后加载的图片上层，所谓背景图片，肯定是在最底层，所以才在最后设置添加~
 


 
 


B.图片顺序的打乱
 


 
 


所谓拼图，首先要能拼才行，要是一开始就是完整的图片，那就没有意义了，所以我们要打乱图片的顺序。
 


具体该如何实现呢？
 


没错，我们要生成随机数来交换图片路径里面的图片顺序！
 


 
 


*ps：在实现之前，得确保每个图片的名称都带有序号：*
 


![](https://i-blog.csdnimg.cn/direct/35a33d056cfb408fb4fa617a9c0e665f.png)
 


*不然就难以对图片的具体路径进行操作了。*
 


 
 


我们 16 宫格示意图如下：
 


| 1 | 2 | 3 | 4 |
| --- | --- | --- | --- |
| 5 | 6 | 7 | 8 |
| 9 | 10 | 11 | 12 |
| 13 | 14 | 15 | 16 |

 


这每个索引对应着相应的图片，而我们只需要打乱这个索引 ，便能实现图片顺序的打乱。
 


所以我们首先需要创建一个 int 类型的二维数组，再将打乱后的索引放进去，最后替换进图片路径即可。
 


实现代码如下：
 


```java
 //记录图片二维数组下标
    int[][]data = new int[4][4];
 
private void Rand(){
 
        //创建索引数组
        int[]array = {1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16};
 
        //生成随机数来交换索引实现打乱过程
        for(int i = 0;i < array.length;++i){
            int index = new Random().nextInt(array.length);
            int temp = array[index];
            array[index] = array[i];
            array[i] = temp;
        }
 
        //将打乱后的索引放入二维数组方便后续调换图片位置
        for(int i = 0;i < array.length;++i){
            data[i/4][i%4] = array[i];
        }
    }
```
 


由于我们交换的是图片索引，所以并不会出现有重复图片出现的情况。
 


然后再回到上面已经创建的 AddPicture 方法内部进行更改：
 


```java
/提取已经打乱顺序的二维数组的元素作为图片路径
                int index = data[i][j];
 
//将路径更改，插入变量index
  picturelabels[i][j] = new JLabel(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\"+ index +".jpg"));
```
 


这样一番操作下来，我们就能实现放入 picturelabels 数组的图片顺序是乱的了。
 


---
 


（3）选择图片功能的实现
 


 
 


作为拼图游戏，肯定是我想从哪一块开始拼都行，那我该如何选择自己想要拼的图片呢？用鼠标点呗！那我们怎么知道用户点击了哪块图片呢？所以这里，我们就要添加鼠标监听器。
 


> 
>  鼠标监听 
>  在 Java 中，鼠标事件通常通过 MouseListener 或 MouseMotionListener 接口来处理。 
>    
>   MouseListener 接口 
>  方法： 
>       • mouseClicked(MouseEvent e)：鼠标按下并释放后触发。     • mousePressed(MouseEvent e)：鼠标按钮按下时触发。     • mouseReleased(MouseEvent e)：鼠标按钮释放时触发。     • mouseEntered(MouseEvent e)：鼠标进入组件时触发。     • mouseExited(MouseEvent e)：鼠标离开组件时触发。 
>    
>  MouseMotionListener 接口 
>  方法： 
>       • mouseDragged(MouseEvent e)：鼠标拖动时触发。     • mouseMoved(MouseEvent e)：鼠标移动时触发。 
> 
 


众所周知，在使用接口时我们都要重写其内部里所有的成员方法，而像 MouseListener 接口这样，成员方法居然有这么多！如果一一进行重写的话是不是太过麻烦了？
 


——是的！
 


所以我们大部分事件监听器都有对应的适配器类，通过继承父类的方式，我们就可以想用什么方法的时候就只重写对应的方法就行，是不是很方便呢！
 


![](https://i-blog.csdnimg.cn/direct/8b61294570384e62819a0dc390d8d478.jpeg)
 


> 
>  适配器类
MouseAdapter 对应 MouseListenerMouseMotionAdapter 对应 MouseMotionListenerKeyAdapter 对应 KeyListenerWindowAdapter 对应 WindowListener 
> 
 


当然，为了区别图片是否选中，我们要给选中的图片设置新的边框，使其更加显眼。
 


不仅如此，我们还要设置两个特判：其一是已有选择图片时恢复图片边框，其二是选择相同图片时不进行后续操作。
 


我在每个操作后面加了输出文字到控制台，这样方便在调试程序的时候分辨目前操作是否实现，因为我技术还不是太成熟，所以很需要这样的提示 QAQ……
 


实现代码如下：
 


```java
  //记录选择的图片
    JLabel selectedpicture = null;
 
    //记录选择的图片的行列
    int selectedRow = -1, selectedCol = -1;
 
private void AddPicture(){   
 
                 //给每个图片设置鼠标监听
                picturelabels[i][j].addMouseListener(new MouseAdapter() {
                    @Override
                    public void mouseClicked(MouseEvent e) {
                        //如果已经有选择的图片了，那么就将那张图片的边框恢复
                        if(selectedpicture != null){
                            System.out.println("已选择图片");
                            selectedpicture.setBorder(new BevelBorder(BevelBorder.LOWERED,Color.orange,Color.ORANGE,Color.green,Color.RED));
                        }
                        //如果选择相同的图片则不进行后续操作
                        if(selectedpicture ==  e.getSource()){
                            System.out.println("选择相同图片");
                            return;
                        }
                        //记录选择图片以及对应的行和列，方便后续调换图片位置
                        selectedpicture = (JLabel)e.getSource();
                        selectedCol = (int) ((selectedpicture.getBounds().getX()-83)/105);
                        selectedRow = (int) ((selectedpicture.getBounds().getY()- 134)/105);
                        System.out.println("现在选择的图片是第"+selectedRow+"行第"+selectedCol+"列");
                        //将选择图片的边框换色
                        selectedpicture.setBorder(new BevelBorder(BevelBorder.RAISED, Color.RED,Color.RED, Color.RED, Color.RED));
                    }
}
```
 


---
 


（4）移动图片功能的实现
 


 
 


作为移动图片的手段，键盘控制肯定是上上策，因此我们得添加键盘监听器来实现。
 


> 
>  键盘监听（KeyListener） 
>    
>  方法： 
>    
>  keyPressed(KeyEvent e): 当键盘按下一个键时触发。keyReleased(KeyEvent e): 当键盘按键松开时触发。keyTyped(KeyEvent e): 当键盘上的某个字符被输入时触发，通常用于捕获字符输入。 
> 
 


对于移动功能，我认为按住一个键不松的情况下应该实现持续移动的功能，所以在此处我们应该使用`keyPressed(KeyEvent e)方法。`
 


`实现代码如下：`
 


```java
  private class gameMove extends KeyAdapter {
         @Override
        public void keyPressed(KeyEvent e) {
            //如果没有选择图片则不进行以下操作
            if(selectedpicture == null)return;
             //记录选中图片的行列
            int row = selectedRow;
            int col = selectedCol;
            //监听键盘移动
            if(e.getKeyCode() == KeyEvent.VK_W && row > 0){
                System.out.println("向上移动");
                swapPicture(row,col,row-1,col);
            }else if(e.getKeyCode() == KeyEvent.VK_S && row < 3){
                System.out.println("向下移动");
                swapPicture(row,col,row+1,col);
            }else if(e.getKeyCode() == KeyEvent.VK_A && col > 0){
                System.out.println("向左移动");
                swapPicture(row,col,row,col-1);
            }else if(e.getKeyCode() == KeyEvent.VK_D && col < 3){
                System.out.println("向友移动");
                swapPicture(row,col,row,col+1);
            }
        }
}
```
 


我在每次移动时调用了 swapPicture 方法，图片的移动是在这个方法中实现的。
 


具体原理也很简单，我们先要交换图片的索引，再将对应 JLabel 容器中的 mageIcon 所加载的图片交换，这才完成了图片的移动。
 


当然，我们也得将图片的边框也进行交换，实现视觉上图片移动的效果。
 


实现代码如下：
 


```java
private void swapPicture(int row,int col,int row1,int col1){
        System.out.println("交换第"+row+"行第"+col+"列与第"+row1+"行第"+col1+"列的图片");
 
        //交换数组下标
        int temp = data[row][col];
        data[row][col] = data[row1][col];
        data[row1][col] = temp;
 
        //交换图片
        ImageIcon temp1 = (ImageIcon) picturelabels[row][col].getIcon();
        picturelabels[row][col].setIcon(picturelabels[row1][col1].getIcon());
        picturelabels[row1][col1].setIcon(temp1);
 
        picturelabels[row][col].setBorder(new BevelBorder(BevelBorder.LOWERED,Color.orange,Color.ORANGE,Color.green,Color.RED));
        picturelabels[row1][col1].setBorder(new BevelBorder(BevelBorder.RAISED, Color.RED,Color.RED, Color.RED, Color.RED));
 
          //记录交换后的图片行列
        selectedRow = row1;
        selectedCol = col1;
 
        //更新图片显示位置
        picturelabels[row][col].setBounds(105 * col + 83, 105 * row + 134, 105, 105);
        picturelabels[row1][col1].setBounds(105 * col1 + 83, 105 * row1 + 134, 105, 105);
    }
```
 


---
 


（5）计步器功能的实现
 


对于拼图的次数我们需要进行一个实时记录，因此需要一个计步器功能。
 


实现的原理也很简单，每移动一步就让计步器自增 1 次便可,但光变量改变可不行，我们也得将 JLabel 里的文本内容进行更改。
 


不过别忘了计步器我们也要用一个 JLabel 容器装载，初始化界面时也要将其实现。
 


代码如下：
 


```java
 //初始化计步器
    int step = 0;
 
    //创建计步器对象
    JLabel stepNumber;
 
 
//初始化界面
 private void AddPicture(){
              //设置计步器
              //这一步一定要在背景图片之前实现！不然就会被覆盖！
            stepNumber = new JLabel("已走步数：" + step);
            stepNumber.setBounds(50, 30, 100, 20);
            this.getContentPane().add(stepNumber);
}
 
 
//移动图片
 private void swapPicture(int row,int col,int row1,int col1){
       //每交换一次图片就相当于走了一步
        step++;
        //更改数值
        stepNumber.setText("已走步数：" + step);
        //刷新界面
        this.getContentPane().repaint();
}
```
 


---
 


（6）胜利条件的判断
 


关于胜利条件其实也很简单，拼成完整图片不就好了嘛！
 


也就是说只要图片索引按照 1-16 的顺序摆好的话即可判定胜利，并即刻弹出胜利标志。
 


那我们应该在什么时候判定胜利？
 


肯定是在移动的时候嘛，所以我们应该要在 swapPicture 方法中进行判定，同时也要在键盘监听器中添加特判，防止游戏胜利后还可以进行移动。
 


实现代码如下：
 


```java
 //设置胜利条件
    int[][]win = new int[][]{{1,2,3,4}, {5,6,7,8}, {9,10,11,12}, {13,14,15,16}};
 
 
 
  private boolean victory(){
        for(int i = 0;i < 4;++i)
            for(int j = 0;j < 4;++j)
                //如果有一个图片不同就未达到胜利条件
                if(data[i][j] != win[i][j])return false;
        return true;
    }
 
 
 
  private class gameMove extends KeyAdapter {
 
        @Override
        public void keyPressed(KeyEvent e) {
         //如果胜利了就不进行后续移动
            if(victory()){
                return;
            }
          }
}
 
 
private void swapPicture(int row,int col,int row1,int col1){
         //判断胜利并添加胜利图片
        if(victory()){
            JLabel victoryPicture = new JLabel(new ImageIcon("胜利图片路径"));
            victoryPicture.setBounds(190, 283, 197,73);
            this.getContentPane().add(victoryPicture);
        }
}
```
 


---
 


（7）作弊功能的实现
 


 
 


既然是游戏，没有作弊手段怎么能行？
 


![](https://i-blog.csdnimg.cn/direct/7b3b14f2670546beaf7e1c8eb691c56f.jpeg)
 


所以我设置了两个便捷性功能：一是按住 M 键不松即可显示完整画面，而是按下 L 键即可一键通关。
 


既然和键盘相关，毫无疑问，我们又要使用到键盘监听了。
 


第一个功能很好实现，我们只需要在按住 M 键时加载一张完整图片在最上层就行了；第二个功能的话我们要实现一键通关的前提，便是满足胜利条件，所以我们可以通过直接更改图片索引数组的下标再调用 AddPicture 方法即可实现。
 


实现代码如下：
 


```java
private class cheatPicture extends KeyAdapter {
        //按住M时显示完整图片
        @Override
        public void keyPressed(KeyEvent e) {
            if(e.getKeyCode() == KeyEvent.VK_M){
                System.out.println("作弊功能");
                showCheatPicture();
            }
        }
 
        @Override
        public void keyReleased(KeyEvent e) {
            //松开M时恢复
            if(e.getKeyCode() == KeyEvent.VK_M){
                AddPicture();
            }
            //一键通关功能
            if(e.getKeyCode() == KeyEvent.VK_L){
                System.out.println("一键通关");
                data = new int[][]{{1,2,3,4}, {5,6,7,8}, {9,10,11,12}, {13,14,15,16}};
                AddPicture();
            }
        }
    }
 
 
 
  private void showCheatPicture(){
        //先删除JFrame内容面板上的所有图片来保证完整图片在所有图片上方而不被覆盖
        this.getContentPane().removeAll();
        //保留计步器
        stepNumber = new JLabel("已走步数：" + step);
        stepNumber.setBounds(50, 30, 100, 20);
        this.getContentPane().add(stepNumber);
        //添加完整图片
        JLabel cheatPicture = new JLabel(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
        cheatPicture.setBounds(83,134,420,420);
        this.getContentPane().add(cheatPicture);
        //添加背景图
        JLabel backdrop = new JLabel(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
        backdrop.setBounds(40,40,508,560);
        this.getContentPane().add(backdrop);
        //刷新界面
        this.getContentPane().repaint();
    }
```
 


---
 


（8）菜单功能的实现
 


我们在之前初始化菜单栏的时候添加了许多菜单，现在我们要将其功能化。
 


![](https://i-blog.csdnimg.cn/direct/e2ded1d5e5fd4fe1af453dd4ac232baf.png)![](https://i-blog.csdnimg.cn/direct/de579c17e6fd4db6b1e835ede638e28e.png)![](https://i-blog.csdnimg.cn/direct/9059c6f0eb7247e082d24f2d23665ba0.png)![](https://i-blog.csdnimg.cn/direct/03ff08cf721c45a5b848f5cf83e45b65.png)
 


我们使用菜单的时候实际上是使用鼠标进行点击的，所有可能有小伙伴此时会像我一样第一时间想着使用鼠标监听，但其实不然：
 


> 
>  菜单项的行为通常与 “动作” 相关，如执行某个命令、改变应用程序状态等。这种操作本质上是一个动作，因此用 ActionListener 处理符合语义上的设计。菜单项的点击行为是触发一个“动作”，而不是直接响应一个物理的鼠标事件。 
> 
 


所以对于菜单栏的功能化，我们使用的都是动作监听。
 


要注意因为动作监听只有一个成员方法，所以并没有对应的适配器类，在使用时我们需要直接使用接口。
 


```java
 public GameJFrame() {
         //实现菜单
        replayJMenuItem.addActionListener(new Menu());
        Animal.addActionListener(new Menu());
        Girl.addActionListener(new Menu());
        Sport.addActionListener(new Menu());
        WriterMenuItem.addActionListener(new Menu());
        RuleMenuItem.addActionListener(new Menu());
        reloginJMenuItem.addActionListener(new Menu());
}
```
 


 
 


A.更换图片
 


 
 


图片的更换其实质就是 ImageIcon 中加载图片的具体路径发生了改变。
 


我们之前的路径类似这样：
 


```plain
"Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"
```
 


我们更换图片更换的是其类型以及在对应类型下的编号，所以需要将路径对应的位置提取出来，设为变量：
 


```plain
"Project of Yliena\\PuzzleGame\\素材\\image\\"+图片类型+"\\"+图片编号+"\\"+图片顺序+".jpg"
```
 


因为我们想要实现的是点击菜单会出现该类型下随机编号的拼图，所以我们还需要将图片顺序赋值为一个随机数，范围视具体情况而定。
 


别忘了在每次更换图片后都要将计步器清零哦~
 


实现代码如下：
 


```java
private class Menu implements ActionListener {
            @Override
        public void actionPerformed(ActionEvent e) {
              //更换图片的实现
            if(e.getSource() == Animal) {
                System.out.println("更换动物图片");
                pictureType = "animal";
                pictureNumber = new Random().nextInt(8)+1;
                step = 0;
                stepNumber = null;
                Rand();
                AddPicture();
            }
            if(e.getSource() == Girl){
                System.out.println("更换女孩图片");
                pictureType = "girl";
                pictureNumber = new Random().nextInt(11)+1;
                step = 0;
                stepNumber = null;
                Rand();
                AddPicture();
            }
            if(e.getSource() == Sport) {
                System.out.println("更换运动图片");
                pictureType = "sport";
                pictureNumber = new Random().nextInt(10)+1;
                step = 0;
                stepNumber = null;
                Rand();
                AddPicture();
            }
     }
}
```
 


 
 


B.重新游玩
 


 
 


重新游玩功能实现的原理也十分简单，只需要将计步器清零然后重新打乱图片顺序再加载图片即可。
 


实现代码如下：
 


```java
private class Menu implements ActionListener {
 
        @Override
        public void actionPerformed(ActionEvent e) {
            //重新游玩的实现
            if(e.getSource() == replayJMenuItem) {
                System.out.println("重新游玩");
                step = 0;
                stepNumber = null;
                Rand();
                AddPicture();
            }
     }
}
```
 


 
 


C.重新登录
 


 
 


关闭游戏界面打开登录界面即可。
 


实现代码如下：
 


```java
  private class Menu implements ActionListener {
 
        @Override
        public void actionPerformed(ActionEvent e) {
                   //重新登陆
            if(e.getSource() == reloginJMenuItem){
                GameJFrame.this.dispose();
                new LoginJFrame();
            }
        }
    }
```
 


 
 


D.游戏规则
 


我将游戏规则的文本进行截图放入 JLabel 容器中，然后使用一个新的 JFrame 窗口来搭载。
 


当然也可以用文本块的形式来替代图片，~~但由于我搞了好久都没有成功所以就放弃了。~~
 


![](https://i-blog.csdnimg.cn/direct/1ff4da40f8544245b2a97838206d38cb.jpeg)
 


所以我们只需要点击菜单后弹出规则界面即可。
 


实现代码如下：
 


```java
 private class Menu implements ActionListener {
 
        @Override
        public void actionPerformed(ActionEvent e) {
              //游戏规则
            if(e.getSource() == RuleMenuItem){
                System.out.println("规则");
                Role();
            }
      }
}
 
 
 private void Role(){
        //规则弹窗
        JFrame Rule = new JFrame();
        Rule.setSize(904,350);
        JLabel RulePicture = new JLabel(new ImageIcon("图片路径"));
        RulePicture.setSize(904, 282);
        Rule.add(RulePicture);
        // 设置窗口位置为屏幕中央
        Rule.setLocationRelativeTo(null);
        //设置关闭最小化
        Rule.setDefaultCloseOperation(WindowConstants.HIDE_ON_CLOSE);
        //设置页面置顶
        Rule.setAlwaysOnTop(true);
        // 显示窗口
        Rule.setVisible(true);
    }
```
 


 
 


可能有小伙伴疑惑为什么我没有讲作者主页子菜单的功能实现，实际上这是作为一个小彩蛋环节，放在本章节最后进行讲解~~
 


![](https://i-blog.csdnimg.cn/direct/e44a99053c094d76b2fe5eb91b18b2f2.jpeg)
 


---
 


（9）游戏退出弹窗功能的实现
 


 
 


许多游戏会在关闭游戏界面时弹出一个弹窗确认是否要关闭，依次来防止误操作。
 


我们这个小游戏虽然看上去有些简陋，但仪式感可不能少！所以我也添加了一个确认弹窗功能。
 


在这里我们需要用到窗口监听的相关知识：
 


> 
>  窗口监听（WindowListener） 
>    
>  窗口监听主要是指监听窗口上的事件，如窗口的关闭、最大化、最小化、聚焦等。 
>    
>  方法： 
>    
>  windowOpened(WindowEvent e): 当窗口首次打开时触发。windowClosing(WindowEvent e): 当用户尝试关闭窗口时触发。windowClosed(WindowEvent e): 当窗口被关闭后触发。windowIconified(WindowEvent e): 当窗口被最小化时触发。windowDeiconified(WindowEvent e): 当窗口从最小化恢复时触发。windowActivated(WindowEvent e): 当窗口获得焦点时触发。windowDeactivated(WindowEvent e): 当窗口失去焦点时触发。 
> 
 


然后关于弹窗，我们需要用到 JOptionPane 的相关知识：
 


> 
>  JOptionPane 
>  JOptionPane 是一个静态类，位于 javax.swing 包中。它用于显示信息、警告、错误、确认对话框或获取用户输入等。 
>  相关应用： 
>    
>  1.显示信息对话框 
>  JOptionPane.showMessageDialog(Component parentComponent, Object message); 
>  title：对话框的标题。 
>  messageType：消息的类型，例如： 
>  JOptionPane.INFORMATION_MESSAGE：信息消息。 
>  JOptionPane.WARNING_MESSAGE：警告消息。 
>  JOptionPane.ERROR_MESSAGE：错误消息。 
>  JOptionPane.QUESTION_MESSAGE：问号消息。 
>  JOptionPane.PLAIN_MESSAGE：无图标的普通消息。 
>    
>  2.显示确认对话框 
>  int option = JOptionPane.showConfirmDialog(Component parentComponent, Object message); 
>  返回值： 
>  JOptionPane.YES_OPTION：用户选择了“是”。 
>  JOptionPane.NO_OPTION：用户选择了“否”。 
>  JOptionPane.CANCEL_OPTION：用户选择了“取消”。 
>    
>  3.显示输入对话框 
>  String input = JOptionPane.showInputDialog(Component parentComponent, Object message); 
>  返回值： 
>  用户输入的字符串（如果用户按下“确定”）。 
>  如果用户取消或关闭对话框，则返回 null。 
>    
>  4.自定义对话框 
>  int option = JOptionPane.showOptionDialog(Component parentComponent, Object message,String title, int optionType, int messageType, Icon icon,Object[] options, Object initialValue); 
>  parentComponent：父组件，通常设置为 null，表示没有父组件。 
>  message：显示的消息内容。 
>  title：对话框标题。 
>  optionType：选项类型，指定可用的按钮选项类型，例如： 
>  JOptionPane.YES_NO_OPTION：显示“是”和“否”按钮。 
>  JOptionPane.OK_CANCEL_OPTION：显示“确定”和“取消”按钮。 
>  JOptionPane.YES_NO_CANCEL_OPTION：显示“是”、“否”和“取消”按钮。 
>  messageType：消息类型，例如 JOptionPane.INFORMATION_MESSAGE 或 JOptionPane.WARNING_MESSAGE。 
>  icon：对话框的自定义图标，可以传递 null。 
>  options：自定义的选项按钮数组。 
>  initialValue：初始值，指定默认选中的按钮。 
> 
 


实现代码如下：
 


```java
  private static class closeWindow extends WindowAdapter {
        @Override
        public void windowClosing(WindowEvent e) {
            System.out.println("关闭窗口");
            //设置弹窗容器
            JFrame close = new JFrame();
            //设置容器置顶
            close.setAlwaysOnTop(true);
            //设置弹窗
            int option = JOptionPane.showConfirmDialog(close, "你确定要退出吗？",
                    "确认退出", JOptionPane.YES_NO_OPTION);
            // 如果点击了"是"按钮，则关闭窗口
            if (option == JOptionPane.YES_OPTION) {
                System.exit(0);
            }
        }
    }
```
 


---
 


（10）小彩蛋
 


 
 


关于菜单栏中的“关于作者 -&gt; 作者主页”这一块，我设置了一个比较好玩的功能，算是一个小彩蛋吧。
 


![](https://i-blog.csdnimg.cn/direct/4d13ea9bc6b74762bf2f5731ea8c1b14.gif)
 


**你                             被                             骗                             了                             ！**
 


在实现这个功能之前，我们需要先学习一下 Desktop 类和 URI 类的知识：
 


> 
>  Desktop 类
 
Desktop 类是 Java 6 引入的一个类，属于 java.awt 包，它提供了一个平台特定的接口，用来启动操作系统中默认的应用程序，如打开浏览器、邮件客户端、文件管理器等。
 
常用方法：
 
isDesktopSupported()：检查当前操作系统是否支持 Desktop 类的功能。不是所有操作系统都支持这个类，通常在某些无图形用户界面的环境中，可能无法使用该类。getDesktop()：获取当前操作系统的 Desktop 实例。一般在确认 isDesktopSupported() 返回 true 后使用。open(File file)：打开指定文件。系统会根据文件类型自动调用默认的应用程序（如打开文档、图片、PDF 等）。browse(URI uri)：使用默认浏览器打开指定的 URL。参数是一个 URI 对象。mail(URI uri)：使用默认的邮件客户端打开一个新的电子邮件窗口，URI 需要包含邮件地址和主题等内容。edit(File file)：使用默认的编辑器打开指定文件。例如，打开一个文本文件。 
> 
 


> 
>  URI 类
 
URI 类是 java.net 包中的一个类，它表示一个统一资源标识符，通常用于在网络中识别和操作资源。
 
构造方法：
          URI(String str)//str 通常是网址
 
常用方法：
 
toString()：将 URI 转换为字符串表示形式。getHost()：获取 URI 的主机名。getPath()：获取 URI 的路径部分。resolve(URI uri)：将一个相对 URI 解析为绝对 URI。这个方法可以根据当前 URI 和相对 URI 构建一个新的 URI。 
> 
 


 
 


实现代码如下：
 


```java
  private class Menu implements ActionListener {
 
        @Override
        public void actionPerformed(ActionEvent e) {
                 //如果点击关于作者
            if(e.getSource() == WriterMenuItem){
                System.out.println("关于作者");
                JFrame ab = new JFrame("你被骗了！");
                // 创建一个JLabel并设置显示的文本
                JLabel label = new JLabel("~~~日日上一当，当当不一样~~~", JLabel.CENTER);
                // 设置字体和大小
                Font font = new Font("微软雅黑", Font.PLAIN, 40);
                label.setFont(font);
                // 将JLabel添加到JFrame中
                ab.add(label);
                // 设置窗口大小
                ab.setSize(700, 300);
                // 设置窗口位置为屏幕中央
                ab.setLocationRelativeTo(null);
                //设置页面置顶
                ab.setAlwaysOnTop(true);
                // 显示窗口
                ab.setVisible(true);
                //打开网站
                openWebsite("https://www.bilibili.com/video/BV1UT42167xb/?spm_id_from=333.337.search-card.all.click");
            }
      }       
}
 
 
 public static void openWebsite(String url) {
        try {
            if (Desktop.isDesktopSupported()) {
                System.out.println("成功打开网址");
                Desktop desktop = Desktop.getDesktop();
                URI uri = new URI(url);
                desktop.browse(uri); // 打开默认浏览器并跳转到指定网址
            } else {
                System.out.println("不支持操作");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
```
 


 
 


最后需要在构造对象里调用以上创建的所用方法：
 


```java
 public GameJFrame() {
        //初始化界面
        initJFrame();
        //搭建菜单栏
        initMenu();
        //实现菜单
        replayJMenuItem.addActionListener(new Menu());
        Animal.addActionListener(new Menu());
        Girl.addActionListener(new Menu());
        Sport.addActionListener(new Menu());
        WriterMenuItem.addActionListener(new Menu());
        RuleMenuItem.addActionListener(new Menu());
        reloginJMenuItem.addActionListener(new Menu());
        //打乱图片顺序
        Rand();
        //显示图像
        AddPicture();
        //添加键盘监听
        addKeyListener(new gameMove());
        //添加作弊功能
        addKeyListener(new cheatPicture());
        //添加窗口监听
        addWindowListener(new closeWindow());
        //显示页面
        this.setVisible(true);
        //蹦出规则窗口
        Role();
    }
```
 


---
 


#### 2.注册界面
 


 
 


（1）界面初始化
 


 
 


A.窗体
 


 
 


原理同游戏界面一致，直接上代码！
 


实现代码如下：
 


```java
  private void initJFrame() {
        //设置页面大小
        this.setSize(488,430);
        //设置页面标题
        this.setTitle("用户注册");
        //设置页面居中
        this.setLocationRelativeTo(null);
        //设置页面置顶
        this.setAlwaysOnTop(true);
        //添加图片
        this.AddPicture();
        //设置页面关闭后也将程序一并关闭
        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }
```
 


 
 


B.图片、文本以及按钮的添加
 


 
 


图片的添加想必不用多说，关于文本输入框以及按钮的添加，这里会涉及到一些新的知识。
 


> 
>  JTextField 
>    
>  JTextField 是一个单行文本输入框，允许用户输入和编辑文本。 
>    
>  特性： 
>   文本输入：用户可以在其中输入文本。  设置默认文本：可以设置默认文本，如 textField.setText("默认文本");。  获取输入文本：使用 textField.getText() 来获取用户输入的文本。  
> 
 


> 
>  JPasswordField 
>    
>  JPasswordField 是一个专门用于密码输入的文本框，它会隐藏用户输入的字符，以保护密码安全。 
>    
>  特性： 
>   隐藏文本：用户输入时，显示的是星号（*）或点（•），而不是明文密码。  设置密码文本：使用 setText() 方法设置密码（尽管实际密码是不可见的）。  获取密码文本：使用 getPassword() 方法来获取密码，返回的是字符数组（char[]），而不是字符串。  
> 
 


> 
>  JButton 
>    
>  JButton 是一个用于触发事件的按钮组件。 
>    
>  特性： 
>   按钮文本或图标：可以设置按钮的文本内容，也可以设置图标。  事件监听：通过添加事件监听器，JButton 可以响应用户点击事件（ActionEvent）。  启用/禁用：可以通过 setEnabled(false) 禁用按钮，或者通过 setEnabled(true) 启用按钮。  
> 
 


我们只需要将这些组件都添加到 JFrame 窗体即可。
 


实现代码如下：
 


```java
       //输入设置
    JTextField userNameText = new JTextField();
    JPasswordField passwordText = new JPasswordField();
    JPasswordField morePasswordText = new JPasswordField();
    //重置按钮设置
    JButton back = new JButton(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
    //注册按钮设置
    JButton Register = new JButton(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
 
private void AddPicture(){
        //注册用户名图片设置
        JLabel userName = new JLabel(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
        userName.setBounds(100, 135, 80, 19);
        this.add(userName);
        //用户名输入设置
        userNameText.setCaretColor(Color.CYAN);
        userNameText.setBounds(195, 134, 200, 30);
        this.add(userNameText);
        //密码图片设置
        JLabel password = new JLabel(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
        password.setBounds(100, 170, 70, 18);
        this.add(password);
        //密码输入设置
        passwordText.setCaretColor(Color.CYAN);
        passwordText.setBounds(195, 165, 200, 30);
        passwordText.setEchoChar('●');
        this.add(passwordText);
        //再次输入密码图片设置
        JLabel morePassword = new JLabel(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
        morePassword.setBounds(90, 205, 100, 18);
        this.add(morePassword);
        //再次输入密码输入设置
        morePasswordText.setCaretColor(Color.CYAN);
        morePasswordText.setBounds(195, 196, 200, 30);
        morePasswordText.setEchoChar('●');
        this.add(morePasswordText);
        //重置按钮设置
        back.setBounds(133, 250, 90, 40);
        this.add(back);
        //注册按钮的设置
        Register.setBounds(256, 250, 90, 40);
        this.add(Register);
        //设置背景图片
        JLabel picture = new JLabel(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
        picture.setBounds(40,40,508,560);
        this.add(picture);
    }
```
 


---
 


（2）密码解密功能的实现
 


 
 


我们在界面初始化的时候，输入密码所用的组件是 JPasswordField，这个组件的特点就是输入的文本是以密文形式显示的，但有些时候用户可能想确认自己是否有输入错误，所以需要查看自己输入的密码，这时我们就需要将输入的密码以明文形式显示。
 


而原理也很简单，我们可以通过 getPassword 方法来获取密码，由于获取的是一个字符串数组，所以我们也得创建新的字符串数组来接收；随后将数组转换为字符串再将文本替换即可。
 


但为了优化体验，我们需要设置一个按钮，在按下时按钮图片改变，表示现在是明文形式，同时实现解密功能，而再次按下时则恢复原有状态，实现这个功能我们需要一个判断和动作监听。
 


实现代码如下：
 


```java
  //查看密码按钮设置
    JButton lookPassword = new JButton(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
 
 
  //查看密码明文状态
    boolean flag = false;
 
 private void AddPicture(){
          //查看加密密码设置
        lookPassword.setBounds(400, 165,18,29);
        this.add(lookPassword);
}
 
  private class ButtonListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
                      //查看密码
            if(!flag) {
                if (e.getSource() == lookPassword) {
                    flag = true;
                    lookPassword.setIcon(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
                    // 获取密码（密码是一个 char 数组）
                    char[] password = passwordText.getPassword();
                    char[] morePassword = morePasswordText.getPassword();
                    // 将 char[] 转换为字符串来查看密码
                    String passwordString = new String(password);
                    String morePasswordString = new String(morePassword);
                    // 设置密码框为明文显示
                    passwordText.setEchoChar((char) 0);
                    morePasswordText.setEchoChar((char) 0);
                    passwordText.setText(passwordString);
                    morePasswordText.setText(morePasswordString);
                }
            }
            //取消明文显示
            else{
                flag = false;
                lookPassword.setIcon(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
                String passwordString = passwordText.getText();
                String morePasswordString = morePasswordText.getText();
                passwordText.setText("");
                morePasswordText.setText("");
                passwordText.setEchoChar('●');
                morePasswordText.setEchoChar('●');
                morePasswordText.setText(morePasswordString);
                passwordText.setText(passwordString);
            }
        }
    }
```
 


---
 


（3）重置功能的实现
 


 
 


原理也很简单，只需要添加一个动作监听，在点击重置按钮后将文本输入框里的文本全部替换成为空字符串即可。
 


 
 


实现代码如下：
 


```java
 private class ButtonListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
                //重置
            if(e.getSource() == back){
                // 清空文本框
                userNameText.setText("");
                passwordText.setText("");
                morePasswordText.setText("");
            }
      }
}
```
 


---
 


（4）记录用户数据
 


 
 


用户数据肯定得是私密的，不能随意被外部调用查看的，所以我创建了一个非标准 Javabean 类来实现用成员方法调用用户数据。
 


实现代码如下：
 


```java
public class UserMessage {
 
    //设置全局数组记录用户名以及密码
    private static ArrayList<UserMessage> Messages = new ArrayList<>();
    private String name;
    private String password;
 
    public UserMessage() {
    }
 
    public UserMessage(String name, String password) {
        this.name = name;
        this.password = password;
    }
 
    public UserMessage(ArrayList<UserMessage> Messages, String name, String password) {
        this.Messages = Messages;
        this.name = name;
        this.password = password;
    }
 
     public int setIndex(String username) {
        int index = -1;
        for(int i = 0; i < Messages.size(); i++) {
            if(Messages.get(i).getName().equals(username)) {
                index = i;
            }
        }
        return index;
    }
 
 
      public  String getname(int index) {
       return Messages.get(index).getName();
    }
 
 
     public  String getpassword(int index) {
        return Messages.get(index).getPassword();
    }
 
 
    public  int getSize() {
        return Messages.size();
    }
 
     public void addMessage(String username, String password) {
        Messages.add(new UserMessage(username, password));
    }
}
 
 
 
 
public class RegisterJFrame extends JFrame {
 
    //创建对象实例来引用里面的成员方法
    UserMessage userMessage = new UserMessage();
 
}
```
 


---
 


（5）确认输入正确性功能的实现
 


 
 


关于注册时检查用户输入正确性有以下几个要点：
 


1. 用户名是否已经被注册
2. 两次输入的密码是否一致
3. 输入是否为空
 


然后在输入不正确时点击注册按钮就会自动跳出警告弹窗，按理说这里应该用到上面所说的 Desktop 类来实现，但我当时没有想到，直接使用了普通窗体，所以小伙伴们在这里还是使用弹窗功能更为合适……
 


![](https://i-blog.csdnimg.cn/direct/b0c041a8e4d64deeac5401df40132aa5.jpeg)
 


实现代码如下：
 


```java
 private class ButtonListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            //注册
            if(e.getSource() == Register){
                System.out.println("注册");
                String username = userNameText.getText();
                String userPassword = passwordText.getText();
                String morePassword = morePasswordText.getText();
                for(int i = 0;i < userMessage.getSize();i++) {
                    if (username.equals(userMessage.getname(i))){
                        System.out.println("用户名重复");
                        JFrame warn = new JFrame("警告");
                        JLabel label1 = new JLabel("用户名已被注册！", JLabel.CENTER);
                        Font font1 = new Font("微软雅黑", Font.PLAIN, 20);
                        label1.setFont(font1);
                        //添加
                        warn.add(label1);
                        // 设置窗口大小
                        warn.setSize(200, 150);
                        // 设置窗口位置为屏幕中央
                        warn.setLocationRelativeTo(null);
                        //设置页面置顶
                        warn.setAlwaysOnTop(true);
                        // 显示窗口
                        warn.setVisible(true);
                        return;
                    }
                }
                if(!userPassword.equals(morePassword)&&!username.isEmpty()&&!userPassword.isEmpty()){
                    JFrame warn = new JFrame("警告");
                    JLabel label1 = new JLabel("两次密码输入不一致，请重新输入！", JLabel.CENTER);
                    Font font1 = new Font("微软雅黑", Font.PLAIN, 20);
                    label1.setFont(font1);
                    //添加
                    warn.add(label1);
                    // 设置窗口大小
                    warn.setSize(400, 150);
                    // 设置窗口位置为屏幕中央
                    warn.setLocationRelativeTo(null);
                    //设置页面置顶
                    warn.setAlwaysOnTop(true);
                    // 显示窗口
                    warn.setVisible(true);
                }else if(username.isEmpty()){
                    JFrame warn = new JFrame("警告");
                    JLabel label1 = new JLabel("用户名为空！", JLabel.CENTER);
                    Font font1 = new Font("微软雅黑", Font.PLAIN, 20);
                    label1.setFont(font1);
                    //添加
                    warn.add(label1);
                    // 设置窗口大小
                    warn.setSize(250, 150);
                    // 设置窗口位置为屏幕中央
                    warn.setLocationRelativeTo(null);
                    //设置页面置顶
                    warn.setAlwaysOnTop(true);
                    // 显示窗口
                    warn.setVisible(true);
                }else if(userPassword.isEmpty()){
                    JFrame warn = new JFrame("警告");
                    JLabel label1 = new JLabel("密码为空！", JLabel.CENTER);
                    Font font1 = new Font("微软雅黑", Font.PLAIN, 20);
                    label1.setFont(font1);
                    //添加
                    warn.add(label1);
                    // 设置窗口大小
                    warn.setSize(250, 150);
                    // 设置窗口位置为屏幕中央
                    warn.setLocationRelativeTo(null);
                    //设置页面置顶
                    warn.setAlwaysOnTop(true);
                    // 显示窗口
                    warn.setVisible(true);
                }
            }
       }
}
```
 


 
 


 
 


最后需要在构造对象里调用以上创建的所有方法：
 


```java
 public RegisterJFrame() {
        //初始化界面
        initJFrame();
        //添加按钮监听
        back.addActionListener(new ButtonListener());
        Register.addActionListener(new ButtonListener());
        lookPassword.addActionListener(new ButtonListener());
        //显示页面
        this.setVisible(true);
    }
```
 


---
 


（6）返回登录界面功能计时器的实现
 


 
 


大家平时注册用户成功之后系统是不是会自动跳转到登录界面呢？
 


所以我们的小游戏也不能落后！我特地加了一个注册成功三秒后自动跳转登录界面的功能。
 


这里又有新知识了：
 


> 
>  Timer 类
 
Timer 类是一个定时器类，用于在指定的时间间隔内执行任务
 
构造方式：
 
           Timer(int delay, ActionListener listener);
delay 是定时器的延迟时间，即定时器触发事件的间隔时间，单位是毫秒。这个参数指的是定时器触发的间隔，也就是每次定时器触发后多久执行一次 actionPerformed 方法。ActionListener 是定时器触发后要执行的动作。
 
常用方法：
 
timer.setRepeats(false)：这个方法设置定时器是否重复触发  timer.start()：这个方法启动定时器，开始按照设置的时间间隔触发事件。  timer.stop();这个方法停止定时器。  timer.setDelay(int delay)：这个方法设置定时器的延迟时间，即每次触发事件的时间间隔。  timer.setInitialDelay(int delay)：这个方法设置定时器第一次触发的延迟时间。即定时器启动后的首次触发事件的等待时间。  timer.getDelay()：这个方法返回定时器的当前延迟时间（即时间间隔），单位是毫秒。  timer.isRunning()：这个方法检查定时器是否正在运行。  
> 
 


由于已经检查了输入正确性，所以这里不需要再进行检查。
 


实现代码如下：
 


```java
 private class ButtonListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
                     //注册
            if(e.getSource() == Register){
                 if(userPassword.equals(morePassword)){
                    //记录用户数据
                    userMessage.addMessage(username, userPassword);
                    JFrame success = new JFrame("注册成功");
                    JLabel label2 = new JLabel("3秒后自动返回登录界面……", JLabel.CENTER);
                    Font font1 = new Font("微软雅黑", Font.PLAIN, 20);
                    label2.setFont(font1);
                    //添加
                    success.add(label2);
                    // 设置窗口大小
                    success.setSize(400, 150);
                    // 设置窗口位置为屏幕中央
                    success.setLocationRelativeTo(null);
                    //设置页面置顶
                    success.setAlwaysOnTop(true);
                    // 显示窗口
                    success.setVisible(true);
                    Timer timer = new Timer(3000, new ActionListener() {
                        @Override
                        public void actionPerformed(ActionEvent e) {
                            // 关闭当前注册成功窗口
                            success.dispose();
                            RegisterJFrame.this.dispose();
                            // 跳转到登录界面
                            new LoginJFrame().setVisible(true);
                        }
                    });
                    // 确保只触发一次
                    timer.setRepeats(false);
                    // 启动定时器
                    timer.start();
                }
         }
}
```
 


---
 


#### 3.登录界面
 


 
 


由于界面初始化以及密码解密功能的实现原理都与注册界面的一致，所以我直接放在一起展示代码。
 


~~其实是因为我懒~~
 


 
 


（1）界面初始化
 


 
 


A.窗体
 


 
 


实现代码如下：
 


```java
 private void initJFrame() {
        //设置页面大小
        this.setSize(488,430);
        //设置页面标题
        this.setTitle("用户登录");
        //设置页面居中
        this.setLocationRelativeTo(null);
        //设置页面置顶
        this.setAlwaysOnTop(true);
        //添加图片
        this.AddPicture();
        //设置页面关闭后也将程序一并关闭
        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }
```
 


 
 


B.图片、文本输入框以及按钮的添加以及密码解密功能的实现
 


 
 


实现代码如下：
 


```java
  //输入文本框
    JTextField userNameText = new JTextField();
    JPasswordField passwordText = new JPasswordField();
    JTextField yzcodeText = new JTextField();
 
    //注册和登录按钮
    JButton register = new JButton(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
    JButton login = new JButton(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
 
    //验证码实现按钮
    JButton code = new JButton();
    JLabel Newcode = new JLabel(makeCode());
 
    //查看密码按钮设置
    JButton lookPassword = new JButton(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
    //查看密码明文状态
    boolean flag1 = false;
 
 
 private void AddPicture(){
        //用户名图片设置
        JLabel userName = new JLabel(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
        userName.setBounds(116, 135, 51, 19);
        this.add(userName);
        //用户名输入设置
        userNameText.setCaretColor(Color.CYAN);
        userNameText.setBounds(195, 134, 200, 30);
        this.add(userNameText);
        //密码图片设置
        JLabel password = new JLabel(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
        this.add(password);
        //密码输入设置
        passwordText.setCaretColor(Color.CYAN);
        passwordText.setBounds(195, 195, 200, 30);
        passwordText.setEchoChar('●');
        this.add(passwordText);
        //查看加密密码设置
        lookPassword.setBounds(400, 195,18,29);
        this.add(lookPassword);
        this.add(code);
        //注册按钮设置
        register.setBounds(133, 300, 90, 40);
        this.add(register);
        //登录按钮的设置
        login.setBounds(256, 300, 90, 40);
        this.add(login);
        //设置背景图片
        JLabel picture = new JLabel(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
        picture.setBounds(40,40,508,560);
        this.add(picture);
    }
 
 
 
 
  private class ButtonListener implements ActionListener {
 
        @Override
        public void actionPerformed(ActionEvent e) {
              //查看密码
            if(!flag1) {
                if (e.getSource() == lookPassword) {
                    flag1 = true;
                    lookPassword.setIcon(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
                    // 获取密码（密码是一个 char 数组）
                    char[] password = passwordText.getPassword();
                    // 将 char[] 转换为字符串来查看密码
                    String passwordString = new String(password);
                    // 设置密码框为明文显示
                    passwordText.setEchoChar((char) 0);
                    passwordText.setText(passwordString);
                }
            }
            //取消明文显示
            else{
                flag1 = false;
                lookPassword.setIcon(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\图片类型\\图片编号\\图片顺序.jpg"));
                String passwordString = passwordText.getText();
                passwordText.setText("");
                passwordText.setEchoChar('●');
                passwordText.setText(passwordString);
            }
        }
    }
```
 


---
 


（2）验证码的生成
 


 
 


大多数系统在登陆时会添加输入验证码功能来验证用户是否为人机，于是我也添加了这个功能。
 


实现原理并不复杂，先随机生成验证码，然后只需要提取文本框中的文本和验证码对照一致即可。
 


另外我们还需要添加动作监听来实现点击验证码图片进行刷新，所以验证码本身其实是一个 JButton 组件。
 


 
 


实现代码如下：
 


```java
 //验证码实现按钮
    JButton code = new JButton();
    JLabel Newcode = new JLabel(makeCode());
 
 private class ButtonListener implements ActionListener {
 
        @Override
        public void actionPerformed(ActionEvent e) {
               //验证码刷新
            if (e.getSource() == code) {
                Newcode.setText(makeCode());
            }
      }
}
 
 
  private String makeCode(){
        //生成验证码
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder code = new StringBuilder(4);
        for (int i = 0; i < 4; i++) {
            int index = random.nextInt(chars.length());
            code.append(chars.charAt(index));
        }
        return code.toString();
    }
```
 


---
 


（3）确认输入正确性功能的实现
 


 
 


我们需要先检查验证码是否正确，如果错误则跳出警告弹窗并刷新验证码，
 


反之则继续检查用户输入的用户名在 UserMessage 类中记录用户数据的数组中是否存在，
 


若存在再检查其输入的密码是否与数组中对应的密码一致，
 


若一致才能进行登录。
 


 
 


实现代码：
 


```java
 private class ButtonListener implements ActionListener {
 
        @Override
        public void actionPerformed(ActionEvent e) {
             //登录
            if(e.getSource() == login) {
                String username = userNameText.getText();
                String password = String.valueOf(passwordText.getPassword());
                String yzcode = yzcodeText.getText();
 
                if (username.isEmpty()) {
                    JFrame warn = new JFrame("警告");
                    JLabel label1 = new JLabel("用户名为空！", JLabel.CENTER);
                    Font font1 = new Font("微软雅黑", Font.PLAIN, 20);
                    label1.setFont(font1);
                    //添加
                    warn.add(label1);
                    // 设置窗口大小
                    warn.setSize(250, 150);
                    // 设置窗口位置为屏幕中央
                    warn.setLocationRelativeTo(null);
                    //设置页面置顶
                    warn.setAlwaysOnTop(true);
                    // 显示窗口
                    warn.setVisible(true);
                    return;
                } else if (password.isEmpty()) {
                    JFrame warn = new JFrame("警告");
                    JLabel label1 = new JLabel("密码为空！", JLabel.CENTER);
                    Font font1 = new Font("微软雅黑", Font.PLAIN, 20);
                    label1.setFont(font1);
                    //添加
                    warn.add(label1);
                    // 设置窗口大小
                    warn.setSize(250, 150);
                    // 设置窗口位置为屏幕中央
                    warn.setLocationRelativeTo(null);
                    //设置页面置顶
                    warn.setAlwaysOnTop(true);
                    // 显示窗口
                    warn.setVisible(true);
                    return;
                } else if (yzcode.isEmpty()) {
                    JFrame warn = new JFrame("警告");
                    JLabel label1 = new JLabel("验证码为空！", JLabel.CENTER);
                    Font font1 = new Font("微软雅黑", Font.PLAIN, 20);
                    label1.setFont(font1);
                    //添加
                    warn.add(label1);
                    // 设置窗口大小
                    warn.setSize(250, 150);
                    // 设置窗口位置为屏幕中央
                    warn.setLocationRelativeTo(null);
                    //设置页面置顶
                    warn.setAlwaysOnTop(true);
                    // 显示窗口
                    warn.setVisible(true);
                    return;
                }
                //验证码正确
                if(yzcode.equals(Newcode.getText())){
                    //检查用户名是否存在
                    boolean flag = false;
                    for(int i = 0;i < userMessage.getSize();++i){
                        //用户名存在
                        if(username.equals(userMessage.getname(i))){
                            flag = true;
                            //密码正确
                            if(password.equals(userMessage.getpassword(i))){
                                LoginJFrame.this.dispose();
                                new GameJFrame().setVisible(true);
                            }
                            //密码错误
                            else{
                                JFrame warn = new JFrame("警告");
                                JLabel label1 = new JLabel("密码错误！", JLabel.CENTER);
                                Font font1 = new Font("微软雅黑", Font.PLAIN, 20);
                                label1.setFont(font1);
                                //添加
                                warn.add(label1);
                                // 设置窗口大小
                                warn.setSize(250, 150);
                                // 设置窗口位置为屏幕中央
                                warn.setLocationRelativeTo(null);
                                //设置页面置顶
                                warn.setAlwaysOnTop(true);
                                // 显示窗口
                                warn.setVisible(true);
                                return;
                            }
                        }
                    }
                    //用户名不存在
                    if(!flag){
                        JFrame warn = new JFrame("警告");
                        JLabel label1 = new JLabel("用户名不存在！", JLabel.CENTER);
                        Font font1 = new Font("微软雅黑", Font.PLAIN, 20);
                        label1.setFont(font1);
                        //添加
                        warn.add(label1);
                        // 设置窗口大小
                        warn.setSize(250, 150);
                        // 设置窗口位置为屏幕中央
                        warn.setLocationRelativeTo(null);
                        //设置页面置顶
                        warn.setAlwaysOnTop(true);
                        // 显示窗口
                        warn.setVisible(true);
                        return;
                    }
                }
                //验证码错误
                else{
                    //刷新
                    Newcode.setText(makeCode());
                    JFrame warn = new JFrame("警告");
                    JLabel label1 = new JLabel("验证码错误！", JLabel.CENTER);
                    Font font1 = new Font("微软雅黑", Font.PLAIN, 20);
                    label1.setFont(font1);
                    //添加
                    warn.add(label1);
                    // 设置窗口大小
                    warn.setSize(250, 150);
                    // 设置窗口位置为屏幕中央
                    warn.setLocationRelativeTo(null);
                    //设置页面置顶
                    warn.setAlwaysOnTop(true);
                    // 显示窗口
                    warn.setVisible(true);
                    return;
                }
            }
      }
}
```
 


---
 


（4）注册界面和游戏界面的跳转
 


 
 


原理也很简单，想要跳转哪个界面就先关闭目前的界面再创造新的实例对象就行了。
 


实际在上面将检查输入正确性的时候已经实现了游戏界面的跳转，所以这里只需要实现注册界面的跳转即可。
 


 
 


实现代码如下：
 


```java
 private class ButtonListener implements ActionListener {
 
        @Override
        public void actionPerformed(ActionEvent e) {
            //注册
            if(e.getSource() == register){
                LoginJFrame.this.dispose();
                new RegisterJFrame().setVisible(true);
            }
      }
}
```
 


---
 


### （三）最终代码（省略了方法的内部实现）
 


 
 


```java
import com.Yilena.ui.GameJFrame;
import com.Yilena.ui.LoginJFrame;
import com.Yilena.ui.RegisterJFrame;
 
public class App {
    public static void main(String[] args) {
        new LoginJFrame();
    }
}
```
 


```java
package com.Yilena.ui;
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.Random;
public class LoginJFrame extends JFrame {
 
    //创建对象实例来引用里面的成员方法
    UserMessage userMessage = new UserMessage();
 
    //输入文本框
    JTextField userNameText = new JTextField();
    JPasswordField passwordText = new JPasswordField();
    JTextField yzcodeText = new JTextField();
 
    //注册和登录按钮
    JButton register = new JButton(new ImageIcon"Project of Yliena\\PuzzleGame\\素材\\image\\"+图片类型+"\\"+图片编号+"\\图片顺序.jpg"));
    JButton login = new JButton(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\"+图片类型+"\\"+图片编号+"\\图片顺序.jpg"));
 
    //验证码实现按钮
    JButton code = new JButton();
    JLabel Newcode = new JLabel(makeCode());
 
    //查看密码按钮设置
    JButton lookPassword = new JButton(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\"+图片类型+"\\"+图片编号+"\\图片顺序.jpg"));
    //查看密码明文状态
    boolean flag1 = false;
 
public LoginJFrame()
 
 private void initJFrame()
 
 private void AddPicture()
 
private class ButtonListener implements ActionListener 
 
 private String makeCode()
 
}
```
 


```java
package com.Yilena.ui;
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
public class RegisterJFrame extends JFrame {
 
    //创建对象实例来引用里面的成员方法
    UserMessage userMessage = new UserMessage();
 
    //输入设置
    JTextField userNameText = new JTextField();
    JPasswordField passwordText = new JPasswordField();
    JPasswordField morePasswordText = new JPasswordField();
    //重置按钮设置
    JButton back = new JButton(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\"+图片类型+"\\"+图片编号+"\\图片顺序.jpg"));
    //注册按钮设置
    JButton Register = new JButton(new ImageIcon("Project of Yliena\\PuzzleGame\\素材\\image\\"+图片类型+"\\"+图片编号+"\\图片顺序.jpg"));
    //查看密码按钮设置
    JButton lookPassword = new JButton(new ImageIcon"Project of Yliena\\PuzzleGame\\素材\\image\\"+图片类型+"\\"+图片编号+"\\图片顺序.jpg"));
 
    //查看密码明文状态
    boolean flag = false;
 
 public RegisterJFrame() 
 
 private void initJFrame()
 
 private void AddPicture()
 
private class ButtonListener implements ActionListener
 
}
```
 


```java
package com.Yilena.ui;
import javax.swing.*;
import java.awt.*;
import javax.swing.border.BevelBorder;
import java.awt.event.*;
import java.util.Random;
import java.net.URI;
 
public class GameJFrame extends JFrame {
 
    //记录图片二维数组下标
    int[][]data = new int[4][4];
 
    //设置胜利条件
    int[][]win = new int[][]{{1,2,3,4}, {5,6,7,8}, {9,10,11,12}, {13,14,15,16}};
 
    //将每张图片都放入二维数组方便进行事件监听
    JLabel[][] picturelabels = new JLabel[4][4];
 
    //记录选择的图片
    JLabel selectedpicture = null;
 
    //记录选择的图片的行列
    int selectedRow = -1, selectedCol = -1;
 
    //初始化计步器
    int step = 0;
 
    //创建计步器对象
    JLabel stepNumber;
 
    //创建菜单栏对象
    JMenuBar menuBar = new JMenuBar();
    //创建菜单项对象
    JMenu functionMenu = new JMenu("功能");
    JMenu AboutUsMenu = new JMenu("关于作者");
    JMenu changePicture = new JMenu("更换图片");
    //创建子菜单对象
    JMenuItem replayJMenuItem = new JMenuItem("重新游玩");
    JMenuItem reloginJMenuItem = new JMenuItem("重新登录");
    JMenuItem WriterMenuItem = new JMenuItem("作者主页");
    JMenuItem Animal = new JMenuItem("动物");
    JMenuItem Girl = new JMenuItem("女孩");
    JMenuItem Sport = new JMenuItem("运动");
    JMenuItem RuleMenuItem = new JMenuItem("游戏规则");
 
    //初始化图片路径
    String pictureType = "animal";
    int pictureNumber = 1;
 
 
public GameJFrame() 
 
private void initJFrame()
 
 private void initMenu()
 
 private void AddPicture()
 
private void Rand()
 
private class Menu implements ActionListener
 
 public static void openWebsite(String url)
 
 private class gameMove extends KeyAdapter
 
  private class cheatPicture extends KeyAdapter
 
 private void swapPicture(int row,int col,int row1,int col1)
 
  private static class closeWindow extends WindowAdapter
 
 private void showCheatPicture()
 
  private boolean victory()
 
  private void Role()
 
}
```
 


**就此，项目完成！**
 


![](https://i-blog.csdnimg.cn/direct/9a2564fcce7147aab18a056932dbf4bc.gif)
 


 
 


---
 


## 三、想说的话
 


 
 


这是我第一次写博客，也不知道该怎么写，姑且照着自己的方式写完了，如果有不足亦或是错误之处欢迎大家指出~~
 


这个项目整体难度不大，主要是从没有接触过 GUI 相关的知识，所以像我这样的初学者可能写的会比较吃力，但在熟练之后其实也相对轻松下来了。
 


就光是这样一个简单的小游戏就要写这么多行代码，看来道阻且长啊……
 


![](https://i-blog.csdnimg.cn/direct/d3a42debcc044b25bfe0174d4289ba66.jpeg)
 


不过其实像这样用一篇文章记录自己写项目的历程也挺不错的，理清整个项目的实现思路的同时也能巩固知识，希望自己能坚持下去吧。
 


 
 


 
 


**~~码文不易，留个赞可以嘛~~**

---
> 原文链接: [记录：Java 阶段性项目（拼图小游戏）](https://blog.csdn.net/2401_88959292/article/details/144153828?spm=1001.2014.3001.5501)
> 作者: Yilena
