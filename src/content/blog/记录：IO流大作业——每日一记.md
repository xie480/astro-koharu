---
"title": "记录：IO流大作业——每日一记"
"link": "ji-lu-ioliu-da-zuo-ye-mei-ri-yi-ji"
"author": "Yilena"
"date": "2024-12-25"
"description": "本文记录了一个基于Java IO流的控制台版\"每日一记\"大作业的完整实现过程。项目涵盖了日记的添加、修改、删除、导入导出等核心功能，并详细介绍了字节流、字符流、缓冲流、转化流、对象流等各类IO流的特点与应用场景。通过具体的代码示例，展示了如何利用GUI组件（如JFrame、JTextField等）构建用户界面，以及如何通过事件监听器实现用户交互与数据持久化操作，为初学者掌握Java IO流与GUI编程提供了生动的实践案例。"
"cover": "https://i-blog.csdnimg.cn/direct/f899eaa037c4458fa60941c9ad6d122c.gif"
"tags":
  - "Java"
  - "IO流"
  - "GUI编程"
"categories":
  - "杂记"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/144703528?spm=1001.2014.3001.5501"
---

**目录**
 



 


[一、项目需求介绍](#t0)
 


[（一）添加界面](#t1)
 


[（二）主界面](#t2)
 


[（三）修改界面](#t3)
 


[二、IO 流介绍](#t4)
 



 


[三、项目实现过程](#t5)
 


[数据操作的实现](#t6)
 



 


[数据加载的实现](#t7)
 


[（一）添加界面](#t8)
 


[1.初始化界面](#t9)
 


[2.保存按钮的实现](#t10)
 


[3.取消按钮的实现](#t11)
 


[（二）主界面](#t12)
 


[1.初始化界面](#t13)
 


[2.添加功能的实现](#t14)
 


[3.修改功能的实现](#t15)
 


[4.删除功能的实现](#t16)
 


[5.子菜单导出的实现](#t17)
 


[6.子菜单栏导入的实现](#t18)
 


[（三）修改界面](#t19)
 


[1.初始化界面](#t20)
 


[2.修改按钮的实现](#t21)
 


[3.取消按钮的实现](#t22)
 


---




 


## 一、项目需求介绍
 



 


*ps：本项目重点考察 IO 流的熟练掌握情况，所以没有使用 Hutool 工具包以及 commons 工具包*
 



 


![](https://i-blog.csdnimg.cn/direct/f899eaa037c4458fa60941c9ad6d122c.gif)
 


### （一）添加界面
 



 


![](https://i-blog.csdnimg.cn/direct/82f8b4d355ba4bdea7cae2439c1f7dde.png)
 


**功能需求：**
 


- 保存按钮：点击后即刻将内容以及当前时间输入到存档 TXT 文件中，并跳转到主界面
- 取消按钮：点击后即刻跳出弹窗提醒用户未保存，点击“确定退出”后跳转到主界面




 


### （二）主界面
 



 


![](https://i-blog.csdnimg.cn/direct/e4e06e256f5c4f1f8aa07acc8441fdf0.png)
 



 


**功能需求：**
 


- 添加按钮：点击后即刻跳转到添加界面
- 修改按钮：点击后加载当前选中的数据并跳转到修改界面
- 删除按钮：点击后删除当前选中的数据
- 子菜单导出：点击后即刻将目前的数据压缩成一个 ZIP 文件
- 子菜单导入：点击后即刻跳出弹窗让用户选择路径下的文件进行读取数据然后输入到项目当中




 


### （三）修改界面
 



 


![](https://i-blog.csdnimg.cn/direct/bf66217b1a1b40e790f342df72668803.png)
 



 


**功能需求：**
 


- 修改按钮：点击后即刻将内容以及当前时间输入到存档 TXT 文件中进行覆盖，并跳转到主界面
- 取消按钮：点击后即刻跳出弹窗提醒用户未保存，点击“确定退出”后跳转到主界面



---




 


## 二、IO 流介绍
 



 


在开始说明项目实现过程之前，让我们先对本次项目主要使用到的 IO 流进行简单的讲解吧。
 


![](https://i-blog.csdnimg.cn/direct/a782d56bca074294b505e52620b6fb5a.jpeg)                                 ![](https://i-blog.csdnimg.cn/direct/8870cf2eaaba4229bb91a1a77c82765c.jpeg)
 


> 
>  IO 流 
>   
>  在 Java 中，IO 流（Input/Output streams）用于处理数据的读取和写入。 
>   
>  其中主要包含以下几种流： 
>  字节流字符流缓冲流转化流对象流打印流压缩流&解压流
> 
 


> 
>  字节流 
>   
>  字节流（Byte Stream）是 Java 中用于处理 所有类型数据（如文本、图片、音频等）的输入输出流。字节流以 字节 为单位进行读取和写入，不会对数据进行编码或解码，因此适用于任何类型的数据。 
>   
>  字节流的主要类 
>   InputStream（输入流）：用于读取数据。 
>    FileInputStream：从文件中读取字节数据。BufferedInputStream：为其他字节流提供缓冲功能，提高读取效率。ByteArrayInputStream：从内存中的字节数组读取数据。 OutputStream（输出流）：用于写入数据。 
>    FileOutputStream：将字节数据写入文件。BufferedOutputStream：为其他字节流提供缓冲功能，提高写入效率。ByteArrayOutputStream：将数据写入内存中的字节数组。
>   
>  字节流的特点 
>  以字节为单位：字节流是最基础的流，处理原始的字节数据，适合处理所有类型的数据。无字符编码：字节流不会进行字符编码和解码，直接操作字节，因此适用于二进制数据（如图片、视频、音频等）和文本数据。
> 
 


> 
>  字符流 
>   
>  字符流（Character Stream）是 Java 中用于处理 文本数据（如字符串、字符等）的输入输出流。与字节流不同，字符流是以 字符（而非字节）为单位进行读取和写入，它会自动进行字符的编码和解码（通常使用 UTF-8 或系统默认编码）。 
>   
>  字符流的主要类 
>   Reader（字符输入流）：用于读取字符数据。 
>    FileReader：从文件中读取字符数据。BufferedReader：提供缓冲功能的字符输入流，适用于高效读取文本行。CharArrayReader：从字符数组中读取数据。 Writer（字符输出流）：用于写入字符数据。 
>    FileWriter：将字符数据写入文件。BufferedWriter：为字符输出流提供缓冲功能，提升写入效率。CharArrayWriter：将字符数据写入内存中的字符数组。
>   
>  字符流的特点
以字符为单位：字符流是专门处理字符数据的流，适用于文本文件和字符串数据。自动字符编码和解码：字符流会根据编码格式（如 UTF-8、GBK 等）自动进行字符的编码和解码，因此适合处理文本文件。
> 
 


> 
>  缓冲流 
>   
>  缓冲流（Buffered Stream）是 Java 中提供的一种高效的输入输出流，它通过增加缓冲区来减少对实际 I/O 操作的频繁访问，从而提高数据读写的效率。 
>   
>  缓冲流的特点 
>  提高效率：缓冲流通过在内存中维护一个缓冲区，减少了与底层设备（如磁盘、网络）之间的频繁交互，能显著提高文件读写的效率。适合大数据量操作：当读取或写入大量数据时，缓冲流会通过批量读取和写入操作，显著提升性能。自动缓存机制：在读取时，缓冲流会先将数据加载到缓冲区，之后程序从内存中读取数据，减少了对文件的频繁访问；在写入时，它会先将数据写入缓冲区，直到缓冲区满了才将数据一次性写入文件。
>   
>  常用的缓冲流类 
>  BufferedInputStream：为字节输入流提供缓冲。BufferedOutputStream：为字节输出流提供缓冲。BufferedReader：为字符输入流提供缓冲，常用于按行读取文本文件。BufferedWriter：为字符输出流提供缓冲，常用于按行写入文本文件。
>   
>  缓冲流的工作原理 
>  缓冲流工作时，会将数据分批读入内存缓冲区，读写操作会先发生在内存中，而非直接与磁盘或其他设备交互。直到缓冲区满时，数据才会批量写入或从中读取。这种方式减少了不必要的 I/O 操作，提高了效率。 
> 
 


> 
>  转化流 
>   
>  转化流（Converter Stream）是 Java I/O 中的一种特殊流，用于在字节流和字符流之间进行转换。字节流是以字节为单位处理数据，而字符流是以字符为单位处理数据。转化流的作用是使得字节流可以按字符流的方式进行处理，从而实现字节与字符之间的转换。 
>   
>  转化流的主要类： 
>  InputStreamReader：字节流转字符流的桥梁，用于将字节流（InputStream）转换为字符流（Reader）。OutputStreamWriter：字符流转字节流的桥梁，用于将字符流（Writer）转换为字节流（OutputStream）。
>   
>  转化流的工作原理： 
>  InputStreamReader 会根据指定的字符编码，将字节数据转换为字符数据。它通常用于从字节流读取数据并将其转换为字符格式。OutputStreamWriter 会根据指定的字符编码，将字符数据转换为字节数据，然后写入到字节流。
> 
 


> 
>  对象流 
>   
>  对象流（Object Stream）是 Java I/O 中的一种特殊流，用于在流中写入和读取 Java 对象。对象流能够处理对象的序列化和反序列化，支持将对象转化为字节流并在需要时恢复原始对象。 
>   
>  对象流主要有两个类： 
>  ObjectOutputStream：用于将 Java 对象写入流中（序列化）。ObjectInputStream：用于从流中读取对象并将其恢复为原始对象（反序列化）。
>   
>  工作原理： 
>  序列化：将 Java 对象转化为字节流的过程，使用 ObjectOutputStream 完成。反序列化：将字节流恢复为 Java 对象的过程，使用 ObjectInputStream 完成。
>   
>  要求： 
>  被序列化的对象必须实现 Serializable 接口（或者 Externalizable 接口）。这是为了告诉 Java 该对象支持序列化操作。
> 
 


> 
>  打印流 
>   
>  打印流（PrintStream 和 PrintWriter）是 Java I/O 中的一种特殊流，主要用于方便地输出数据，尤其是将数据以易读的格式（如文本）打印到控制台或文件。打印流的特点是可以直接打印各种类型的数据（如整数、浮点数、字符串等），并且自动处理字符编码。 
>   
>  主要特点： 
>  自动转换：PrintStream 和 PrintWriter 可以直接将不同数据类型（如 int, double, String 等）转换为字符串形式并输出。支持自动换行：在打印时，打印流会自动处理换行符，默认情况下每次打印后会输出一个换行。不需要显式地调用 flush() 或 close()（虽然可以调用），流会在合适的时候自动刷新输出。
>   
>  主要类： 
>  PrintStream：用于字节流的打印流，可以将数据打印到控制台、文件或其他输出流。PrintWriter：用于字符流的打印流，可以将数据打印到字符流（如控制台或文件）。
>   
>  主要方法： 
>  print()：打印数据，不自动换行。println()：打印数据并换行。printf()：支持格式化输出。
> 
 


> 
>  压缩流&解压流 
>   
>  压缩流和解压流是 Java I/O 中用于处理数据压缩和解压缩的流，它们通常用于减少存储或传输数据的大小。Java 提供了一些类来实现数据的压缩和解压操作，主要通过字节流进行处理。 
>   
>  1. 压缩流 (DeflaterOutputStream) 
>  压缩流用于将数据压缩后输出，减少数据的大小。最常用的类是 DeflaterOutputStream。 
>  DeflaterOutputStream：这个类用于将数据压缩并写入目标输出流。它基于 Deflater 类实现，可以将数据按特定的算法（如 DEFLATE 算法）进行压缩。
>   
>  2. 解压流 (InflaterInputStream) 
>  解压流用于从压缩数据中恢复原始数据。最常用的类是 InflaterInputStream。 
>  InflaterInputStream：这个类用于读取压缩的数据并解压缩。它基于 Inflater 类实现，可以读取压缩格式的文件并将数据解压。
> 
 


---



### 
 


## 三、项目实现过程
 



 


### 数据操作的实现
 


创建一个 Message 对象集合进行数据存储以及读取。
 


然后我们得自己写 addMessage 和 WriteMessage 方法来方便我们进行操作。
 


对于修改数据以及删除数据也需要相应的方法。
 


具体实现代码如下：
 


```java
public class Message {
 
    private static ArrayList<Message> messages = new ArrayList<>();
 
    private String time;
    private String title;
    private String content;
 
    public Message() {
    }
 
    public Message(String time, String title, String content) {
        this.time = time;
        this.title = title;
        this.content = content;
    }
 
    /**
     * 获取
     * @return time
     */
    public String getTime() {
        return this.time;
    }
 
    /**
     * 设置
     * @param time
     */
    public void setTime(String time) {
        this.time = time;
    }
 
    /**
     * 获取
     * @return title
     */
    public String getTitle() {
        return title;
    }
 
    /**
     * 设置
     * @param title
     */
    public void setTitle(String title) {
        this.title = title;
    }
 
    /**
     * 获取
     * @return content
     */
    public String getContent() {
        return content;
    }
 
    /**
     * 设置
     * @param content
     */
    public void setContent(String content) {
        this.content = content;
    }
 
    public String toString() {
        return "time=" + time + "&title=" + title + "&content=" + content;
    }
 
    public void addMessage(Message message){
        messages.add(message);
    }
 
    public void WriteMessage() throws IOException {
        BufferedWriter fileWriter = new BufferedWriter(new FileWriter("TEST.TXT"));
        for (Message m : messages) {
            fileWriter.write(m.toString());
            fileWriter.newLine();
            fileWriter.flush();
        }
    }
 
    public void deleteMessage(String time) throws IOException {
        messages.removeIf(m -> m.getTime().equals(time));
        WriteMessage();
    }
 
    public void setMessage(String time1,String time,String title,String content) throws IOException {
        deleteMessage(time1);
        messages.add(new Message(time,title,content));
        WriteMessage();
    }
}
```
 


---



### 
 


### 数据加载的实现
 



 


在每次运行程序时，我们都应该提前将文档中的数据进行加载，我专门写了一个类来实现。
 


原理也很简单，每读取一行就将其放入对象集合中即可。
 


注意我们文档数据存放的格式是像 time=2024-12-23@12:12:12&title=1&=2 这样的，方便统一管理以及后续操作。
 


具体实现代码如下：
 


```java
public class ReadFile {
    public ReadFile() throws IOException {
        BufferedReader br = new BufferedReader(new FileReader("DiaryMessage.txt"));
        String line;
        while ((line = br.readLine()) != null) {
            //time=2024-12-23@12:12:12&title=1&content=2
            Message message = new Message(line.split("&")[0].split("=")[1], line.split("&")[1].split("=")[1], line.split("&")[2].split("=")[1]);
            message.addMessage(message);
        }
        br.close();
    }
}
```
 


---



### （一）添加界面
 



 


#### 1.界面
 



 


这里都是基本模板就不做过多的说明了，直接运用 GUI 图像编程知识即可，废话不多说直接上代码。
 


```java
public class AddJFrame extends JFrame {
 
    JTextField titleText  = new JTextField();
    JTextArea contentText = new JTextArea();
    JButton save = new JButton("保存");
    JButton cancel = new JButton("取消");
 
    Message message = new Message();
 
     public AddJFrame() {
        //初始化界面
        initJFrame();
        //添加组件
        initFunction();
        this.setVisible(true);
    }
 
 
    private void initJFrame(){
        this.setTitle("每日一记");
        this.setSize(600, 600);
        this.setAlwaysOnTop(true);
        this.setLocationRelativeTo(null);
        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        this.setLayout(null);
        this.getContentPane().setBackground(Color.LIGHT_GRAY);
    }
 
private void initFunction(){
        JLabel title = new JLabel("每日一记");
        title.setBounds(220, 20, 584, 50);
        title.setFont(new Font("宋体", Font.BOLD, 32));
        this.getContentPane().add(title);
 
        JLabel subject = new JLabel("标题");
        subject.setBounds(70,90,100,30);
        subject.setFont(new Font("宋体",Font.PLAIN,16));
        this.getContentPane().add(subject);
 
        JLabel content = new JLabel("内容");
        content.setBounds(70,140,100,30);
        content.setFont(new Font("宋体",Font.PLAIN,16));
        this.getContentPane().add(content);
 
        titleText.setBounds(120,90,426,30);
        titleText.setFont(new Font("宋体",Font.PLAIN,16));
        this.getContentPane().add(titleText);
 
        contentText.setBounds(120,140,426,300);
        contentText.setFont(new Font("宋体",Font.PLAIN,16));
        contentText.setLineWrap(true);
        contentText.setWrapStyleWord(true);
        this.getContentPane().add(contentText);
 
        save.setBounds(132,466,140,40);
        save.setFont(new Font("宋体",Font.PLAIN,24));
        this.getContentPane().add(save);
 
        cancel.setBounds(312,466,140,40);
        cancel.setFont(new Font("宋体",Font.PLAIN,24));
        this.getContentPane().add(cancel);
    }
}
```
 



 


#### 2.保存按钮的实现
 



 


首先要判断输入正确性，若标题或内容为空则跳出弹窗警告，
 


然后用 Date 类获取当前时间，然后用 SimpleDateFormat 类规范一下格式成为编号，
 


最后写入数据再跳转到主界面即可。
 


具体代码如下：
 


```java
private class JButtonActionListener implements ActionListener{
 
        @Override
        public void actionPerformed(ActionEvent e) {
            if(e.getSource() == save){
                if(titleText.getText().isEmpty() || contentText.getText().isEmpty()){
                    JFrame warn = new JFrame();
                    warn.setLocationRelativeTo(null);
                    warn.setAlwaysOnTop(true);
                    warn.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
                    JOptionPane.showMessageDialog(warn, "标题或内容不能为空！", "警告", JOptionPane.WARNING_MESSAGE);
                    return;
                }
                SimpleDateFormat timeNow = new SimpleDateFormat("yyyy-MM-dd@HH:mm:ss");
                Date now = new Date();
                message.addMessage(new Message(timeNow.format(now),titleText.getText(),contentText.getText()));
                try {
                    message.WriteMessage();
                    AddJFrame.this.dispose();
                    new NoteJFrame();
                } catch (IOException ex) {
                    throw new RuntimeException(ex);
                }
            }
}
```
 



 


#### 3.取消按钮的实现
 



 


这个也很简单，使用窗口监听，先跳出弹窗提醒用户是否确认退出，然后再跳转到主界面即可。
 


具体实现代码如下：
 


```java
 private class JButtonActionListener implements ActionListener{
 
        @Override
        public void actionPerformed(ActionEvent e) {
           if(e.getSource() == cancel){
                JFrame warn = new JFrame();
                warn.setLocationRelativeTo(null);
                warn.setAlwaysOnTop(true);
                warn.setDefaultCloseOperation(JFrame.HIDE_ON_CLOSE);
                int result = JOptionPane.showConfirmDialog(warn, "添加未保存，确定退出？", "退出", JOptionPane.YES_NO_OPTION);
                AddJFrame.this.dispose();
                try {
                    new NoteJFrame();
                } catch (IOException ex) {
                    throw new RuntimeException(ex);
                }
            }
        }
    }
 
 private  class JFrameClose extends WindowAdapter {
        public void windowClosing(WindowEvent e){
                JFrame warn = new JFrame();
                warn.setLocationRelativeTo(null);
                warn.setAlwaysOnTop(true);
                warn.setDefaultCloseOperation(JFrame.HIDE_ON_CLOSE);
                int result = JOptionPane.showConfirmDialog(warn, "内容未保存，确定退出？", "退出", JOptionPane.YES_NO_OPTION);
                if(result == JOptionPane.YES_OPTION){
                    UpDataJFrame.this.dispose();
                    try {
                        new NoteJFrame();
                    } catch (IOException ex) {
                        throw new RuntimeException(ex);
                    }
                }
        }
    }
```
 


---




 


### （二）主界面
 



 


#### 1.初始化界面
 



 


直接上代码！
 


```java
public class NoteJFrame extends JFrame {
 
    JButton add = new JButton("添加");
    JButton update = new JButton("修改");
    JButton delete = new JButton("删除");
 
    JTable table;
 
    JMenuItem exportItem = new JMenuItem("导出");
    JMenuItem importItem = new JMenuItem("导入");
 
    Object[][] tabledatas = new Object[30][3];
 
    String SelectedFile = null;
 
    int row = -1;
 
    public NoteJFrame() throws IOException {
        //初始化界面
        initFrame();
        //初始化菜单
        initJmenuBar();
        //初始化组件
        initView();
        this.setVisible(true);
    }
 
    private void initFrame() {
        this.setSize(600, 600);
        this.setTitle("每日一记");
        this.setAlwaysOnTop(true);
        this.setLocationRelativeTo(null);
        this.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
        this.setLayout(null);
        this.getContentPane().setBackground(Color.LIGHT_GRAY);
    }
 
    private void initJmenuBar() {
        JMenuBar jMenuBar = new JMenuBar();
        JMenu functionJMenu = new JMenu("功能");
 
        functionJMenu.add(exportItem);
        functionJMenu.add(importItem);
 
        jMenuBar.add(functionJMenu);
 
        jMenuBar.setBackground(Color.GRAY);
 
        this.setJMenuBar(jMenuBar);
    }
 
    private void initView(){
        JLabel title = new JLabel("每日一记");
        title.setBounds(220, 20, 584, 50);
        title.setFont(new Font("宋体", Font.BOLD, 32));
        this.getContentPane().add(title);
 
        Object[] tableTitles = {"记录时间", "标题", "正文"};
 
        addTableDatas();
 
        table = new JTable(tabledatas, tableTitles);
        table.setBounds(40, 70, 504, 380);
 
        JScrollPane jScrollPane = new JScrollPane(table);
        jScrollPane.setBounds(40, 70, 504, 380);
        this.getContentPane().add(jScrollPane);
 
        add.setBounds(40, 466, 140, 40);
        update.setBounds(222, 466, 140, 40);
        delete.setBounds(404, 466, 140, 40);
 
        add.setFont(new Font("宋体", Font.PLAIN, 24));
        update.setFont(new Font("宋体", Font.PLAIN, 24));
        delete.setFont(new Font("宋体", Font.PLAIN, 24));
 
 
        this.getContentPane().add(add);
        this.getContentPane().add(update);
        this.getContentPane().add(delete);
    }
}
```
 



 


#### 2.添加功能的实现
 



 


直接点击跳转到添加界面即可。
 


直接上代码！
 


```java
 private class JButtonActionListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            if (e.getSource() == add){
                NoteJFrame.this.dispose();
                new AddJFrame();
            }
}
```
 



 


#### 3.修改功能的实现
 



 


使用鼠标监听标记选择数据，然后记录数据所在行数，
 


然后判断操作正确性：是否有选择数据或者选择了空白数据，
 


如果操作不正确则跳出弹窗，
 


正确则跳转修改界面。
 


具体实现代码如下：
 


```java
static Message SelectedMessage = new Message(); 
 
private class JButtonActionListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
          if (e.getSource() == update){
                if(row == -1 || tabledatas[row][1] == null){
                    JFrame warn = new JFrame();
                    warn.setLocationRelativeTo(null);
                    warn.setAlwaysOnTop(true);
                    warn.setDefaultCloseOperation(JFrame.HIDE_ON_CLOSE);
                    JOptionPane.showMessageDialog(warn, "请选择要修改的内容！", "警告", JOptionPane.WARNING_MESSAGE);
                    return;
                }
                NoteJFrame.this.dispose();
                new UpDataJFrame(SelectedMessage);
            }
}
 
 private class MouseListener extends MouseAdapter{
        public void mouseClicked(MouseEvent e){
            row = table.getSelectedRow();
            if(row != -1) {
                String time = (String) table.getValueAt(row, 0);
                String title = (String) table.getValueAt(row, 1);
                String content = (String) table.getValueAt(row, 2);
                SelectedMessage.setTime(time);
                SelectedMessage.setTitle(title);
                SelectedMessage.setContent(content);
            }
        }
    }
```
 



 


#### 4.删除功能的实现
 



 


获取选中数据的时间编号后调用之前写的 deleteMessage 方法然后重新加载一下表格即可。
 


具体实现代码如下：
 


```java
 private class JButtonActionListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
        if (e.getSource() == delete){
                try {
                    SelectedMessage.deleteMessage(SelectedMessage.getTime());
                    addTableDatas();
                    NoteJFrame.this.dispose();
                    new NoteJFrame();
                } catch (IOException ex) {
                    throw new RuntimeException(ex);
                }
            }
}
 
 public static String getTime(){
        return SelectedMessage.getTime();
    }
```
 



 


#### 5.子菜单导出的实现
 



 


直接运用压缩流进行压缩即可。
 


具体实现代码如下：
 


```java
 private class JButtonActionListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
              if (e.getSource() == exportItem){
                try {
                    ZipOutputStream zos = new ZipOutputStream(new FileOutputStream("DiaryMessage.zip"));
                    zos.putNextEntry(new ZipEntry("DiaryMessage.txt"));
                    BufferedReader bfw = new BufferedReader(new FileReader("DiaryMessage.txt"));
                    String line;
                    while ((line = bfw.readLine()) != null){
                        zos.write(line.getBytes());
                    }
                    bfw.close();
                    zos.closeEntry();
                    zos.close();
                } catch (IOException ex) {
                    throw new RuntimeException(ex);
                }
            }
```
 



 


#### 6.子导入的实现
 



 


使用 JFileChooser 组件让用户选择文件，然后获取其选择的路径进行替换后重新加载即可。
 


具体实现代码如下：
 


```java
 private class JButtonActionListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
           if (e.getSource() == importItem){
                openFileChooser();
                try {
                    new ReadFile();
                    addTableDatas();
                    NoteJFrame.this.dispose();
                    new NoteJFrame();
                } catch (IOException ex) {
                    throw new RuntimeException(ex);
                }
            }
        }
}
 
 private void openFileChooser() {
        JFileChooser fileChooser = new JFileChooser();
        // 设置文件选择器的模式为文件夹选择
        fileChooser.setFileSelectionMode(JFileChooser.FILES_ONLY);
        // 打开文件选择对话框
        int result = fileChooser.showOpenDialog(this);
        // 如果用户选择了一个目录
        if (result == JFileChooser.APPROVE_OPTION) {
            File selectedDirectory = fileChooser.getSelectedFile();  // 获取用户选中的文件夹
            SelectedFile = selectedDirectory.getAbsolutePath();
            JOptionPane.showMessageDialog(this, "选择的路径是: " + SelectedFile);
        } else {
            JOptionPane.showMessageDialog(this, "没有选择文件夹");
        }
    }
```
 


---




 


### （三）修改界面
 



 


#### 1.初始化界面
 



 


由于修改界面要对选择的数据进行更改，所以我们应该使用有参构造，参数是选中的 Message 对象，然后将其数据读取加载到文本内，其他跟添加界面没有什么区别。
 


```java
public class UpDataJFrame extends JFrame {
    JTextField titleText  = new JTextField();
    JTextArea contentText = new JTextArea();
    JButton upData = new JButton("修改");
    JButton cancel = new JButton("取消");
 
    Message message = new Message();
 
    public UpDataJFrame(Message message){
        //初始化界面
        initJFrame();
        //添加组件
        initFunction();
        titleText.setText(message.getTitle());
        contentText.setText(message.getContent());
        this.setVisible(true);
    }
 
    private void initJFrame(){
        this.setTitle("每日一记");
        this.setSize(600, 600);
        this.setAlwaysOnTop(true);
        this.setLocationRelativeTo(null);
        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        this.setLayout(null);
        this.getContentPane().setBackground(Color.LIGHT_GRAY);
    }
 
    private void initFunction(){
        JLabel title = new JLabel("每日一记");
        title.setBounds(220, 20, 584, 50);
        title.setFont(new Font("宋体", Font.BOLD, 32));
        this.getContentPane().add(title);
 
        JLabel subject = new JLabel("标题");
        subject.setBounds(70,90,100,30);
        subject.setFont(new Font("宋体",Font.PLAIN,16));
        this.getContentPane().add(subject);
 
        JLabel content = new JLabel("内容");
        content.setBounds(70,140,100,30);
        content.setFont(new Font("宋体",Font.PLAIN,16));
        this.getContentPane().add(content);
 
        titleText.setBounds(120,90,426,30);
        titleText.setFont(new Font("宋体",Font.PLAIN,16));
        this.getContentPane().add(titleText);
 
        contentText.setBounds(120,140,426,300);
        contentText.setFont(new Font("宋体",Font.PLAIN,16));
        contentText.setLineWrap(true);
        contentText.setWrapStyleWord(true);
        this.getContentPane().add(contentText);
 
        upData.setBounds(132,466,140,40);
        upData.setFont(new Font("宋体",Font.PLAIN,24));
        this.getContentPane().add(upData);
 
        cancel.setBounds(312,466,140,40);
        cancel.setFont(new Font("宋体",Font.PLAIN,24));
        this.getContentPane().add(cancel);
    }
```
 



 


#### 2.修改按钮的实现
 



 


跟保存一样，首先我们需要判断输入正确性，
 


然后获取当前的时间，把当前文本输入框内的文本进行读取再重新封装成一个 Message 对象，
 


最后调用 setMessage 进行更改再重新加载界面进行刷新即可。
 


而在 setMseeage 中我覆盖的方式是直接删除旧数据再添加新数据，这样也可以实现表格有一定的排列顺序。
 


```java
 private class JButtonActionListener implements ActionListener {
 
        @Override
        public void actionPerformed(ActionEvent e) {
            if(e.getSource() == upData){
                if(titleText.getText().isEmpty() || contentText.getText().isEmpty()){
                    JFrame warn = new JFrame();
                    warn.setLocationRelativeTo(null);
                    warn.setAlwaysOnTop(true);
                    warn.setDefaultCloseOperation(JFrame.HIDE_ON_CLOSE);
                    JOptionPane.showMessageDialog(warn, "标题或内容不能为空！", "警告", JOptionPane.WARNING_MESSAGE);
                    return;
                }
                SimpleDateFormat timeNow = new SimpleDateFormat("yyyy-MM-dd@HH:mm:ss");
                Date now = new Date();
                try {
                    message.setMessage(NoteJFrame.getTime(),timeNow.format(now),titleText.getText(),contentText.getText());
                    UpDataJFrame.this.dispose();
                    new NoteJFrame();
                } catch (IOException ex) {
                    throw new RuntimeException(ex);
                }
            }
       }
}
```
 



 


#### 3.取消按钮的实现
 



 


这个就完全和添加界面的一致了。
 


```java
 private class JButtonActionListener implements ActionListener {
 
        @Override
        public void actionPerformed(ActionEvent e) {
      if(e.getSource() == cancel){
                JFrame warn = new JFrame();
                warn.setLocationRelativeTo(null);
                warn.setAlwaysOnTop(true);
                warn.setDefaultCloseOperation(JFrame.HIDE_ON_CLOSE);
                int result = JOptionPane.showConfirmDialog(warn, "修改未保存，确定退出？", "退出", JOptionPane.YES_NO_OPTION);
                if(result == JOptionPane.YES_OPTION){
                    UpDataJFrame.this.dispose();
                    try {
                        new NoteJFrame();
                    } catch (IOException ex) {
                        throw new RuntimeException(ex);
                    }
                }
            }
        }
}
 
    private  class JFrameClose extends WindowAdapter {
        public void windowClosing(WindowEvent e){
                JFrame warn = new JFrame();
                warn.setLocationRelativeTo(null);
                warn.setAlwaysOnTop(true);
                warn.setDefaultCloseOperation(JFrame.HIDE_ON_CLOSE);
                int result = JOptionPane.showConfirmDialog(warn, "修改未保存，确定退出？", "退出", JOptionPane.YES_NO_OPTION);
                if(result == JOptionPane.YES_OPTION){
                    UpDataJFrame.this.dispose();
                    try {
                        new NoteJFrame();
                    } catch (IOException ex) {
                        throw new RuntimeException(ex);
                    }
                }
        }
    }
```
 


---



**至此，项目完成！**
 


![](https://i-blog.csdnimg.cn/direct/3879ee3735e644e99e07bedfcf0ba1d0.gif)
 


**~码文不易，点个赞支持一下吧~**

---
> 原文链接: [记录：IO 流大作业——每日一记](https://blog.csdn.net/2401_88959292/article/details/144703528?spm=1001.2014.3001.5501)
> 作者: Yilena
