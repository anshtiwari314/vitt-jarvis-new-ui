import React from "react"
import { useState, createContext, useContext, useEffect, useRef, useCallback } from "react"
import { v4 as uuidv4 } from 'uuid'
import { AnamEvent, createClient, type AgentAudioInputStream, type AnamClient } from "@anam-ai/js-sdk"
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
import { streamAnamTts } from "../lib/anamTtsClient"
// interface DataContextType {
//   socket: Socket | null
//   setSocket: (socket: Socket | null) => void
//   socketConnected: boolean
//   ngrokServerUrl?: string
//   setMsgLoading?: (loading: boolean) => void
//   oneWayUrl?: string
// }

const Context = createContext<any>("")
const ANAM_SESSION_ENDPOINT = AppConfig.anamSessionEndpoint

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
    | { type: "video"; url: string; keepButtonActive: boolean; filler: boolean }

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
  const [isAvatarStreamConnected, setIsAvatarStreamConnected] = useState(false)
  const [speakerEnabled, setSpeakerEnabled] = useState(true)
  const speakerEnabledRef = useRef(true)
  const lastSentSpeakerStateRef = useRef<"on" | "off" | null>(null)
  const suppressSpeakerEmitRef = useRef(false)
  const avatarVideoElementsRef = useRef<Set<HTMLVideoElement>>(new Set())
  const anamClientRef = useRef<AnamClient | null>(null)
  const anamOutputStreamRef = useRef<MediaStream | null>(null)
  const anamAudioInputStreamRef = useRef<AgentAudioInputStream | null>(null)
  const anamSessionStartPromiseRef = useRef<Promise<void> | null>(null)
  const prefetchedAnamSessionTokenRef = useRef<string | null>(null)
  const avatarAudioAbortControllerRef = useRef<AbortController | null>(null)
  const avatarSocketStreamActiveRef = useRef(false)
  const avatarSpeechStartPromiseRef = useRef<Promise<void> | null>(null)
  const avatarVideoIdCounterRef = useRef(0)
  const primaryAvatarVideoElementRef = useRef<HTMLVideoElement | null>(null)

  const [basicInfoVideoUrl, setBasicInfoVideoUrl] = useState("")
  const [isBasicInfoVideoPlaying, setIsBasicInfoVideoPlaying] = useState(false)
  const isBasicInfoVideoPlayingRef = useRef(false)
  const isFillerPlaybackRef = useRef(false)

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

  function parseActivateSpeaker(data: any): boolean {
    return data?.activate_speaker === true
  }

  /** Turn speaker on when server requests it (ref updated synchronously for queue processing). */
  function activateSpeakerIfRequested(data: any) {
    if (speakerEnabledRef.current || !parseActivateSpeaker(data)) return
    suppressSpeakerEmitRef.current = true
    speakerEnabledRef.current = true
    setSpeakerEnabled(true)
  }

  function canPlayIncomingMedia(data: any): boolean {
    return speakerEnabledRef.current || parseActivateSpeaker(data)
  }

  function handleAudioPlaybackResponse(data: any) {
    console.log("audio_playback_res received", data)
    extractAndPlayAudio(data)
  }

  function finalizeAvatarSocketSpeech() {
    if (!avatarSocketStreamActiveRef.current) return

    try {
      anamAudioInputStreamRef.current?.endSequence()
    } catch (err) {
      console.warn("Failed ending websocket avatar speech sequence:", err)
    }

    avatarSocketStreamActiveRef.current = false
    isAudioStillPlaying.current = false
    setIsAudioPlayingState(false)
    setAudioUrl("")
    isMediaBusyRef.current = false
    advanceMediaQueue()
  }

  function unlockAvatarOutput() {
    audioUnlockedRef.current = true
    syncAvatarVideoElements()
  }

  async function startAvatarSocketSpeechIfNeeded() {
    if (avatarSocketStreamActiveRef.current) return

    if (avatarSpeechStartPromiseRef.current) {
      return avatarSpeechStartPromiseRef.current
    }

    avatarSpeechStartPromiseRef.current = (async () => {
      // Clear MP4/MP3 queue only — do not interrupt Anam persona (breaks lip-sync).
      stopQueuedAudioPlayback()
      mediaQueueRef.current = mediaQueueRef.current.filter(isFillerMediaItem)
      setIsBasicInfoVideoPlaying(false)
      isBasicInfoVideoPlayingRef.current = false
      setBasicInfoVideoUrl("")

      unlockAvatarOutput()
      await ensureAvatarSessionStarted()

      avatarSocketStreamActiveRef.current = true
      isMediaBusyRef.current = true
      isAudioStillPlaying.current = true
      setIsAudioPlayingState(true)
      syncAvatarVideoElements()
    })()

    try {
      await avatarSpeechStartPromiseRef.current
    } finally {
      avatarSpeechStartPromiseRef.current = null
    }
  }

  function ingestAnamTtsPayload(raw: any) {
    const data = unwrapPlaybackPayload(raw)
    const eventType = typeof data?.type === "string" ? data.type : ""

    activateSpeakerIfRequested(data)

    if (
      eventType === "end" ||
      data?.done === true ||
      data?.is_final === true ||
      data?.stream_end === true
    ) {
      finalizeAvatarSocketSpeech()
      return
    }

    const audioChunk =
      typeof data?.chunk === "string" ? data.chunk :
      typeof data?.audio === "string" ? data.audio :
      typeof data?.audio_chunk === "string" ? data.audio_chunk :
      typeof data?.audio_base64 === "string" ? data.audio_base64 :
      null

    if (!audioChunk) return

    unlockAvatarOutput()

    void startAvatarSocketSpeechIfNeeded()
      .then(() => {
        anamAudioInputStreamRef.current?.sendAudioChunk(audioChunk)
      })
      .catch((err) => {
        console.warn("Failed handling anam_saravm_tts audio chunk:", err)
        finalizeAvatarSocketSpeech()
      })
  }

  function handleAnamSarvamTts(raw: any) {
    console.log("anam_saravm_tts received", raw)
    ingestAnamTtsPayload(raw)
  }

  const speakThroughAvatar = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    avatarAudioAbortControllerRef.current?.abort()
    const controller = new AbortController()
    avatarAudioAbortControllerRef.current = controller

    try {
      await streamAnamTts({
        text: trimmed,
        signal: controller.signal,
        onChunk: (chunk) => {
          if (chunk.type === "audio" && chunk.chunk) {
            ingestAnamTtsPayload({ type: "audio", chunk: chunk.chunk })
            return
          }
          if (chunk.type === "end") {
            ingestAnamTtsPayload({ type: "end" })
          }
          if (chunk.type === "error") {
            console.warn("Anam HTTP TTS error:", chunk.message)
          }
        },
      })
      ingestAnamTtsPayload({ type: "end" })
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.warn("speakThroughAvatar failed:", err)
      }
      finalizeAvatarSocketSpeech()
    } finally {
      if (avatarAudioAbortControllerRef.current === controller) {
        avatarAudioAbortControllerRef.current = null
      }
    }
  }, [])

  const videoChunksRef = useRef<Uint8Array[]>([])

  function parseChunkToUint8Array(chunk: any): Uint8Array | null {
    if (!chunk) return null
    if (chunk instanceof Uint8Array) return chunk
    if (chunk instanceof ArrayBuffer) return new Uint8Array(chunk)
    if (Array.isArray(chunk)) return new Uint8Array(chunk)
    if (typeof chunk === "string") {
      const cleanB64 = chunk.includes(",") ? chunk.split(",")[1] : chunk
      try {
        const binaryStr = atob(cleanB64)
        const bytes = new Uint8Array(binaryStr.length)
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i)
        }
        return bytes
      } catch (err) {
        console.warn("Failed to decode video chunk base64:", err)
        return null
      }
    }
    return null
  }

  /** Normalize server envelope: { route_type, data: {...} } or flat payload. */
  function unwrapPlaybackPayload(raw: any): any {
    if (!raw || typeof raw !== "object") return raw
    if (
      raw.data !== null &&
      typeof raw.data === "object" &&
      !Array.isArray(raw.data) &&
      (
        Object.prototype.hasOwnProperty.call(raw.data, "video_url") ||
        Object.prototype.hasOwnProperty.call(raw.data, "videobase64") ||
        Object.prototype.hasOwnProperty.call(raw.data, "video_chunk") ||
        Object.prototype.hasOwnProperty.call(raw.data, "videobytes") ||
        Object.prototype.hasOwnProperty.call(raw.data, "chunk") ||
        Object.prototype.hasOwnProperty.call(raw.data, "video_stream") ||
        Object.prototype.hasOwnProperty.call(raw.data, "type") ||
        Object.prototype.hasOwnProperty.call(raw.data, "filler") ||
        Object.prototype.hasOwnProperty.call(raw.data, "done") ||
        Object.prototype.hasOwnProperty.call(raw.data, "is_final") ||
        Object.prototype.hasOwnProperty.call(raw.data, "stream_end") ||
        Object.prototype.hasOwnProperty.call(raw.data, "activate_speaker") ||
        Object.prototype.hasOwnProperty.call(raw.data, "keep_button_active")
      )
    ) {
      return raw.data
    }
    return raw
  }

  function resolveVideoUrlFromPayload(data: any): string | null {
    if (typeof data?.video_url === "string" && data.video_url.trim()) {
      return data.video_url.trim()
    }
    // video_url null/empty → fall back to videobase64
    if (
      data?.video_url === null ||
      data?.video_url === undefined ||
      (typeof data?.video_url === "string" && !data.video_url.trim())
    ) {
      if (typeof data?.videobase64 === "string" && data.videobase64.trim()) {
        const rawB64 = data.videobase64.trim()
        return rawB64.startsWith("data:") ? rawB64 : `data:video/mp4;base64,${rawB64}`
      }
    }
    return null
  }

  function parseFillerFlag(data: any): boolean {
    return data?.filler === true
  }

  function getShouldMuteAvatarOutput() {
    // Speaker toggle controls Anam output; lip-sync still runs when muted.
    if (!speakerEnabledRef.current) return true
    // Browser autoplay policy: stay muted until a user gesture unlocks output.
    return !audioUnlockedRef.current
  }

  function syncAvatarVideoElements() {
    const outputStream = anamOutputStreamRef.current
    const shouldMute = getShouldMuteAvatarOutput()

    avatarVideoElementsRef.current.forEach((video) => {
      video.muted = shouldMute
      video.playsInline = true
      video.autoplay = true

      if (outputStream) {
        if (video.srcObject !== outputStream) {
          video.srcObject = outputStream
        }
        const playPromise = video.play()
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch((err) => {
            console.warn("Avatar video play failed:", err)
            if (!video.muted) {
              video.muted = true
              video.play().catch((retryErr) => {
                console.warn("Avatar video muted play failed:", retryErr)
              })
            }
          })
        }
      } else if (video.srcObject) {
        video.srcObject = null
      }
    })
  }

  async function prefetchAnamSessionToken(): Promise<string | null> {
    if (prefetchedAnamSessionTokenRef.current) {
      return prefetchedAnamSessionTokenRef.current
    }

    try {
      const response = await fetch(ANAM_SESSION_ENDPOINT, { method: "POST" })
      if (!response.ok) {
        throw new Error(`Anam session request failed with ${response.status}`)
      }

      const payload = await response.json()
      const nextToken =
        payload?.sessionToken ||
        payload?.anamSessionToken ||
        payload?.token ||
        null

      prefetchedAnamSessionTokenRef.current = typeof nextToken === "string" ? nextToken : null
      return prefetchedAnamSessionTokenRef.current
    } catch (err) {
      console.warn("Failed to prefetch Anam session token:", err)
      return null
    }
  }

  function clearAvatarVideoOutputs() {
    avatarVideoElementsRef.current.forEach((video) => {
      if (video.srcObject) {
        video.srcObject = null
      }
    })
  }

  function ensureAvatarVideoElementId(video: HTMLVideoElement) {
    if (!video.id) {
      avatarVideoIdCounterRef.current += 1
      video.id = `anam-avatar-video-${avatarVideoIdCounterRef.current}`
    }
    return video.id
  }

  async function ensureAvatarSessionStarted() {
    if (anamOutputStreamRef.current && anamAudioInputStreamRef.current && anamClientRef.current) {
      syncAvatarVideoElements()
      return
    }

    if (anamSessionStartPromiseRef.current) {
      return anamSessionStartPromiseRef.current
    }

    anamSessionStartPromiseRef.current = (async () => {
      const sessionToken =
        prefetchedAnamSessionTokenRef.current || await prefetchAnamSessionToken()
      const targetVideoElement =
        primaryAvatarVideoElementRef.current || Array.from(avatarVideoElementsRef.current)[0] || null

      if (!sessionToken) {
        throw new Error("No Anam session token available")
      }
      if (!targetVideoElement) {
        throw new Error("No avatar video element is available")
      }

      const client = createClient(sessionToken, {
        disableInputAudio: true,
      })
      client.addListener(AnamEvent.VIDEO_STREAM_STARTED, (videoStream) => {
        anamOutputStreamRef.current = videoStream
        setIsAvatarStreamConnected(true)
        syncAvatarVideoElements()
      })

      anamClientRef.current = client
      await client.streamToVideoElement(ensureAvatarVideoElementId(targetVideoElement))
      anamAudioInputStreamRef.current = client.createAgentAudioInputStream({
        encoding: "pcm_s16le",
        sampleRate: 16000,
        channels: 1,
      })
      prefetchedAnamSessionTokenRef.current = null
      setIsAvatarStreamConnected(true)
      syncAvatarVideoElements()
    })()

    try {
      await anamSessionStartPromiseRef.current
    } catch (err) {
      anamClientRef.current = null
      anamOutputStreamRef.current = null
      anamAudioInputStreamRef.current = null
      setIsAvatarStreamConnected(false)
      clearAvatarVideoOutputs()
      throw err
    } finally {
      anamSessionStartPromiseRef.current = null
    }
  }

  async function stopAvatarSession() {
    avatarAudioAbortControllerRef.current?.abort()
    avatarAudioAbortControllerRef.current = null

    try {
      anamAudioInputStreamRef.current?.endSequence()
    } catch (err) {
      console.warn("Failed ending avatar audio sequence:", err)
    }

    try {
      anamClientRef.current?.interruptPersona()
    } catch (err) {
      console.warn("Failed interrupting avatar persona:", err)
    }

    try {
      await anamClientRef.current?.stopStreaming()
    } catch (err) {
      console.warn("Failed stopping avatar stream:", err)
    }

    anamClientRef.current = null
    anamOutputStreamRef.current = null
    anamAudioInputStreamRef.current = null
    setIsAvatarStreamConnected(false)
    clearAvatarVideoOutputs()
  }

  const registerAvatarVideoElement = useCallback((element: HTMLVideoElement | null) => {
    if (!element) {
      return () => {}
    }

    avatarVideoElementsRef.current.add(element)
    if (!primaryAvatarVideoElementRef.current) {
      primaryAvatarVideoElementRef.current = element
    }
    ensureAvatarVideoElementId(element)
    syncAvatarVideoElements()
    void ensureAvatarSessionStarted().catch((err) => {
      console.warn("Unable to start avatar stream:", err)
    })

    return () => {
      avatarVideoElementsRef.current.delete(element)
      if (primaryAvatarVideoElementRef.current === element) {
        primaryAvatarVideoElementRef.current = Array.from(avatarVideoElementsRef.current)[0] || null
      }
      if (element.srcObject) {
        element.srcObject = null
      }
    }
  }, [])

  function isFillerMediaItem(item: MediaQueueItem | null): boolean {
    return item?.type === "video" && item.filler
  }

  function clearMediaQueueAndStopPlayback() {
    mediaQueueRef.current = []
    currentMediaItemRef.current = null
    isMediaBusyRef.current = false
    isFillerPlaybackRef.current = false
    videoChunksRef.current = []
    stopCurrentAudio()
    setIsBasicInfoVideoPlaying(false)
    isBasicInfoVideoPlayingRef.current = false
    setBasicInfoVideoUrl("")
  }

  function handleVideoPlaybackResponse(raw: any) {
    const data = unwrapPlaybackPayload(raw)
    console.log("video_playback_res received", data)
    const videoUrl = resolveVideoUrlFromPayload(data)
    if (!videoUrl) return

    const isFiller = parseFillerFlag(data)
    const keepButtonActive = parseKeepButtonActive(data)

    // activate_speaker: true → turn on the Composer speaker icon
    activateSpeakerIfRequested(data)

    if (!isFiller) {
      if (!canPlayIncomingMedia(data)) return
      clearMediaQueueAndStopPlayback()
      enqueueMedia({
        type: "video",
        url: videoUrl,
        keepButtonActive,
        filler: false,
      })
      return
    }

    // Fillers play immediately (muted when speaker off); queue if another filler is playing
    enqueueMedia({
      type: "video",
      url: videoUrl,
      keepButtonActive,
      filler: true,
    })
  }

  function handleVideoBytesPlaybackResponse(raw: any) {
    const data = unwrapPlaybackPayload(raw)
    console.log("video_bytes_playback_res received", data)
    let videoUrl = ""

    const chunkData = data?.video_chunk ?? data?.videobytes ?? data?.chunk ?? data?.video_stream
    if (chunkData !== undefined && chunkData !== null) {
      const parsedBytes = parseChunkToUint8Array(chunkData)
      if (parsedBytes) {
        videoChunksRef.current.push(parsedBytes)
      }

      const isLastChunk =
        data?.is_last_chunk === true ||
        data?.is_final === true ||
        data?.stream_end === true ||
        data?.is_last === true ||
        (data?.is_last_chunk === undefined && data?.is_final === undefined && data?.stream_end === undefined)

      if (isLastChunk) {
        if (videoChunksRef.current.length > 0) {
          const mimeType = typeof data?.mime_type === "string" ? data.mime_type : "video/mp4"
          const blob = new Blob(videoChunksRef.current as BlobPart[], { type: mimeType })
          videoUrl = URL.createObjectURL(blob)
          videoChunksRef.current = []
        }
      } else {
        return
      }
    }

    if (!videoUrl) return

    const isFiller = parseFillerFlag(data)
    const keepButtonActive = parseKeepButtonActive(data)

    // activate_speaker: true → turn on the Composer speaker icon
    activateSpeakerIfRequested(data)

    if (!isFiller) {
      if (!canPlayIncomingMedia(data)) return
      clearMediaQueueAndStopPlayback()
      enqueueMedia({
        type: "video",
        url: videoUrl,
        keepButtonActive,
        filler: false,
      })
      return
    }

    enqueueMedia({
      type: "video",
      url: videoUrl,
      keepButtonActive,
      filler: true,
    })
  }

  const startBasicInfoVideo = useCallback(() => {
    if (!speakerEnabledRef.current && !isFillerPlaybackRef.current) {
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


  function stopQueuedAudioPlayback() {
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

  function interruptAvatarSpeech() {
    avatarAudioAbortControllerRef.current?.abort()
    avatarAudioAbortControllerRef.current = null
    try {
      anamAudioInputStreamRef.current?.endSequence()
    } catch (err) {
      console.warn("Failed ending active avatar audio sequence:", err)
    }
    try {
      anamClientRef.current?.interruptPersona()
    } catch (err) {
      console.warn("Failed interrupting active avatar speech:", err)
    }
    avatarSocketStreamActiveRef.current = false
  }

  function stopCurrentAudio() {
    interruptAvatarSpeech()
    stopQueuedAudioPlayback()
  }

  function cancelBasicInfoVideoSession() {
    setIsBasicInfoVideoPlaying(false)
    isBasicInfoVideoPlayingRef.current = false
    isFillerPlaybackRef.current = false
    setBasicInfoVideoUrl("")
    if (isMediaBusyRef.current && !isAudioStillPlaying.current) {
      isMediaBusyRef.current = false
      advanceMediaQueue()
    }
  }

  const endBasicInfoVideo = useCallback(() => {
    setIsBasicInfoVideoPlaying(false)
    isBasicInfoVideoPlayingRef.current = false
    isFillerPlaybackRef.current = false
    setBasicInfoVideoUrl("")
    isMediaBusyRef.current = false
    advanceMediaQueue()
  }, [])

  function resetSpeakerWhenMediaIdle(completedKeepButtonActive = false) {
    // Speaker stays on by default; user toggles mute manually.
    void completedKeepButtonActive
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
        // Mute output only — Anam still receives TTS chunks for lip-sync.
        speakerEnabledRef.current = false
        stopQueuedAudioPlayback()
        syncAvatarVideoElements()
        return false
      }
      speakerEnabledRef.current = true
      audioUnlockedRef.current = true
      syncAvatarVideoElements()
      return true
    })
  }

  function clearAllMedia() {
    mediaQueueRef.current = []
    currentMediaItemRef.current = null
    isMediaBusyRef.current = false
    isFillerPlaybackRef.current = false
    videoChunksRef.current = []
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

  function startQueuedVideo(url: string, isFiller = false) {
    if (typeof url !== "string" || !url.trim()) {
      isMediaBusyRef.current = false
      isFillerPlaybackRef.current = false
      advanceMediaQueue()
      return
    }
    isFillerPlaybackRef.current = isFiller
    setBasicInfoVideoUrl(url)
    startBasicInfoVideo()
  }

  function processMediaQueue() {
    if (isMediaBusyRef.current) return

    const next = mediaQueueRef.current[0]
    if (!next) return

    const isFillerVideo = next.type === "video" && next.filler
    if (!speakerEnabledRef.current && !isFillerVideo) return

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
    startQueuedVideo(next.url, isFillerVideo)
  }

  function enqueueMedia(item: MediaQueueItem) {
    const isFillerVideo = item.type === "video" && item.filler
    if (!speakerEnabledRef.current && !isFillerVideo) return
    mediaQueueRef.current.push(item)
    processMediaQueue()
  }

  // Speaker off: mute output + stop queued MP3 playback; Anam TTS/lip-sync continues.
  useEffect(() => {
    syncAvatarVideoElements()
    if (speakerEnabled) return
    stopQueuedAudioPlayback()
    // Drop queued audio / non-filler items; keep fillers + currently playing video.
    mediaQueueRef.current = mediaQueueRef.current.filter(isFillerMediaItem)
  }, [speakerEnabled])

  function extractAndPlayAudio(data: any) {
    let audiourl: string | null = null
    if (data?.audio_url && data.audio_url !== null) {
      audiourl = data.audio_url
    }
    if (data?.audiobase64 && data.audiobase64 !== null) {
      audiourl = `data:audio/mpeg;base64,${data.audiobase64}`
    }
    if (!audiourl) return
    if (!canPlayIncomingMedia(data)) return
    activateSpeakerIfRequested(data)
    enqueueMedia({
      type: "audio",
      url: audiourl,
      keepButtonActive: parseKeepButtonActive(data),
    })
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
        tempSocket.on('anam_saravm_tts', handleAnamSarvamTts)
        tempSocket.on('video_playback_res', handleVideoPlaybackResponse)
        tempSocket.on('video_bytes_playback_res', handleVideoBytesPlaybackResponse)
        tempSocket.on('message', (payload: any) => {
          const routeType =
            payload?.route_type ||
            payload?.event ||
            payload?.channel ||
            payload?.type
          if (routeType) {
            console.log("[ws inbound]", routeType, payload)
          }
        })

    setSocket(tempSocket)

    return () => {
      tempSocket.off("connect", connected)
      tempSocket.off("disconnect", disconnect)
      tempSocket.off("questions_loader_res", initialisationSalesState)
      tempSocket.off("ai_suggestion_res", updateSalesState)
      tempSocket.off("notifications", updateNotifications)
      tempSocket.off("audio_playback_res", handleAudioPlaybackResponse)
      tempSocket.off("anam_saravm_tts", handleAnamSarvamTts)
      tempSocket.off("video_playback_res", handleVideoPlaybackResponse)
      tempSocket.off("video_bytes_playback_res", handleVideoBytesPlaybackResponse)
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

    // Server-initiated activation via activate_speaker — do not echo speaker: "on" back.
    if (currentSpeakerState === "on" && suppressSpeakerEmitRef.current) {
      suppressSpeakerEmitRef.current = false
      lastSentSpeakerStateRef.current = currentSpeakerState
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
      if (audioElem && (pendingAutoplayRef.current || audioUrl)) {
        const playPromise = audioElem.play()
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch((err: any) => {
            console.warn('Auto-play retry failed:', err)
          })
        }
        pendingAutoplayRef.current = false
      }
      syncAvatarVideoElements()
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

  // Prefetch Anam session token early to reduce first-speech latency.
  useEffect(() => {
    void prefetchAnamSessionToken()
  }, [])

  useEffect(() => {
    syncAvatarVideoElements()
  }, [speakerEnabled, isAvatarStreamConnected])

  useEffect(() => {
    return () => {
      void stopAvatarSession()
    }
  }, [])
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
    isAvatarStreamConnected, registerAvatarVideoElement, speakThroughAvatar,
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
