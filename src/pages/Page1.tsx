import { useState,useRef, useEffect } from 'react'
import pinkPanther from '../PinkPanther30.wav'
import MsgWrapper from '../components/MsgWrapper';
import { v4 as uuidv4 } from 'uuid';
import WavToMp3 from '../functions/wavToMp3';
import vittLogo from '../assets/vitt-logo.png'
import { useData } from '../context/DataWrapper';
//import { createFFmpeg} from '@ffmpeg/ffmpeg';


export default function CuePage(){

  let [recordingOn,setRecordingOn] = useState<boolean>(false);
  let recordingStatus = useRef(false);
  let [responseType,setResponseType] = useState<string>("insurance") 
  //let recordingOn:boolean = true;
  //@ts-ignore
  let {SESSION_ID,setData,setMsgLoading} = useData()

  type Transcript = {
    transcript:string
  }

  type responseData = Transcript[] |[]

  //let myId:string = uuidv4();
  let [msg,setMsg] = useState<responseData>([]);
  
  type progressBarType = {
      uploaded:number,
      hidden:boolean 
    }

  const [count, setCount] = useState(0)
  const [audiofile,setAudioFile] = useState<any>("");
  const [progress,setProgress] = useState<progressBarType>({uploaded:0,hidden:true})
  const audioPlayerRef = useRef<HTMLAudioElement>(null!)
  const [url1,setUrl1] = useState<string>("https://tso4smyf1j.execute-api.ap-south-1.amazonaws.com/test/transcription-clientaudio")
  const [url2,setUrl2] = useState<string>("") 
  

  function selectAudio(e:any){
    console.log(e.target.files[0]);
    let audioElement = audioPlayerRef.current;
    let url = URL.createObjectURL(e.target.files[0])
    
    
    setAudioFile( e.target.files[0] )
    audioElement.src = url 
    

    audioElement.addEventListener("load",()=>{
      URL.revokeObjectURL(url)
    })

    audioElement.play();

  }

  function setPercentage(event:any){
  
    let percent= (event.loaded/event.total)*100;
    if(percent!=100)
    setProgress({uploaded:Math.round(percent),hidden:false})
    else {
      setProgress({uploaded:100,hidden:false})
      setTimeout(()=>{
        setProgress({uploaded:0,hidden:true})
      },3000)
    }
  }

  
  function sendFileToServer(){
    

    let formData = new FormData(); 
    formData.append("file1",audiofile);
    formData.append("fileName",audiofile.name);

    let ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", setPercentage, false);
    ajax.addEventListener("load", (e)=>{
      
      console.log("load",e) 
          
      //setPercentage(numberOfChunks-chunks.length,numberOfChunks)
    }, false);
    ajax.onreadystatechange = () => {
      if (ajax.readyState === 4) {
        let tempData= JSON.parse(ajax.response)

        setMsg((prev)=>[...prev,...tempData])
        console.log('ajax response',tempData);
      }
    }
    ajax.addEventListener("error", (e)=>{
      console.log("error",e)
     // setProgress({uploaded:0,hidden:true})
    }, false);
    ajax.addEventListener("abort", (e)=>{console.log("abort error",e)}, false); 

    ajax.open("POST", url1); 
    //ajax.timeout = 2000;
    ajax.send(formData);


    // request.onreadystatechange = function()
    // {
    //     if (request.readyState == 4 && request.status == 200)
    //     {
    //         callback(request.responseText); // Another callback here
    //     }
    // }; 

}
  

  function sendToServer(blob:any,url:string){
    //console.log(blob)
    let reader = new FileReader()
    reader.onloadend = ()=>{
      let base64data:any = reader.result;
     // console.log(`base64`,base64data)
     let date = new Date() 
     fetch(url,{
        method:'POST',
        headers:{
           'Accept':'application.json',
           'Content-Type':'application/json'
        },

        body:JSON.stringify({
            audiomessage:base64data.split(',')[1],
           // uid:myId,
            mob:responseType,
            timeStamp:`${date.toLocaleDateString()} ${date.toLocaleTimeString()}:${date.getMilliseconds()}`,
            sessionid:SESSION_ID
        }),
        cache:'default',}).then(res=>{
           console.log("res from audio server",res)
           
           return res.json()
        }).then((result)=>{
          //setData(prev=>[...prev,{sessionid:SESSION_ID,loading:true}])
          //setMsg((prev)=>[...prev,...result])
          console.log(result)
        })

    }
   reader.readAsDataURL(blob)
  }

  function startMediaRecorder(stream:MediaStream,time:number){
   // let url = 'https://tso4smyf1j.execute-api.ap-south-1.amazonaws.com/test/transcription-clientaudio'

    let url = url1
     let arrayofChunks:any = []
       let mediaRecorder = new MediaRecorder(stream,{
         audioBitsPerSecond:32000
         })
     
     mediaRecorder.ondataavailable = (e)=>{ 
       arrayofChunks.push(e.data)
     }
     
     mediaRecorder.onstop = async ()=>{
      setMsgLoading(true)
     //let url = `https://asia-south1-utility-range-375005.cloudfunctions.net/save_b64_1`
     //let url = `https://0455-182-72-76-34.ngrok.io`
     let mp3Blob = await WavToMp3(new Blob(arrayofChunks,{type:'audio/wav'}))
     //console.log(mp3Blob)
     sendToServer( mp3Blob,url)
      arrayofChunks = []
     }
     //setTimeout(()=>mediaRecorder.stop(),time)
 
     //if recording true stop after 30 sec
     let timeOutId = setTimeout(()=>{
      if(mediaRecorder.state==='recording')
      mediaRecorder.stop()
     },time)
     //chk every second 
     let intervalId = setInterval(()=>{
       if(recordingStatus.current ===false){
         clearInterval(intervalId) 
          clearTimeout(timeOutId)
        if(mediaRecorder.state==='recording')
         mediaRecorder.stop()
         
       }
       
     },1000)
     mediaRecorder.start()
     
   }

  useEffect(()=>{
    recordingStatus.current = recordingOn

    let id:Number;
    if(recordingOn ===true){
      setMsg([]);
      navigator.mediaDevices.getUserMedia({
        audio:true
      }).then(stream=>{
       startMediaRecorder(stream,30000)
       //@ts-ignore
        id = setInterval(()=>{
          console.log('recording is ',recordingOn)
          startMediaRecorder(stream,30000)
        },30000)
      })
     // if(recordingOn ===true) 
    }
    //@ts-ignore
    return()=>clearInterval(id)
  },[recordingOn])
  
  return (
    <div className="App">
        <div className='header'>
            <img src={vittLogo}/>
        </div>
        <h1>Jarvis Recording & Cues Project</h1>
      
        <div className='player'>
          {/* <audio controls ref={audioPlayerRef}></audio> */}
          {/* <h4>{audiofile.name}</h4> */}
        </div>
        <div>
           {/* <input 
            className='urlInput'
              type="text" 
              placeholder="Enter url" 
              value={url1}
              onChange={(e)=>{setUrl1(e.target.value);setUrl2(e.target.value)}} 
            />  */}
        </div>
        <div className="fileInputs">
            
            {/* <div>
            
              <label htmlFor="fileInput">Select Audio File</label>
                <input 
                  type="file"
                  name="fileInput" 
                  id="fileInput"
                  accept=".mp3,.wav,.aac"
                  onChange={(e)=>selectAudio(e)} 
                  /> 
                <button disabled={!progress.hidden} onClick={()=>{setMsg([]);sendFileToServer()}}>Upload</button>
            </div>
             */}
            {/* <div className='progressive' style={{display:progress.hidden?`none`:'block'}}> 

              <progress className="progressBar" value={progress.uploaded} max="100" ></progress>
              <p>{progress.uploaded}%</p>
            </div> */}
        </div>
        <div>
          {/* <input 
              type="text" 
              placeholder="Enter url for base64" 
              value={url2} 
              onChange={(e)=>setUrl2(e.target.value)} 
            /> */}
        </div>
        <div className='recording'>
          <button className='recordBtn'
            style={{backgroundColor:recordingOn?'red':'rgb(80 31 159)'}} 
            onClick={()=>{ setRecordingOn((prev)=>!prev) }}
            >{recordingOn? `Recording...`:`Start Recording`}
          </button>
        </div>

        <div>
            <label htmlFor="cars">Choose an option:</label>

            <select id="cars" onChange={e=>setResponseType(e.target.value)}>
              <option value="insurance" >Insurance</option>
              <option value="wealth">Wealth</option>
              
            </select>
            
        </div>
      <MsgWrapper />
    </div>
  )
}

