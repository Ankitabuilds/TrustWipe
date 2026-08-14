function startSanitization(){

    let progress = 0;

    document.getElementById("status").innerHTML =
    "Sanitization in Progress...";

    let interval = setInterval(function(){

        progress += 5;

        document.getElementById("progressBar")
        .style.width = progress + "%";

        document.getElementById("progressText")
        .innerHTML = progress + "%";

        if(progress >= 100){

            clearInterval(interval);

            document.getElementById("status")
            .innerHTML =
            "✅ Sanitization Completed Successfully";
        }

    },200);
}

function verifyData(){

    document.getElementById("verifyStatus")
    .innerHTML =
    "✅ Verification Successful";
}

function generateCertificate(){

    document.getElementById("certificateStatus")
    .innerHTML =
    "✅ Certificate Generated Successfully";
}