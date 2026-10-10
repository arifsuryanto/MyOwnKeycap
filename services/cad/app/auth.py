import os
import hmac
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

API_KEY_HEADER = APIKeyHeader(name="X-CAD-Secret", auto_error=False)

def verify_shared_secret(api_key: str = Security(API_KEY_HEADER)):
    expected_secret = os.getenv("CAD_SHARED_SECRET", "dev_cad_secret")
    if not api_key or not hmac.compare_digest(api_key, expected_secret):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing CAD shared secret",
        )
    return True
