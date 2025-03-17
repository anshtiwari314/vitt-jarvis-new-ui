import React, { useState,createContext, useContext, useEffect, useRef } from 'react'
import AddOnlySuggestiveMsg from '../components/AddOnlySuggestiveMsg'
import AddTextMsg from '../components/AddTextMsg'
import {connect, io} from 'socket.io-client';
import {v4 as uuidv4} from 'uuid'
import WavToMp3 from '../functions/wavToMp3';
import { useAuth } from './AuthContext';
import { xhrUploadFile } from '../functions/requests';

import { startMediaRecorder } from '../functions/mediaRecorder';
import {handleData } from '../functions/incomingDataPreprocessing'

import Meeting from '../assets/Meeting.svg'
import Home from '../assets/Home.svg'
import Setting from '../assets/Setting.svg'
import Inventory from './assets/Inventory.svg'
import Library from '../assets/Library.svg'
import Analytics from '../assets/Analytics.svg'
import Schedule from '../assets/Schedule.svg'
import Feedback from '../assets/Feedback.svg'

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
    const globalStreamRef = useRef<any>(null)
    const [recordingActive,setRecordingActive] = useState(false)
    const recordingActiveStatus = useRef(false)
    //@ts-ignore
    const {currentUser}= useAuth()
    const [SESSION_ID,setSessionId] = useState(currentUser.sessionid) 
    const tempRef = useRef("")
    const [msgLoading,setMsgLoading] = useState<boolean>(false);
    const [audioArr,setAudioArr] = useState<any>([])

    let audioUrlRef = useRef(null)
    const [audioUrlFlag,setAudioUrlFlag] = useState<boolean>(false)
    const [audioUrl,setAudioUrl] = useState('')

    const [socket,setSocket] = useState<any>(null)
    const [msgId,setMsgId] = useState(uuidv4())
    let [recordingOn,setRecordingOn] = useState<boolean>(false);
    let recordingStatus = useRef(false);
    const [progress,setProgress] = useState({uploaded:0,hidden:false})
    const sessionUid = uuidv4()

    const [activeTab,setActiveTab ] = useState(0)
    
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
    
    

    function handleAudio(base64:string,filename:string){
        //@ts-ignore
        setAudioArr(prev=>[...prev,{base64:base64,filename:filename}])
    }
   

    function handleQuery(data:any){
        setMsgLoading(true)
        console.log(data)
        let tempObj = {
            query:data,
            sessionid:SESSION_ID
        }
        //socket.emit("messagefromclient",tempObj)
        //

        fetch('https://tso4smyf1j.execute-api.ap-south-1.amazonaws.com/test/transcription-2way-clientaudio',{
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

        function receiveData(result:any){
          console.log(`%c just after receiveing data ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
          console.log(result.text,result.messageid,result);
            // if(tempRef.current ===data){
            //     //console.log("tempRef current",tempRef.current)
            //     return ;
            // }
            
            console.log(result.sessionid ===SESSION_ID,result.sessionid,result,SESSION_ID)

            if(result.sessionid === SESSION_ID){
              console.log(`%c just after filter data for this session id ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
              
              const {arr}=handleData(result)
              setData(prev=>[...arr,...prev])
           // handleAudio(data.speech_bytes,data.file_name)
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
      
      

    useEffect(()=>{
      recordingActiveStatus.current = recordingActive

      let uid = uuidv4()

      let timeOutId
      let intervalId
      if(recordingActive===true){
        navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{

          let startMediaRecorderArgs = {
            stream,
            time:4000,
            recordingStatus:recordingActiveStatus,
            url:`${`https://8d38-49-204-210-149.ngrok-free.app`}/save_audio_chunk`,
            SESSION_ID,
            fileid:sessionUid ,
            filename:`${sessionUid}.mp3`
          } 

          console.log('navigator')
          startMediaRecorder(startMediaRecorderArgs)
          intervalId =setInterval(()=>{
            startMediaRecorder(startMediaRecorderArgs)
          },4000)
          //timeOutId=setTimeout(()=>requestAnimationFrame(()=>startMediaRecorder(startMediaRecorderArgs)),4000)
        })
        
      }

      return ()=> { timeOutId && clearTimeout(timeOutId);
        intervalId && clearInterval(intervalId)
      }
    },[recordingActive])

    useEffect(()=>{
        recordingStatus.current = recordingOn
    
        let id:number;
        if(recordingOn ===true){
          //setMsg([]);
          navigator.mediaDevices.getUserMedia({
            audio:true
          }).then(stream=>{

            let startMediaRecorderArgs = {
              stream,
              time:30000,
              recordingStatus:recordingStatus,
              audioServerUrl,
              SESSION_ID
            } 

           startMediaRecorder(startMediaRecorderArgs)
           //@ts-ignore
            id = setInterval(()=>{
              console.log('recording is ',recordingOn)
              startMediaRecorder(startMediaRecorderArgs)
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
          console.log(`%c vad triggered ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
          
          
          //this timeout if user is silence from starting 
          timer = setTimeout(()=>{
            tempVad && tempVad.pause() ; tempVad = undefined
            setRecordingOn(false)
          },5000)
    
          function start(){
            
            console.log(`%c audio started ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
            //end timer
            timer && clearTimeout(timer); 
            id && clearTimeout(id) ; id = undefined;
          }
          function stop(){
            
            console.log(`%c audio stopped ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
            //start timer
            id=setTimeout(()=>{
              
              console.log(`%c if silence after 0.5sec then pause the vad ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
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
        
        

    // useEffect( ()=>{

        
    //     if(SESSION_ID==='' || socket===null )
    //     return;

        
        
    //     return ()=>{
            
    //     }
    // },[SESSION_ID,socket])

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
        recordingOn,setRecordingOn,audioUrl,setAudioUrl,
        recordingActive,setRecordingActive,tabs,activeTab,setActiveTab
    }
  return (
      //@ts-ignore
    <Context.Provider value={values}>
        {children}
    </Context.Provider>
  )
}
