import React, { useEffect } from "react"
import { useAppSelector } from "../../store/store"
import { useVad } from "../../context/VadWrapper"
import { TailSpin } from "react-loading-icons"
import { useDispatch } from "react-redux"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataWrapper"
import { updatePrefLanguage } from '../../reducers/queryparamReducer'
import { LogOut } from "lucide-react";

export default function Header() {
  const { socket } = useData()
  const currentNavigation = useAppSelector(
    (state) => state.healthManagmentReducer.navigation
  )
  //@ts-ignore
  const { manualVadStatus, setManualVadStatus, VAD2 } = useVad()
  const [clientName, qpParams] = useAppSelector((state) => [
    state.healthManagmentReducer.clientName,
    state.qpReducer
  ])
  const navigation = useAppSelector((state) => state.healthManagmentReducer.navigation)

  const { setCurrentUser } = useAuth()
  const dispatch = useDispatch()

  function handleLogout() {
    localStorage.removeItem("insurance-auth")
    setCurrentUser(null)
  }

  const pageDetails: { [key: string]: string } = {
    "Basic Info": "Basic Information",
    Assets: "Assets",
    Liabilities: "Liabilities",
    "Financial Goals": "Financial Goals",
    "Plan Summary": "Plan Summary",
    Recommendations: "Recommendations",
  }

  // ---------------- TIMER -------------------
  const [timerSeconds, setTimerSeconds] = React.useState(0)
  const [timerState, setTimerState] = React.useState<
    "stopped" | "running" | "paused"
  >("stopped")
  const timerIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const updateTimer = React.useCallback(() => {
    setTimerSeconds((prev) => prev + 1)
  }, [])

  const handleTimerControls = (action: "start" | "pause" | "stop") => {
    if (action === "start") {
      if (timerState !== "running") {
        timerIntervalRef.current = setInterval(updateTimer, 1000)
        setTimerState("running")
      }
    } else if (action === "pause") {
      if (timerState === "running") {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
        setTimerState("paused")
      }
    } else if (action === "stop") {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      setTimerState("stopped")
      setTimerSeconds(0)
    }
  }

  React.useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [])

  React.useEffect(() => {
    handleTimerControls("start")
  }, [])

  React.useEffect(() => {
    const statuses = ["audio", "transcription", "processing"]
    let currentStatusIndex = 0
    const statusInterval = setInterval(() => {
      if (timerState !== "running") return

      const statusId = statuses[currentStatusIndex]
      const statusElement = document.getElementById(`status-${statusId}`)
      if (statusElement) {
        const indicator = statusElement.querySelector(".status-indindicator")
        indicator?.classList.add("bg-green-500")
        statusElement.classList.add("text-slate-700", "font-medium")
      }

      currentStatusIndex = (currentStatusIndex + 1) % statuses.length
    }, 750)

    return () => clearInterval(statusInterval)
  }, [timerState])

  React.useEffect(() => {
    const clientNameHeader = document.getElementById("client-name-header")
    if (clientNameHeader) {
      setTimeout(() => {
        clientNameHeader.textContent = `| Client: ${clientName}`
        clientNameHeader.classList.remove("hidden")
      }, 2000)
    }
  }, [clientName])

  const minutes = Math.floor(timerSeconds / 60)
    .toString()
    .padStart(2, "0")
  const seconds = (timerSeconds % 60).toString().padStart(2, "0")

  // ---------------- LANGUAGE CHANGE -------------------
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let selectedLang = e.target.value
    dispatch(updatePrefLanguage(selectedLang))
    selectedLang = selectedLang.charAt(0).toUpperCase() + selectedLang.slice(1)

    const pyLoad = {
      roomid: qpParams.roomId,
      pref_language: selectedLang
    }

    socket && socket.emit('switch_pref_language_hi', pyLoad)
    console.log("Preferred language updated:", selectedLang)
  }

  // ---------------- FLAG LOGIC -------------------
    const handleFlag = (flagType: string) => {
      console.log("Raising flag:", flagType)
      const pyLoad ={
        roomid: qpParams.roomId,
        topic: navigation,
        report_message: flagType,
        type: "HI",
        agent_name:JSON.parse(localStorage.getItem('agent_name') || '{}')?.agent_name||''
      }
      console.log("Flag payload:", pyLoad)
      socket && socket.emit('save_flags_data', pyLoad)
      setFlagOpen(false)
      alert(`Flag raised: ${flagType}`)
    }

    const [flagOpen, setFlagOpen] = React.useState(false)

  return (
    <>

      {/* HEADER */}
      <header className="bg-white p-3 sm:p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h2 id="page-title" className="text-xl sm:text-2xl font-bold text-slate-800"></h2>
          <p id="client-name-header" className="mt-0.5 sm:mt-1 text-base sm:text-lg text-slate-500 hidden">
            Roshan
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4">

          {/* 🚩 FLAG BUTTON */}
          <button
            onClick={() => setFlagOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold shadow-sm"
          >
            ⚑
          </button>

          {/* VAD Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 p-0.5 sm:p-1 rounded-md sm:rounded-lg">
            {VAD2 !== undefined && !VAD2.loading ? (
              <div>
                {VAD2.listening ? (
                  <button
                    id="pause-btn"
                    className={`p-1.5 sm:p-2 rounded-md hover:bg-slate-200 text-slate-600 ${
                      timerState === "paused" ? "text-sky-600" : ""
                    }`}
                    onClick={() => {
                      setManualVadStatus(false)
                    }}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.75 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25A.75.75 0 005.75 4.5zm8.5 0a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75z"></path>
                    </svg>
                  </button>
                ) : (
                  <button
                    id="start-btn"
                    className={`p-1.5 sm:p-2 rounded-md hover:bg-slate-200 text-slate-600 ${
                      timerState === "running" ? "text-sky-600" : ""
                    }`}
                    onClick={() => {
                      setManualVadStatus(true)
                    }}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-1 sm:p-2 flex justify-center items-center">
                <TailSpin
                  stroke="red"
                  strokeOpacity={1}
                  speed={0.95}
                  style={{ margin: "0.5rem", width: "0.8rem", height: "0.8rem" }}
                />
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="text-base sm:text-lg font-mono font-semibold text-slate-700 bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg">
            {minutes}:{seconds}
          </div>

          {/* Language Selector */}
          <select
            value={qpParams.pref_language}
            onChange={handleLanguageChange}
            className="bg-slate-100 border border-slate-300 text-slate-700 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-200 transition"
          >
            <option value="english">English</option>
            {/* <option value="hindi">Hindi</option>   */}
            <option value="marathi">Marathi</option>
          </select>

          {/* Logout */}
          {/* <a
            onClick={handleLogout}
            style={{ cursor: "pointer" }}
            className="text-blue-600 hover:underline"
          >
            Logout
          </a> */}
          <button
            onClick={handleLogout}
            className="relative group text-red-600 hover:text-red-700"
          >
            <LogOut className="w-5 h-5" />

            {/* Tooltip */}
            <span className="
              absolute left-1/2 -translate-x-1/2 top-full mt-2
              hidden group-hover:block 
              bg-black text-white text-xs px-2 py-1 rounded 
              whitespace-nowrap z-10
            ">
              Logout
            </span>
          </button>
        </div>
      </header>

      {/* ------------------ FLAG POPUP MODAL ------------------ */}
      {flagOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl text-slate-800">
            <h3 className="text-lg font-bold mb-4">Raise a Flag</h3>

            <FlagOptions handleFlag={handleFlag} />

            <button
              onClick={() => setFlagOpen(false)}
              className="mt-4 w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </>
  )
}

// -------------------------------------------------------------
// FLAG OPTIONS COMPONENT (WITH OTHERS FIELD)
// -------------------------------------------------------------
function FlagOptions({ handleFlag }: { handleFlag: (msg: string) => void }) {
  const [showInput, setShowInput] = React.useState(false)
  const [otherText, setOtherText] = React.useState("")

  const options = [
    "System Not Responding",
    "Incorrect Data Captured",
    "Incorrect Q/A",
    "Latency is High",
  ]

  return (
    <div className="space-y-3">

      {options.map((item) => (
        <button
          key={item}
          onClick={() => handleFlag(item)}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-md"
        >
          {item}
        </button>
      ))}

      {/* Others Button */}
      <button
        onClick={() => setShowInput(!showInput)}
        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-md"
      >
        Others
      </button>

      {/* Input section */}
      {showInput && (
        <div className="mt-2 space-y-2">
          <input
            type="text"
            placeholder="Type your issue..."
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />

          <button
            onClick={() => {
              if (!otherText.trim()) {
                alert("Please enter a message")
                return
              }
              handleFlag(otherText.trim())
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-md"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  )
}
