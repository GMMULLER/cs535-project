import React, { useState, useEffect, useRef } from "react";

import { AudioRecorder } from 'react-audio-voice-recorder';

function Recorder() {

    const [recordingCounter, setRecordingCounter] = useState<number>(0);
    const [participant, setParticipant] = useState<string>("");
    const [currentTaskNumber, _setCurrentTaskNumber] = useState<number>(0);

	const currentTaskNumberRef = useRef(currentTaskNumber);
	const setCurrentTaskNumber = (data: number) => {
	    currentTaskNumberRef.current = data;
	    _setCurrentTaskNumber(data);
	};


    const tasksPrompts = [
        "Record a message as if you were inviting a friend to hang out with you in your place tomorrow",
        "Record a message as if you were emailing your boss to ask if there is a meeting happening today",
        "Record a massage as if you were wishing happy birthday to your best friend"
    ]

    const addAudioElement = (blob: any) => {

        const formData = new FormData();
        formData.append('audio', blob);

        fetch('http://localhost:5001/uploadAudio?filename=audio'+recordingCounter, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                // Handle response
                console.log('Audio uploaded successfully');
            })
            .catch(error => {
                // Handle error
                console.error('Error uploading audio:', error);
            });

        const url = URL.createObjectURL(blob);
        const audio = document.createElement("audio");
        audio.src = url;
        audio.controls = true;
        let resultDiv = document.getElementById("audioResult") as HTMLElement;
        resultDiv.innerHTML = "";
        resultDiv.appendChild(audio);

        setRecordingCounter(recordingCounter+1);
    };

    useEffect(() => {

        let submitButton = document.getElementById("submitButton") as HTMLElement;

        submitButton.addEventListener("click", function() {
            // log info
            if(currentTaskNumberRef.current < tasksPrompts.length-1){
                setCurrentTaskNumber(currentTaskNumberRef.current+1);
            }
        });
    }, []);


    return (
        <>
            {participant == "" ? <div>
                <input type="text" id="participantInput" />
            </div> : <div>
                <p style={{fontWeight: "bold"}}>{tasksPrompts[currentTaskNumberRef.current]}</p>
                <p>Feel free to record a task as many times as you wish. Use the box editor to tweak the text to make the transcription as close to your intended message as possible.</p>
                <p>While it is possible to skip a task we encourage you to do so only after getting stuck with unsuccessful attempts</p>
                <AudioRecorder 
                    onRecordingComplete={addAudioElement}
                    audioTrackConstraints={{
                        noiseSuppression: true,
                        echoCancellation: true,
                    }} 
                    downloadOnSavePress={false}
                    showVisualizer={true}
                />
                <div id={"audioResult"}></div>
                <button id={"submitButton"}>Submit</button>
                <button>Skip</button>
                <div>
                    <span>Task: {currentTaskNumberRef.current+1}/{tasksPrompts.length}</span>
                </div>
            </div>}
            
            

        </>
    );
}

export default Recorder;