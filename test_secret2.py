
import base64
import hmac
import hashlib

original_payload = "eyJyb2xlIjoidXNlciIsInVpZCI6ImQ2Yjg4OTBmYmQzOTQ1NjBiZjk3OWRlYjVjMDVkZjc3IiwidXNlcm5hbWUiOiJhYWEifQ"
original_timestamp = "acdBtw"
original_signature = "TizbaPtvU5gyzcLdh1rrK7il3Ko"

test_secrets = ["ctfplus.cn", "challenge.ctfplus.cn", "8080-e1457612-38b6-4579-93e7-be6a1d0a4142", "openclaw", "session", "itsdangerous"]

for secret in test_secrets:
    signature = hmac.new(secret.encode(), f"{original_payload}.{original_timestamp}".encode(), hashlib.sha1)
    encoded = base64.b64encode(signature.digest()).rstrip(b'=').decode()
    print(f"{secret}: {encoded}")
    if encoded == original_signature:
        print(f"MATCH FOUND! {secret}")
