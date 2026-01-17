import type React from "react"
import { useEffect, useState, useRef, useCallback } from "react"
import { useAppSelector } from "../../store/store";
import { useVad } from "../../context/VadWrapper"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataWrapper"
import { useDispatch } from "react-redux"
import { updatePref_language, updatePrefLanguage } from "../../reducers/salesCopilotReducer"
import { X } from "lucide-react"
import { TailSpin } from "react-loading-icons"
   import { Flag } from "lucide-react";

export default function Header() {
  const { socket } = useData()
  const dispatch = useDispatch()
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
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Flag modal state
  const [flagOpen, setFlagOpen] = useState(false)

  // Timer update callback
  const updateTimer = useCallback(() => {
    setTimerSeconds((prev) => prev + 1)
  }, [])

  // Auto-start timer on mount
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    timerIntervalRef.current = setInterval(updateTimer, 1000)
    setTimerState("running")

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [updateTimer])

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
  const minutes = Math.floor(timerSeconds / 60)
    .toString()
    .padStart(2, "0")
  const seconds = (timerSeconds % 60).toString().padStart(2, "0")

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
          {/* Left: Title */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 md:text-2xl">
              {pageDetails[currentNavigation] || "Dashboard"}
            </h2>
            {clientName && <p className="mt-1 text-base text-slate-500 md:text-lg">| Client: {clientName}</p>}
          </div>

          {/* Right: Controls */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <button className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-50 md:px-4 md:text-base">
              Skip PFR
            </button>

            {/* VAD Controls */}
            <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
              {VAD2 !== undefined && !VAD2.loading ? (
                VAD2.listening ? (
                  <button
                    onClick={() => setManualVadStatus(false)}
                    className="rounded-md p-2 text-slate-600 hover:bg-slate-200"
                    aria-label="Pause recording"
                  >
                    <PauseIcon />
                  </button>
                ) : (
                  <button
                    onClick={() => setManualVadStatus(true)}
                    className="rounded-md p-2 text-slate-600 hover:bg-slate-200"
                    aria-label="Start recording"
                  >
                    <PlayIcon />
                  </button>
                )
              ) : (
                <div className="flex items-center justify-center">
                  <TailSpin
                    stroke="red"
                    strokeOpacity={1}
                    speed={0.95}
                    style={{ margin: "0.5rem", width: "1rem", height: "1rem" }}
                  />
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-base font-semibold text-slate-700 md:text-lg">
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
