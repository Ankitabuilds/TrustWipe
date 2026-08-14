from datetime import datetime


def create_certificate(result, evidence_hash):
    certificate = {
        "project": "TrustWipe",
        "certificate_type": "Sanitization Certificate",
        "status": result["status"],
        "message": result["message"],
        "evidence_hash": evidence_hash,
        "timestamp": datetime.now().isoformat()
    }

    return certificate