import React, { useState, useEffect, useRef } from "react";

import { AudioRecorder } from 'react-audio-voice-recorder';
import './Recorder.css'

function Recorder() {

    const [recordingCounter, setRecordingCounter] = useState<number>(0);
    const [recordedCounter, setRecordedCounter] = useState<number>(0);
    const [participant, setParticipant] = useState<string>("");
    const [currentTaskNumber, _setCurrentTaskNumber] = useState<number>(0);
    const [currentTaskContent, setCurrentTaskContent] = useState<string>("");
    const [lastRecording, setLastRecording] = useState<string>("");
    const [taskStartTimestamp, setTaskStartTimestamp] = useState<Date>(new Date());

    const currentTaskNumberRef = useRef(currentTaskNumber);
    const setCurrentTaskNumber = (data: number) => {
        currentTaskNumberRef.current = data;
        _setCurrentTaskNumber(data);
    };

    const tasksPrompts = [
        "Record a message as if you were writing a message to your friend to invite them to hang out together this weekend",
        "Record a message as if you were emailing your boss to ask to ask whether there will be a meeting today",
        "Record a massage as if you were wishing happy birthday to your best friend, highlighting your wishes for them for the upcoming year",
        "Record a massage as if you were writing a message to your professor to extend the deadline for an assignment you’ve been working on",
        "Record a massage as if you were writing a friendly letter to a family member you haven't seen in a while. Share updates about your life and ask about theirs",
        "Record a massage as if you were providing a voice-to-text review for a product you recently purchased online. Share your thoughts on its features, performance, and overall satisfaction",
        "Record a massage as if you were writing a thank-you note to a colleague who has provided valuable assistance on a recent task. Express gratitude professionally and acknowledge their contributions",
        "Record a massage as if you were writing a short blog post on a topic of your choice. It could be a personal experience, hobby, or any subject that interests you",
        "Record a massage for your significant other to remind them about an upcoming anniversary dinner reservation",
        "Record a massage for your landlord to report a maintenance issue in your apartment",
    ]

    const resolveTranscript = async (promise: Promise<any>) => {
        promise.then((obj: any) => {
            setCurrentTaskContent(obj.content);
            setLastRecording(lastRecording);
        });
    }

    const addAudioElement = (blob: any) => {

        const formData = new FormData();
        formData.append('audio', blob);

        fetch('http://localhost:5001/uploadAudio?filename=audio' + recordingCounter, {
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

        setRecordingCounter(recordingCounter + 1);
        setRecordedCounter(recordedCounter + 1);
    };

    useEffect(() => {
        setTaskStartTimestamp(new Date());
    }, [participant]);

    useEffect(() => {
        let saveParticipant = document.getElementById("saveParticipant") as HTMLElement;

        saveParticipant.addEventListener("click", function () {
            let participantInput = document.getElementById("participantInput") as HTMLInputElement;
            setParticipant(participantInput.value);

            const date = new Date();

            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();

            // This arrangement can be altered based on how we want the date's format to appear.
            let currentDate = `${day}-${month}-${year}`;
            let proficiencyLevel = document.getElementById("englishProficiency") as HTMLInputElement;
            let nativeLanguage = document.getElementById("nativeLanguage") as HTMLInputElement;

            let data = {
                code: participantInput.value,
                date: currentDate,
                proficiency_level: proficiencyLevel.value,
                native_language: nativeLanguage.value,
            }

            fetch('http://localhost:5001/registerParticipant', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                }
            })
                .then(response => {
                })
                .catch(error => {
                });
        });
    }, []);

    const updateTaskContent = (event: any) => {
        setCurrentTaskContent(event.target.value);
    }

    const submitTask = () => {

        let nowTime = new Date();

        // @ts-ignore
        let elapsedTime = nowTime - taskStartTimestamp;

        let data = {
            participant_code: participant,
            task_id: currentTaskNumber,
            final_answer: currentTaskContent,
            last_recorded_answer: lastRecording,
            number_of_recordings: recordedCounter,
            skipped: 0,
            time: elapsedTime
        }

        fetch('http://localhost:5001/submitAnswer', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            }
        })
            .then(response => {
            })
            .catch(error => {
            });

        setCurrentTaskNumber(currentTaskNumberRef.current + 1);
        setCurrentTaskContent("");
        setLastRecording("");
        setRecordedCounter(0);

        setTaskStartTimestamp(new Date());
    }

    const skipTask = () => {
        // TODO: log info
        setCurrentTaskNumber(currentTaskNumberRef.current + 1);
        setCurrentTaskContent("");
        setLastRecording("");
        setRecordedCounter(0);

        setTaskStartTimestamp(new Date());
    }

    return (
        <>
            {participant == "" ? <div>
                <label htmlFor="participant" style={{ marginRight: "10px" }}>Participant ID:</label>
                <input type="text" id="participantInput" name="participant" />
                <br />
                <br />
                <label htmlFor="englishProficiency" style={{ marginRight: "10px" }}>English proficiency:</label>
                <select name="englishProficiency" id="englishProficiency">
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="proficient">Proficient</option>
                </select>
                <br />
                <br />
                <label htmlFor="nativeLanguage" style={{ marginRight: "10px" }}>Native Language:</label>
                <input type="text" id="nativeLanguage" name="nativeLanguage" />
                <br />
                <button id={"saveParticipant"}>Save</button>
            </div> : currentTaskNumberRef.current < tasksPrompts.length ? <div>
                <h2 style={{ textAlign: "center" }}>ID: {participant}</h2>
                <p style={{ fontSize: "2em" }}>{tasksPrompts[currentTaskNumberRef.current]}.</p>
                <p style={{ color: "#999999" }}>Feel free to record and listen to your answer as many times as you wish. If you want you can use the box editor to tweak the text to fix mistakes.</p>
                <p style={{ color: "#999999" }}>While it is possible to skip a task we encourage you to do so only after getting stuck with unsuccessful attempts.</p>
                <AudioRecorder
                    onRecordingComplete={addAudioElement}
                    audioTrackConstraints={{
                        noiseSuppression: true,
                        echoCancellation: true,
                    }}
                    downloadOnSavePress={false}
                    showVisualizer={true}
                    classes={{ AudioRecorderClass: "recorderContainer" }}
                />
                <div id={"audioResult"}></div>
                <div>
                    {/* <input type="text" value={currentTaskContent} onChange={updateTaskContent}/> */}
                    <textarea value={currentTaskContent} rows={4} cols={50} onChange={updateTaskContent} style={{ width: "100%", height: "200px", marginBottom: "10px", resize: "none" }}></textarea>
                </div>
                <button id={"submitButton"} style={{ marginRight: "5px" }} onClick={submitTask}>Submit</button>
                <button style={{ backgroundColor: "#de0202" }} onClick={skipTask}>Skip</button>
                <div style={{ marginTop: "10px", fontWeight: "bold" }}>
                    <span>Task: {currentTaskNumberRef.current + 1}/{tasksPrompts.length}</span>
                </div>
            </div> : <p style={{ color: "green", fontSize: "2em" }}>All tasks completed. Thank you!</p>}

        </>
    );
}

export default Recorder;