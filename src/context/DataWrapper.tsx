import React from "react"
import { useState, createContext, useContext, useEffect, useRef, useCallback } from "react"
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
import {config as AppConfig, wsEndpoint} from '../configuration.js'
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
  useEffect(() => {
    console.log("DataWrapper mounted")
  }, [])

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
    "Data Retrieval": false,
    "Plan Summary": false,
    Recommendations: false,
  })
  const navigation =
    useAppSelector((state) => state.salesCopilotReducer.navigation) || "Data Retrieval"
  const navigationRef = useRef(navigation)
  const {roomId,candid,name} = useAppSelector((state) => state.qpReducer);
  const salesCopilotState = useAppSelector(state=>state.salesCopilotReducer)

  const [recommendationsGenerated,setRecommendationsGenerated] = useState(false)

  // --- Audio / video playback (shared queue, play btn must be on) ---
  type MediaQueueItem =
    | { type: "audio"; url: string; keepButtonActive: boolean }
    | { type: "video"; url: string; keepButtonActive: boolean }

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaQueueRef = useRef<MediaQueueItem[]>([])
  const currentMediaItemRef = useRef<MediaQueueItem | null>(null)
  const isMediaBusyRef = useRef(false)
  const isAudioStillPlaying = useRef<boolean>(false)
  const [audioUrl, setAudioUrl] = useState('')
  const [resetAudioPlayerState, setResetAudioPlayerState] = useState('')
  const audioUnlockedRef = useRef(false)
  const pendingAutoplayRef = useRef(false)
  const [isAudioPlayingState, setIsAudioPlayingState] = useState(false)
  const [speakerEnabled, setSpeakerEnabled] = useState(false)
  const speakerEnabledRef = useRef(false)
  const lastSentSpeakerStateRef = useRef<"on" | "off" | null>(null)

  const [basicInfoVideoUrl, setBasicInfoVideoUrl] = useState("")
  const [isBasicInfoVideoPlaying, setIsBasicInfoVideoPlaying] = useState(false)
  const isBasicInfoVideoPlayingRef = useRef(false)

  type VideoPreloadEntry = {
    status: "loading" | "ready" | "error"
    element: HTMLVideoElement
  }
  const videoPreloadCacheRef = useRef<Map<string, VideoPreloadEntry>>(new Map())
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
        setHotPageLoading((prev) => ({ ...prev, "Data Retrieval": false }))
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

  function parseKeepButtonActive(data: any): boolean {
    return data?.keep_button_active === true
  }

  function handleAudioPlaybackResponse(data: any) {
    console.log("audio_playback_res received", data)
    extractAndPlayAudio(data)
  }

  function handleVideoPlaybackResponse(data: any) {
    console.log("video_playback_res received", data)
    const videoUrl =
      typeof data?.video_url === "string" ? data.video_url.trim() : ""
    if (!videoUrl) return
    enqueueMedia({
      type: "video",
      url: videoUrl,
      keepButtonActive: parseKeepButtonActive(data),
    })
  }

  const startBasicInfoVideo = useCallback(() => {
    if (!speakerEnabledRef.current) {
      cancelBasicInfoVideoSession()
      return
    }
    if (isBasicInfoVideoPlayingRef.current) return
    setIsBasicInfoVideoPlaying(true)
    isBasicInfoVideoPlayingRef.current = true
  }, [])

  function initialisationSalesState(data: any) {
    console.log('init sales data',data)
    //return null;

    dispatch(initSalesState(data))
    // Fallback: if a full reload comes back via questions_loader_res,
    // clear language-change loading for every section.
    setLanguageChangeLoading(buildLanguageLoadingMap(false))

    try {
      const videosUrl = extractVideosUrlFromLoaderPayload(data)
      if (videosUrl.length > 0) {
        preloadVideoUrls(videosUrl)
      }
    } catch (err) {
      console.warn('Video preload skipped:', err)
    }
  }

  // Keep speakerEnabledRef in sync so socket callbacks always read the latest value
  useEffect(() => {
    speakerEnabledRef.current = speakerEnabled
  }, [speakerEnabled])

  useEffect(() => {
    isBasicInfoVideoPlayingRef.current = isBasicInfoVideoPlaying
  }, [isBasicInfoVideoPlaying])

  useEffect(() => {
    navigationRef.current = navigation
  }, [navigation])


  function stopCurrentAudio() {
    const audioElem = audioRef.current
    if (audioElem) {
      audioElem.pause()
      audioElem.src = ""
      audioElem.load()
    }
    isAudioStillPlaying.current = false
    pendingAutoplayRef.current = false
    setIsAudioPlayingState(false)
    setAudioUrl("")
  }

  function cancelBasicInfoVideoSession() {
    setIsBasicInfoVideoPlaying(false)
    isBasicInfoVideoPlayingRef.current = false
    setBasicInfoVideoUrl("")
    if (isMediaBusyRef.current && !isAudioStillPlaying.current) {
      isMediaBusyRef.current = false
      advanceMediaQueue()
    }
  }

  const endBasicInfoVideo = useCallback(() => {
    setIsBasicInfoVideoPlaying(false)
    isBasicInfoVideoPlayingRef.current = false
    setBasicInfoVideoUrl("")
    isMediaBusyRef.current = false
    advanceMediaQueue()
  }, [])

  function resetSpeakerWhenMediaIdle(completedKeepButtonActive = false) {
    if (!speakerEnabledRef.current) return
    if (mediaQueueRef.current.length > 0) return
    if (isMediaBusyRef.current) return
    if (isAudioStillPlaying.current) return
    if (isBasicInfoVideoPlayingRef.current) return
    if (completedKeepButtonActive) return
    setSpeakerEnabled(false)
  }

  function advanceMediaQueue() {
    const completedKeepButtonActive =
      currentMediaItemRef.current?.keepButtonActive ?? false
    currentMediaItemRef.current = null
    processMediaQueue()
    resetSpeakerWhenMediaIdle(completedKeepButtonActive)
  }

  function toggleSpeakerPlayback() {
    setSpeakerEnabled((prev) => {
      if (prev) {
        speakerEnabledRef.current = false
        clearAllMedia()
        return false
      }
      speakerEnabledRef.current = true
      return true
    })
  }

  function clearAllMedia() {
    mediaQueueRef.current = []
    currentMediaItemRef.current = null
    isMediaBusyRef.current = false
    stopCurrentAudio()
    setIsBasicInfoVideoPlaying(false)
    isBasicInfoVideoPlayingRef.current = false
    setBasicInfoVideoUrl("")
  }

  function normalizeVideoUrls(raw: unknown): string[] {
    if (!Array.isArray(raw)) return []
    return [...new Set(
      raw
        .filter((url): url is string => typeof url === "string")
        .map((url) => url.trim())
        .filter(Boolean)
    )]
  }

  function extractVideosUrlFromLoaderPayload(rawPayload: any): string[] {
    if (rawPayload == null) return []

    let payload = rawPayload
    if (Array.isArray(rawPayload) && rawPayload.length >= 2 && typeof rawPayload[1] === "object") {
      payload = rawPayload[1]
    }
    if (payload == null || typeof payload !== "object") return []

    if (
      payload?.data &&
      typeof payload.data === "object" &&
      !Array.isArray(payload.data) &&
      payload?.videos_url == null
    ) {
      payload = payload.data
    }

    const rawUrls = payload?.videos_url ?? payload?.videosUrl
    return normalizeVideoUrls(rawUrls)
  }

  const isVideoPreloaded = useCallback((url: string): boolean => {
    if (typeof url !== "string" || !url.trim()) return false
    return videoPreloadCacheRef.current.get(url)?.status === "ready"
  }, [])

  function clearVideoPreloadCache() {
    videoPreloadCacheRef.current.forEach(({ element }) => {
      element.pause()
      element.removeAttribute("src")
      element.load()
      element.remove()
    })
    videoPreloadCacheRef.current.clear()
  }

  function preloadVideoUrls(urls: unknown) {
    const nextUrls = normalizeVideoUrls(urls)
    if (nextUrls.length === 0) return
    if (typeof document === "undefined") return

    for (const [url, entry] of videoPreloadCacheRef.current) {
      if (!nextUrls.includes(url)) {
        entry.element.pause()
        entry.element.removeAttribute("src")
        entry.element.load()
        entry.element.remove()
        videoPreloadCacheRef.current.delete(url)
      }
    }

    nextUrls.forEach((url) => {
      if (videoPreloadCacheRef.current.has(url)) return

      const video = document.createElement("video")
      video.preload = "auto"
      video.playsInline = true
      video.muted = true
      video.style.display = "none"
      document.body.appendChild(video)

      const entry: VideoPreloadEntry = { status: "loading", element: video }
      videoPreloadCacheRef.current.set(url, entry)

      const markReady = () => {
        entry.status = "ready"
      }
      const markError = () => {
        entry.status = "error"
      }

      video.addEventListener("canplaythrough", markReady, { once: true })
      video.addEventListener("error", markError, { once: true })
      video.src = url
      video.load()
    })
  }

  function startQueuedVideo(url: string) {
    if (typeof url !== "string" || !url.trim()) {
      isMediaBusyRef.current = false
      advanceMediaQueue()
      return
    }
    setBasicInfoVideoUrl(url)
    if (isVideoPreloaded(url)) {
      startBasicInfoVideo()
    }
  }

  function processMediaQueue() {
    if (!speakerEnabledRef.current) return
    if (isMediaBusyRef.current) return

    const next = mediaQueueRef.current[0]
    if (!next) return

    mediaQueueRef.current.shift()
    currentMediaItemRef.current = next

    if (next.type === "audio") {
      isMediaBusyRef.current = true
      isAudioStillPlaying.current = true
      setIsAudioPlayingState(true)
      setAudioUrl(next.url)
      setResetAudioPlayerState(uuidv4())
      return
    }

    isMediaBusyRef.current = true
    startQueuedVideo(next.url)
  }

  function enqueueMedia(item: MediaQueueItem) {
    if (!speakerEnabledRef.current) return
    mediaQueueRef.current.push(item)
    processMediaQueue()
  }

  // When play is turned off, stop everything and discard the queue.
  useEffect(() => {
    if (speakerEnabled) return
    clearAllMedia()
  }, [speakerEnabled])

  function extractAndPlayAudio(data: any) {
    let audiourl: string | null = null
    if (data?.audio_url && data.audio_url !== null) {
      audiourl = data.audio_url
    }
    if (data?.audiobase64 && data.audiobase64 !== null) {
      audiourl = `data:audio/mpeg;base64,${data.audiobase64}`
    }
    if (audiourl) {
      enqueueMedia({
        type: "audio",
        url: audiourl,
        keepButtonActive: parseKeepButtonActive(data),
      })
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
        const tempSocket = createAppWebSocket(socketUrl, wsEndpoint)

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
        // Force speaker + topic sync to re-emit after reconnect.
        lastSentSpeakerStateRef.current = null
        }

        tempSocket.on("connect", connected);
        tempSocket.on("disconnect", disconnect);

        tempSocket.on('questions_loader_res', initialisationSalesState)
        tempSocket.on('ai_suggestion_res', updateSalesState)
        tempSocket.on('notifications', updateNotifications)
        tempSocket.on('audio_playback_res', handleAudioPlaybackResponse)
        tempSocket.on('video_playback_res', handleVideoPlaybackResponse)

    setSocket(tempSocket)

    return () => {
      tempSocket.off("connect", connected)
      tempSocket.off("disconnect", disconnect)
      tempSocket.off("questions_loader_res", initialisationSalesState)
      tempSocket.off("ai_suggestion_res", updateSalesState)
      tempSocket.off("notifications", updateNotifications)
      tempSocket.off("audio_playback_res", handleAudioPlaybackResponse)
      tempSocket.off("video_playback_res", handleVideoPlaybackResponse)
      clearVideoPreloadCache()
      tempSocket.disconnect()
    }
  }, [])
  // useEffect(()=>{
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const lang = urlParams.get('lang') || 'English'
  //   dispatch(updatePref_language(lang))
  // },[socket])

  // Internal nav label → socket topic (backend contract).
  const NAV_TO_SOCKET_TOPIC: Record<string, string> = {
    "Data Retrieval": "Basic Info",
  }

  function resolveSocketTopic(navPage: string): string {
    return NAV_TO_SOCKET_TOPIC[navPage] ?? navPage
  }

  function emitSelectedTopic(navPage: string) {
    if (!socket || !isSocketConnected) {
      return
    }

    if (navPage === "Data Retrieval" || navPage === "Plan Summary") {
      setHotPageLoading((prev) => ({ ...prev, [navPage]: true }))
    }

    const socketTopic = resolveSocketTopic(navPage)

    const data = {
      roomid: roomId,
      jobid: "abcde",
      agentid: "1234",
      name: name,
      selected_topic: socketTopic,
      agent_name: JSON.parse(localStorage.getItem('agent_name') || '{}')?.agent_name || '',
    }

    console.log("emitting selected_topic_req_v2", data)
    socket.emit("selected_topic_req_v2", data)
  }

  // Emit current topic on page load / socket connect (and reconnect).
  useEffect(() => {
    if (!socket || !isSocketConnected) return

    const nav = navigationRef.current
    if (typeof nav === 'string' && nav.startsWith('Recommendations::')) {
      return
    }

    emitSelectedTopic(nav)
  }, [socket, isSocketConnected])

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
      case 'Data Retrieval':
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
        modified_data = { 'Basic Info': updated }
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
      case 'Data Retrieval':
      case 'Basic Info': {
        const basicInfo = salesCopilotState.salesData.basicInfo
        const updatedTable = applyTableEdit(basicInfo?.table, rowIndex, colIndex, value)
        if (!updatedTable) return
        const updated = { ...basicInfo, table: updatedTable }
        dispatch(updateBasicInfo(updated))
        modified_data = { 'Basic Info': updated }
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
      isAudioStillPlaying.current = false
      setIsAudioPlayingState(false)
      setAudioUrl("")
      isMediaBusyRef.current = false
      advanceMediaQueue()
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
    audioRef, audioUrl, setAudioUrl, mediaQueueRef, isAudioStillPlaying, isAudioPlayingState,
    speakerEnabled, setSpeakerEnabled, toggleSpeakerPlayback,
    basicInfoVideoUrl, isBasicInfoVideoPlaying, startBasicInfoVideo, endBasicInfoVideo,
    isVideoPreloaded,
    hotPageLoading,
    languageChangeLoading, startLanguageChangeLoading,
    emitSelectedTopic,
  }
  return (
    <Context.Provider value={values}>
      <audio ref={audioRef} style={{ display: 'none' }} />
      {children}
    </Context.Provider>
  )
}
