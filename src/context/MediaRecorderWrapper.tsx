import React, { createContext, useContext, useState, useEffect } from 'react';

import { PostReq } from '../functions/requests';
import { generateBase64, getTimeStamp } from '../functions/generalFn';
//import { continuousMediaRecorder } from '../functions/mediaRecorder';
import { useAuth } from './AuthContext';
import { useData } from './DataWrapper';


const MediaRecorderContext = createContext('');

export function useMediaRecorderData(){
    return useContext(MediaRecorderContext);   
}


export default function MediaRecorderWrapper({children}){

    const {toggleContinuousChunking,setToggleContinuousChunking} = useData()
    const [continuousRecorder,setContinuousRecorder] = useState(null);
    const {currentUser} = useAuth()


    async function getAudioStream(){
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            return audioStream;
        } catch (error) {
            console.error('Error accessing audio stream:', error);
            throw error;
        }
    }

    async function sendAudioChunk(audioBlob) {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob); // Reads the blob as a Base64 encoded string
            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1]; // Get the base64 part

                try {
                    const response = await fetch(`https://b1c231587c5c.ngrok-free.app/stream_audio`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sessionid: currentUser.sessionuid,
                            audiomessage: base64Audio
                        }),
                    });
                    const data = await response.json();
                    if (response.ok) {
                        // console.log('Chunk sent successfully:', data.message);
                        // For this example, we're not receiving transcripts directly back from the backend
                        // The backend logs them. You'd use WebSockets for real-time client updates.
                        // appendTranscript(`[Client Sent] Chunk for session ${sessionId}`);
                    } else {
                        console.error('Error sending chunk:', data.message);
                       // showMessage(`Error sending audio chunk: ${data.message}`, 'error');
                    }
                } catch (error) {
                    console.error('Network error sending chunk:', error);
                   // showMessage(`Network error sending audio chunk: ${error.message}`, 'error');
                }
            };
        }

    useEffect(()=>{
        
        let recorder:MediaRecorder|null = null;
        let baseUrl = 'https://b1c231587c5c.ngrok-free.app'; // Default URL
        let url = `${baseUrl}/stream_audio`;

        async function initMediaRecorder(){

            const audioStream = await getAudioStream();
            recorder = new MediaRecorder(audioStream,{
            //audioBitsPerSecond:32000,
            mimeType: 'audio/webm;codecs=opus'
            })

            let data = {
            sessionid:currentUser?.sessionuid,
            mob:currentUser.userid,
            userid:currentUser?.userid
            }

            recorder.ondataavailable = async (event)=>{ 
                if (event.data.size > 0) {
                    // let base64 = await generateBase64(event.data)

                    // data = {...data, 
                    //     audiomessage:base64.split(',')[1],
                    //     audiofiletimestamp: getTimeStamp()
                    // }
                    // let res = await PostReq(url,data)
                    sendAudioChunk(event.data);
                   // console.log("res from audio server",res)
                }
            }
        
            recorder.onstop = ()=> {
                console.log('MediaRecorderWrapper stopped');
                recorder.stream.getTracks().forEach(track => track.stop());
            };

            //recorder.start(200); // Start recording with a 200ms interval
            setContinuousRecorder(recorder); 
            console.log('MediaRecorderWrapper initialized inside',recorder);
        }

        initMediaRecorder();
        //console.log('MediaRecorderWrapper initialized',recorder);


       
        return ()=>{

            console.log('MediaRecorderWrapper cleaned up',recorder);
            
            if (recorder && recorder.state !== 'inactive') {
                recorder.stop();
            }
            
            
        }
        
    },[])

    useEffect(()=>{

        if(!continuousRecorder) return;
        console.log('toggleContinuousChunking changed',toggleContinuousChunking, continuousRecorder.state);

        if(toggleContinuousChunking){
            if(continuousRecorder.state === 'paused')
            continuousRecorder.resume();
            else if(continuousRecorder.state === 'inactive'){
                continuousRecorder.start(200); // Start recording with a 200ms interval
            }
            
        }else{
            if(continuousRecorder.state === 'recording')
            continuousRecorder.pause();
        }

        
        // if (continuousRecorder && continuousRecorder.state !== 'inactive') 
        //     continuousRecorder.stop(); 
    },[toggleContinuousChunking])


    let values = {

    }
    return (
        <MediaRecorderContext.Provider value={{values}}>
            {children}
        </MediaRecorderContext.Provider>
    )
}