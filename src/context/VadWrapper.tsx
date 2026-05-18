import React, {createContext, useContext,useEffect,useState,useRef } from 'react'
import { startMediaRecorder,startMediaRecorder2 } from '../functions/mediaRecorder';
import { getTimeStamp,getOldTimeStamp,generateBase64 } from '../functions/generalFn';
import WavToMp3 from '../functions/wavToMp3';
import { useData } from './DataWrapper';
import { useAuth } from './AuthContext';
import { useMicVAD} from "@ricky0123/vad-react"
import { PostReq } from '../functions/requests';
import {
  getMetaDataOfSpeechSegment,
  shouldSkipSpeechSegment,
  prewarmYamnetModel,
  prewarmWhisperModel,
  ENABLE_YAMNET_FILTER,
  ENABLE_WHISPER_SEMANTIC_FILTER,
} from './speechSegmentFilters';
//import { processAudioToBase64 } from '../functions/generalFn';
//import useRequest from '../hooks/requests';
import { addTranscription } from '../reducers/transcriptionReducer';
import { utils } from "@ricky0123/vad-react"

const VadContext = createContext('vadContext')

export function useVad(){
    return useContext(VadContext)
}

export function VadWrapper({children}){


    // Removed socket, setSocket, added send
    const {
      ngrokServerUrl,
      setMsgLoading,
      oneWayUrl,
      audioQueueRef,
      audioRef,
      isAudioStillPlaying,
      send,
      setYamnetModelDownloading,
      setWhisperModelDownloading
    } = useData()
    const {currentUser} = useAuth()
    const [vadRecordingOn,setVadRecordingOn] = useState<boolean>(false);
    let recordingStatus = useRef(false);

    const [vadInstance,setVadInstance] = useState(null)
    const [userSpeaking,setUserSpeaking] = useState(false)
    const [vadStatus,setVadStatus] = useState(false)
    const vadRef = useRef({ oldVadrecordingStatus:false,myVad:null })
    const [manualVadStatus,setManualVadStatus] = useState(true)
    const vadMicStreamRef = useRef<MediaStream | null>(null)
    const vad2FrameCounterRef = useRef(0)

    //setting for around 1.4sec of audio filter
    const VAD2_TARGET_MIN_SPEECH_MS = 1000
    const VAD2_FRAME_SAMPLES = 512
    const VAD2_MIN_SPEECH_FRAMES = Math.max(
      1,
      Math.ceil((VAD2_TARGET_MIN_SPEECH_MS / 1000) * (16000 / VAD2_FRAME_SAMPLES))
    )

    // Preload only the enabled models and show UI while each downloads.
    useEffect(() => {
      const tasks: Promise<any>[] = []

      if (ENABLE_YAMNET_FILTER) {
        setYamnetModelDownloading(true)
        tasks.push(
          prewarmYamnetModel()
            .catch((err) => console.warn('YAMNet prewarm failed', err))
            .finally(() => setYamnetModelDownloading(false))
        )
      }

      if (ENABLE_WHISPER_SEMANTIC_FILTER) {
        setWhisperModelDownloading(true)
        tasks.push(
          prewarmWhisperModel()
            .catch((err) => console.warn('Whisper prewarm failed', err))
            .finally(() => setWhisperModelDownloading(false))
        )
      }

      // Case: both disabled => do nothing.
      if (tasks.length === 0) return
      void Promise.all(tasks)
    }, [])

    const initReqStatusRef = useRef(false)
    //const {PostReq } = useRequest()

    // ort.env.wasm.wasmPaths = {
    //     "ort-wasm-simd-threaded.wasm": `/ort-wasm-simd-threaded.wasm`,
    //     "ort-wasm-simd.wasm": `/ort-wasm-simd.wasm`,
    //     "ort-wasm.wasm": `/ort-wasm.wasm`,
    //     "ort-wasm-threaded.wasm": `/ort-wasm-threaded.wasm`,
    //   }

    
    


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


      const base64Payload = base64data.split(',')[1];
      data = {...data,
        audiomessage: base64Payload,
        audiobase64: base64Payload,
        timeStamp:getTimeStamp()
      }


      // socket.emit('transcribe_audio_req',data) // Replaced
      send('transcribe_audio_req', data);

      //let resp = await PostReq(url,data)
      //console.log('resp',resp)
      //console.log('resp2',resp.audiobase64)

      // let tempTranscription = {
      //     id: 'unique',
      //     speaker: "saurabh",
      //     transcription: "How can you utilize JPEG and JPEGJPEG to enhance your interactions on your webpages?",
      //     timeStamp: "13:59:01",
      //     isCandidate: false
      // }

      //addTranscription(tempTranscription)
     // return resp
}


      const vad2DebugConfig = {
        workletURL: `./vad.worklet.bundle.min.js`,
        //modelURL: "http://localhost:8080/silero_vad.onnx",
        //@ts-ignore
        modelURL:`./silero_vad.onnx`,
        positiveSpeechThreshold: 0.8,
        submitUserSpeechOnPause:true,
        //model:"v5" as const,
        frameSamples: VAD2_FRAME_SAMPLES,
        minSpeechFrames: VAD2_MIN_SPEECH_FRAMES,
        redemptionFrames:8,

        getStream: async () => {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 2,
              echoCancellation: true,
              autoGainControl: false,
              noiseSuppression: true,
            },
          })
          vadMicStreamRef.current = stream
          return stream
        },
        pauseStream: async (stream: MediaStream) => {
          stream.getTracks().forEach((track) => {
            track.enabled = false
            track.stop()
          })
          vadMicStreamRef.current?.getTracks().forEach((track) => {
            track.enabled = false
            track.stop()
          })
          if (vadMicStreamRef.current === stream) {
            vadMicStreamRef.current = null
          }
        },
        resumeStream: async () => {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 2,
              echoCancellation: true,
              autoGainControl: false,
              noiseSuppression: true,
            },
          })
          vadMicStreamRef.current = stream
          return stream
        },
        // onFrameProcessed: (probs) => {
        //   vad2FrameCounterRef.current += 1
        //   if (vad2FrameCounterRef.current % 20 === 0) {
        //     console.log("[VAD2 realtime frame]", {
        //       frameCount: vad2FrameCounterRef.current,
        //       isSpeechProbability: probs?.isSpeech,
        //       thresholdUsed: 0.8,
        //       currentDecision: probs?.isSpeech >= 0.8 ? "speech" : "non-speech",
        //       minSpeechFramesUsed: VAD2_MIN_SPEECH_FRAMES
        //     })
        //   }
        //},
        // Default legacy minSpeechFrames is 3 (~288ms+ of speech-positive frames); short clips (e.g. ~0.2s) become onVADMisfire. Lower to capture brief utterances (try 1 if you need the absolute minimum and accept more false positives).
        //minSpeechFrames: 2,
        //minSpeechMs:20,
        onVADMisfire: () => {
          console.log("Vad misfire")

          audioRef.current.play()
          isAudioStillPlaying.current = true;
        
        },
        onSpeechStart: () => {
          console.log("Speech start")

          
          audioRef.current.pause()
          isAudioStillPlaying.current = true ;

          
          //console.log(audioQueueRef.current)
        },
        onSpeechEnd:async (audio)=>{

          audioRef.current.pause()
          isAudioStillPlaying.current = false
          audioQueueRef.current = []

          console.log("Speech end")
            getMetaDataOfSpeechSegment(audio)
            const filterDecision = await shouldSkipSpeechSegment(audio)
            console.log('[speech segment filter decision]', filterDecision)
            if (filterDecision.skip) {
              return
            }
            let data = {
              // this one is for jarvis-in-person
              //sessionid:currentUser?.userid,

                //this one is for vitt-sales-copilot
                
               sessionid:currentUser?.sessionuid,
               mob:currentUser.userid,
                userid:currentUser?.userid,
                req_timestamp:getTimeStamp()
            }
            // send audio to backend via websocket
            setMsgLoading(true)
            processAudioToBase64(audio, oneWayUrl, data)
        }
      }

      const VAD2 = useMicVAD(vad2DebugConfig)

      useEffect(() => {
        return () => {
          vadMicStreamRef.current?.getTracks().forEach((track) => {
            track.enabled = false
            track.stop()
          })
          vadMicStreamRef.current = null
        }
      }, [])

      
      useEffect(()=>{
      //init req 

      if(vadInstance ===null || !VAD2 || VAD2.loading)
        return ;

      let data = {
        //this change is for jarvis-in-person-usecase
        //sessionid:currentUser.userid,
        

        // this change is for vitt-sales-copilot
        sessionid:currentUser.sessionuid,
        mob: currentUser.userid,
        userid:currentUser.userid,
        audiomessage:'',
        timeStamp:getTimeStamp(),
        req_timestamp:getTimeStamp(),
        init:true
      }

      if(initReqStatusRef.current ===false){
        initReqStatusRef.current = true
        PostReq(`${ngrokServerUrl}/vad_stream`,data).then(resp=>{
          console.log('init req',resp)
         })
      }
       
      

    },[ngrokServerUrl,vadInstance,VAD2?.loading])

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
            sessionid:currentUser.sessionuid,
            mob: currentUser.userid,
            userid:currentUser.userid
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
    //                 
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
      if(VAD2.loading) return

      console.log('useEffect manual vad paused runs',VAD2)
      console.log("[VAD2 object keys]", Object.keys((VAD2 as any) || {}))

      const micVAD = (VAD2 as any)?.micVAD
      if (micVAD?.options) {
        console.log("[VAD2 runtime fields]", {
          positiveSpeechThreshold: micVAD.options.positiveSpeechThreshold,
          negativeSpeechThreshold: micVAD.options.negativeSpeechThreshold,
          minSpeechFrames: micVAD.options.minSpeechFrames,
          frameSamples: micVAD.options.frameSamples,
          model: micVAD.options.model,
        })
      } else {
        console.log("[VAD2 runtime fields] micVAD/options not available yet", {
          micVADExists: !!micVAD,
          loading: VAD2.loading,
        })
      }

      setManualVadStatus(false)
      VAD2?.pause()

    },[VAD2?.loading, (VAD2 as any)?.micVAD])

    useEffect(() => {
      if ((VAD2 as any)?.errored) {
        console.log("[VAD2 error]", (VAD2 as any).errored)
      }
    }, [(VAD2 as any)?.errored])

      useEffect(()=>{

        let url = ''
        let tempVad = null

        
        
        if (typeof VAD2 !== "object" )
        return ;

        if(manualVadStatus===true){
            console.log('vad2',VAD2)
           // VAD2.vadOptions.positiveSpeechThreshold=0.9 
           // VAD2.vadOptions.negativeSpeechThreshold=0.85
            VAD2?.start()
            //console.log('manual vad is active',VAD2)
            console.log('vad2 after changing parameteres',VAD2)
          
            const micVAD = (VAD2 as any)?.micVAD
            if (micVAD?.options) {
              console.log("[VAD2 runtime fields]", micVAD.options);
            }
        }else{
          console.log('manual vad is paused',VAD2)
          VAD2?.pause()
        }
      },[manualVadStatus])
    
    

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
                
                userid:currentUser.userid,
                sessionid:currentUser.sessionuid,
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