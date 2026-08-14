from flask import Flask, jsonify
import psutil
from sanitization import sanitize_test_file

app = Flask(__name__)


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
    result = sanitize_test_file("test_data/sample.txt")
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)