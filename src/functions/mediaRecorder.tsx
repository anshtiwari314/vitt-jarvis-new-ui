import { sendToServer } from "./requests"
import WavToMp3 from './wavToMp3'

export function startMediaRecorder(args){
    //let url = 'https://f6p70odi12.execute-api.ap-south-1.amazonaws.com'

    let {stream,url,time,recordingStatus,sessionid,userid,fileid,filename,timeStamp} = args
    console.log('startMediaRecorder triggered')

    //let url = audioServerUrl
     let arrayofChunks:any = []
       let mediaRecorder = new MediaRecorder(stream,{
         audioBitsPerSecond:32000
         })
     
     mediaRecorder.ondataavailable = (e)=>{ 
       arrayofChunks.push(e.data)
     }
     
     mediaRecorder.onstop = async ()=>{
      //setMsgLoading(true)
     
      //let url = `https://asia-south1-utility-range-375005.cloudfunctions.net/save_b64_1`
     //let url = `https://0455-182-72-76-34.ngrok.io`
     console.log(`%c just before wav to mp3 ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
     let mp3Blob = await WavToMp3(new Blob(arrayofChunks,{type:'audio/wav'}))
     //console.log(mp3Blob)
     console.log(`%c just after wav to mp3 ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
     
     let data = {
      
      mob:'vois',
     // uid:myId,
      userid,
      sessionid,
      url:window.location.href,
      date: '13.3.2025',
      time: '11.51.0.57',
      fileid,
      filename,
      timeStamp
    }

     sendToServer( mp3Blob,url,sessionid,data)
      arrayofChunks = []
     }

     //setTimeout(()=>mediaRecorder.stop(),time)
 
     //if recording true stop after 30 sec
     let timeOutId = setTimeout(()=>{
      if(mediaRecorder.state==='recording')
      mediaRecorder.stop()
     },time)
     //chk every second 

     

     let timeOutId2 =setTimeout(()=>requestAnimationFrame(()=>{

      if(recordingStatus.current ===false){
        //clearInterval(intervalId) 
        clearTimeout(timeOutId)
        clearTimeout(timeOutId2)
       if(mediaRecorder.state==='recording')
        mediaRecorder.stop()
        
      }
     }),1000)
     

    //  let intervalId = setInterval(
       
    //  },1000)
     mediaRecorder.start()
     
   }

   export function startMediaRecorder2(args){
    //let url = 'https://f6p70odi12.execute-api.ap-south-1.amazonaws.com'

    const {stream,url,time,recordingStatus,sessionid,userid,fileid,filename,timeStamp} =args

    console.log('startMediaRecorder triggered')

    //let url = audioServerUrl
     let arrayofChunks:any = []
       let mediaRecorder = new MediaRecorder(stream,{
         audioBitsPerSecond:32000
         })
     
     mediaRecorder.ondataavailable = (e)=>{ 
       arrayofChunks.push(e.data)
     }
     
     mediaRecorder.onstop = async ()=>{
      //setMsgLoading(true)
     
      //let url = `https://asia-south1-utility-range-375005.cloudfunctions.net/save_b64_1`
     //let url = `https://0455-182-72-76-34.ngrok.io`
     console.log(`%c just before wav to mp3 ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
     let mp3Blob = await WavToMp3(new Blob(arrayofChunks,{type:'audio/wav'}))
     //console.log(mp3Blob)
     console.log(`%c just after wav to mp3 ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
     
     let data = {
      
      //mob:'vois',
     // uid:myId,
      userid,
      sessionid,
      url:window.location.href,
      date: '13.3.2025',
      time: '11.51.0.57',
      fileid,
      filename,
      timeStamp
    }

     sendToServer( mp3Blob,url,sessionid,data)
      arrayofChunks = []
     }

     //setTimeout(()=>mediaRecorder.stop(),time)
 
     //if recording true stop after 30 sec
     let timeOutId = setTimeout(()=>{
      if(mediaRecorder.state==='recording')
      mediaRecorder.stop()
     },time)
     //chk every second 

     

     let timeOutId2 =setTimeout(()=>requestAnimationFrame(()=>{

      if(recordingStatus.current ===false){
        //clearInterval(intervalId) 
        clearTimeout(timeOutId)
        clearTimeout(timeOutId2)
       if(mediaRecorder.state==='recording')
        mediaRecorder.stop()
        
      }
     }),1000)
     

    //  let intervalId = setInterval(
       
    //  },1000)
     mediaRecorder.start()
     
   }

/** Records one chunk (default 4s). Stops early and fires onChunk when recordingStatus becomes false. */
export function startMediaRecorderChunk(args: {
  stream: MediaStream
  durationMs: number
  recordingStatus: { current: boolean }
  onChunk: (blob: Blob) => void | Promise<void>
}): Promise<void> {
  const { stream, durationMs, recordingStatus, onChunk } = args

  return new Promise((resolve, reject) => {
    const chunks: BlobPart[] = []
    let mediaRecorder: MediaRecorder

    try {
      mediaRecorder = new MediaRecorder(stream, {
        audioBitsPerSecond: 32000,
      })
    } catch (error) {
      reject(error)
      return
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    const durationTimeout = setTimeout(() => {
      if (mediaRecorder.state === "recording") mediaRecorder.stop()
    }, durationMs)

    function stopRecordingEarly() {
      if (mediaRecorder.state !== "recording") return
      if (typeof mediaRecorder.requestData === "function") {
        mediaRecorder.requestData()
      }
      mediaRecorder.stop()
    }

    const pauseCheckInterval = setInterval(() => {
      if (!recordingStatus.current) {
        clearTimeout(durationTimeout)
        clearInterval(pauseCheckInterval)
        stopRecordingEarly()
      }
    }, 200)

    mediaRecorder.onstop = async () => {
      clearTimeout(durationTimeout)
      clearInterval(pauseCheckInterval)
      try {
        if (chunks.length > 0) {
          const blob = new Blob(chunks, {
            type: mediaRecorder.mimeType || "audio/webm",
          })
          await onChunk(blob)
        }
      } finally {
        resolve()
      }
    }

    mediaRecorder.onerror = () => {
      clearTimeout(durationTimeout)
      clearInterval(pauseCheckInterval)
      reject(new Error("MediaRecorder error"))
    }

    try {
      mediaRecorder.start()
    } catch (error) {
      clearTimeout(durationTimeout)
      clearInterval(pauseCheckInterval)
      reject(error)
    }
  })
}