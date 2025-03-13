import { sendToServer } from "./requests"
import WavToMp3 from './wavToMp3'

export function startMediaRecorder({stream,audioServerUrl,time,recordingStatus,SESSION_ID}){
    //let url = 'https://f6p70odi12.execute-api.ap-south-1.amazonaws.com'

    console.log('startMediaRecorder triggered')

    let url = audioServerUrl
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
     
     sendToServer( mp3Blob,url,SESSION_ID)
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