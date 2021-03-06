// fetching DOM references
var btnStartRecording = document.querySelector('#btn-start-recording');
var btnStopRecording = document.querySelector('#btn-stop-recording');

var videoElement = document.querySelector('video');

var progressBar = document.querySelector('#progress-bar');
var percentage = document.querySelector('#percentage');

var recorder;

function getFormattedDate() {
    var d = new Date();
    d = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
    return d;
}

// reusable helpers

// this function submits recorded blob to nodejs server
function postFiles() {
    var blob = recorder.getBlob();

    // getting unique identifier for the file name
    var fileName = generateRandomString() + '.webm';

    var file = new File([blob], fileName, {
        type: 'video/webm'
    });

    videoElement.src = '';
    //videoElement.poster = '/ajax-loader.gif';

    xhr('/uploadFile', file, function(responseText) {
        var fileURL = JSON.parse(responseText).fileURL;

        console.info('fileURL', fileURL);
        videoElement.src = fileURL;
        //videoElement.play();
        captureUserMedia(function(stream) {
            mediaStream = stream;

            videoElement.src = window.URL.createObjectURL(stream);
            videoElement.play();
            videoElement.muted = true;
            videoElement.controls = false;

            recorder = RecordRTC(stream, {
                type: 'video'
            });

            recorder.startRecording();

            // enable stop-recording button
            //btnStopRecording.disabled = false;
        });




        setInterval(function() {
            recorder.stopRecording(postFiles);

        }, 15000);
        //videoElement.muted = false;
        //videoElement.controls = true;
        var node = document.createElement("LI");
        //var node2 = document.createElement("P");
        node.innerHTML = '<p>' + getFormattedDate() + '</p>' + '<br>' + '<a>' + '<a target="_blank" href="' + videoElement.src + '">' + 'Zobacz' + '</a>' +
            '<br>' + '<a>' + '<a href="' + videoElement.src + '" download>' + 'Pobierz' + '</a>';

        document.getElementById("files-list").appendChild(node);

        //document.querySelector('#footer-h2').innerHTML = '<a href="' + videoElement.src + '">' + videoElement.src + '</a>';
        console.log(getFormattedDate());
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

    /*request.upload.onprogress = function(event) {
        progressBar.max = event.total;
        progressBar.value = event.loaded;
        progressBar.innerHTML = 'Upload Progress ' + Math.round(event.loaded / event.total * 100) + "%";
    };
            
    request.upload.onload = function() {
        percentage.style.display = 'none';
        progressBar.style.display = 'none';
    };*/
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

// UI events handling
/*btnStartRecording.onclick = function() {
    btnStartRecording.disabled = true;
    
    captureUserMedia(function(stream) {
        mediaStream = stream;
        
        videoElement.src = window.URL.createObjectURL(stream);
        videoElement.play();
        videoElement.muted = true;
        videoElement.controls = false;
        
        recorder = RecordRTC(stream, {
            type: 'video'
        });
        
        recorder.startRecording();
        
        // enable stop-recording button
        btnStopRecording.disabled = false;
    });
};*/

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

        recorder.startRecording();

        // enable stop-recording button
        //btnStopRecording.disabled = false;

        setTimeout(function() {
            recorder.stopRecording(postFiles);

        }, 15000);

    });
};



/*btnStopRecording.onclick = function() {
    btnStartRecording.disabled = false;
    btnStopRecording.disabled = true;
    
    recorder.stopRecording(postFiles);
};*/

window.onbeforeunload = function() {
    startRecording.disabled = false;
};