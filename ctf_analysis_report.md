# CTF 题目分析报告

## 题目信息
- URL: http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn/
- 提示: Flask Web 应用，有仅管理员可访问的备份读取接口，存在逻辑缺陷

## 发现的路由
- `/` - 首页（登录）
- `/login` - 登录接口
- `/register` - 注册接口
- `/dashboard` - 仪表板
- `/api/profile` - 用户资料 API
- `/api/admin` - 管理员 API（需要 admin 角色）
- `/../` - 目录遍历（返回 200）

## 发现的逻辑缺陷

### 1. 用户名大小写问题
- 注册 `admin` 返回 400（被禁止）
- 注册 `admiN`、`ADMiN`、`aDMin` 等可以成功
- 但这些用户都是 "user" 角色

### 2. UID 生成逻辑
- UID 是用户名的 MD5 哈希
- 注册 `admiN` 得到的 UID = MD5("admiN")
- 数据库中可能有重复的 "admin" 用户（小写）

### 3. Session 保持问题
- POST /login 可以成功登录
- 但 GET 请求无法保持 session
- Session 似乎无法在请求间传递

### 4. 管理员 API 访问
- /api/admin 返回 403 "Access Denied: Admin role required"
- 需要真正的管理员角色才能访问

## 测试过的方法

### ✅ 已测试
- 用户名大小写变体（admiN, ADMiN, aDMin 等）
- 所有已知 UID 的登录
- 目录遍历攻击
- 备份文件路径猜测
- API 路由枚举
- 特殊 UID 值（admin, null, undefined）
- Cookie/Session 伪造

### ❌ 未发现
- 管理员权限
- 备份接口访问
- Flag

## 可能的攻击方向

### 方向 1: 用户名逻辑漏洞深入
可能的逻辑：
1. 注册时 `username.lower()` 存储到数据库，但 `MD5(username)` 作为 UID
2. 某个特定的大小写组合会触发管理员权限

需要测试：所有可能的大小写组合

### 方向 2: 管理员用户已存在
数据库中可能已经有一个 admin 用户，需要找到：
- 它的 UID（可能是 MD5("admin") 或其他）
- 或者某种方式激活它

### 方向 3: 备份接口的特殊触发
备份接口可能在特定条件下出现：
- 特定的用户名
- 特定的 UID
- 特定的请求参数
- 特定的时间或条件

### 方向 4: Session 伪造或利用
虽然 session 无法保持，但可能：
- 某种 session 格式可以绕过检查
- 或某种 session 注入

## 建议的下一步

1. **深入测试用户名逻辑**
   - 尝试所有可能的 "admin" 大小写组合
   - 检查是否有某种组合会触发管理员权限

2. **分析注册响应**
   - 检查注册 "admin" 变体时的完整响应
   - 可能隐藏了某些信息

3. **检查 /api/admin 的完整行为**
   - 测试不同的 HTTP 方法
   - 测试不同的参数组合
   - 测试不同的 Content-Type

4. **深入测试目录遍历**
   - /../ 返回 200，可能有其他文件
   - 尝试更多可能的文件名

5. **查看 JavaScript 代码**
   - dashboard 有 refreshProfile() 函数
   - 可能有隐藏的逻辑

## 关键发现

1. **POST /login 有效**
   - 可以成功登录
   - 但登录后无法访问 /api/admin

2. **目录遍历存在**
   - /../ 返回 200
   - 但访问具体文件返回 404

3. **角色检查严格**
   - /api/admin 明确返回 "Admin role required"
   - 需要真正的 admin 角色

## 总结

这个题目最可能的漏洞是：
**用户名大小写逻辑漏洞**，需要找到某种特定的大小写组合，使得：
1. 注册成功
2. 角色为 admin
3. 可以访问 /api/admin

或者，需要找到已经存在的管理员用户的正确 UID。

目前未能找到 flag，需要更深入的分析或尝试其他方向。
