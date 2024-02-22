// import React, { useState } from "react";

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faMicrophone } from '@fortawesome/free-solid-svg-icons'

// function Recorder() {

//     const [mediaRecorder, setMediaRecorder] = useState<any>(null);
//     const [audioURL, setAudioURL] = useState('');
//     const [recording, setRecording] = useState(false);

//     const startRecording = () => {
//         navigator.mediaDevices.getUserMedia({ audio: true })
//             .then(function (stream) {
//                 const recorder = new MediaRecorder(stream);
//                 setMediaRecorder(recorder);
//                 recorder.start();
//                 setRecording(true);

//                 const chunks: any = [];
//                 recorder.ondataavailable = function (e) {
//                     chunks.push(e.data);
//                 };

//                 recorder.onstop = function (e) {
//                     // const blob = new Blob(chunks, { 'type': 'audio/mp3; codecs=opus' });
//                     const blob = new Blob(chunks, { 'type': 'audio/mp3' });
//                     const url = window.URL.createObjectURL(blob);
//                     setAudioURL(url);

//                     console.log("blob", blob);

//                     const formData = new FormData();
//                     formData.append('audio', blob);
        
//                     fetch('http://localhost:5001/uploadAudio', {
//                         method: 'POST',
//                         body: formData
//                     })
//                         .then(response => {
//                             // Handle response
//                             console.log('Audio uploaded successfully');
//                         })
//                         .catch(error => {
//                             // Handle error
//                             console.error('Error uploading audio:', error);
//                         });
//                 };
//             })
//             .catch(function (err) {
//                 console.log('The following error occurred: ' + err);
//             });
//     };

//     const stopRecording = () => {
//         if (mediaRecorder) {
//             mediaRecorder.stop();
//             setRecording(false);
//         }
//     };

//     return (
//         <>
//             <FontAwesomeIcon icon={faMicrophone} />
//             <div>
//                 <button onClick={startRecording} disabled={recording}>Start Recording</button>
//                 <button onClick={stopRecording} disabled={!recording}>Stop Recording</button>
//                 {audioURL && <audio controls src={audioURL}></audio>}
//             </div>
//         </>
//     );
// }

// export default Recorder;

import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone } from '@fortawesome/free-solid-svg-icons'

function Recorder() {

    useEffect(() => {
        var audioRecorder = {
            /** Stores the recorded audio as Blob objects of audio data as the recording continues*/
            audioBlobs: [],/*of type Blob[]*/
            /** Stores the reference of the MediaRecorder instance that handles the MediaStream when recording starts*/
            mediaRecorder: null, /*of type MediaRecorder*/
            /** Stores the reference to the stream currently capturing the audio*/
            streamBeingCaptured: null, /*of type MediaStream*/
            /** Start recording the audio 
             * @returns {Promise} - returns a promise that resolves if audio recording successfully started
             */
            start: function () {
                //Feature Detection
                if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
                    //Feature is not supported in browser
                    //return a custom error
                    return Promise.reject(new Error('mediaDevices API or getUserMedia method is not supported in this browser.'));
                }
        
                else {
                    //Feature is supported in browser
        
                    //create an audio stream
                    return navigator.mediaDevices.getUserMedia({ audio: true }/*of type MediaStreamConstraints*/)
                        //returns a promise that resolves to the audio stream
                        .then(stream /*of type MediaStream*/ => {
        
                            //save the reference of the stream to be able to stop it when necessary
                            // @ts-ignore
                            audioRecorder.streamBeingCaptured = stream;
        
                            //create a media recorder instance by passing that stream into the MediaRecorder constructor
                            // @ts-ignore
                            audioRecorder.mediaRecorder = new MediaRecorder(stream); /*the MediaRecorder interface of the MediaStream Recording
                            API provides functionality to easily record media*/
        
                            //clear previously saved audio Blobs, if any
                            audioRecorder.audioBlobs = [];
        
                            //add a dataavailable event listener in order to store the audio data Blobs when recording
                            // @ts-ignore
                            audioRecorder.mediaRecorder.addEventListener("dataavailable", event => {
                                //store audio Blob object
                                // @ts-ignore
                                audioRecorder.audioBlobs.push(event.data);
                            });
        
                            //start the recording by calling the start method on the media recorder
                            // @ts-ignore
                            audioRecorder.mediaRecorder.start();
                        });
        
                    /* errors are not handled in the API because if its handled and the promise is chained, the .then after the catch will be executed*/
                }
            },
            /** Stop the started audio recording
             * @returns {Promise} - returns a promise that resolves to the audio as a blob file
             */
            stop: function () {
                //return a promise that would return the blob or URL of the recording
                return new Promise(resolve => {
                    //save audio type to pass to set the Blob type
                    // @ts-ignore
                    let mimeType = audioRecorder.mediaRecorder.mimeType;
        
                    //listen to the stop event in order to create & return a single Blob object
                    // @ts-ignore
                    audioRecorder.mediaRecorder.addEventListener("stop", () => {
                        //create a single blob object, as we might have gathered a few Blob objects that needs to be joined as one
                        let audioBlob = new Blob(audioRecorder.audioBlobs, { type: mimeType });
                        
                        //resolve promise with the single audio blob representing the recorded audio
                        resolve(audioBlob);
                    });
                    audioRecorder.cancel();
                });
            },
            /** Cancel audio recording*/
            cancel: function () {
                //stop the recording feature
                // @ts-ignore
                audioRecorder.mediaRecorder.stop();
        
                //stop all the tracks on the active stream in order to stop the stream
                audioRecorder.stopStream();
        
                //reset API properties for next recording
                audioRecorder.resetRecordingProperties();
            },
            /** Stop all the tracks on the active stream in order to stop the stream and remove
             * the red flashing dot showing in the tab
             */
            stopStream: function () {
                //stopping the capturing request by stopping all the tracks on the active stream
                // @ts-ignore
                audioRecorder.streamBeingCaptured.getTracks() //get all tracks from the stream
                    .forEach((track: any) /*of type MediaStreamTrack*/ => track.stop()); //stop each one
            },
            /** Reset all the recording properties including the media recorder and stream being captured*/
            resetRecordingProperties: function () {
                audioRecorder.mediaRecorder = null;
                audioRecorder.streamBeingCaptured = null;
        
                /*No need to remove event listeners attached to mediaRecorder as
                If a DOM element which is removed is reference-free (no references pointing to it), the element itself is picked
                up by the garbage collector as well as any event handlers/listeners associated with it.
                getEventListeners(audioRecorder.mediaRecorder) will return an empty array of events.*/
            }
        }

        var microphoneButton = document.getElementsByClassName("start-recording-button")[0] as HTMLElement;
        var recordingControlButtonsContainer = document.getElementsByClassName("recording-contorl-buttons-container")[0];
        var stopRecordingButton = document.getElementsByClassName("stop-recording-button")[0] as HTMLElement;
        var cancelRecordingButton = document.getElementsByClassName("cancel-recording-button")[0] as HTMLElement;
        var elapsedTimeTag = document.getElementsByClassName("elapsed-time")[0];
        var closeBrowserNotSupportedBoxButton = document.getElementsByClassName("close-browser-not-supported-box")[0] as HTMLElement;
        var overlay = document.getElementsByClassName("overlay")[0];
        var audioElement = document.getElementsByClassName("audio-element")[0] as HTMLAudioElement;

        var audioElementSource = document.getElementsByClassName("audio-element")[0].getElementsByTagName("source")[0];
        var textIndicatorOfAudiPlaying = document.getElementsByClassName("text-indication-of-audio-playing")[0];

        //Listen to start recording button
        microphoneButton.onclick = startAudioRecording;

        //Listen to stop recording button
        stopRecordingButton.onclick = stopAudioRecording;

        //Listen to cancel recording button
        cancelRecordingButton.onclick = cancelAudioRecording;

        //Listen to when the ok button is clicked in the browser not supporting audio recording box
        closeBrowserNotSupportedBoxButton.onclick = hideBrowserNotSupportedOverlay;

        //Listen to when the audio being played ends
        audioElement.onended = hideTextIndicatorOfAudioPlaying;


        /** Displays recording control buttons */
        function handleDisplayingRecordingControlButtons() {
            //Hide the microphone button that starts audio recording
            microphoneButton.style.display = "none";

            //Display the recording control buttons
            recordingControlButtonsContainer.classList.remove("hide");

            //Handle the displaying of the elapsed recording time
            handleElapsedRecordingTime();
        }

        /** Hide the displayed recording control buttons */
        function handleHidingRecordingControlButtons() {
            //Display the microphone button that starts audio recording
            microphoneButton.style.display = "block";

            //Hide the recording control buttons
            recordingControlButtonsContainer.classList.add("hide");

            //stop interval that handles both time elapsed and the red dot
            clearInterval(elapsedTimeTimer);
        }

        /** Displays browser not supported info box for the user*/
        function displayBrowserNotSupportedOverlay() {
            overlay.classList.remove("hide");
        }

        /** Displays browser not supported info box for the user*/
        function hideBrowserNotSupportedOverlay() {
            overlay.classList.add("hide");
        }

        /** Creates a source element for the the audio element in the HTML document*/
        function createSourceForAudioElement() {
            let sourceElement = document.createElement("source");
            audioElement.appendChild(sourceElement);

            audioElementSource = sourceElement;
        }

        /** Display the text indicator of the audio being playing in the background */
        function displayTextIndicatorOfAudioPlaying() {
            textIndicatorOfAudiPlaying.classList.remove("hide");
        }

        /** Hide the text indicator of the audio being playing in the background */
        function hideTextIndicatorOfAudioPlaying() {
            textIndicatorOfAudiPlaying.classList.add("hide");
        }

        //Controller

        /** Stores the actual start time when an audio recording begins to take place to ensure elapsed time start time is accurate*/
        var audioRecordStartTime: any;

        /** Stores the maximum recording time in hours to stop recording once maximum recording hour has been reached */
        var maximumRecordingTimeInHours = 1;

        /** Stores the reference of the setInterval function that controls the timer in audio recording*/
        var elapsedTimeTimer: any;

        /** Starts the audio recording*/
        function startAudioRecording() {

            console.log("Recording Audio...");

            //If a previous audio recording is playing, pause it
            let recorderAudioIsPlaying = !audioElement.paused; // the paused property tells whether the media element is paused or not
            console.log("paused?", !recorderAudioIsPlaying);
            if (recorderAudioIsPlaying) {
                audioElement.pause();
                //also hide the audio playing indicator displayed on the screen
                hideTextIndicatorOfAudioPlaying();
            }

            //start recording using the audio recording API
            audioRecorder.start()
                .then(() => { //on success

                    //store the recording start time to display the elapsed time according to it
                    audioRecordStartTime = new Date();

                    //display control buttons to offer the functionality of stop and cancel
                    handleDisplayingRecordingControlButtons();
                })
                .catch(error => { //on error
                    //No Browser Support Error
                    if (error.message.includes("mediaDevices API or getUserMedia method is not supported in this browser.")) {
                        console.log("To record audio, use browsers like Chrome and Firefox.");
                        displayBrowserNotSupportedOverlay();
                    }

                    //Error handling structure
                    switch (error.name) {
                        case 'AbortError': //error from navigator.mediaDevices.getUserMedia
                            console.log("An AbortError has occured.");
                            break;
                        case 'NotAllowedError': //error from navigator.mediaDevices.getUserMedia
                            console.log("A NotAllowedError has occured. User might have denied permission.");
                            break;
                        case 'NotFoundError': //error from navigator.mediaDevices.getUserMedia
                            console.log("A NotFoundError has occured.");
                            break;
                        case 'NotReadableError': //error from navigator.mediaDevices.getUserMedia
                            console.log("A NotReadableError has occured.");
                            break;
                        case 'SecurityError': //error from navigator.mediaDevices.getUserMedia or from the MediaRecorder.start
                            console.log("A SecurityError has occured.");
                            break;
                        case 'TypeError': //error from navigator.mediaDevices.getUserMedia
                            console.log("A TypeError has occured.");
                            break;
                        case 'InvalidStateError': //error from the MediaRecorder.start
                            console.log("An InvalidStateError has occured.");
                            break;
                        case 'UnknownError': //error from the MediaRecorder.start
                            console.log("An UnknownError has occured.");
                            break;
                        default:
                            console.log("An error occured with the error name " + error.name);
                    };
                });
        }
        /** Stop the currently started audio recording & sends it
         */
        function stopAudioRecording() {

            console.log("Stopping Audio Recording...");

            //stop the recording using the audio recording API
            audioRecorder.stop()
                .then(audioAsblob => {
                    //Play recorder audio
                    playAudio(audioAsblob);

                    //hide recording control button & return record icon
                    handleHidingRecordingControlButtons();
                })
                .catch(error => {
                    //Error handling structure
                    switch (error.name) {
                        case 'InvalidStateError': //error from the MediaRecorder.stop
                            console.log("An InvalidStateError has occured.");
                            break;
                        default:
                            console.log("An error occured with the error name " + error.name);
                    };
                });
        }

        /** Cancel the currently started audio recording */
        function cancelAudioRecording() {
            console.log("Canceling audio...");

            //cancel the recording using the audio recording API
            audioRecorder.cancel();

            //hide recording control button & return record icon
            handleHidingRecordingControlButtons();
        }

        /** Plays recorded audio using the audio element in the HTML document
         * @param {Blob} recorderAudioAsBlob - recorded audio as a Blob Object 
        */
        function playAudio(recorderAudioAsBlob: any) {

            //read content of files (Blobs) asynchronously
            let reader = new FileReader();

            //once content has been read
            reader.onload = (e) => {
                //store the base64 URL that represents the URL of the recording audio
                // @ts-ignore
                let base64URL = e.target.result;

                //If this is the first audio playing, create a source element
                //as pre populating the HTML with a source of empty src causes error
                if (!audioElementSource) //if its not defined create it (happens first time only)
                    createSourceForAudioElement();

                //set the audio element's source using the base64 URL
                // @ts-ignore      
                audioElementSource.src = base64URL;

                //set the type of the audio element based on the recorded audio's Blob type
                let BlobType = recorderAudioAsBlob.type.includes(";") ?
                    recorderAudioAsBlob.type.substr(0, recorderAudioAsBlob.type.indexOf(';')) : recorderAudioAsBlob.type;
                audioElementSource.type = BlobType

                //call the load method as it is used to update the audio element after changing the source or other settings
                audioElement.load();

                //play the audio after successfully setting new src and type that corresponds to the recorded audio
                console.log("Playing audio...");
                audioElement.play();

                //Display text indicator of having the audio play in the background
                displayTextIndicatorOfAudioPlaying();
            };

            //read content and convert it to a URL (base64)
            reader.readAsDataURL(recorderAudioAsBlob);
        }

        /** Computes the elapsed recording time since the moment the function is called in the format h:m:s*/
        function handleElapsedRecordingTime() {
            //display inital time when recording begins
            displayElapsedTimeDuringAudioRecording("00:00");

            //create an interval that compute & displays elapsed time, as well as, animate red dot - every second
            elapsedTimeTimer = setInterval(() => {
                //compute the elapsed time every second
                let elapsedTime = computeElapsedTime(audioRecordStartTime); //pass the actual record start time
                //display the elapsed time
                displayElapsedTimeDuringAudioRecording(elapsedTime);
            }, 1000); //every second
        }

        /** Display elapsed time during audio recording
         * @param {String} elapsedTime - elapsed time in the format mm:ss or hh:mm:ss 
         */
        function displayElapsedTimeDuringAudioRecording(elapsedTime: any) {
            //1. display the passed elapsed time as the elapsed time in the elapsedTime HTML element
            elapsedTimeTag.innerHTML = elapsedTime;

            //2. Stop the recording when the max number of hours is reached
            if (elapsedTimeReachedMaximumNumberOfHours(elapsedTime)) {
                stopAudioRecording();
            }
        }

        /**
         * @param {String} elapsedTime - elapsed time in the format mm:ss or hh:mm:ss  
         * @returns {Boolean} whether the elapsed time reached the maximum number of hours or not
         */
        function elapsedTimeReachedMaximumNumberOfHours(elapsedTime: any) {
            //Split the elapsed time by the symbo :
            let elapsedTimeSplitted = elapsedTime.split(":");

            //Turn the maximum recording time in hours to a string and pad it with zero if less than 10
            let maximumRecordingTimeInHoursAsString = maximumRecordingTimeInHours < 10 ? "0" + maximumRecordingTimeInHours : maximumRecordingTimeInHours.toString();

            //if it the elapsed time reach hours and also reach the maximum recording time in hours return true
            if (elapsedTimeSplitted.length === 3 && elapsedTimeSplitted[0] === maximumRecordingTimeInHoursAsString)
                return true;
            else //otherwise, return false
                return false;
        }

        /** Computes the elapsedTime since the moment the function is called in the format mm:ss or hh:mm:ss
         * @param {String} startTime - start time to compute the elapsed time since
         * @returns {String} elapsed time in mm:ss format or hh:mm:ss format, if elapsed hours are 0.
         */
        function computeElapsedTime(startTime: any) {
            //record end time
            let endTime = new Date();

            //time difference in ms
            // @ts-ignore
            let timeDiff = endTime - startTime;

            //convert time difference from ms to seconds
            timeDiff = timeDiff / 1000;

            //extract integer seconds that dont form a minute using %
            let seconds = Math.floor(timeDiff % 60); //ignoring uncomplete seconds (floor)

            //pad seconds with a zero if neccessary
            // @ts-ignore
            seconds = seconds < 10 ? "0" + seconds : seconds;

            //convert time difference from seconds to minutes using %
            timeDiff = Math.floor(timeDiff / 60);

            //extract integer minutes that don't form an hour using %
            let minutes = timeDiff % 60; //no need to floor possible incomplete minutes, becase they've been handled as seconds
            // @ts-ignore
            minutes = minutes < 10 ? "0" + minutes : minutes;

            //convert time difference from minutes to hours
            timeDiff = Math.floor(timeDiff / 60);

            //extract integer hours that don't form a day using %
            let hours = timeDiff % 24; //no need to floor possible incomplete hours, becase they've been handled as seconds

            //convert time difference from hours to days
            timeDiff = Math.floor(timeDiff / 24);

            // the rest of timeDiff is number of days
            let days = timeDiff; //add days to hours

            let totalHours = hours + (days * 24);
            // @ts-ignore
            totalHours = totalHours < 10 ? "0" + totalHours : totalHours;

            // @ts-ignore
            if (totalHours === "00") {
                return minutes + ":" + seconds;
            } else {
                return totalHours + ":" + minutes + ":" + seconds;
            }
        }        
    }, []);

    return (
        <>
            <div className="audio-recording-container">
                <h1 className="title">Audio Recording API Demo</h1>
                <i className="start-recording-button fa fa-microphone" aria-hidden="true"></i>
                <div className="recording-contorl-buttons-container hide">
                    <i className="cancel-recording-button fa fa-times-circle-o" aria-hidden="true"></i>
                    <div className="recording-elapsed-time">
                        <i className="red-recording-dot fa fa-circle" aria-hidden="true"></i>
                        <p className="elapsed-time"></p>
                    </div>
                    <i className="stop-recording-button fa fa-stop-circle-o" aria-hidden="true"></i>
                </div>
                <div className="text-indication-of-audio-playing-container">
                    <p className="text-indication-of-audio-playing hide">Audio is playing<span>.</span><span>.</span><span>.</span></p>
                </div>
            </div>
            <div className="overlay hide">
                <div className="browser-not-supporting-audio-recording-box">
                    <p>To record audio, use browsers like Chrome and Firefox that support audio recording.</p>
                    <button type="button" className="close-browser-not-supported-box">Ok.</button>
                </div>
            </div>

            <audio controls className="audio-element hide">
            </audio>
        </>
    );
}

export default Recorder;

