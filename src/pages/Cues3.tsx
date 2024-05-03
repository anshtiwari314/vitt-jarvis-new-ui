import { useState,useRef, useEffect } from 'react'
import pinkPanther from '../PinkPanther30.wav'
import MsgWrapper from '../components/MsgWrapper';
import { v4 as uuidv4 } from 'uuid';
import WavToMp3 from '../functions/wavToMp3';
import vittLogo from '../assets/vitt-logo.png'
//import { createFFmpeg} from '@ffmpeg/ffmpeg';
//import { useMicVAD } from "@ricky0123/vad-react/dist/index.js"
import { MicVAD } from "@ricky0123/vad-web"
import { useData } from '../context/DataWrapper';
//import  {useMicVAD}  from './MicVadReact'
// import * as voiceActivityDetection from 'https://esm.run/voice-activity-detection'

export default function CuePage(){

// this file is built on top of caus2.tsx
//this file have rickey vad implemented with two buttons one for fetch data 
// & other for recording on

  let [recordingOn,setRecordingOn] = useState<boolean>(false);
  let recordingStatus = useRef(false);
  let [responseType,setResponseType] = useState<string>("insurance") 
  //let recordingOn:boolean = true;
  //@ts-ignore
  let {SESSION_ID,setData,setMsgLoading,audioArr,audioUrlFlag,audioUrlRef} = useData()

  type Transcript = {
    transcript:string
  }

  type responseData = Transcript[] |[]

  let myId:string = uuidv4();
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
  const url2Ref = useRef("")
  const fetchDataRef = useRef<string>('') 
  const [fetchData,setFetchData] = useState("")
  //https://tso4smyf1j.execute-api.ap-south-1.amazonaws.com/test/transcription-clientaudio

  // const vad = useMicVAD({
  //   startOnLoad: true,
  //   onSpeechEnd: (audio) => {
  //     console.log("User stopped talking",audio)
  //   },
  // })
  
  function VAD(cb1:CallableFunction,cb2:CallableFunction){
    return new Promise(async (resolve,reject)=>{
        //@ts-ignore
        const myvad = await vad.MicVAD.new({
          onSpeechStart: cb1,
          onSpeechEnd: cb2
        })
        resolve(myvad)
        reject(myvad)
    })
    
  }
  

   
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
            //uid:myId,
            mob:responseType,
            timeStamp:`${date.toLocaleDateString()} ${date.toLocaleTimeString()}:${date.getMilliseconds()}`,
            sessionid:SESSION_ID,
            //retrievalurl:url2Ref.current
            retrievalurl:fetchDataRef.current,
            url :window.location.hostname
        }),
        cache:'default',}).then(res=>{
           console.log("res from audio server",res)
           return res.json()
        }).then((result)=>{
          
          //setMsg((prev)=>[...prev,...result])
          console.log(result)
        })

    }
   reader.readAsDataURL(blob)
  }

  function startMediaRecorder(stream:MediaStream,time:number){
    //let url = 'https://f6p70odi12.execute-api.ap-south-1.amazonaws.com'
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
    if(audioUrlRef.current === null)
    return ;

    let audio = new Audio()
    audio.src = audioUrlRef.current
    audio.oncanplay =()=>{
      audio.play()
    }
      return ()=>{ 
        audio.pause()
        //@ts-ignore
        audio = null
      }
   },[audioUrlFlag])
  
   useEffect(()=>{
    recordingStatus.current = recordingOn

    let id:number;
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
    return()=>clearInterval(id)
  },[recordingOn])
  
    useEffect(()=>{
      
    let tempVad:any
    let id:undefined|any
    let timer :undefined|any
    
    if(recordingOn ===true){
      console.log("vad trigeered")
      
      //this timeout if user is silence from starting 
      timer = setTimeout(()=>{
        tempVad && tempVad.pause() ; tempVad = undefined
        setRecordingOn(false)
      },5000)

      function start(){
        console.log("audio started")
        //end timer
        timer && clearTimeout(timer); 
        id && clearTimeout(id) ; id = undefined;
      }
      function stop(){
        console.log("audio stopped")
        //start timer
        id=setTimeout(()=>{
          console.log("silence 0.5 sec")
          console.log(tempVad)
          tempVad && tempVad.pause()
          tempVad = undefined
          setRecordingOn(false)
        },500)
      }
      
        VAD(start,stop).then((vad:any)=>{
          tempVad = vad
          vad.start()
        })
        
      }
      return ()=>{
        // if recording On is manually disabled , pause vad 
        tempVad && tempVad.pause(); tempVad = undefined
        id && clearInterval(id);id = undefined
        timer && clearInterval(timer) ; timer = undefined
      }
    },[recordingOn])
    
    useEffect(()=>{

    },[])

    useEffect(()=>{
        //console.log(vad)
        // if(vad.loading===true)
        // return ;
        // console.log(vad)
        // vad.start()

        // setTimeout(()=>{
        //     vad.pause()
        // },10000)
      //console.log(voiceActivityDetection)

    },[])

    function getData(){
      let url = 'https://qhpv9mvz1h.execute-api.ap-south-1.amazonaws.com/prod/fetch-data-fortranscriptiontesting'
      fetch(url,{
        method:'POST',
        headers:{
           'Accept':'application.json',
           'Content-Type':'application/json'
        },

        body:JSON.stringify({}),
        cache:'default',}).then(res=>{
           console.log("res from audio server",res)
           return res.json()
        }).then((result)=>{
          
          //setMsg((prev)=>[...prev,...result])
          if(result.success===true){
          fetchDataRef.current = result.showtranscript
          setFetchData(fetchDataRef.current)
          console.log(result)
          }
        })
    }

  return (
    <div className="App">
        <div className='header'>
            <img src={vittLogo}/>
        </div>
        <h1>Jarvis Recording & Cues Project</h1>
        {/* <p style={{fontSize:"3rem"}}>{vad.userSpeaking ? "speaking":"not speaking"}</p> */}
        <div className='player'>
          {/* <audio controls ref={audioPlayerRef}></audio> */}
          {/* <h4>{audiofile.name}</h4> */}
        </div>
        <div>
            {/* <input 
            className='urlInput'
              type="text" 
              placeholder="Enter url " 
              value={url1} 
              onChange={(e)=>{setUrl1(e.target.value);}} 
            /> */}
            <input 
              type="text" 
              className='urlInput'
             // placeholder="Enter transcription here & click Start Recording to speak" 
             // value={url2} 
             // onChange={(e)=>{url2Ref.current = e.target.value;setUrl2(e.target.value)}} 
              value ={fetchData}
              onChange={(e)=>{fetchDataRef.current= e.target.value;setFetchData(fetchDataRef.current)}}
            />
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
          
        </div>
        <div className='recording'>

          <button className='recordBtn'
            style={{backgroundColor:'rgb(50 39 150)',margin:"0 1rem"}} 
            onClick={()=>getData()}
            >Fetch Data
          </button>
          <button className='recordBtn'
            style={{backgroundColor:recordingOn?'red':'rgb(80 31 159)'}} 
            onClick={()=>{ setRecordingOn((prev)=>!prev) }}
            >{recordingOn? `Recording...`:`Start Recording`}
          </button>
        </div>

        <div >
            <label htmlFor="cars">Choose an option:</label>

            <select id="cars" onChange={e=>setResponseType(e.target.value)}>
              <option value="insurance" >Insurance</option>
              <option value="wealth">Wealth</option>
              
            </select>
        </div>
        <div>
           {audioArr.map((e:any,i:number)=>{
             return <audio src={e.base64} controls={true} autoPlay={true}></audio>
           })}
        </div>
      {/*  */}
    </div>
  )
}<MsgWrapper />

