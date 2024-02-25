import React, { useState, useEffect, useRef } from "react";

import { AudioRecorder } from 'react-audio-voice-recorder';
import './Recorder.css'

function Recorder() {

    const [recordingCounter, setRecordingCounter] = useState<number>(0);
    const [participant, setParticipant] = useState<string>("");
    const [currentTaskNumber, _setCurrentTaskNumber] = useState<number>(0);
    const [currentTaskContent, setCurrentTaskContent] = useState<string>("");

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

    const resolveTranscript = async (promise: Promise<any>) => {
        promise.then((obj: any) => {
            setCurrentTaskContent(obj.content);
        });
    }

    const addAudioElement = (blob: any) => {

        const formData = new FormData();
        formData.append('audio', blob);

        fetch('http://localhost:5001/uploadAudio?filename=audio'+recordingCounter, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                resolveTranscript(response.json());
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

        if(participant != ""){
            let submitButton = document.getElementById("submitButton") as HTMLElement;
    
            submitButton.addEventListener("click", function() {
                // TODO: log info
                if(currentTaskNumberRef.current < tasksPrompts.length-1){
                    setCurrentTaskNumber(currentTaskNumberRef.current+1);
                }
            });
        }

    }, [participant]);

    useEffect(() => {
        let saveParticipant = document.getElementById("saveParticipant") as HTMLElement;
    
        saveParticipant.addEventListener("click", function() {
            // TODO: save log info
            let participantInput = document.getElementById("participantInput") as HTMLInputElement;
            setParticipant(participantInput.value);
        });
    }, []);

    const updateTaskContent = (event: any) => {
        setCurrentTaskContent(event.target.value);
    }

    return (
        <>
            {participant == "" ? <div>
                <label htmlFor="participant" style={{marginRight: "10px"}}>Participant ID:</label>
                <input type="text" id="participantInput" name="participant"/>
                <button id={"saveParticipant"}>Save</button>
            </div> : <div>
                <h2 style={{textAlign: "center"}}>ID: {participant}</h2>
                <p style={{fontSize: "2em"}}>{tasksPrompts[currentTaskNumberRef.current]}.</p>
                <p style={{color: "#999999"}}>Feel free to record and listen to your answer as many times as you wish. Use the box editor to tweak the text to make the transcription as close to your intended message as possible.</p>
                <p style={{color: "#999999"}}>While it is possible to skip a task we encourage you to do so only after getting stuck with unsuccessful attempts.</p>
                <AudioRecorder 
                    onRecordingComplete={addAudioElement}
                    audioTrackConstraints={{
                        noiseSuppression: true,
                        echoCancellation: true,
                    }} 
                    downloadOnSavePress={false}
                    showVisualizer={true}
                    classes={{AudioRecorderClass: "recorderContainer"}}
                />
                <div id={"audioResult"}></div>
                <div>
                    {/* <input type="text" value={currentTaskContent} onChange={updateTaskContent}/> */}
                    <textarea value={currentTaskContent} rows={4} cols={50} onChange={updateTaskContent} style={{width: "100%", height: "200px", marginBottom: "10px"}}></textarea>
                </div>
                <button id={"submitButton"} style={{marginRight: "5px"}}>Submit</button>
                <button style={{backgroundColor: "#de0202"}}>Skip</button>
                <div style={{marginTop: "10px", fontWeight: "bold"}}>
                    <span>Task: {currentTaskNumberRef.current+1}/{tasksPrompts.length}</span>
                </div>
            </div>}
            
            

        </>
    );
}

export default Recorder;