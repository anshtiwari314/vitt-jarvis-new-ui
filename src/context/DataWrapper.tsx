import type React from "react"
import { useState, createContext, useContext, useEffect, useRef } from "react"
import { v4 as uuidv4 } from 'uuid'
import { io, type Socket } from "socket.io-client"
import {
  initSalesState,
  updateBasicInfo,
  updateAssets,
  updateLiabilities,
  updateFinancialGoals,
  updatePlanSummary,
  updateRecommendations,
  updateFollowUpQn,
  updateCues,
  updatePref_language,
  updateAlerts,
  addCues
} from "../reducers/salesCopilotReducer"
import { useDispatch } from "react-redux"
import { useAppSelector } from "../store/store"
import {config as AppConfig} from '../configuration.js'
// interface DataContextType {
//   socket: Socket | null
//   setSocket: (socket: Socket | null) => void
//   socketConnected: boolean
//   ngrokServerUrl?: string
//   setMsgLoading?: (loading: boolean) => void
//   oneWayUrl?: string
// }

const Context = createContext<any>("")

export function useData() {
  const context = useContext(Context)
  if (!context) {
    throw new Error("useData must be used within a DataWrapper")
  }
  return context
}

export default function DataWrapper({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()
  console.log("DataWrapper mounted")

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isSocketConnected,setIsSocketConnected] = useState(false)
const [pref_language,setPref_language]=useState("English")
  const navigation = useAppSelector((state) => state.salesCopilotReducer.navigation)
  const {roomId,candid,name} = useAppSelector((state) => state.qpReducer);
  const salesCopilotState = useAppSelector(state=>state.salesCopilotReducer)

  const [recommendationsGenerated,setRecommendationsGenerated] = useState(false)

  // --- Audio playback state ---
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioQueueRef = useRef<string[]>([])
  const isAudioStillPlaying = useRef<boolean>(false)
  const [audioUrl, setAudioUrl] = useState('')
  const [resetAudioPlayerState, setResetAudioPlayerState] = useState('')
  const audioUnlockedRef = useRef(false)
  const pendingAutoplayRef = useRef(false)
  const [isAudioPlayingState, setIsAudioPlayingState] = useState(false)
  const [speakerEnabled, setSpeakerEnabled] = useState(true)
  const speakerEnabledRef = useRef(true)
  // ----------------------------

  const [toggleNotificationModal,setToggleNotificationModal] = useState({
           visibility:false,
           text:"",
          options:[],
          old_json:{},
          new_json:{},
          old_json_raw:{},
          new_json_raw:{}
        })

  //console.log("sales state", navigation)

  function updateSalesState(data:any) {
    console.log("handle incoming data", data, " the data type", data.type)

    // Extract and play audio if present in the incoming data
    extractAndPlayAudio(data)

    //return null;
    switch (data.type) {
      case "value-modified":
        let ob = {
          visibility:true,
          // text:"username changed from varun to anuj ? correct",
          // options:["yes","no"],
          ...data 
        }
        console.log("value modified triggers",data)
        setToggleNotificationModal(ob)
        break
      case "basic-info":
        console.log(data,"int the basic section info");
        dispatch(updateBasicInfo(data.basicInfo))
        break
      case "assets":
        console.log('receiving assets data',data)
        dispatch(updateAssets(data.assets))
        break
      case "liabilities":
        console.log('liabilities',data)
        dispatch(updateLiabilities(data.liabilities))
        break
      case "financial-goals":
        dispatch(updateFinancialGoals(data.financialGoals))
        break
      case "plan-summary":
        dispatch(updatePlanSummary(data.planSummary))
        break
      case "recommendations":
        console.log('recommendation data from backend',data)
        dispatch(updateRecommendations(data.recommendations))
        break
      case "follow-up-qn":
        dispatch(updateFollowUpQn(data.followUpQn))
        break
      case "add-cues":
        dispatch(addCues(data))
        break
      case "alert":
        dispatch(updateAlerts(data.alert))
        break
      default:
        console.warn(`Unhandled action type: ${data.type}`)
    }
  }

  function updateNotifications(data){
   // {"status": "completed", "msg": "Product Recommendation ready"}
      console.log('update notifications',data)
      if(data.status ==='completed')
        setRecommendationsGenerated(true)
      else
        setRecommendationsGenerated(false)
  }

  function initialisationSalesState(data: any) {
    console.log('init sales data',data)
    //return null;

    dispatch(initSalesState(data))
  }

  // Keep speakerEnabledRef in sync so socket callbacks always read the latest value
  useEffect(() => {
    speakerEnabledRef.current = speakerEnabled
  }, [speakerEnabled])

  function enqueueAudio(audiourl: string) {
    if (!speakerEnabledRef.current) return   // speaker is off — ignore
    if (isAudioStillPlaying.current) {
      audioQueueRef.current = [...audioQueueRef.current, audiourl]
    } else {
      isAudioStillPlaying.current = true
      setIsAudioPlayingState(true)
      setAudioUrl(audiourl)
      setResetAudioPlayerState(uuidv4())
    }
  }

  function extractAndPlayAudio(data: any) {
    let audiourl: string | null = null
    if (data?.audio_url && data.audio_url !== null) {
      audiourl = data.audio_url
    }
    if (data?.audiobase64 && data.audiobase64 !== null) {
      audiourl = `data:audio/mpeg;base64,${data.audiobase64}`
    }
    if (audiourl) {
      enqueueAudio(audiourl)
    }
  }



useEffect(()=>{
  console.log('sales copilot state',salesCopilotState)
},[salesCopilotState])
  //console.log('config',config)
  //console.log("hello world")
    useEffect(()=>{
        //const socketUrl = 'http://localhost:5000'
        //const socketUrl = 'https://0be7987cc39f.ngrok-free.app'
        
        const socketUrl = AppConfig.wsUrl

        const tempSocket = io(socketUrl)

        //console.log('Socket has been created',tempSocket)


        function connected() {
           // console.log("Socket is connected",tempSocket?.id);
            tempSocket.emit("connected",tempSocket.id);
            setIsSocketConnected(true)
            //   if (firstTimeConnectRef.current === true) {
            //     console.log("socket 1st connect triggered");
            //   } else {
            //     console.log("socket 2nd connect triggered");
            //     socket.emit("join-room", roomId, myId);
            //   }
        }

        function disconnect() {
        console.log("Socket disconnected");
        setIsSocketConnected(false)
        }

        tempSocket.on("connect", connected);
        tempSocket.on("disconnect", disconnect);

        tempSocket.on('questions_loader_res', initialisationSalesState)
        tempSocket.on('ai_suggestion_res', updateSalesState)
        tempSocket.on('notifications', updateNotifications)

    setSocket(tempSocket)

    return () => {
      tempSocket.off("connect", connected)
      tempSocket.off("disconnect", disconnect)
      tempSocket.off("questions_loader_res", initialisationSalesState)
      tempSocket.off("ai_suggestion_res", updateSalesState)
      tempSocket.off("notifications", updateNotifications)
      tempSocket.disconnect()
    }
  }, [])
  // useEffect(()=>{
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const lang = urlParams.get('lang') || 'English'
  //   dispatch(updatePref_language(lang))
  // },[socket])

  useEffect(() => {
    if (!socket) {
      return
    }

    const data = {
      roomid: roomId,
      jobid: "abcde",
      agentid: "1234",
      name: name,
      selected_topic: navigation,
      agent_name:JSON.parse(localStorage.getItem('agent_name') || '{}')?.agent_name || ''
    }

    socket.emit("selected_topic_req_v2", data)
  }, [navigation,socket])


  function updateField(fieldname,fieldvalue){
    console.log('update field',fieldname,fieldvalue)
    let ob = {
      roomid: roomId,
        jobid: 'abcde',
        agentid: '1234',

        name: name,
      manual_transcript : `actually ${fieldname} is ${fieldvalue}`
    }
    socket?.emit('ai_suggestion_req_ins_v2',ob)
  }

  // --- Audio event listeners ---
  useEffect(() => {
    const audioElem = audioRef.current
    if (!audioElem) return

    function handlePlay() {
      isAudioStillPlaying.current = true
      setIsAudioPlayingState(true)
    }
    function handlePause() {
      setIsAudioPlayingState(false)
    }
    function handlePlaying() {
      isAudioStillPlaying.current = true
      setIsAudioPlayingState(true)
    }
    function handleEnded() {
      const nextAudio = audioQueueRef.current.shift()
      if (nextAudio) {
        setAudioUrl(nextAudio)
        setResetAudioPlayerState(uuidv4())
      } else {
        isAudioStillPlaying.current = false
        setIsAudioPlayingState(false)
        setAudioUrl('')
      }
    }

    audioElem.addEventListener('play', handlePlay)
    audioElem.addEventListener('pause', handlePause)
    audioElem.addEventListener('playing', handlePlaying)
    audioElem.addEventListener('ended', handleEnded)

    return () => {
      audioElem.removeEventListener('play', handlePlay)
      audioElem.removeEventListener('pause', handlePause)
      audioElem.removeEventListener('playing', handlePlaying)
      audioElem.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Play audio when audioUrl changes
  useEffect(() => {
    const audioElem = audioRef.current
    if (!audioElem || audioUrl === '') return

    audioElem.src = audioUrl
    audioElem.autoplay = true
    audioElem.preload = 'auto'
    const playPromise = audioElem.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((err: any) => {
        console.warn('Auto-play failed:', err)
        pendingAutoplayRef.current = true
      })
    }
  }, [audioUrl, resetAudioPlayerState])

  // Unlock audio on first user interaction (browser autoplay policy)
  useEffect(() => {
    function unlockAudio() {
      if (audioUnlockedRef.current) return
      audioUnlockedRef.current = true
      const audioElem = audioRef.current
      if (!audioElem) return
      if (pendingAutoplayRef.current || audioUrl) {
        const playPromise = audioElem.play()
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch((err: any) => {
            console.warn('Auto-play retry failed:', err)
          })
        }
        pendingAutoplayRef.current = false
      }
      document.removeEventListener('click', unlockAudio)
      document.removeEventListener('touchstart', unlockAudio)
      document.removeEventListener('keydown', unlockAudio)
    }
    document.addEventListener('click', unlockAudio, { once: true })
    document.addEventListener('touchstart', unlockAudio, { once: true })
    document.addEventListener('keydown', unlockAudio, { once: true })
    return () => {
      document.removeEventListener('click', unlockAudio)
      document.removeEventListener('touchstart', unlockAudio)
      document.removeEventListener('keydown', unlockAudio)
    }
  }, [audioUrl])
  // -----------------------------

  const values = {
    socket,
    setSocket,isSocketConnected,
    //socketConnected: socketConnected && socketReady,
    //ngrokServerUrl: "http://localhost:5000",
    setMsgLoading: (loading: boolean) => console.log("Loading:", loading),
    oneWayUrl: "wss://recruito.vitti.insure",
    toggleNotificationModal,setToggleNotificationModal,updateField,
    recommendationsGenerated,setRecommendationsGenerated,
    pref_language,setPref_language,
    audioRef, audioUrl, setAudioUrl, audioQueueRef, isAudioStillPlaying, isAudioPlayingState,
    speakerEnabled, setSpeakerEnabled
  }
  return (
    <Context.Provider value={values}>
      <audio ref={audioRef} style={{ display: 'none' }} />
      {children}
    </Context.Provider>
  )
}
