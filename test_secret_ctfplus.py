
import base64
import hmac
import hashlib

original_payload = "eyJyb2xlIjoidXNlciIsInVpZCI6ImQ2Yjg4OTBmYmQzOTQ1NjBiZjk3OWRlYjVjMDVkZjc3IiwidXNlcm5hbWUiOiJhYWEifQ"
original_timestamp = "acdBtw"
original_signature = "TizbaPtvU5gyzcLdh1rrK7il3Ko"

secret = "ctfplusctfplus"
signature = hmac.new(secret.encode(), f"{original_payload}.{original_timestamp}".encode(), hashlib.sha1)
encoded = base64.b64encode(signature.digest()).rstrip(b'=').decode()
print(f"{secret}: {encoded}")

secret = "ctf"
signature = hmac.new(secret.encode(), f"{original_payload}.{original_timestamp}".encode(), hashlib.sha1)
encoded = base64.b64encode(signature.digest()).rstrip(b'=').decode()
print(f"{secret}: {encoded}")

secret = "CTFplus"
signature = hmac.new(secret.encode(), f"{original_payload}.{original_timestamp}".encode(), hashlib.sha1)
encoded = base64.b64encode(signature.digest()).rstrip(b'=').decode()
print(f"{secret}: {encoded}")

secret = "CHANGEME"
signature = hmac.new(secret.encode(), f"{original_payload}.{original_timestamp}".encode(), hashlib.sha1)
encoded = base64.b64encode(signature.digest()).rstrip(b'=').decode()
print(f"{secret}: {encoded}")
