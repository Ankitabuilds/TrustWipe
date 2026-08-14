import hashlib
import json


def generate_evidence_hash(evidence):
    evidence_string = json.dumps(
        evidence,
        sort_keys=True
    )

    return hashlib.sha256(
        evidence_string.encode("utf-8")
    ).hexdigest()