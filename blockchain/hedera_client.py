# blockchain/hedera_client.py
import os
import json
import hashlib
from datetime import datetime, timezone

import requests
from dotenv import load_dotenv

load_dotenv()

HEDERA_SERVICE_URL = os.getenv("HEDERA_SERVICE_URL", "http://127.0.0.1:8787")
HEDERA_TOPIC_ID = os.getenv("HEDERA_TOPIC_ID")

def _sha256_hex(obj: dict) -> str:
    data = json.dumps(obj, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(data).hexdigest()

def publish_prediction(payload: dict) -> dict:
    """
    يرسل التنبؤ إلى خدمة Node (server.js) لنشره على Hedera HCS.
    تأكد أن HEDERA_TOPIC_ID موجود في .env وأن server.js شغال.
    """
    if not HEDERA_TOPIC_ID:
        return {"ok": False, "error": "HEDERA_TOPIC_ID not set in .env"}

    body = {
        "topicId": HEDERA_TOPIC_ID,
        "message": {
            "type": "PORTFLOW_PREDICTION",
            "hash": _sha256_hex(payload),
            "ts": datetime.now(timezone.utc).isoformat(),
            "data": payload,
        },
    }

    try:
        r = requests.post(f"{HEDERA_SERVICE_URL}/hcs/publish", json=body, timeout=15)
        r.raise_for_status()
        return r.json()
    except requests.RequestException as e:
        return {"ok": False, "error": f"publish failed: {e}"}
