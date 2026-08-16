const API_URL = "https://trustwipe-snzz.onrender.com";

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

    const filename = document
        .getElementById("testFile")
        .value
        .trim();

    if (!filename) {

        document.getElementById("status").innerHTML =
            "❌ Please enter a test filename.";

        return;
    }

    // Reset previous states
    sanitizationResult = null;

    document.getElementById("verifyStatus").innerHTML =
        "Verification Pending";

    document.getElementById("certificateStatus").innerHTML =
        "No Certificate Generated";

    document.getElementById("status").innerHTML =
        "Sanitization in Progress...";

    document.getElementById("progressBar").style.width =
        "30%";

    document.getElementById("progressText").innerHTML =
        "Processing...";

    try {

        const response = await fetch(`${API_URL}/sanitize`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                filename: filename
            })
        });

        const result = await response.json();

        if (!response.ok || result.status === "failed") {

            document.getElementById("status").innerHTML =
                "❌ Sanitization Failed";

            document.getElementById("progressText").innerHTML =
                result.message || "File not found";

            document.getElementById("progressBar").style.width =
                "0%";

            sanitizationResult = null;

            return;
        }

        sanitizationResult = result;

        document.getElementById("progressBar").style.width =
            "100%";

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
            "⚠️ Please run successful sanitization first.";

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
async function generateCertificate() {

    if (!sanitizationResult) {

        document.getElementById("certificateStatus").innerHTML =
            "⚠️ Please complete successful sanitization first.";

        return;
    }

    document.getElementById("certificateStatus").innerHTML =
        "⏳ Generating Certificate...";

    try {

        const response = await fetch(`${API_URL}/certificate`, {
            method: "POST"
        });

        const result = await response.json();

        if (!response.ok || result.status === "failed") {

            document.getElementById("certificateStatus").innerHTML =
                "❌ " + result.message;

            return;
        }

        const certificate = result.certificate;

        document.getElementById("certificateStatus").innerHTML =
            "✅ Certificate Generated Successfully<br><br>" +
            "<strong>Project:</strong> " +
            certificate.project +
            "<br>" +
            "<strong>Type:</strong> " +
            certificate.certificate_type +
            "<br>" +
            "<strong>Status:</strong> " +
            certificate.status +
            "<br>" +
            "<strong>Evidence Hash:</strong> " +
            certificate.evidence_hash +
            "<br>" +
            "<strong>Timestamp:</strong> " +
            certificate.timestamp;

    } catch (error) {

        console.error(error);

        document.getElementById("certificateStatus").innerHTML =
            "❌ Cannot connect to TrustWipe backend.";
    }
}


// -----------------------------
// Load device information
// -----------------------------
window.addEventListener(
    "DOMContentLoaded",
    loadDeviceInfo
);
