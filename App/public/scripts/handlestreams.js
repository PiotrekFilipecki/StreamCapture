var btnStartRecording = document.querySelector('#btn-start-recording');
var btnStopRecording = document.querySelector('#btn-stop-recording');

var videoElement = document.querySelector('video');

var progressBar = document.querySelector('#progress-bar');
var percentage = document.querySelector('#percentage');

var recorder;


function postFiles() {
    var blob = recorder.getBlob();

    
    var fileName = generateRandomString() + '.webm';

    var file = new File([blob], fileName, {
        type: 'video/webm'
    });

    videoElement.src = '';


    xhr('/uploadFile', file, function(responseText) {
        var fileURL = JSON.parse(responseText).fileURL;

        console.info('fileURL', fileURL);
        videoElement.src = fileURL;

        videoElement.muted = false;
        videoElement.controls = true;


    });

    if (mediaStream) mediaStream.stop();
}

// XHR2/FormData
function xhr(url, data, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.responseText);
        }
    };

    request.open('POST', url);

    var formData = new FormData();
    formData.append('file', data);
    request.send(formData);
}

// generating random string
function generateRandomString() {
    if (window.crypto) {
        var a = window.crypto.getRandomValues(new Uint32Array(3)),
            token = '';
        for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
        return token;
    } else {
        return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
    }
}

var mediaStream = null;
// reusable getUserMedia
window.onload = function() {
    btnStartRecording.disabled = true;

    captureUserMedia(function(stream) {
        mediaStream = stream;

        videoElement.src = window.URL.createObjectURL(stream);
        
        videoElement.muted = true;
        videoElement.controls = false;
        recorder = RecordRTC(stream, {
            type: 'video',

        });

        recorder.setRecordingDuration(5 * 1000).onRecordingStopped(function(url) {
            console.debug('setRecordingDuration', url);
            postFiles();
            captureUserMedia(stream);
            console.log('agaaain');
            //window.open(url);
        });
        recorder.startRecording();


        // enable stop-recording button
        btnStopRecording.disabled = false;
        /*setTimeout(function(){
            recorder.stopRecording(postFiles);
            window.ondataavailable
        }, 2000);*/

    });
};

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

navigator.mediaDevices.getUserMedia({
    video: true
}).then(function(stream) {
    var recordRTC = RecordRTC(stream, {
        recorderType: WhammyRecorder
    });

    // auto stop recording after 5 seconds
    recordRTC.setRecordingDuration(5 * 1000).onRecordingStopped(function(url) {
        console.debug('setRecordingDuration', url);
        window.open(url);
    })

    recordRTC.startRecording();
}).catch(function(error) {
    console.error(error);
});



btnStopRecording.onclick = function() {
    btnStartRecording.disabled = false;
    btnStopRecording.disabled = true;

    recorder.stopRecording(postFiles);
};

window.onbeforeunload = function() {
    startRecording.disabled = false;
};