import React from "react"
import { useState, createContext, useContext, useEffect, useRef } from "react"
import { v4 as uuidv4 } from 'uuid'
import {
  initSalesState,
  updateBasicInfo,
  updateAssets,
  updateLiabilities,
  updateFinancialReview,
  updateFinancialGoals,
  updatePlanSummary,
  updateRecommendations,
  updateRecommendationPlanDetails,
  updateFollowUpQn,
  updateCues,
  updatePref_language,
  updateAlerts,
  addCues
} from "../reducers/salesCopilotReducer"
import { useDispatch } from "react-redux"
import { useAppSelector } from "../store/store"
import {config as AppConfig} from '../configuration.js'
import { createAppWebSocket, type AppWebSocket } from "../lib/websocketClient"
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

  const [socket, setSocket] = useState<AppWebSocket | null>(null)
  const [isSocketConnected,setIsSocketConnected] = useState(false)
  // Per-section loading flags shown while a language switch is in flight.
  // Each section clears independently when its `ai_suggestion_res` arrives.
  const LANGUAGE_LOADING_SECTIONS = [
    "Basic Info",
    "Assets",
    "Liabilities",
    "Financial Goals",
    "Plan Summary",
    "Recommendations",
  ] as const
  const buildLanguageLoadingMap = (value: boolean) =>
    LANGUAGE_LOADING_SECTIONS.reduce<Record<string, boolean>>((acc, key) => {
      acc[key] = value
      return acc
    }, {})
  const [languageChangeLoading, setLanguageChangeLoading] = useState<Record<string, boolean>>(
    buildLanguageLoadingMap(false)
  )
  function startLanguageChangeLoading() {
    setLanguageChangeLoading(buildLanguageLoadingMap(true))
  }
const [pref_language,setPref_language]=useState("English")
  const [hotPageLoading, setHotPageLoading] = useState<Record<string, boolean>>({
    "Financial Goals": false,
    "Plan Summary": false,
    Recommendations: false,
  })
  const navigation =
    useAppSelector((state) => state.salesCopilotReducer.navigation) || "Basic Info"
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
  const [speakerEnabled, setSpeakerEnabled] = useState(false)
  const speakerEnabledRef = useRef(false)
  const lastSentSpeakerStateRef = useRef<"on" | "off" | null>(null)
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
    //extractAndPlayAudio(data)

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
        console.log(data,"in the basic section info");
        dispatch(updateBasicInfo(data.basicInfo))
        setLanguageChangeLoading((prev) => ({ ...prev, "Basic Info": false }))
        break
      case "financial-review":
        console.log('receiving financial-review data',data)
        dispatch(updateFinancialReview(data.financialReview))
        setLanguageChangeLoading((prev) => ({ ...prev, "Assets": false, "Liabilities": false }))
        break
      case "financial-goals":
        dispatch(updateFinancialGoals(data.financialGoals))
        setHotPageLoading((prev) => ({ ...prev, "Financial Goals": false }))
        setLanguageChangeLoading((prev) => ({ ...prev, "Financial Goals": false }))
        break
      case "plan-summary":
        dispatch(updatePlanSummary(data.planSummary))
        setHotPageLoading((prev) => ({ ...prev, "Plan Summary": false }))
        setLanguageChangeLoading((prev) => ({ ...prev, "Plan Summary": false }))
        break
      case "recommendations":
        console.log('recommendation data from backend',data)
        dispatch(updateRecommendations(data.recommendations))
        setLanguageChangeLoading((prev) => ({ ...prev, "Recommendations": false }))
        break
      // case "follow-up-qn":
      //   dispatch(updateFollowUpQn(data.followUpQn))
      //   break
      case "add-cues":
        dispatch(
          addCues({
            id: data.card_id ?? data.id ?? `${Date.now()}`,
            header: data.header ?? "Follow-up Question",
            color: data.color ?? "blue",
            data: Array.isArray(data.data) ? data.data : [],
            card_type: data.card_type ?? "regular_card",
          })
        )
        break
      case "update-cues":
        dispatch(
          updateCues({
            id: data.card_id ?? data.id ?? `${Date.now()}`,
            header: data.header ?? "Follow-up Question",
            color: data.color ?? "blue",
            data: Array.isArray(data.data) ? data.data : [],
            card_type: data.card_type ?? "regular_card",
          })
        )
        break
      // case "alert":
      //   dispatch(updateAlerts(data.alert))
      //   break
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

  function handleAudioPlaybackResponse(data: any) {
    console.log("audio_playback_res received", data)
    extractAndPlayAudio(data)
  }

  function initialisationSalesState(data: any) {
    console.log('init sales data',data)
    //return null;

    dispatch(initSalesState(data))
    // Fallback: if a full reload comes back via questions_loader_res,
    // clear language-change loading for every section.
    setLanguageChangeLoading(buildLanguageLoadingMap(false))
  }

  // Keep speakerEnabledRef in sync so socket callbacks always read the latest value
  useEffect(() => {
    speakerEnabledRef.current = speakerEnabled
  }, [speakerEnabled])

  // When speaker is turned off, hard-reset local audio state so
  // subsequent audio_playback_res events can start fresh after re-enable.
  useEffect(() => {
    if (speakerEnabled) return

    const audioElem = audioRef.current
    if (audioElem) {
      audioElem.pause()
      audioElem.src = ''
      audioElem.load()
    }

    audioQueueRef.current = []
    isAudioStillPlaying.current = false
    pendingAutoplayRef.current = false
    setIsAudioPlayingState(false)
    setAudioUrl('')
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
        const tempSocket = createAppWebSocket(socketUrl, AppConfig.wsEndpoint)

        //console.log('Socket has been created',tempSocket)


        function connected() {
           // console.log("Socket is connected",tempSocket?.id);
            tempSocket.emit("connected",{ socket_id: tempSocket.id });
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
        tempSocket.on('audio_playback_res', handleAudioPlaybackResponse)

    setSocket(tempSocket)

    return () => {
      tempSocket.off("connect", connected)
      tempSocket.off("disconnect", disconnect)
      tempSocket.off("questions_loader_res", initialisationSalesState)
      tempSocket.off("ai_suggestion_res", updateSalesState)
      tempSocket.off("notifications", updateNotifications)
      tempSocket.off("audio_playback_res", handleAudioPlaybackResponse)
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

    if (navigation === "Financial Goals" || navigation === "Plan Summary") {
      setHotPageLoading((prev) => ({ ...prev, [navigation]: true }))
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

  useEffect(() => {
    if (!socket || !isSocketConnected) return

    const currentSpeakerState: "on" | "off" = speakerEnabled ? "on" : "off"
    // Emit once right after connect, then only when speaker state actually changes.
    if (lastSentSpeakerStateRef.current === currentSpeakerState) {
      return
    }

    const payload = {
      roomid: roomId,
      agentid: "1234",
      name: name,
      agent_name: JSON.parse(localStorage.getItem('agent_name') || '{}')?.agent_name || '',
      timeStamp: new Date().toISOString(),
      speaker: currentSpeakerState,
    }
    console.log("emitting audio_playback_req", payload)
    socket.emit("audio_playback_req", payload)
    lastSentSpeakerStateRef.current = currentSpeakerState
  }, [socket, isSocketConnected, speakerEnabled, roomId, name])


  // Label → value key pairs used across sections. When we find an object whose
  // label key matches the edited fieldname, we update the matching value key
  // and set modified_by_agent: true.
  const FIELD_LABEL_VALUE_PAIRS: Array<[string, string]> = [
    ['field', 'value'],
    ['sub_header', 'sub_header_data'],
    ['text_area_header', 'text_area_value'],
    ['text_area_headerA', 'text_area_valueA'],
    ['text_area_headerB', 'text_area_valueB'],
  ]

  function updateFieldInTree(
    node: any,
    fieldname: string,
    fieldvalue: string
  ): { node: any; changed: boolean } {
    if (node === null || node === undefined) return { node, changed: false }

    if (Array.isArray(node)) {
      let changed = false
      const next = node.map((item) => {
        const res = updateFieldInTree(item, fieldname, fieldvalue)
        if (res.changed) changed = true
        return res.node
      })
      return { node: changed ? next : node, changed }
    }

    if (typeof node === 'object') {
      for (const [labelKey, valueKey] of FIELD_LABEL_VALUE_PAIRS) {
        if (node[labelKey] === fieldname && valueKey in node) {
          const currentValue =
            node[valueKey] === null || node[valueKey] === undefined ? '' : String(node[valueKey])
          const nextValue = fieldvalue === null || fieldvalue === undefined ? '' : String(fieldvalue)
          if (currentValue === nextValue) {
            return { node, changed: false }
          }
          return {
            node: { ...node, [valueKey]: fieldvalue, modified_by_agent: true },
            changed: true,
          }
        }
      }

      let changed = false
      const next: Record<string, any> = { ...node }
      for (const key of Object.keys(node)) {
        const res = updateFieldInTree(node[key], fieldname, fieldvalue)
        if (res.changed) {
          next[key] = res.node
          changed = true
        }
      }
      return { node: changed ? next : node, changed }
    }

    return { node, changed: false }
  }

  function updateField(fieldname: string, fieldvalue: string) {
    console.log('update field', fieldname, fieldvalue , navigation)

    let sectionKey: string | null = null
    let modified_data: Record<string, any> = {}
    let anyChanged = false

    switch (navigation) {
      case 'Basic Info': {
        sectionKey = navigation
        const { node: updated, changed } = updateFieldInTree(
          salesCopilotState.salesData.basicInfo,
          fieldname,
          fieldvalue
        )
        anyChanged = changed
        if (!changed) break
        dispatch(updateBasicInfo(updated))
        modified_data = { [navigation]: updated }
        break
      }
      case 'Assets': {
        sectionKey = navigation
        const { node: updatedAssets, changed } = updateFieldInTree(
          salesCopilotState.salesData.financialReview?.assets,
          fieldname,
          fieldvalue
        )
        anyChanged = changed
        if (!changed) break
        dispatch(updateAssets(updatedAssets))
        modified_data = { [navigation]: updatedAssets }
        break
      }
      case 'Liabilities': {
        sectionKey = navigation
        const { node: updatedLiab, changed } = updateFieldInTree(
          salesCopilotState.salesData.financialReview?.liabilities,
          fieldname,
          fieldvalue
        )
        anyChanged = changed
        if (!changed) break
        dispatch(updateLiabilities(updatedLiab))
        modified_data = { [navigation]: updatedLiab }
        break
      }
      case 'Financial Goals': {
        sectionKey = navigation
        const { node: updated, changed } = updateFieldInTree(
          salesCopilotState.salesData.financialGoals,
          fieldname,
          fieldvalue
        )
        anyChanged = changed
        if (!changed) break
        dispatch(updateFinancialGoals(updated))
        modified_data = { [navigation]: updated } 
        break
      }
      case 'Plan Summary': {
        sectionKey = navigation
        const { node: updated, changed } = updateFieldInTree(
          salesCopilotState.salesData.planSummary,
          fieldname,
          fieldvalue
        )
        anyChanged = changed
        if (!changed) break
        dispatch(updatePlanSummary(updated))
        modified_data = { [navigation]: updated }
        break
      }
      default: {
        // Recommendations: navigation === 'Recommendations::<category>'
        if (typeof navigation === 'string' && navigation.startsWith('Recommendations::')) {
          const parts = navigation.split('::')
          const category = parts[1]
          const recs: any = salesCopilotState.salesData.recommendations
          if (recs?.categories && category) {
            const updatedCategories = recs.categories.map((c: any) => {
              if (c.category !== category) return c
              const { node, changed } = updateFieldInTree(c, fieldname, fieldvalue)
              if (changed) anyChanged = true
              return node
            })
            if (!anyChanged) break
            const updatedRecs = { ...recs, categories: updatedCategories }
            dispatch(updateRecommendations(updatedRecs))
            modified_data = { recommendations: updatedRecs }
            break
          }
        }
        anyChanged = true
        modified_data = { [fieldname]: fieldvalue }
      }
    }

    if (!anyChanged) {
      console.log('No value change detected, skipping ai_suggestion_req_ins_v2 emit')
      return
    }

    const ob = {
      roomid: roomId,
      jobid: 'abcde',
      agentid: '1234',
      name: name,
      modified_data,
    }
    console.log('emitting ai_suggestion_req_ins_v2', ob)
    socket?.emit('ai_suggestion_req_ins_v2', ob)
  }

  function emitModifiedData(modified_data: Record<string, any>) {
    const ob = {
      roomid: roomId,
      jobid: 'abcde',
      agentid: '1234',
      name: name,
      modified_data,
    }
    console.log('emitting ai_suggestion_req_ins_v2', ob)
    socket?.emit('ai_suggestion_req_ins_v2', ob)
  }

  function buildUpdatedTableCell(prevCell: any, value: string) {
    const prev =
      prevCell !== null && typeof prevCell === 'object'
        ? prevCell
        : { value: prevCell, is_copyable: true, is_editable: true }
    return { ...prev, value, modified_by_agent: true }
  }

  function applyTableEdit(table: any, rowIndex: number, colIndex: number, value: string) {
    if (!table || !Array.isArray(table.table_values)) return null
    const newValues = table.table_values.map((row: any[], r: number) =>
      r !== rowIndex
        ? row
        : row.map((cell: any, c: number) =>
            c !== colIndex ? cell : buildUpdatedTableCell(cell, value)
          )
    )
    return { ...table, table_values: newValues }
  }

  function updateTableCell(rowIndex: number, colIndex: number, value: string) {
    let modified_data: Record<string, any> = {}

    switch (navigation) {
      case 'Basic Info': {
        const basicInfo = salesCopilotState.salesData.basicInfo
        const updatedTable = applyTableEdit(basicInfo?.table, rowIndex, colIndex, value)
        if (!updatedTable) return
        const updated = { ...basicInfo, table: updatedTable }
        dispatch(updateBasicInfo(updated))
        modified_data = { [navigation]: updated }
        break
      }
      case 'Assets': {
        const assets = salesCopilotState.salesData.financialReview?.assets
        const updatedTable = applyTableEdit(assets?.table, rowIndex, colIndex, value)
        if (!updatedTable) return
        const updated = { ...assets, table: updatedTable }
        dispatch(updateAssets(updated))
        modified_data = { [navigation]: updated }
        break
      }
      case 'Liabilities': {
        const liab = salesCopilotState.salesData.financialReview?.liabilities
        const updatedTable = applyTableEdit(liab?.table, rowIndex, colIndex, value)
        if (!updatedTable) return
        const updated = { ...liab, table: updatedTable }
        dispatch(updateLiabilities(updated))
        modified_data = { [navigation]: updated }
        break
      }
      default:
        return
    }

    emitModifiedData(modified_data)
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
    toggleNotificationModal,setToggleNotificationModal,updateField,emitModifiedData,updateTableCell,
    recommendationsGenerated,setRecommendationsGenerated,
    pref_language,setPref_language,
    audioRef, audioUrl, setAudioUrl, audioQueueRef, isAudioStillPlaying, isAudioPlayingState,
    speakerEnabled, setSpeakerEnabled,
    hotPageLoading,
    languageChangeLoading, startLanguageChangeLoading
  }
  return (
    <Context.Provider value={values}>
      <audio ref={audioRef} style={{ display: 'none' }} />
      {children}
    </Context.Provider>
  )
}
