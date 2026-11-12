---
"title": "记录：基于TCP协议的控制台版网络聊天室"
"link": "ji-lu-ji-yu-tcpxie-yi-de-kong-zhi-tai-ban-wang-luo-liao-tian-shi"
"author": "Yilena"
"date": "2025-01-02"
"description": "本文记录了一个基于TCP协议的控制台版网络聊天室的完整开发过程。项目涵盖了用户注册、登录、消息发送与接收以及服务端群发等核心功能。文章详细解析了客户端与服务端的交互逻辑，重点展示了如何利用多线程技术实现消息的并发处理与实时反馈。通过具体的Java代码示例，包括ServerPort、ServerThread、ClientPort及ClientChatRunnable等核心类，直观呈现了网络编程与IO流在实际项目中的应用，为初学者理解TCP通信与多线程编程提供了生动的实践案例。"
"cover": "https://i-blog.csdnimg.cn/direct/d02861509a124b6d9d24e92c466fb5aa.jpeg"
"tags":
  - "Java"
  - "网络编程"
  - "多线程"
"categories":
  - "杂记"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/144873575?spm=1001.2014.3001.5501"
---

**目录**
 



 


[一、项目需求介绍](#t0)
 



 


[​编辑](#t1)
 


[（一）客户端](#t2)
 


[（二）服务端](#t3)
 



 


[二、项目实现过程](#t4)
 


[（一）程序入口](#t5)
 


[A.客户端](#t6)
 



 


[B.服务端](#t7)
 


[（二）用户注册](#t8)
 


[A.客户端](#t9)
 



 


[B.服务端](#t10)
 


[（三）用户登录](#t11)
 


[A.客户端](#t12)
 


[B.服务端](#t13)
 


[（四）客户端 （发送信息）->    服务端（接受信息）](#t14)
 


[A.客户端](#t15)
 


[B.服务端](#t16)
 



 


[（五）服务端（群发信息） -> 客户端（接受信息）](#t17)
 


[A.客户端](#t18)
 


[B.服务端](#t19)
 


[三、项目整体展示（省略了方法内部实现）](#t20)
 


[（一）ServerPort 类](#t21)
 


[（二）ServerThread 类](#t22)
 


[（三）ClientPort 类](#t23)
 


[（四）ClientChatRunnable 类](#t24)
 


---



*这个大作业应该是目前为止感觉最烧脑的一个，主要难点在于客服端和服务端之间的相互反馈以及服务端消息的群发实现，逻辑需要提前理清楚。*
 


![](https://i-blog.csdnimg.cn/direct/d02861509a124b6d9d24e92c466fb5aa.jpeg)
 


*主要知识点：网络编程、多线程、IO 流*
 


---



### 
 


## 一、需求介绍
 


### 
 


## ![](https://i-blog.csdnimg.cn/direct/7b519ffea59b49c789eafc8c9bcee517.gif)
 



 


### （一）
 



 


功能需求：
 


- 注册用户
- 登录用户
- 发送信息
- 接收信息




 


### （二）
 



 


功能需求：
 


- 注册信息的验证
- 登录信息的验证
- 接收信息
- 群发信息




 


---



### 
 


## 二、项目实现过程
 



 


我们服务端和客户端都应该分别启用两条线程，
 


一条用于接收信息，一条用于发送信息，
 


这样才不会造成多线程运行的逻辑紊乱。
 



 


### （一）程序入口
 



 


#### A.客户端
 



 


先建立和服务端的连接，当连接建立时服务端发来反馈，然后打印欢迎，根据用户输入的选择再进行下一步操作。
 


```java
public class ClientPort {
/ 创建一个Scanner对象以供程序输入使用
    static Scanner sc = new Scanner(System.in);
 
    /**
     * 程序的入口点
     * @param args 命令行参数
     * @throws IOException 网络通信中可能抛出的异常
     */
    public static void main(String[] args) throws IOException {
 
        // 创建一个Socket对象，连接到本地主机的指定端口
        Socket socket = new Socket("127.0.0.1",1615);
 
        // 创建BufferedWriter和BufferedReader对象，用于与服务器通信
        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
        BufferedReader br = new BufferedReader(new InputStreamReader(socket.getInputStream()));
 
        // 读取服务器的欢迎信息并打印
        String line = br.readLine();
        System.out.println(line);
 
        // 主循环，显示菜单并根据用户选择执行对应操作
        while (true) {
            System.out.println("""
                ==============欢迎来到聊天室================
                1登录
                2注册
                请输入您的选择：
                """);
            String choose = sc.nextLine();
            switch (choose) {
                case "1" -> Login(socket,bw,br);
                case "2" -> Register(bw,br);
                default -> System.out.println("******输入错误，请重新输入******");
            }
        }
    }
}
```
 


#### 
 


#### B.服务端
 



 


由于服务端要实现同时对接多个客户端，所以需要用无限循环进行包围。
 


同时需要加载本地的用户信息 TXT 文件。
 



 


```java
public class ServerPort { 
 
  // 存储所有当前连接的客户端Socket
    static ArrayList<Socket> list = new ArrayList<>();
 
    /**
     * 主函数，用于启动服务器并接受客户端连接
     * @param args 命令行参数
     * @throws IOException 如果文件操作或网络操作失败
     */
    public static void main(String[] args) throws IOException {
        // 创建ServerSocket，监听1615端口
        ServerSocket serverSocket = new ServerSocket(1615);
 
        // 加载用户信息属性文件
        Properties prop = new Properties();
        FileInputStream fis = new FileInputStream("userMessage.txt");
        prop.load(fis);
        fis.close();
 
        // 无限循环等待客户端连接
        while (true) {
            // 接受客户端连接
            Socket socket = serverSocket.accept();
            // 创建BufferedWriter用于向客户端发送消息
            BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
            // 创建BufferedReader用于接收客户端消息
            BufferedReader br = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            // 向客户端发送连接成功消息
            bw.write("服务器已经连接成功");
            bw.newLine();
            bw.flush();
 
           // 创建并启动一个新的线程来处理客户端连接
           new Thread(new ServerThread(socket, bw,br,prop)).start();
        }
    }
}
```
 


---




 


### （二）用户注册
 



 


#### A.客户端
 



 


先向服务端发送注册请求，接着判断输入合法性，若合法则向服务端发送数据进行验证，再根据的反馈打印提示信息。
 


```java
/**
     * 注册功能实现
     * @param bw 用于向服务器发送信息的BufferedWriter对象
     * @param br 用于从服务器接收信息的BufferedReader对象
     * @throws IOException 与服务器通信中可能抛出的异常
     */
    private static void Register(BufferedWriter bw, BufferedReader br) throws IOException {
 
        StringBuilder userMessage = new StringBuilder();
 
        // 向服务器发送注册请求
        while (true) {
 
            bw.write("Register");
            bw.newLine();
            bw.flush();
 
            System.out.println("""
            注册：
            请输入用户名：""");
            String username = sc.nextLine();
 
            // 验证用户名的合法性
            if(username.length() < 6)System.out.println("******用户名长度不能小于6位******");
            else if (username.length() > 18) System.out.println("******用户名长度不能大于18位******");
            else if (!username.matches("^[a-zA-Z]+$")) System.out.println("******用户名只能包含字母******");
            else {
                userMessage.append(username).append("=");
                break;
            }
        }
 
        // 验证密码的合法性
        while (true) {
            System.out.println("请输入密码：");
            String password = sc.nextLine();
 
            if(password.length() < 3)System.out.println("******密码长度不能小于3位******");
            else if (password.length() > 8) System.out.println("******密码长度不能大于8位******");
            else if (!password.matches("^[a-zA-Z]\\d+")) System.out.println("******密码格式为：首位为字母，其余位为数字******");
            else {
                userMessage.append(password);
                break;
           }
            System.out.println("******输入错误，请重新输入******");
            System.out.println();
        }
 
        // 将用户信息发送给服务器
        bw.write(userMessage.toString());
        bw.newLine();
        bw.flush();
 
        // 根据服务器返回的信息判断注册结果
        String message1 = br.readLine();
        if(message1.equals("1")) System.out.println("用户名已存在");
        else if(message1.equals("3")) System.out.println("注册成功");
        else System.out.println("注册失败");
    }
```
 


#### 
 


#### B.服务端
 



 


先接收客户端发送的注册请求，再启用注册方法，接收客户端发来的数据，再根据具体情况进行反馈。
 



 


```java
public class ServerThread implements Runnable {
 
    // 客户端Socket
    private Socket socket;
    // 用于向客户端发送数据的BufferedWriter
    private BufferedWriter bw;
    // 用于接收客户端数据的BufferedReader
    private BufferedReader br;
    // 存储用户信息的Properties对象
    private Properties prop;
    // 记录最后一次发送消息的时间
    private static LocalDateTime LastTime;
 
    /**
     * 构造方法
     * @param socket 客户端Socket
     * @param bw 用于向客户端发送数据的BufferedWriter
     * @param br 用于接收客户端数据的BufferedReader
     * @param prop 存储用户信息的Properties对象
     * @throws IOException
     */
    public ServerThread(Socket socket, BufferedWriter bw, BufferedReader br, Properties prop) throws IOException {
        this.socket = socket;
        this.bw = bw;
        this.br = br;
        this.prop = prop;
    }
 
 
    /**
     * 线程运行方法，用于处理客户端请求
     */
    @Override
    public void run() {
        try{
            while(true) {
                // 读取客户端请求
                String line = br.readLine();
                // 根据客户端请求类型执行对应的操作
                switch (line){
                    case "Login" -> login();
                    case "Register" -> register();
                }
            }
        }catch (IOException e){
            e.printStackTrace();
        }
    }
 
    /**
     * 注册方法
     * @throws IOException
     */
    private void register() throws IOException {
        // 读取用户注册信息
        String userMessage = br.readLine();
        String[] userInfo = userMessage.split("=");
        //1.用户名已存在,2.密码错误，3.注册成功，4.登陆成功,5.用户不存在
        if(prop.containsKey(userInfo[0])){
            // 如果用户名已存在，发送提示信息
            bw.write("1");
            bw.newLine();
            bw.flush();
        }else {
            // 如果用户名不存在，添加用户信息到Properties对象，并保存到文件
            prop.setProperty(userInfo[0], userInfo[1]);
            FileOutputStream fos = new FileOutputStream("F:\\Java\\Project of Yliena\\ChatRoom\\userMessage.txt");
            prop.store(fos, null);
            fos.close();
            // 发送注册成功信息
            bw.write("3");
            bw.newLine();
            bw.flush();
        }
    }
}
```
 



 


### （三）
 



 


#### A.客户端
 



 


先向服务端发送登录请求，再向服务端发送数据进行验证，再根据服务器的反馈打印提示信息。
 


```java
/**
     * 登录功能实现
     * @param socket 与服务器的Socket连接
     * @param bw 用于向服务器发送信息的BufferedWriter对象
     * @param br 用于从服务器接收信息的BufferedReader对象
     * @throws IOException 与服务器通信中可能抛出的异常
     */
    private static void Login(Socket socket, BufferedWriter bw, BufferedReader br) throws IOException {
 
        // 向服务器发送登录请求
        bw.write("Login");
        bw.newLine();
        bw.flush();
 
        StringBuilder userMessage = new StringBuilder();
 
        // 输入用户名和密码
        System.out.println("""
            登录：
            请输入用户名：
            """);
        String username = sc.nextLine();
 
        System.out.println("请输入密码：");
        String password = sc.nextLine();
 
        userMessage.append(username).append("=").append(password);
 
        // 将用户信息发送给服务器
        bw.write(userMessage.toString());
        bw.newLine();
        bw.flush();
 
        // 根据服务器返回的信息判断登录结果
        String message = br.readLine();
        if(message.equals("2")) System.out.println("密码错误");
        else if(message.equals("4")) {
            System.out.println("登录成功");
            System.out.println("========================================");
            System.out.println("请开始聊天吧！");
            // 启动一个新的线程处理聊天信息
            new Thread(new ClientChatRunnable(socket)).start();
            SendMessage(username,bw,br);
        }
        else if(message.equals("5")) System.out.println("用户名不存在");
        else System.out.println("登录失败");
    }
```
 



 


#### B.服务端
 



 


先接收客户端发送的登录请求，再启用登录方法，接收客户端发来的数据，再根据具体情况进行反馈。
 


```java
 /**
     * 登录方法
     * @throws IOException
     */
    private void login() throws IOException {
        // 读取用户登录信息
        String userMessage = br.readLine();
        String[] userInfo = userMessage.split("=");
        //1.用户名已存在,2.密码错误，3.注册成功，4.登陆成功,5.用户不存在
        if(prop.containsKey(userInfo[0])){
            // 如果用户名存在，检查密码是否正确
            if(!prop.getProperty(userInfo[0]).equals(userInfo[1])){
                // 如果密码错误，发送提示信息
                bw.write("2");
                bw.newLine();
                bw.flush();
            }else {
                // 如果密码正确，发送登录成功信息，并将用户添加到在线用户列表
                bw.write("4");
                bw.newLine();
                bw.flush();
                ServerPort.list.add(socket);
                // 发送用户消息
                SendMessage(userInfo[0]);
            }
        }else {
            // 如果用户名不存在，发送提示信息
            bw.write("5");
            bw.newLine();
            bw.flush();
        }
    }
```
 


---




 


### （四）客户端 （发送信息）-&gt;    服务端（接受信息）
 



 


#### A.客户端
 



 


由于我们发送信息应该是想发多少就发多少的，所以应该用无限循环包围实现。
 


只需将输入的文本信息发送至服务端即可。
 


```java
 /**
     * 发送消息功能实现
     * @param username 用户名
     * @param bw 用于向服务器发送信息的BufferedWriter对象
     * @param br 用于从服务器接收信息的BufferedReader对象
     * @throws IOException 与服务器通信中可能抛出的异常
     */
    private static void SendMessage(String username, BufferedWriter bw, BufferedReader br) throws IOException {
        while(true){
            System.out.println("请输入：");
            String message = sc.nextLine();
            if(!message.isEmpty()) {
                bw.write(message);
                bw.newLine();
                bw.flush();
            }
        }
    }
```
 



 


#### B.服务端
 



 


只是单纯的信息接收。
 


```java
  private void SendMessage(String username) throws IOException {
        while(true){
            // 读取用户发送的消息
            String Message = br.readLine();
            System.out.println("收到来自" + username + "的消息：" + Message);
        }
}
```
 


---



### 
 


### （五）服务端（群发信息） -&gt; 客户端（接受信息）
 



 


#### A.客户端
 



 


早在登录成功时客户端就已经启动了 ClientChatRunnable 线程进行实时的接收信息，实现原理也非常简单。
 


```java
/**
 * 实现Runnable接口的客户端聊天类
 * 该类的实例可以通过Thread进行启动，以实现并发处理服务器消息的功能
 */
public class ClientChatRunnable implements Runnable {
 
    /**
     * 用于客户端与服务器之间的通信套接字
     */
    Socket socket;
 
    /**
     * 构造函数，初始化客户端通信套接字
     * @param socket 客户端与服务器通信的套接字对象
     */
    public ClientChatRunnable(Socket socket) {
        this.socket = socket;
    }
 
    /**
     * 实现Runnable接口的run方法
     * 该方法不断监听来自服务器的消息，并将其打印到控制台
     * 注意：该循环不会停止，确保持续接收消息
     */
    @Override
    public void run() {
        while(true){
            try{
                // 创建BufferedReader以读取服务器发送的消息
                BufferedReader br = new BufferedReader(new java.io.InputStreamReader(socket.getInputStream()));
                // 读取数据
                String line;
                while((line = br.readLine()) != null){
                    System.out.println(line);
                }
                // 将读取的消息输出到控制台
                System.out.println(line);
            } catch (IOException e) {
                // 如果发生IO异常，抛出运行时异常
                throw new RuntimeException(e);
            }
        }
    }
}
```
 



 


#### B.服务端
 



 


服务端只需要在接收到信息的时候即刻进行群发，所以不需要额外创建一条线程进行信息的发送，而且我们当时在登陆成功的时候将与每个客户端之间的连接对象放入了集合中，只需要遍历集合分别对每个客户端发送信息即可。
 


在这里我额外加入了个时间，当第一条信息发出时会显示发出时间，往后只有当信息发送时间差超过 5min 后才会再次发送时间，更贴近我们使用的聊天软件。
 


```java
 private void SendMessage(String username) throws IOException {
        while(true){
            boolean flag = true;
            // 读取用户发送的消息
            String Message = br.readLine();
            System.out.println("收到来自" + username + "的消息：" + Message);
            // 将消息发送给所有在线用户
            for(Socket socket : ServerPort.list){
                BufferedWriter bw1 = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
                LocalDateTime time = LocalDateTime.now();
                DateTimeFormatter sdf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                // 如果LastTime为null，初始化LastTime，并发送当前时间
                if(LastTime == null){
                    LastTime = time;
                   flag = false;
                } else {
                    // 如果LastTime不为null，检查是否超过5分钟未发送时间信息
                    Long betweenTime = ChronoUnit.MINUTES.between(LastTime, time);
                    if (betweenTime > 5) {
                        // 如果超过5分钟，发送当前时间
                        bw1.write(sdf.format(time));
                        bw1.newLine();
                        bw1.flush();
                    }
                }
 
                if (!flag){
                    bw1.write(sdf.format(time));
                    bw1.newLine();
                    bw1.flush();
                }
 
                // 发送用户消息
                bw1.write(username + ":  " + Message);
                bw1.newLine();
                bw1.flush();
            }
 
        }
    }
```
 


---




 


## 三、项目整体展示（省略了方法内部实现）
 



 


### （一）ServerPort
 


```java
/**
 * ServerPort 类用于创建一个聊天室服务器，监听指定端口并处理客户端连接
 */
public class ServerPort {
 
    // 存储所有当前连接的客户端Socket
    static ArrayList<Socket> list = new ArrayList<>();
 
    /**
     * 主函数，用于启动服务器并接受客户端连接
     * @param args 命令行参数
     * @throws IOException 如果文件操作或网络操作失败
     */
    public static void main(String[] args) throws IOException{……}
}
```
 



 


### （二）ServerThread 类
 


```java
/**
 * 服务器线程类，用于处理客户端的请求
 */
public class ServerThread implements Runnable {
 
    // 客户端Socket
    private Socket socket;
    // 用于向客户端发送数据的BufferedWriter
    private BufferedWriter bw;
    // 用于接收客户端数据的BufferedReader
    private BufferedReader br;
    // 存储用户信息的Properties对象
    private Properties prop;
    // 记录最后一次发送消息的时间
    private static LocalDateTime LastTime;
 
    /**
     * 构造方法
     * @param socket 客户端Socket
     * @param bw 用于向客户端发送数据的BufferedWriter
     * @param br 用于接收客户端数据的BufferedReader
     * @param prop 存储用户信息的Properties对象
     * @throws IOException
     */
    public ServerThread(Socket socket, BufferedWriter bw, BufferedReader br, Properties prop) throws IOException{……}
 
 
    /**
     * 线程运行方法，用于处理客户端请求
     */
    @Override
    public void run() {……}
 
    /**
     * 注册方法
     * @throws IOException
     */
    private void register() throws IOException{……}
 
 
    /**
     * 登录方法
     * @throws IOException
     */
    private void login() throws IOException {……}
 
 
    /**
     * 发送消息方法
     * @param username 用户名
     * @throws IOException
     */
    private void SendMessage(String username) throws IOException {……}
}
 
```
 



 


### （三）ClientPort 类
 


```java
/**
 * ClientPort类实现了客户端的聊天室登录和注册功能
 */
public class ClientPort {
 
    // 创建一个Scanner对象以供程序输入使用
    static Scanner sc = new Scanner(System.in);
 
    /**
     * 程序的入口点
     * @param args 命令行参数
     * @throws IOException 网络通信中可能抛出的异常
     */
    public static void main(String[] args) throws IOException{……}
 
 
 /**
     * 注册功能实现
     * @param bw 用于向服务器发送信息的BufferedWriter对象
     * @param br 用于从服务器接收信息的BufferedReader对象
     * @throws IOException 与服务器通信中可能抛出的异常
     */
    private static void Register(BufferedWriter bw, BufferedReader br) throws IOException{……}
 
 
 /**
     * 登录功能实现
     * @param socket 与服务器的Socket连接
     * @param bw 用于向服务器发送信息的BufferedWriter对象
     * @param br 用于从服务器接收信息的BufferedReader对象
     * @throws IOException 与服务器通信中可能抛出的异常
     */
    private static void Login(Socket socket, BufferedWriter bw, BufferedReader br) throws IOException{……}
 
 
  /**
     * 发送消息功能实现
     * @param username 用户名
     * @param bw 用于向服务器发送信息的BufferedWriter对象
     * @param br 用于从服务器接收信息的BufferedReader对象
     * @throws IOException 与服务器通信中可能抛出的异常
     */
    private static void SendMessage(String username, BufferedWriter bw, BufferedReader br) throws IOException{……}
}
```
 



 


### （四）ClientChatRunnable 类
 


```java
/**
 * 实现Runnable接口的客户端聊天类
 * 该类的实例可以通过Thread进行启动，以实现并发处理服务器消息的功能
 */
public class ClientChatRunnable implements Runnable {
 
    /**
     * 用于客户端与服务器之间的通信套接字
     */
    Socket socket;
 
    /**
     * 构造函数，初始化客户端通信套接字
     * @param socket 客户端与服务器通信的套接字对象
     */
    public ClientChatRunnable(Socket socket) {
        this.socket = socket;
    }
 
    /**
     * 实现Runnable接口的run方法
     * 该方法不断监听来自服务器的消息，并将其打印到控制台
     * 注意：该循环不会停止，确保持续接收消息
     */
    @Override
    public void run() {……}
}
```
 


---



**至此，项目完成！**
 


![](https://i-blog.csdnimg.cn/direct/3879ee3735e644e99e07bedfcf0ba1d0.gif)
 


**~码文不易，点个赞支持一下吧~**

---
> 原文链接: [记录：基于 TCP 协议的控制台版网络聊天室](https://blog.csdn.net/2401_88959292/article/details/144873575?spm=1001.2014.3001.5501)
> 作者: Yilena
