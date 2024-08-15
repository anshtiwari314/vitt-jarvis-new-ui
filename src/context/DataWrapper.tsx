import React, { useState,createContext, useContext, useEffect, useRef } from 'react'
import AddOnlySuggestiveMsg from '../components/AddOnlySuggestiveMsg'
import AddTextMsg from '../components/AddTextMsg'
import {io} from 'socket.io-client';
import {v4 as uuidv4} from 'uuid'
import WavToMp3 from '../functions/wavToMp3';

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
    let audioServerUrl =`https://tso4smyf1j.execute-api.ap-south-1.amazonaws.com/test/transcription-2way-clientaudio`
    //let url1 = 'http://localhost:3008/'
    let socketUrl = 'https://vitt-ai-request-broadcaster-production.up.railway.app'
    const [SESSION_ID,setSessionId] = useState(uuidv4()) 
    const tempRef = useRef("")
    const [msgLoading,setMsgLoading] = useState<boolean>(false);
    const [audioArr,setAudioArr] = useState<any>([])
    let audioUrlRef = useRef(null)
    const [audioUrlFlag,setAudioUrlFlag] = useState<boolean>(false)
    const [socket,setSocket] = useState<any>(null)
    const [msgId,setMsgId] = useState(uuidv4())
    let [recordingOn,setRecordingOn] = useState<boolean>(false);
    let recordingStatus = useRef(false);

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
    function handleData(data:any){
        console.log('handleData',data)
        setMsgLoading(false)
        let arr:Data[] =[]
        //@ts-ignore
        let obj:Data = {}
// "sessionid": <str>, "audiofiletimestamp": <str>
        
        if(data?.loading){
            return ;
        }
        if(data?.audiourl!=null){
            audioUrlRef.current = data.audiourl
            setAudioUrlFlag(prev=>!prev)
            //setAudioUrl('https://files.gospeljingle.com/uploads/music/2023/04/Taylor_Swift_-_August.mp3')
        }
        if(data?.imageurl){
            //@ts-ignore
            obj["id"]= uuidv4()
            obj["type"]="ImageMsg"
            obj["imageUrl"] = data.imageurl;
            obj["iconName"] = 'fa-solid fa-forward-fast'
            obj["similarity_query"] = data.similarity_query;
            obj["color"]= data.color;
            obj["iconColor"] = data.iconColor 
            obj["sessionid"] = data.sessionid;
            obj["audiofiletimestamp"]=data.audiofiletimestamp
            obj["istranscription"] = data.istranscription
            //arr.push(obj)
            arr = [obj,...arr]
            //@ts-ignore
            obj = {}
        }
        if(data?.value){
            //@ts-ignore
            obj["id"]= uuidv4()
            obj["type"]="InputForm"
            obj["iconName"] = "fa-regular fa-pen-to-square"
            obj["value"] = data.value 
            obj["label"] = data.label 
            obj["color"] = data.color 
            obj["iconColor"] = data.iconColor 
            obj["similarity_query"] = data.similarity_query;
            obj["sessionid"] = data.sessionid
            obj["audiofiletimestamp"]=data.audiofiletimestamp
            obj["istranscription"] = data.istranscription
            //arr.push(obj)
            arr = [obj,...arr]
            //@ts-ignore
            obj = {}
        }
        if(data?.radio){
            //@ts-ignore
            obj["id"]= uuidv4()
            obj["type"]="RadioForm"
            obj["iconName"] = 'fa-regular fa-pen-to-square'
            obj["label"] = data.label 
            obj["radio"] = data.radio
            obj["color"] = data.color
            obj["iconColor"] = data.iconColor 
            obj["similarity_query"] = data.similarity_query;
            obj["sessionid"] = data.sessionid
            obj["audiofiletimestamp"]=data.audiofiletimestamp
            obj["istranscription"] = data.istranscription
            //arr.push(obj)
            arr = [obj,...arr]
            //@ts-ignore
            obj={}
        }
        if(data?.content){
            data.content.map((e:any,i:number)=>{
                //@ts-ignore
                obj["id"]= uuidv4()
                obj["type"]="TextMsg"
                obj["content"] = e 
                obj["iconName"] = 'fa-solid fa-circle-question'
                obj["color"]= data.color 
                obj["iconColor"] = data.iconColor
                obj["similarity_query"] = data.similarity_query;
                obj["sessionid"] = data.sessionid
                obj["audiofiletimestamp"]=data.audiofiletimestamp
                obj["istranscription"] = data.istranscription
                //arr.push(obj)
                arr = [obj,...arr]
                //@ts-ignore
                obj={}
            })
            
        }
        // if(data?.initquery.length>"1"){
        //         obj["id"]= uuidv4()
        //         obj["type"]="TextMsg"
        //         obj["content"] = data.initquery
        //         obj["iconName"] = 'fa-solid fa-circle-question'
        //         obj["color"]= data.color 
        //         obj["iconColor"] = data.iconColor
        //         obj["similarity_query"] = "Transcription captured";
        //         obj["sessionid"] = data.sessionid
        //         obj["audiofiletimestamp"]=data.audiofiletimestamp
        //         obj["initquery"] = true
        //         //arr.push(obj)
        //         arr = [...arr,obj]
        //         //@ts-ignore
        //         obj={}
        // }
        if(data?.replies){
            //@ts-ignore
            obj["id"]= uuidv4()
            obj["type"] = "SuggestiveMsg"
            obj["replies"] = data.replies
            obj["color"] = data.color
            obj["iconColor"] = data.iconColor 
            obj["similarity_query"] = data.similarity_query;
            obj["iconName"] = 'fa-solid fa-forward-fast'
            obj["sessionid"] = data.sessionid
            obj["audiofiletimestamp"]=data.audiofiletimestamp
            obj["istranscription"] = data.istranscription
            //arr.push(obj)
            arr = [obj,...arr]
            //@ts-ignore
            obj={}
           
        } 

       console.log(arr)
       setData(prev=>[...arr,...prev])
       //console.log(obj)
    }

    function handleQuery(data:any){
        //setMsgLoading(true)
        console.log(data)
        let tempObj = {
            query:data,
            sessionid:SESSION_ID
        }
        socket.emit("messagefromclient",tempObj)
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
            console.log(result.text,result.messageid,result);
            // if(tempRef.current ===data){
            //     //console.log("tempRef current",tempRef.current)
            //     return ;
            // }
            
            console.log(result.sessionid ===SESSION_ID,result.sessionid,SESSION_ID)
            if(result.sessionid === SESSION_ID){
            handleData(result)
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
      function startMediaRecorder(stream:MediaStream,time:number){
        //let url = 'https://f6p70odi12.execute-api.ap-south-1.amazonaws.com'
        let url = audioServerUrl
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
       function sendToServer(blob:any,url:string){
        //console.log(blob)
        let reader = new FileReader()
        reader.onloadend = ()=>{
          let base64data:any = reader.result;
         // console.log(`base64`,base64data)
         let date = new Date() 
        let audioData = JSON.stringify({
            audiomessage:base64data.split(',')[1],
            mob:'8368751774',
           // uid:myId,
            timeStamp:`${date.toLocaleDateString()} ${date.toLocaleTimeString()}:${date.getMilliseconds()}`,
            sessionid:SESSION_ID
        })
        console.log('just before sending data',new Date().toLocaleTimeString())
        socket.emit('audiomessagefromclient',audioData)
        // fetch(url,{
        //   method:'POST',
        //   headers:{
        //      'Accept':'application.json',
        //      'Content-Type':'application/json'
        //   },
        //   body:audioData,
        //   cache:'default',}).then(res=>{
        //      console.log("res from audio server",res)
        //   })
        }
       reader.readAsDataURL(blob)
      }

    useEffect(()=>{
        recordingStatus.current = recordingOn
    
        let id:number;
        if(recordingOn ===true){
          //setMsg([]);
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
          console.log("vad trigeered",new Date().toLocaleTimeString())
          
          //this timeout if user is silence from starting 
          timer = setTimeout(()=>{
            tempVad && tempVad.pause() ; tempVad = undefined
            setRecordingOn(false)
          },5000)
    
          function start(){
            console.log("audio started",new Date().toLocaleTimeString())
            //end timer
            timer && clearTimeout(timer); 
            id && clearTimeout(id) ; id = undefined;
          }
          function stop(){
            console.log("audio stopped" ,new Date().toLocaleTimeString())
            //start timer
            id=setTimeout(()=>{
              console.log("silence 0.5 sec",new Date().toLocaleTimeString())
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
        recordingOn,setRecordingOn
    }
  return (
      //@ts-ignore
    <Context.Provider value={values}>
        {children}
    </Context.Provider>
  )
}
