'use client';

import type React from "react"
import { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "../../store/store"
import { useVad } from "../../context/VadWrapper"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataWrapper"
import playSound from "../../assets/sound-play.gif"
import { updatePref_language } from "../../reducers/salesCopilotReducer"
import { X } from "lucide-react"
import { TailSpin } from "react-loading-icons"
import { Flag } from "lucide-react"
import { useDispatch } from "react-redux";

export default function Header() {
  const { socket, isAudioPlayingState, audioRef, speakerEnabled, setSpeakerEnabled } = useData()
  const dispatch = useAppDispatch()
  //@ts-ignore
  const { setCurrentUser } = useAuth()
  //@ts-ignore
  const { manualVadStatus, setManualVadStatus, VAD2 } = useVad()

  // Redux selectors
  const currentNavigation = useAppSelector((state) => state.salesCopilotReducer.navigation)
  const clientName = useAppSelector((state) => state.salesCopilotReducer.clientName)
  const pref_language = useAppSelector((state) => state.salesCopilotReducer.pref_language)
  const allLanguageOptions = useAppSelector((state) => state.salesCopilotReducer.language_ids)
  const qpParams = useAppSelector((state) => state.qpReducer)

  console.log("parms are",{
    pref_language,
    allLanguageOptions,
    qpParams  
  })

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerState, setTimerState] = useState<"stopped" | "running" | "paused">("stopped")

  // Flag modal state
  const [flagOpen, setFlagOpen] = useState(false)

  // Timer - runs ONLY when VAD2.listening is true
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (VAD2 && VAD2.listening) {
      setTimerState("running")
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      setTimerState("stopped")
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [VAD2])

  const minutes = Math.floor(timerSeconds / 60)
    .toString()
    .padStart(2, "0")
  const seconds = (timerSeconds % 60).toString().padStart(2, "0")

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("insurance-auth")
    setCurrentUser(null)
  }

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

    const selectedLang = e.target.value
    dispatch(updatePref_language(selectedLang))
    socket?.emit("switch_pref_language_hi", {
      roomid: qpParams.roomId,
      pref_language: selectedLang,
    })
  }

  // Handle flag submission
  const handleFlag = (flagType: string) => {
    console.log("Flag submitted:", flagType)
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

  // Format timer display
  // const minutes = Math.floor(timerSeconds / 60)
    // .toString()
    // .padStart(2, "0")
  // const seconds = (timerSeconds % 60).toString().padStart(2, "0")

  // Page title mapping
  const pageDetails: Record<string, string> = {
    "Basic Info": "Basic Information",
    Assets: "Assets",
    Liabilities: "Liabilities",
    "Financial Goals": "Financial Goals",
    "Plan Summary": "Plan Summary",
    Recommendations: "Recommendations",
  }

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left: Title  name vad play logo*/}
          <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-800 md:text-2xl">
                    {pageDetails[currentNavigation] || "Dashboard"}
                  </h2>

                  {clientName && (
                    <p className="text-base text-slate-500 md:text-lg">
                      | Client: {clientName}
                    </p>
                  )}

                  {VAD2?.userSpeaking && (
                    <img
                      src={playSound || "/placeholder.svg"}
                      alt="User Speaking"
                      className="w-16 h-8 object-contain"
                    />
                  )}
                </div>


          {/* Right: Controls */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-50 md:px-4 md:text-base">
              Skip PFR
            </button>

            {/* VAD Controls */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg flex-shrink-0">
              {VAD2 !== undefined && !VAD2.loading ? (
                <button
                  className={`p-2 rounded-md hover:bg-slate-200 ${VAD2.listening ? "text-sky-600" : "text-slate-600"}`}
                  onClick={() => setManualVadStatus(!VAD2.listening)}
                >
                  {VAD2.listening ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.75 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25A.75.75 0 005.75 4.5zm8.5 0a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                    </svg>
                  )}
                </button>
              ) : (
                <div className="p-2 flex justify-center items-center">
                  <TailSpin stroke="red" speed={0.95} className="w-4 h-4 m-1" />
                </div>
              )}

              {/* Speaker toggle — right of mic */}
              <button
                className={`p-2 rounded-md hover:bg-slate-200 transition-colors ${speakerEnabled ? (isAudioPlayingState ? "text-green-600" : "text-slate-600") : "text-red-400"}`}
                title={speakerEnabled ? (isAudioPlayingState ? "Audio playing — click to disable speaker" : "Speaker on — click to disable") : "Speaker off — click to enable"}
                onClick={() => {
                  if (speakerEnabled) {
                    // turning off: stop any current playback and clear queue
                    if (audioRef?.current) {
                      audioRef.current.pause()
                      audioRef.current.src = ''
                    }
                  }
                  setSpeakerEnabled((prev: boolean) => !prev)
                }}
              >
                {speakerEnabled ? (
                  isAudioPlayingState ? (
                    /* Speaker with sound waves — on & playing */
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.553 3.064A.75.75 0 0112 3.75v16.5a.75.75 0 01-1.255.555L5.46 16H2.75A1.75 1.75 0 011 14.25v-4.5C1 8.784 1.784 8 2.75 8H5.46l5.285-4.805a.75.75 0 01.808-.131z" />
                      <path d="M17.03 7.47a.75.75 0 011.06 0 8.25 8.25 0 010 11.66.75.75 0 11-1.06-1.06 6.75 6.75 0 000-9.54.75.75 0 010-1.06zM14.47 9.97a.75.75 0 011.06 0 5.25 5.25 0 010 7.06.75.75 0 11-1.06-1.06 3.75 3.75 0 000-4.94.75.75 0 010-1.06z" />
                    </svg>
                  ) : (
                    /* Speaker — on but silent */
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.553 3.064A.75.75 0 0112 3.75v16.5a.75.75 0 01-1.255.555L5.46 16H2.75A1.75 1.75 0 011 14.25v-4.5C1 8.784 1.784 8 2.75 8H5.46l5.285-4.805a.75.75 0 01.808-.131z" />
                    </svg>
                  )
                ) : (
                  /* Speaker — off / muted (X overlay) */
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.553 3.064A.75.75 0 0112 3.75v16.5a.75.75 0 01-1.255.555L5.46 16H2.75A1.75 1.75 0 011 14.25v-4.5C1 8.784 1.784 8 2.75 8H5.46l5.285-4.805a.75.75 0 01.808-.131z" />
                    <path fillRule="evenodd" d="M16.28 9.22a.75.75 0 011.06 0l1.72 1.72 1.72-1.72a.75.75 0 111.06 1.06L20.12 12l1.72 1.72a.75.75 0 11-1.06 1.06L19.06 13.06l-1.72 1.72a.75.75 0 11-1.06-1.06L17.94 12l-1.66-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>

            {/* Timer */}
            <div
              className={`text-lg font-mono font-semibold px-3 py-2 rounded-lg whitespace-nowrap ${VAD2?.listening ? "text-green-700 bg-green-50" : "text-slate-700 bg-slate-100"}`}
            >
              {minutes}:{seconds}
            </div>

            {/* Language Selector */}
            <select
              value={pref_language}
              onChange={handleLanguageChange}
              className="rounded-lg border border-slate-300 bg-slate-100 px-2 py-2 text-base text-slate-700 outline-none transition hover:bg-slate-200"
              aria-label="Select language"
            >
              {allLanguageOptions?.map((lang: string) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>

            {/* Flag Button */}
            <button
              onClick={() => setFlagOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 transition"
            >
              <Flag
                size={18}
                className="text-gray-700 hover:text-red-500 transition"
              />
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-200 md:px-4 md:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Flag Modal */}
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
        {/* Close Button */}
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
            {/* Selected Option Display */}
            <div className="rounded-md bg-slate-100 px-3 py-2">
              <p className="text-sm font-medium text-slate-600">{selectedOption}</p>
            </div>

            {/* Comment Input */}
            <textarea
              placeholder="Add your comment here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] w-full resize-none rounded-md border border-slate-300 px-3 py-3 text-base outline-none focus:ring-2 focus:ring-slate-400"
              autoFocus
            />

            {/* Action Buttons */}
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

// Icon Components
function PlayIcon() {
  return (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M5.75 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25A.75.75 0 005.75 4.5zm8.5 0a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75z" />
    </svg>
  )
}
