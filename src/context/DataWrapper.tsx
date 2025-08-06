import React, { useState,createContext, useContext, useEffect, useRef } from 'react'
import AddOnlySuggestiveMsg from '../components/AddOnlySuggestiveMsg'
import AddTextMsg from '../components/AddTextMsg'
import {connect, io} from 'socket.io-client';
import {v4 as uuidv4} from 'uuid'
import WavToMp3 from '../functions/wavToMp3';
import { useAuth } from './AuthContext';
import { xhrUploadFile } from '../functions/requests';

import { startMediaRecorder,startMediaRecorder2 } from '../functions/mediaRecorder';
import { getTimeStamp,getOldTimeStamp } from '../functions/generalFn';
import {handleData } from '../functions/incomingDataPreprocessing'

import Meeting from '../assets/Meeting.svg'
import Home from '../assets/Home.svg'
import Setting from '../assets/Setting.svg'
import Inventory from './assets/Inventory.svg'
import Library from '../assets/Library.svg'
import Analytics from '../assets/Analytics.svg'
import Schedule from '../assets/Schedule.svg'
import Feedback from '../assets/Feedback.svg'

import useAutoResetState from '../hooks/useAutoResetState';
import useWasmLoader from '../hooks/useWasmLoader'

const Context = createContext('')
type Data = {
        type:string,
        query: string, 
        label:string,
        replies: string[],
        color: string,
        iconColor:string,
        similarity_query:string,
        imageurl:string,
        value:string,
        radio:string[],
        content:string[],
        id:string,
        iconName:string,
        imageUrl:string,
        sessionid :string,
        audiofiletimestamp:string,
        loading:boolean
        initquery:boolean
        istranscription:boolean
} 
export function useData(){
    return useContext(Context)
}
 
export default function DataWrapper({children}:{children:React.ReactNode}) {
    
    const [data,setData] = useState<Object[]>([])
    const dataArrRef = useRef<any>([])
    let audioServerUrl =`https://tso4smyf1j.execute-api.ap-south-1.amazonaws.com/test/transcription-clientaudio`
    //let url1 = 'http://localhost:3008/'
    let socketUrl = 'https://vitt-ai-request-broadcaster-production.up.railway.app'
    //let socketUrl = 'http://localhost:5000'
    const globalStreamRef = useRef<any>(null)
    const [recordingActive,setRecordingActive] = useState(false)
    const recordingActiveStatus = useRef(false)
    //@ts-ignore
    const {currentUser}= useAuth()
    const [SESSION_ID,setSessionId] = useState(currentUser?.userid) 
    const tempRef = useRef("")
    //const [msgLoading,setMsgLoading] = useState<boolean>(false);
    
    
    const audioQueueRef = useRef<string[]>([])
    const [audioQueue,setAudioQueue] = useState<string[]>([])
    const [audioArr,setAudioArr] = useState<string[]>([])
    const isAudioStillPlaying = useRef<boolean>(false)
    const [resetAudioPlayerState,setResetAudioPlayerState] = useState('')
    let audioUrlRef = useRef(null)
    const [audioUrlFlag,setAudioUrlFlag] = useState<boolean>(false)
    const [audioUrl,setAudioUrl] = useState('')

    //  this state is used for stt record (media recorder start & stop several times)
    const [toggleChunking,setToggleChunking] = useState(false)
    const chunkingActiveStatus = useRef(false)

    // this state is used for continuous media recorder without stopping & send data when available 
    // without processing it to mp3  
    const [toggleContinuousChunking,setToggleContinuousChunking] = useState(false)  

    const [socket,setSocket] = useState<any>(null)
    const [msgId,setMsgId] = useState(uuidv4())

    
    const [manualVadRecordingOn,setManualVadRecordingOn]  = useState<boolean>(false);
    
    const [progress,setProgress] = useState({uploaded:0,hidden:false})
    const sessionUid = uuidv4()
    //const [ngrokServerUrl,setNgrokServerUrl] = useState('')
    const vittSalesCopilot = 'https://wpv7kxos9g.execute-api.ap-south-1.amazonaws.com/test/sales-copilot-gcp'
    const ngrokUrl = 'https://wpv7kxos9g.execute-api.ap-south-1.amazonaws.com/test/recruito-upload-apis'
    //const ngrokUrl = 'https://54f228149b21.ngrok-free.app'
    //https://rr7yg8ikr5.execute-api.ap-south-1.amazonaws.com/test/docretrieval_clientaudio
    //const oneWayUrl = 'http://35.200.139.251/tezz_nbfc'
    //const oneWayUrl = 'https://cd824b8dabc9.ngrok-free.app/tezz_nbfc'
    //const oneWayUrl = 'https://e1433db306a2.ngrok-free.app'
    
    const [oneWayUrl,setOneWayUrl] = useState('http://35.200.139.251/tezz_nbfc')
    const [ngrokServerUrl,setNgrokServerUrl]= useState(ngrokUrl)
    //https://wpv7kxos9g.execute-api.ap-south-1.amazonaws.com/test/recruito-upload-apis
    const [recordingServerUrl,setRecordingServerUrl] = useState('https://wpv7kxos9g.execute-api.ap-south-1.amazonaws.com/test/recruito-upload-apis')
    const audioRef = useRef(null);
    const [activeTab,setActiveTab ] = useState(0)

    const[msgLoading,setMsgLoading]= useAutoResetState(false,10000)

    const wasmUrls = [
      'ort-wasm-simd-threaded.jsep.wasm',
      // 'ort-wasm-simd-threaded.wasm',
      // 'ort-wasm-simd.jsep.wasm',
      // 'ort-wasm-simd.wasm',
      // 'ort-wasm-threaded.wasm',
      // 'ort-wasm.wasm'

    ];

    //useWasmLoader(wasmUrls)
    const isFilesLoaded = false

    const tabs = [
      {tab:'Dashboard',icon:Home},
      {tab:'Recordings',icon:Meeting},
      {tab:'Language Settings',icon:Setting},
      {tab:'Advanced Analytics',icon:Analytics},
      {tab:'Schedule',icon:Schedule},
      {tab:'Library',icon:Library},
      {tab:'Your Feedback',icon:Feedback}
    ] 

    let Data = {
        color: "#7D11E9",
        content: ['Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.'],
        iconColor: "blue",
        initquery: "what is mutual fund? what is mutual fund? is mutual fund what is mutual fund what is mutual fund",
        match_score: "0.9741857",
        matched_query: "what is a mutual fund",
        query: ['what is a mutual fund'],
        raw_modded_query: "what is mutual fund fund",
        sessionid: ['aff2b452-5014-4132-8d6d-6ccfa8d520b1'],
        similarity_query: "Definition of mutual fund",
        istranscription:true
    }
    
    
    

    useEffect(()=>{
      console.log("datawrapper ",currentUser)
    },[currentUser])
    
    function handleAudio(base64:string,filename:string){
        //@ts-ignore
        //setAudioArr(prev=>[...prev,{base64:base64,filename:filename}])
    }
   

    function handleQuery(data:any){
        setMsgLoading(true)
        console.log(data)
        let tempObj = {
            query:data,
            
            //this one is for jarvis-in-person
            //sessionid : SESSION_ID,

            //this one is for vitt-sales-copilot
            sessionid:currentUser?.sessionuid,
            mob: SESSION_ID,
            
           
            
            userid:SESSION_ID
        }
        //socket.emit("messagefromclient",tempObj)
        //
        
        let url = 'https://tso4smyf1j.execute-api.ap-south-1.amazonaws.com/test/transcription-2way-clientaudio'
        let url2 = 'https://34.100.145.102/'
        let url3 = 'https://ff6e-49-204-210-149.ngrok-free.app'
        let url4 = 'https://wpv7kxos9g.execute-api.ap-south-1.amazonaws.com/test/sales-copilot-gcp'


        let {arr,audiourl} = handleData({sessionid:currentUser?.sessionuid,similarity_query:data,isOutgoing:true})
        console.log('arr from handleQuery',arr)
        setData(prev=>[...prev,...arr])
        
        fetch(oneWayUrl,{
          method:'POST',
          headers:{
            'Accept':'application.json',
            'Content-Type':'application/json'
          },
          body:JSON.stringify(tempObj),
          cache:'default',}).then(res=>{
            console.log("res from audio server",res)
          })
    }
    function handleTokens(data:any){
        
        let tempArr= dataArrRef.current.filter((e:any)=>{
            if(e.msgId ===data.messageid)
            return true;
            else return false;
        })
        let tempMsg = tempArr[0]
        console.log("tempMsg",tempMsg)

        if(tempMsg === undefined){
            tempMsg ={
                query:data.query,
                content:data.text,
                color:"#7D11E9",
                iconColor:"blue",
                similarity_query:"Definition of mutual fund",
                sessionid:SESSION_ID,
                istranscription:true,
                msgId:data.messageid
            }
            dataArrRef.current = [...dataArrRef.current,tempMsg]
        }else{
            dataArrRef.current[dataArrRef.current.length-1].content = `${tempMsg.content}${data.text}`
            
        }
        //console.log("tempMsg",tempArr)
       
        setData([...dataArrRef.current])
    }

    function handleRecordings(stream:MediaStream){
      let url = 'https://qhpv9mvz1h.execute-api.ap-south-1.amazonaws.com/prod/postfacto-upload-test'
      let arrayofChunks:any = []
        let mediaRecorder = new MediaRecorder(stream,{
          audioBitsPerSecond:32000
          })
      
      mediaRecorder.ondataavailable = (e)=>{ 
        arrayofChunks.push(e.data)
      }
      
      mediaRecorder.onstop = async ()=>{
      // setMsgLoading(true)
      //let url = `https://asia-south1-utility-range-375005.cloudfunctions.net/save_b64_1`
      //let url = `https://0455-182-72-76-34.ngrok.io`
      console.log(`%c just before wav to mp3 ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
      let mp3Blob = await WavToMp3(new Blob(arrayofChunks,{type:'audio/wav'}))
      //console.log(mp3Blob)
      console.log(`%c just after wav to mp3 ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
      //sendToServer( mp3Blob,url)
      let myfile = new File([mp3Blob], "audio.mp3", {type:"audio/mp3"});
      xhrUploadFile(myfile)
      
       arrayofChunks = []
      }
 
      //setTimeout(()=>mediaRecorder.stop(),time)
  
      //if recording true stop after 30 sec
      
      // let timeOutId = setTimeout(()=>{
      //  if(mediaRecorder.state==='recording')
      //  mediaRecorder.stop()
      // },time)

      //chk every second 
      // let intervalId = setInterval(()=>{
      //   if(recordingStatus.current ===false){
      //     clearInterval(intervalId) 
      //      clearTimeout(timeOutId)
      //    if(mediaRecorder.state==='recording')
      //     mediaRecorder.stop()
          
      //   }
        
      // },1000)

      globalStreamRef.current = mediaRecorder
      mediaRecorder.start()
    }
    
    
  
    function handleProcessing(){
      xhrUploadFile(audiofile)
    }

    useEffect(()=>{

      let audioElem = audioRef.current;
      if(!audioElem) return;

    function handlePlay(){
      //console.log(`%c audio play event ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
      isAudioStillPlaying.current = true
    }
    function handlePause(){
      //console.log(`%c audio paused ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
    }
    function handleEnded(){
      //console.log(`%c audio ended ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
      //chk if audioArr has more than one element
      
      if(audioQueueRef.current.length>0){
        setAudioUrl(audioQueueRef.current.shift())
       // setAudioQueue(audioQueueRef.current)
        setResetAudioPlayerState(uuidv4())
      }else {
        isAudioStillPlaying.current = false
      }
      
    
    }
    function handlePlaying(){
      //console.log(`%c audio playing ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
      isAudioStillPlaying.current = true
    }
    function handleWaiting(){
      //console.log(`%c audio waiting ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
     // isAudioStillPlaying.current = false 
    }
    
    audioElem.addEventListener('play', handlePlay)

    audioElem.addEventListener('pause', handlePause)

    audioElem.addEventListener('ended', handleEnded)

    audioElem.addEventListener('playing', handlePlaying)

    audioElem.addEventListener('waiting',handleWaiting)

    console.log(`%c listeners added to audio elem ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
    
    return () => {
      audioElem.removeEventListener('play', handlePlay);
      audioElem.removeEventListener('pause', handlePause);
      audioElem.removeEventListener('ended', handleEnded );
      audioElem.removeEventListener('playing', handlePlaying);
      audioElem.removeEventListener('waiting', handleWaiting);
      console.log(`%c listeners removed from audio elem ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
    }
  },[])


  useEffect(()=>{
    let audioElem = audioRef.current;
    if(!audioElem) return;
    if(audioUrl === '') return;

    //console.log(`%c audioArr ${audioArr} ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
    
    function handleCanPlayThough(){
      console.log(`%c audio started ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
      audioElem.play();
    }

    
    audioElem.addEventListener("canplaythrough",handleCanPlayThough);

    console.log('just before changing audio url')
    audioElem.src = audioUrl;

    return ()=>{
      audioElem.removeEventListener("canplaythrough",handleCanPlayThough);
    }

  },[audioUrl,resetAudioPlayerState])

    function playAudio(audiourl){
      //console.log('audiourl',audiourl)
      let audioElem = audioRef.current;
    //@ts-ignore
    audioElem.src = audiourl;

    
    //@ts-ignore
    function handleCanPlayThough(){
      console.log(`%c audio started ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
      audioElem.play();
    }

    
    audioElem.addEventListener("canplaythrough",handleCanPlayThough);
    

    
    }

    useEffect(()=>{
      console.log("recording acive status",recordingActive)
      // if(recordingActive){
      //   navigator.mediaDevices.getUserMedia({
      //     audio:true
      //   }).then(stream=>{
      //     console.log("before handle recording triggered")
      //     handleRecordings(stream)
      //   }).catch(()=>{
      //     console.log("error in recording")
      //   })
      // }
      // else {
      //   let mediaRecorder = globalStreamRef.current
         
      //   if(mediaRecorder !==null && mediaRecorder.state==='recording'){
      //     mediaRecorder.stop()
      //     console.log("after media recorder stop")
      //   }
      // }

    },[recordingActive])

    useEffect(()=>{
      console.log('i am current user at data-wrapper',currentUser)
    },[currentUser])
    
    useEffect(()=>{
        console.log(data)
    },[data])

    useEffect(()=>{
        console.log('i am session id at data-wrapper',SESSION_ID)
    },[SESSION_ID])

    useEffect(()=>{
        const tempSocket = io(socketUrl)
        console.log(tempSocket)
        setSocket(tempSocket)
    },[])

   

    useEffect(()=>{
        if(SESSION_ID==='' || socket===null )
        return;
        //handleData(Data)
        //handleData(Data)

        // if(socket.id===undefined)
        // return ;
        //console.log(socket,socket.connected,socket.id)

        function onConnect(){
                console.log("connection established");
                console.log("socket.id",socket.id)
             //socket.emit('join-room',SESSION_ID,socket.id)
        }

        function onDisconnect(){
            console.log("disconnected")
        }

        function isAudioPlaying(audioElement) {
  return !audioElement.paused;
}

        function receiveData(result:any){
          console.log(`%c just after receiveing data ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
          console.log(result.text,result.messageid,result);
            // if(tempRef.current ===data){
            //     //console.log("tempRef current",tempRef.current)
            //     return ;
            // }
            
            console.log(result.sessionid ===SESSION_ID,result.sessionid,result,SESSION_ID,currentUser)

            if(result.sessionid === currentUser.sessionuid){
              console.log(`%c just after filter data for this session id ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
              setMsgLoading(false)
              const {arr,audiourl}=handleData(result)
              //console.log('i am audiourl',audiourl)
              //setAudioUrl(audiourl)
              //console.log(audiourl)
              console.log(`%c audioRef paused ${audioRef.current.paused} ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
             
              // if()
              // if(audiourl!==null)
              //   playAudio(audiourl)
              
               //let isPlaying = isAudioPlaying(audioRef.current)
              //console.log('isAudioPlaying',isPlaying)
              console.log(`%c audioRef paused ${audioRef.current.paused} ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
              
              setData(prev=>[...prev,...arr])
              //setAudioArr(prev=>[...prev,audiourl])
              

              if(isAudioStillPlaying.current===false){
              setAudioUrl(audiourl)
              }else {
               audioQueueRef.current = [...audioQueueRef.current,audiourl]
                
              }
              
            }
    }
       socket.on("connect",onConnect)
       socket.on("disconnect",onDisconnect)
       socket.on("receive-data",receiveData)

       return ()=>{
           socket.off("connect",onConnect)
           socket.off('disconnect',onDisconnect)
           socket.off("receive-data",receiveData)
       }
    },[SESSION_ID,socket,msgId])

    
      
      

    useEffect(()=>{
      recordingActiveStatus.current = recordingActive
      let url = 'http://35.200.139.251'
      let url2 = `https://wpv7kxos9g.execute-api.ap-south-1.amazonaws.com/test/recruito-upload-apis`
      let uid = uuidv4()
      let timeOutId
      let intervalId
      if(recordingActive===true){
        navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{

          let startMediaRecorderArgs = {
            stream,
            time:4000,
            recordingStatus:recordingActiveStatus,
            url:`${recordingServerUrl}/save_audio_chunk`,
            mob:currentUser.userid,
            sessionid:currentUser.sessionuid,
            userid:currentUser.userid,
            
            fileid:currentUser.sessionuid,
            filename:`${currentUser.sessionuid}.mp3`,
            timeStamp:getTimeStamp()
          } 

          console.log('navigator')
          startMediaRecorder2(startMediaRecorderArgs)
          
          intervalId =setInterval(()=>{
            startMediaRecorder2(startMediaRecorderArgs)
          },4000)
          //timeOutId=setTimeout(()=>requestAnimationFrame(()=>startMediaRecorder(startMediaRecorderArgs)),4000)
        })
        
      }

      return ()=> { timeOutId && clearTimeout(timeOutId);
        intervalId && clearInterval(intervalId)
      }
    },[recordingActive,recordingServerUrl])

    
    useEffect(()=>{
        // this code is to handle chuking logic which is used for very small files  
      let intervalId 

      let data = {
          sessionid:currentUser?.sessionuid,
          mob:currentUser.userid,
          userid:currentUser?.userid
      }

      let baseUrl = 'https://b1c231587c5c.ngrok-free.app'; // Default URL
      let url = `${ngrokServerUrl}/stream_audio`
      let recordingTime = 500 //in ms

      if(toggleChunking===true){
        navigator.mediaDevices.getUserMedia({audio:true}).then(audioStream=>{
            startMediaRecorder(audioStream,url,recordingTime,data)
            intervalId = setInterval(()=>{
              startMediaRecorder(audioStream,url,recordingTime,data)
            },recordingTime)
        })
      }

      return ()=>{
        intervalId && clearInterval(intervalId)
      }
    },[toggleChunking,ngrokServerUrl])
        

    

    

    let values = {
        data,
        setData,
        SESSION_ID,setSessionId,
        msgLoading,
        setMsgLoading,
        audioArr,
        audioUrlFlag,audioUrlRef,
        handleQuery,
        sessionUid,
        audioRef,
       // vadRecordingOn,setVadRecordingOn,
        manualVadRecordingOn,setManualVadRecordingOn,
        audioUrl,setAudioUrl,
        recordingActive,setRecordingActive,tabs,activeTab,setActiveTab,
        ngrokServerUrl,setNgrokServerUrl,oneWayUrl,isFilesLoaded,recordingServerUrl,setRecordingServerUrl,
        toggleChunking,setToggleChunking,toggleContinuousChunking,setToggleContinuousChunking,audioQueueRef,isAudioStillPlaying
    }
  return (
      //@ts-ignore
    <Context.Provider value={values}>
        {children}
    </Context.Provider>
  )
}
