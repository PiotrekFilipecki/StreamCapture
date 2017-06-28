var videoElement = document.querySelector('video');
var recorder;

function getFormattedDate() {
    var d = new Date();
    d = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
    return d;
}


var mediaStream = null;
// reusable getUserMedia
function captureUserMedia(success_callback) {
    var session = {
        audio: true,
        video: true
    };

    navigator.getUserMedia(session, success_callback, function(error) {
        alert('Unable to capture your camera. Please check console logs.');
        console.error(error);
    });
}



window.onload = function() {
    //btnStartRecording.disabled = true;

    captureUserMedia(function(stream) {
        mediaStream = stream;

        videoElement.src = window.URL.createObjectURL(stream);
        videoElement.play();
        videoElement.muted = true;
        videoElement.controls = false;

        recorder = RecordRTC(stream, {
            type: 'video'
        });
       

    });
};

window.onbeforeunload = function() {
    startRecording.disabled = false;
};