from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import psutil

from sanitization import sanitize_test_file
from evidence import generate_evidence_hash
from certificate import create_certificate


app = Flask(__name__)
CORS(app)


last_result = None
last_evidence_hash = None


@app.route("/")
def home():
    return "TrustWipe Backend is Running!"


@app.route("/device")
def device_info():
    partitions = psutil.disk_partitions()
    devices = []

    for partition in partitions:
        try:
            usage = psutil.disk_usage(partition.mountpoint)

            devices.append({
                "device": partition.device,
                "mountpoint": partition.mountpoint,
                "filesystem": partition.fstype,
                "total_gb": round(usage.total / (1024 ** 3), 2),
                "used_gb": round(usage.used / (1024 ** 3), 2),
                "free_gb": round(usage.free / (1024 ** 3), 2)
            })

        except PermissionError:
            continue

    return jsonify(devices)


@app.route("/sanitize", methods=["POST"])
def sanitize():
    global last_result, last_evidence_hash

    data = request.get_json(silent=True) or {}

    filename = data.get("filename", "").strip()

    if not filename:
        return jsonify({
            "status": "failed",
            "message": "No test file selected"
        }), 400

    # Only allow filenames, not arbitrary system paths
    safe_name = os.path.basename(filename)

    file_path = os.path.join(
        "test_data",
        safe_name
    )

    result = sanitize_test_file(file_path)

    # File does not exist or sanitization failed
    if result["status"] == "failed":
        return jsonify({
            "status": "failed",
            "message": result["message"],
            "result": result
        }), 404

    # Generate evidence only after successful sanitization
    evidence = {
        "sanitization_result": result,
        "filename": safe_name
    }

    evidence_hash = generate_evidence_hash(evidence)

    last_result = result
    last_evidence_hash = evidence_hash

    return jsonify({
        "status": "completed",
        "result": result,
        "evidence_hash": evidence_hash
    })


@app.route("/certificate", methods=["POST"])
def generate_certificate():

    if last_result is None or last_evidence_hash is None:
        return jsonify({
            "status": "failed",
            "message": "Please complete sanitization first."
        }), 400

    certificate = create_certificate(
        last_result,
        last_evidence_hash
    )

    return jsonify({
        "status": "completed",
        "certificate": certificate
    })


if __name__ == "__main__":
    app.run(debug=True)