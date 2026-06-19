'use client';

import React, { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "../../store/store"
import { useVad } from "../../context/VadWrapper"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataWrapper"
import playSound from "../../assets/sound-play.gif"
import { updatePref_language } from "../../reducers/salesCopilotReducer"
import { TailSpin } from "react-loading-icons"
import { Flag, X, Mic, MicOff, AudioLines, LogOut, ChevronDown, Play, Pause } from "lucide-react"
import {
  useConnectionQuality,
  defaultHealthUrl,
  NetworkStatusIcon,
  NetworkStatusBanner,
} from "./NetworkMonitor"

// Page title mapping (shared between Header and MobileHeaderControls)
const pageDetails: Record<string, string> = {
  "Data Retrieval": "Client Info",
  Assets: "Assets",
  Liabilities: "Liabilities",
  "Plan Summary": "Plan Summary",
  Recommendations: "Recommendations",
}

const resolvePageTitle = (nav: string) => {
  if (typeof nav === "string" && nav.startsWith("Recommendations::")) {
    return "Recommendations"
  }
  return pageDetails[nav] || "Dashboard"
}

export default function Header() {
  const { socket, isAudioPlayingState, audioRef, speakerEnabled, setSpeakerEnabled, startLanguageChangeLoading } = useData()
  const dispatch = useAppDispatch()
  //@ts-ignore
  const { setCurrentUser } = useAuth()
  //@ts-ignore
  const { manualVadStatus, setManualVadStatus, VAD2 } = useVad()

  const currentNavigation = useAppSelector((state) => state.salesCopilotReducer.navigation)
  const clientName = useAppSelector((state) => state.salesCopilotReducer.clientName)
  const pref_language = useAppSelector((state) => state.salesCopilotReducer.pref_language)
  const allLanguageOptions = useAppSelector((state) => state.salesCopilotReducer.language_ids)
  const qpParams = useAppSelector((state) => state.qpReducer)

  const [timerSeconds, setTimerSeconds] = useState(0)
  const [flagOpen, setFlagOpen] = useState(false)
  const [speakGifLoaded, setSpeakGifLoaded] = useState(false)

  const networkStatus = useConnectionQuality(defaultHealthUrl(), 15000)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (VAD2 && VAD2.listening) {
      interval = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [VAD2])

  const minutes = Math.floor(timerSeconds / 60).toString().padStart(2, "0")
  const seconds = (timerSeconds % 60).toString().padStart(2, "0")

  const handleLogout = () => {
    localStorage.removeItem("insurance-auth")
    setCurrentUser(null)
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let selectedLang = e.target.value
    dispatch(updatePref_language(selectedLang))
    selectedLang = selectedLang.charAt(0).toUpperCase() + selectedLang.slice(1)
    startLanguageChangeLoading()
    socket?.emit("switch_pref_language_li", {
      roomid: qpParams.roomId,
      pref_language: selectedLang,
    })
  }

  const handleFlag = (flagType: string) => {
    const payload = {
      roomid: qpParams.roomId,
      topic: currentNavigation,
      report_message: flagType,
      type: "LI",
      agent_name: JSON.parse(localStorage.getItem("agent_name") || "{}")?.agent_name || "",
    }
    socket?.emit("save_flags_data", payload)
    setFlagOpen(false)
    alert(`Flag raised: ${flagType}`)
  }

  return (
    <>
      {/* Title bar.
          Desktop: sticky at top, includes title + all controls in one row.
          Mobile: NOT sticky — scrolls away with content. Only contains the title (name + network icon). */}
      <header className="bg-white border-b border-slate-200 shadow-sm md:sticky md:top-0 md:z-30">
        <div className="px-3 py-2 md:p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left: Title + client name */}
          <div className="flex items-center justify-between md:justify-start gap-2 md:gap-3 md:flex-wrap min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1 md:flex-initial">
              <h2 className="text-xl font-bold text-slate-800 md:text-2xl whitespace-nowrap flex-shrink-0">
                {resolvePageTitle(currentNavigation)}
              </h2>

              {clientName && (
                <p className="text-base text-slate-500 md:text-lg truncate min-w-0">
                  | <span className="md:hidden">{clientName}</span>
                  <span className="hidden md:inline">Client: {clientName}</span>
                </p>
              )}

              {/* Desktop: VAD speaking icon inline with title. */}
              {VAD2?.userSpeaking && manualVadStatus === true && (
                <>
                  {!speakGifLoaded && (
                    <AudioLines className="hidden md:block w-8 h-8 text-sky-500 animate-pulse" />
                  )}
                  <img
                    src={playSound}
                    alt="User Speaking"
                    onLoad={() => setSpeakGifLoaded(true)}
                    className={`${speakGifLoaded ? "hidden md:block" : "hidden"} w-16 h-8 object-contain`}
                  />
                </>
              )}
            </div>

            {/* Network status icon at far right of the title row (mobile only).
                Bare variant — no grey box — so the freed width goes to the client name.
                Desktop has the network icon embedded in the controls cluster below. */}
            <div className="md:hidden flex-shrink-0">
              <NetworkStatusIcon {...networkStatus} variant="bare" />
            </div>
          </div>

          {/* Right: Desktop controls */}
          <div className="hidden md:flex flex-wrap items-center gap-3">
            {/* Mic Control */}
            <div className="h-10 md:h-12 flex items-center flex-shrink-0">
              {VAD2 !== undefined && VAD2.loading === false ? (
                <button
                  className={`h-full px-3 md:px-4 flex items-center justify-center rounded-lg transition-all duration-200 shadow-sm ${
                    manualVadStatus
                      ? "text-sky-600 bg-white shadow-[0_0_10px_rgba(2,132,199,0.3)] relative z-10"
                      : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                  }`}
                  onClick={() => setManualVadStatus(!manualVadStatus)}
                >
                  {manualVadStatus ? (
                    <Mic className="w-5 h-4 md:w-7 md:h-7" />
                  ) : (
                    <MicOff className="w-5 h-4 md:w-7 md:h-7" />
                  )}
                </button>
              ) : (
                <div className="h-full px-3 md:px-4 flex justify-center items-center rounded-lg bg-slate-100 shadow-sm">
                  <TailSpin stroke="red" speed={0.95} className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              )}
            </div>

            {/* Media play/pause control (gray styling like mic) */}
            <div className="h-10 md:h-12 ml-1 md:ml-2 flex items-center flex-shrink-0">
              <button
                className={`h-full px-3 md:px-4 flex items-center justify-center rounded-lg transition-all duration-200 shadow-sm ${
                  speakerEnabled
                    ? "text-slate-600 bg-white shadow-[0_0_10px_rgba(148,163,184,0.35)] ring-1 ring-slate-200 relative z-10"
                    : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                }`}
                title={
                  speakerEnabled
                    ? isAudioPlayingState
                      ? "Media playing — click to turn off playback"
                      : "Playback on — click to turn off"
                    : "Playback off — click to turn on"
                }
                onClick={() => {
                  if (speakerEnabled) {
                    if (audioRef?.current) {
                      audioRef.current.pause()
                      audioRef.current.src = ''
                    }
                  }
                  setSpeakerEnabled((prev: boolean) => !prev)
                }}
              >
                {speakerEnabled ? (
                  <Pause className="w-5 h-5 md:w-7 md:h-7" fill="currentColor" />
                ) : (
                  <Play className="w-5 h-5 md:w-7 md:h-7" fill="currentColor" />
                )}
              </button>
            </div>

            {/* Timer */}
            <div
              className={`h-10 md:h-12 flex items-center justify-center text-sm md:text-lg font-mono font-semibold px-3 md:px-4 rounded-lg whitespace-nowrap shadow-sm ${VAD2?.listening ? "text-green-700 bg-green-50" : "text-slate-700 bg-slate-100"}`}
            >
              {minutes}:{seconds}
            </div>

            {/* Language Selector */}
            <select
              value={pref_language}
              onChange={handleLanguageChange}
              className="h-10 md:h-12 flex items-center rounded-lg border border-slate-300 bg-slate-100 px-2 md:px-4 text-sm md:text-base text-slate-700 outline-none transition hover:bg-slate-200 shadow-sm"
              aria-label="Select language"
            >
              {allLanguageOptions?.map((lang: string) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>

            {/* Network status icon (desktop) */}
            <NetworkStatusIcon {...networkStatus} />

            {/* Flag Button */}
            <button
              onClick={() => setFlagOpen(true)}
              className="h-10 md:h-12 w-10 md:w-12 flex items-center justify-center rounded-lg hover:bg-slate-100 transition shadow-sm"
            >
              <Flag className="w-5 h-5 md:w-6 md:h-6 text-gray-700 hover:text-red-500 transition" />
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="h-10 md:h-12 flex items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-3 md:px-5 text-sm md:text-base font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-200 shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {flagOpen && <FlagModal onClose={() => setFlagOpen(false)} onSubmit={handleFlag} />}
      <NetworkStatusBanner {...networkStatus} />
    </>
  )
}

/**
 * Mobile-only icons strip. Rendered as a separate component so the parent
 * (MainInsurancePage) can place it inside a sticky wrapper that also contains
 * the AI Cues panel, keeping them stuck together while the title section
 * scrolls away.
 */
export function MobileHeaderControls() {
  const { socket, isAudioPlayingState, audioRef, speakerEnabled, setSpeakerEnabled, startLanguageChangeLoading } = useData()
  const dispatch = useAppDispatch()
  //@ts-ignore
  const { setCurrentUser } = useAuth()
  //@ts-ignore
  const { manualVadStatus, setManualVadStatus, VAD2 } = useVad()

  const currentNavigation = useAppSelector((state) => state.salesCopilotReducer.navigation)
  const pref_language = useAppSelector((state) => state.salesCopilotReducer.pref_language)
  const allLanguageOptions = useAppSelector((state) => state.salesCopilotReducer.language_ids)
  const qpParams = useAppSelector((state) => state.qpReducer)

  const [timerSeconds, setTimerSeconds] = useState(0)
  const [flagOpen, setFlagOpen] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (VAD2 && VAD2.listening) {
      interval = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [VAD2])

  const minutes = Math.floor(timerSeconds / 60).toString().padStart(2, "0")
  const seconds = (timerSeconds % 60).toString().padStart(2, "0")

  const handleLogout = () => {
    localStorage.removeItem("insurance-auth")
    setCurrentUser(null)
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let selectedLang = e.target.value
    dispatch(updatePref_language(selectedLang))
    selectedLang = selectedLang.charAt(0).toUpperCase() + selectedLang.slice(1)
    startLanguageChangeLoading()
    socket?.emit("switch_pref_language_li", {
      roomid: qpParams.roomId,
      pref_language: selectedLang,
    })
  }

  const handleFlag = (flagType: string) => {
    const payload = {
      roomid: qpParams.roomId,
      topic: currentNavigation,
      report_message: flagType,
      type: "LI",
      agent_name: JSON.parse(localStorage.getItem("agent_name") || "{}")?.agent_name || "",
    }
    socket?.emit("save_flags_data", payload)
    setFlagOpen(false)
    alert(`Flag raised: ${flagType}`)
  }

  return (
    <>
      <div className="md:hidden bg-white border-b border-slate-200 px-2 py-4">
        <div className="flex items-center justify-between gap-1 w-full">
          {/* Mic Control */}
          <div className="flex items-center flex-shrink-0 bg-slate-100 rounded-lg shadow-sm">
            {VAD2 !== undefined && VAD2.loading === false ? (
              <button
                className={`px-3 py-2 flex items-center justify-center rounded-lg transition-all duration-200 ${
                  manualVadStatus
                    ? "text-sky-600 bg-white shadow-[0_0_10px_rgba(2,132,199,0.3)] ring-1 ring-slate-200 relative z-10"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => setManualVadStatus(!manualVadStatus)}
              >
                {manualVadStatus ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            ) : (
              <div className="px-3 py-2 flex justify-center items-center">
                <TailSpin stroke="red" speed={0.95} className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Media play/pause control (gray styling like mic) */}
          <div className="flex items-center flex-shrink-0 bg-slate-100 rounded-lg shadow-sm">
            <button
              className={`px-3 py-2 flex items-center justify-center rounded-lg transition-all duration-200 ${
                speakerEnabled
                  ? "text-slate-600 bg-white shadow-[0_0_10px_rgba(148,163,184,0.35)] ring-1 ring-slate-200 relative z-10"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
              title={
                speakerEnabled
                  ? isAudioPlayingState
                    ? "Media playing — click to turn off playback"
                    : "Playback on — click to turn off"
                  : "Playback off — click to turn on"
              }
              onClick={() => {
                if (speakerEnabled) {
                  if (audioRef?.current) {
                    audioRef.current.pause()
                    audioRef.current.src = ""
                  }
                }
                setSpeakerEnabled((prev: boolean) => !prev)
              }}
            >
              {speakerEnabled ? (
                <Pause className="w-5 h-5" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5" fill="currentColor" />
              )}
            </button>
          </div>

          {/* Timer */}
          <div className="flex items-center flex-shrink-0 bg-slate-100 rounded-lg shadow-sm">
            <div
              className={`px-3 py-2 flex items-center justify-center text-sm font-mono font-semibold rounded-lg ${
                VAD2?.listening ? "text-green-700 bg-green-50 shadow-[0_0_10px_rgba(22,163,74,0.3)] ring-1 ring-slate-200 relative z-10" : "text-slate-700"
              }`}
            >
              {minutes}:{seconds}
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center flex-shrink-0 bg-slate-100 rounded-lg shadow-sm">
            <div className="relative flex items-center justify-center px-2 py-2 min-w-[3rem]">
              <select
                value={pref_language}
                onChange={handleLanguageChange}
                className="absolute inset-0 w-full h-full text-transparent bg-transparent outline-none appearance-none cursor-pointer z-10"
                aria-label="Select language"
              >
                {allLanguageOptions?.map((lang: string) => (
                  <option key={lang} value={lang} className="text-slate-800">
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-0.5 text-sm font-semibold text-slate-700 pointer-events-none">
                <span>
                  {pref_language ? pref_language.substring(0, 2).charAt(0).toUpperCase() + pref_language.substring(1, 2).toLowerCase() : "En"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Flag Button */}
          <div className="flex items-center flex-shrink-0 bg-slate-100 rounded-lg shadow-sm">
            <button
              onClick={() => setFlagOpen(true)}
              className="px-3 py-2 flex items-center justify-center rounded-lg hover:bg-slate-200 transition"
            >
              <Flag className="w-5 h-5 text-gray-700 hover:text-red-500 transition" />
            </button>
          </div>

          {/* Logout Button */}
          <div className="flex items-center flex-shrink-0 bg-slate-100 rounded-lg shadow-sm">
            <button
              onClick={handleLogout}
              className="px-3 py-2 flex items-center justify-center rounded-lg hover:bg-slate-200 transition text-slate-700"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {flagOpen && <FlagModal onClose={() => setFlagOpen(false)} onSubmit={handleFlag} />}
    </>
  )
}

interface FlagModalProps {
  onClose: () => void
  onSubmit: (message: string) => void
}

function FlagModal({ onClose, onSubmit }: FlagModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [inputText, setInputText] = useState("")

  const options = ["System Not Responding", "Incorrect Data Captured", "Incorrect Q/A", "Latency is High", "Others"]

  const handleSubmit = () => {
    if (!inputText.trim()) return
    const flagMessage = selectedOption === "Others" ? inputText.trim() : `${selectedOption}: ${inputText.trim()}`
    onSubmit(flagMessage)
    setSelectedOption(null)
    setInputText("")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-slate-500 transition hover:text-slate-800"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <h3 className="mb-4 text-lg font-bold text-slate-800">Raise a Flag</h3>

        {selectedOption ? (
          <div className="space-y-3">
            <div className="rounded-md bg-slate-100 px-3 py-2">
              <p className="text-sm font-medium text-slate-600">{selectedOption}</p>
            </div>

            <textarea
              placeholder="Add your comment here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] w-full resize-none rounded-md border border-slate-300 px-3 py-3 text-base outline-none focus:ring-1 focus:ring-slate-300"
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedOption(null)
                  setInputText("")
                }}
                className="flex-1 rounded-md bg-slate-200 px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-300"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!inputText.trim()}
                className="flex-1 rounded-md bg-blue-500 px-3 py-2 text-base font-semibold text-white disabled:bg-blue-300 hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                className="w-full rounded-md bg-slate-100 px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-200"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
