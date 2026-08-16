const API_URL = "http://127.0.0.1:5000";

let sanitizationResult = null;


// -----------------------------
// Load Device Information
// -----------------------------
async function loadDeviceInfo() {

    try {

        const response = await fetch(`${API_URL}/device`);

        if (!response.ok) {
            throw new Error("Failed to get device information");
        }

        const devices = await response.json();

        if (devices.length === 0) {
            document.getElementById("deviceInfo").innerHTML =
                "No device information available.";
            return;
        }

        const device = devices[0];

        document.getElementById("deviceInfo").innerHTML = `
            <p><strong>Device:</strong> ${device.device}</p>
            <p><strong>Mountpoint:</strong> ${device.mountpoint}</p>
            <p><strong>Filesystem:</strong> ${device.filesystem}</p>
            <p><strong>Total:</strong> ${device.total_gb} GB</p>
            <p><strong>Used:</strong> ${device.used_gb} GB</p>
            <p><strong>Free:</strong> ${device.free_gb} GB</p>
        `;

    } catch (error) {

        console.error(error);

        document.getElementById("deviceInfo").innerHTML =
            "Unable to connect to TrustWipe backend.";
    }
}


// -----------------------------
// Start Sanitization
// -----------------------------
async function startSanitization() {

    document.getElementById("status").innerHTML =
        "Sanitization in Progress...";

    document.getElementById("progressBar").style.width = "30%";
    document.getElementById("progressText").innerHTML = "Processing...";

    // Reset verification and certificate states
    document.getElementById("verifyStatus").innerHTML =
        "Verification Pending";

    document.getElementById("certificateStatus").innerHTML =
        "No Certificate Generated";

    sanitizationResult = null;

    try {

        const response = await fetch(`${API_URL}/sanitize`, {
            method: "POST"
        });

        const result = await response.json();

        sanitizationResult = result;

        if (!response.ok || result.result.status === "failed") {

            document.getElementById("status").innerHTML =
                "❌ Sanitization Failed";

            document.getElementById("progressText").innerHTML =
                "Failed";

            sanitizationResult = null;

            return;
        }

        document.getElementById("progressBar").style.width = "100%";

        document.getElementById("progressText").innerHTML =
            "100%";

        document.getElementById("status").innerHTML =
            "✅ Sanitization Completed Successfully";

    } catch (error) {

        console.error(error);

        document.getElementById("status").innerHTML =
            "❌ Cannot connect to TrustWipe backend.";

        document.getElementById("progressText").innerHTML =
            "Connection Failed";
    }
}


// -----------------------------
// Verification
// -----------------------------
function verifyData() {

    if (!sanitizationResult) {

        document.getElementById("verifyStatus").innerHTML =
            "⚠️ Please run sanitization first.";

        return;
    }

    if (
        sanitizationResult.result &&
        sanitizationResult.result.status === "completed"
    ) {

        document.getElementById("verifyStatus").innerHTML =
            "✅ Verification Successful";

    } else {

        document.getElementById("verifyStatus").innerHTML =
            "❌ Verification Failed";
    }
}


// -----------------------------
// Certificate
// -----------------------------
function generateCertificate() {

    if (!sanitizationResult) {

        document.getElementById("certificateStatus").innerHTML =
            "⚠️ Please run sanitization first.";

        return;
    }

    if (
        sanitizationResult.certificate &&
        sanitizationResult.certificate.status === "completed"
    ) {

        document.getElementById("certificateStatus").innerHTML =
            "✅ Certificate Generated<br>" +
            "Project: " +
            sanitizationResult.certificate.project +
            "<br>" +
            "Evidence Hash: " +
            sanitizationResult.evidence_hash;

    } else {

        document.getElementById("certificateStatus").innerHTML =
            "❌ Certificate generation failed.";
    }
}


// -----------------------------
// Load device information
// -----------------------------
window.addEventListener("DOMContentLoaded", loadDeviceInfo);