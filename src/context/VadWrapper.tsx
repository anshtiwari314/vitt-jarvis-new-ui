import React, {createContext, useContext,useEffect,useState,useRef } from 'react'
import { startMediaRecorder,startMediaRecorder2 } from '../functions/mediaRecorder';
import { getTimeStamp,getOldTimeStamp,generateBase64 } from '../functions/generalFn';
import WavToMp3 from '../functions/wavToMp3';
import { useData } from './DataWrapper';
import { useAuth } from './AuthContext';
import { useMicVAD, utils} from "@ricky0123/vad-react"
//import { } from "@ricky0123/vad-react"
import { PostReq } from '../functions/requests';
import { useAppSelector } from '../store/store';
//import { processAudioToBase64 } from '../functions/generalFn';
//import useRequest from '../hooks/requests';

const VadContext = createContext('vadContext')

export function useVad(){
    return useContext(VadContext)
}

export default function VadWrapper({children}){

    const oneWayUrl = ''
    const ngrokServerUrl = ''
    const {socket,isSocketConnected,setMsgLoading,audioRef,isAudioStillPlaying,audioQueueRef} = useData()
    const {roomId,candid,name} = useAppSelector((state) => state.qpReducer);
    
    //const {currentUser} = useAuth()
    const [vadRecordingOn,setVadRecordingOn] = useState<boolean>(false);
    let recordingStatus = useRef(false);

    const [vadInstance,setVadInstance] = useState(null)
    const [userSpeaking,setUserSpeaking] = useState(false)
    const [vadStatus,setVadStatus] = useState(false)
    const vadRef = useRef({ oldVadrecordingStatus:false,myVad:null })
    const [manualVadStatus,setManualVadStatus] = useState(true)

    const initReqStatusRef = useRef(false);
    const isQuestionLoaderRunsFirstTime = useRef(true)

    // Audio-VAD interaction refs
    const wasPlayingBeforeSpeechRef = useRef(false)
    const pausedAtRef = useRef(0)

    //const {PostReq } = useRequest()

    // ort.env.wasm.wasmPaths = {
    //     "ort-wasm-simd-threaded.wasm": `/ort-wasm-simd-threaded.wasm`,
    //     "ort-wasm-simd.wasm": `/ort-wasm-simd.wasm`,
    //     "ort-wasm.wasm": `/ort-wasm.wasm`,
    //     "ort-wasm-threaded.wasm": `/ort-wasm-threaded.wasm`,
    //   }

    console.log('vad wrapper',roomId)

  async function processAudioToBase64(audio,url,data){
    console.log("vad stopped")
    const wavBuffer = utils.encodeWAV(audio)
      // const base64 = utils.arrayBufferToBase64(wavBuffer)
      // console.log("hello world",base64)

         // let wavBlob =processingToWav(audio)
      let wavBlob = new Blob([wavBuffer], { type: 'audio/wav' })
      let mp3Blob = await WavToMp3(wavBlob)
      
      //generate base64 of that blob 
      let base64data = await generateBase64(mp3Blob)


      data = {
        ...data,
        audiomessage:base64data.split(',')[1],
        timeStamp:getTimeStamp()
      }


      //let resp = await PostReq(url,data)
      //console.log('resp',resp)
      //return resp
      console.log("from inside send to server[DEBUGGGG]", data);
      socket.emit("ai_suggestion_req_ins_v2", data);

}

    // useEffect(()=>{
    //   console.log('socket is connected',socket)
    // },[isSocketConnected])

    useEffect(()=>{
      if(socket===null || isSocketConnected===false || isQuestionLoaderRunsFirstTime.current===false)
        return ;

      isQuestionLoaderRunsFirstTime.current = false
      //init req 

      // let data = {
      //   //this change is for jarvis-in-person-usecase
      //   //sessionid:currentUser.userid,
        


      //   // this change is for vitt-sales-copilot
      //   sessionid:currentUser.sessionuid,
      //   mob: currentUser.userid,
      //   userid:currentUser.userid,
      //   audiomessage:'',
      //   timeStamp:getTimeStamp(),
      //   init:true
      // }


    let questionsApiReqPayload = {
        roomid: roomId,
        jobid: 'abcde',
        agentid: '1234',
        //custemailid: custEmailId,
        //isHost: isHost,
        name: name, 
        agent_name:JSON.parse(localStorage.getItem('agent_name') || '{}')?.agent_name || ''
         //roomid: "abc-123-fgh-456",
        //name:'bayya'
         // jobid: "1",
        // agentid: "1234",
        
      //isHost:isHost
    };

      // if(initReqStatusRef.current ===false){
      //   initReqStatusRef.current = true
      //   PostReq('https://2265-49-204-210-210.ngrok-free.app/',data).then(resp=>{
      //     console.log('init req',resp)
      //    })
      // }

      //this will trigger only after socket is connected & only once 
     
      socket.emit("questions_loader_req_ins_v2", questionsApiReqPayload);
      

    },[socket,isSocketConnected])


    function VAD(cb1:CallableFunction,cb2:CallableFunction){
        return new Promise(async (resolve,reject)=>{
            //@ts-ignore
            const myvad = await vad.MicVAD.new({
              onSpeechStart: cb1,
              onSpeechEnd: cb2,
              positiveSpeechThreshold:0.9 ,
              negativeSpeechThreshold:0.85
          // redemptionFrames:100
            })
            resolve(myvad)
            reject(myvad)
        })
        
      }
    

      const VAD2 = useMicVAD({
        workletURL: `./vad.worklet.bundle.min.js`,
        //modelURL: "http://localhost:8080/silero_vad.onnx",
        //@ts-ignore
        modelURL:`./silero_vad.onnx`,
        onVADMisfire: () => {
          console.log("Vad misfire")
          // Misfire: resume audio that was paused on speech start
          //@ts-ignore
          if (wasPlayingBeforeSpeechRef.current && audioRef?.current) {
            //@ts-ignore
            audioRef.current.currentTime = pausedAtRef.current
            //@ts-ignore
            const playPromise = audioRef.current.play()
            if (playPromise && typeof playPromise.catch === 'function') {
              playPromise.catch((err: any) => console.warn('Audio resume failed:', err))
            }
            //@ts-ignore
            isAudioStillPlaying.current = true
            wasPlayingBeforeSpeechRef.current = false
          }
        },
        onSpeechStart: () => {
          console.log("Speech start")
          // If audio is playing, pause it
          //@ts-ignore
          if (isAudioStillPlaying.current && audioRef?.current && !audioRef.current.paused) {
            //@ts-ignore
            pausedAtRef.current = audioRef.current.currentTime
            //@ts-ignore
            audioRef.current.pause()
            wasPlayingBeforeSpeechRef.current = true
            //@ts-ignore
            isAudioStillPlaying.current = false
          }
        },
        onSpeechEnd:(audio)=>{
            console.log('getting data from vad2')
          // Real speech detected - clear audio queue, keep audio stopped
          //@ts-ignore
          audioQueueRef.current = []
          wasPlayingBeforeSpeechRef.current = false

          let speechStopDate = new Date();

            let data = {
              
              roomid: roomId,
              jobid: 'abcde',
              agentid: 'bayya-bayya',
              //custemailid: custEmailId,
              //isHost: isHost,
              name: name, 
              agent_name:JSON.parse(localStorage.getItem('agent_name') || '{}')?.agent_name || '',
              //sessionid:usersArrRef.current[0]?.id,
               
              speech_stop_time:`${speechStopDate.toLocaleDateString()} ${speechStopDate.toLocaleTimeString()}:${speechStopDate.getMilliseconds()}`
            }

          processAudioToBase64(audio,oneWayUrl,data)
        }
      })

      
      

    function start(){
      setUserSpeaking(true)
    }
    
    async function stop(audio){
        setUserSpeaking(false)
        setVadStatus(false)
        setMsgLoading(true)
        let data = {
            //this change is for jarvis-in-person-usecase
            //sessionid:currentUser.userid,
            

            // this change is for vitt-sales-copilot
            // sessionid:currentUser.sessionuid,
            // mob: currentUser.userid,
            // userid:currentUser.userid
        }
        processAudioToBase64(audio,oneWayUrl,data)
        
        
    }

    function getVadInstance(){
      VAD(start,stop).then((myVad)=>{
         console.log('getVad instance',myVad)
         return myVad
      })
    }
    /** automatic vad new  */

    useEffect(()=>{
      if(vadInstance!==null)
        return ;

      let intervalId = setInterval(()=>{
        VAD(start,stop).then((myVad)=>{
          if(myVad===null)
            return ;
          vadRef.current.myVad = myVad
          setVadInstance(myVad)
          clearInterval(intervalId)
        })
      },1000)

      return ()=>{clearInterval(intervalId)}
    },[])

    useEffect(()=>{
      if(vadInstance===null)
        return ;

      if( vadStatus===true ){
        vadInstance?.start()
        console.log('if 1 called',vadInstance)
      }else{
        console.log('else 1 called',vadInstance)
        vadInstance?.pause()
      }
      

    },[vadStatus])

    // useEffect(()=>{
    //     if(vadStatus===true){
    //         // chk if initialized first time or not
    //         // initialised if null
    //         if(vadRef.current.myVad ===null){
                

    //             VAD(start,stop).then((myVad)=>{
    //               console.log('nested if 1 called',myVad)
    //                 vadRef.current.myVad = myVad
    //                 setVadInstance(myVad)
    //                 vadRef.current.myVad.start()
    //                 console.log(vadRef.current.myVad)

    //                 // vadRef.current.myVad.options.positiveSpeechThreshold=0.9 
    //                 // vadRef.current.myVad.options.negativeSpeechThreshold=0.85
                    

    //                 console.log(vadRef.current.myVad)
    //              })
                
                
    //         }else{
    //             //call vad if initialised before
    //             vadRef.current.myVad?.start()
    //             console.log('nested else 1 called',vadRef.current.myVad)
    //         }
            
    //     }else{
    //         vadRef.current.myVad?.pause()
    //         console.log('else 2 called',vadRef.current.myVad)
    //     }
    // },[vadStatus])


    /** manual vad logic  begins here ( offline logic)*/

    useEffect(()=>{
      //console.log('useEffect manual vad paused runs',VAD2)
      //VAD2?.pause()
    },[])

      useEffect(()=>{

        let url = ''
        let tempVad = null

        
        //|| VAD2?.vadOptions ===undefined
        if (typeof VAD2 !== "object" )
        return ;

        if(manualVadStatus===true){
            console.log('vad2',VAD2)
            //VAD2.vadOptions.positiveSpeechThreshold=0.9 
            //VAD2.vadOptions.negativeSpeechThreshold=0.85
            VAD2?.start()
            //console.log('manual vad is active',VAD2)
            console.log('vad2 after changing parameteres',VAD2)
         
        }else{
          console.log('manual vad is paused',VAD2)
          VAD2?.pause()
        }
      },[manualVadStatus])
    
      useEffect(()=>{

        let timeout ;
        if(!VAD2.loading){
          console.log('manual-vad-stopping')
          setManualVadStatus(false)
          // timeout = setTimeout(()=>{
            
          // },3000)
        }

        return ()=> {
         timeout && clearTimeout(timeout)
        }
      },[VAD2?.loading])
    

    /* (Automatic vad old ) this logic has time delay bcz of startMediaRecorder function the data only send after when 
     startMediaRecorder2 has finished execution of 10sec 
    */
    useEffect(()=>{
      
        console.log(`%c vadRecordingOn toggle ${new Date().toLocaleTimeString()} ${recordingStatus.current} ${vadRecordingOn}`,'background-color:teal;color:white')
          recordingStatus.current = vadRecordingOn
      
          let id:number;
          if(vadRecordingOn ===true){
            //setMsg([]);
            navigator.mediaDevices.getUserMedia({
              audio:true
            }).then(stream=>{
  
              let startMediaRecorderArgs = {
                stream,
                //url : 'https://tso4smyf1j.execute-api.ap-south-1.amazonaws.com/test/transcription-clientaudio',
                //url:'http://35.187.246.238/transcription-clientaudio',
                //url:'https://34.100.145.102/',
                //url:'https://wpv7kxos9g.execute-api.ap-south-1.amazonaws.com/test/sales-copilot-gcp',
                url : ngrokServerUrl,
                time:10000,
                recordingStatus:recordingStatus,
                
                // userid:currentUser.userid,
                // sessionid:currentUser.sessionuid,
                timeStamp:getTimeStamp()
                // mob:"anuj",
                // //roomid	"271083f6-8a51-4db0-b005-7e14923f70d2"
                // //sessionid	"demo1"
                // timeStamp:	"3/17/2025 1:52:19 PM:160",
                // uid	:"anuj"
              } 
  
             startMediaRecorder2(startMediaRecorderArgs)
             setMsgLoading(true)
             //@ts-ignore
              id = setInterval(()=>{
                console.log('recording is ',vadRecordingOn)
                startMediaRecorder2(startMediaRecorderArgs)
                setMsgLoading(true)
              },10000)
            })
      
           // if(recordingOn ===true) 
          }
          return()=>clearInterval(id)
        },[vadRecordingOn,ngrokServerUrl])
        
      useEffect(()=>{
        
          let tempVad:any
          let id:undefined|any
          let timer :undefined|any
          
          if(vadRecordingOn ===true){
            console.log(`%c vad triggered ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
            
            
            //this timeout if user is silence from starting 
            timer = setTimeout(()=>{
              tempVad && tempVad.pause() ; tempVad = undefined
              setVadRecordingOn(false)
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
  
              // id=setTimeout(()=>{
                
              //   console.log(`%c if silence after 0.5sec then pause the vad ${new Date().toLocaleTimeString()}`,'background-color:teal;color:white')
              //   console.log(tempVad)
                
              // },500)
              tempVad && tempVad.pause()
                tempVad = undefined
                setVadRecordingOn(false)
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
          },[vadRecordingOn])

    let values = {

        vadRecordingOn,
    setVadRecordingOn,
        manualVadStatus,setManualVadStatus,
        vadStatus,setVadStatus,vadInstance,VAD2,userSpeaking
    }
    return (
        //@ts-ignore
        <VadContext.Provider value={values}>
            {children}
        </VadContext.Provider>
    )
}