import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 发现的所有路由测试")
print(f"[*] Target: {BASE_URL}")
print()

# 发现的路由
routes = [
    "/",
    "/login",
    "/register",
    "/dashboard",
    "/api/profile",
]

# 首先登录
uid = "3553c1effa0b4698895a4874cfbd86d8"
session.post(f"{BASE_URL}/login", data={"uid": uid})

print(f"[*] 已登录 ADMiN")
print()

# 测试1: GET 每个路由
print("[*] 测试1: GET 所有路由")

for route in routes:
    resp = session.get(f"{BASE_URL}{route}")
    print(f"    GET {route}: {resp.status_code}")
    
    if resp.status_code != 404:
        # 提取链接
        links = re.findall(r'href=["\']([^"\']+)["\']', resp.text)
        if links:
            print(f"        Links: {links}")

print()

# 测试2: POST 每个路由
print("[*] 测试2: POST 所有路由")

for route in routes:
    resp = session.post(f"{BASE_URL}{route}", data={"uid": uid})
    print(f"    POST {route}: {resp.status_code}")
    
    if resp.status_code != 404 and resp.status_code != 405:
        print(f"        {resp.text[:300]}")

print()

# 测试3: 检查所有路由的所有可能子路径
print("[*] 测试3:：检查子路径")

subpaths = [
    "/backup",
    "/backup.zip",
    "/backup.txt",
    "/admin",
    "/admin/backup",
    "/admin/backup.zip",
    "/api",
    "/api/backup",
    "/api/admin",
    "/api/admin/backup",
    "/static",
    "/static/backup",
    "/static/backup.zip",
    "/flag",
    "/flag.txt",
]

for path in subpaths:
    resp = session.get(f"{BASE_URL}{path}")
    if resp.status_code != 404:
        print(f"    [+] {path}: {resp.status_code}")
        print(f"    {resp.text[:300]}")

print()

# 测试4: 检查 dashboard 的响应
print("[*] 测试4: 深入分析 dashboard")

resp = session.get(f"{BASE_URL}/dashboard")
print(f"    /dashboard: {resp.status_code}")

# 保存到文件
with open("dashboard_analysis.html", "w", encoding="utf-8") as f:
    f.write(resp.text)
print(f"    [+] 保存到 dashboard_analysis.html")

# 检查 disabled 按钮
if "disabled" in resp.text:
    print(f"    [-] 发现 disabled 按钮")
else:
    print(f"    [!!!] 没有 disabled 按钮!")
    print(f"    [!!!] 可能是管理员!")

# 检查备份相关
if "backup" in resp.text.lower():
    print(f"    [+] 发现 backup 关键词")

print()

print("[*] 测试完成")
