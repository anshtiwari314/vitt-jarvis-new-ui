import React, { useEffect } from "react"
import { useAppSelector } from "../../store/store"
import { useVad } from "../../context/VadWrapper"
import { TailSpin } from "react-loading-icons"
import { useDispatch } from "react-redux"
import { useAuth } from "../../context/AuthContext"
// import { setPageTitle } from "../../store/actions"

export default function Header() {
  const currentNavigation = useAppSelector((state) => state.healthManagmentReducer.navigation)
  //@ts-ignore
  const { manualVadStatus, setManualVadStatus, VAD2 } = useVad()
  const clientName = useAppSelector((state) => state.healthManagmentReducer.clientName)
  //console.log("client name in header", clientName)

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
  // Timer state and functions (moved from index2.html)
  const [timerSeconds, setTimerSeconds] = React.useState(0)
  const [timerState, setTimerState] = React.useState<"stopped" | "running" | "paused">("stopped")
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
    // Cleanup interval on component unmount
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [])

  // Auto-start timer when the component mounts (app starts)
  React.useEffect(() => {
    handleTimerControls("start")
  }, [])

  // Simulate status (moved from index2.html)
  React.useEffect(() => {
    const statuses = ["audio", "transcription", "processing"]
    let currentStatusIndex = 0
    const statusInterval = setInterval(() => {
      if (timerState !== "running") {
        statuses.forEach((s) => {
          const el = document.getElementById(`status-${s}`)
          if (el && el.querySelector(".status-indicator")) {
            el.querySelector(".status-indicator")?.classList.remove("bg-green-500")
            el.querySelector(".status-indicator")?.classList.add("bg-gray-300")
            el.classList.add("text-slate-500")
            el.classList.remove("text-slate-700", "font-medium")
          }
        })
        return
      }

      const statusId = statuses[currentStatusIndex]
      const statusElement = document.getElementById(`status-${statusId}`)

      if (statusElement) {
        const indicator = statusElement.querySelector(".status-indicator")
        indicator?.classList.add("bg-green-500")
        statusElement.classList.add("text-slate-700", "font-medium")
      }

      currentStatusIndex = currentStatusIndex + 1

      if (currentStatusIndex >= statuses.length) {
        currentStatusIndex = 0
        setTimeout(() => {
          if (timerState === "running") {
            // Re-check state before resetting
            statuses.forEach((s) => {
              const el = document.getElementById(`status-${s}`)
              if (el && el.querySelector(".status-indicator")) {
                el.querySelector(".status-indicator")?.classList.remove("bg-green-500")
                el.querySelector(".status-indicator")?.classList.add("bg-gray-300")
                el.classList.remove("text-slate-700", "font-medium")
                el.classList.add("text-slate-500")
              }
            })
          }
        }, 500)
      }
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

  useEffect(() => {
    console.log("manual vad status", manualVadStatus)
  }, [manualVadStatus])

//   useEffect(() => {
//     dispatch(setPageTitle(pageDetails[currentNavigation] || "Dashboard"))
//   }, [currentNavigation, dispatch])

  return (
    <header className="bg-white p-3 sm:p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
    <div>
        {/* Adjusted font size for mobile (text-xl) and restored for larger screens (sm:text-2xl) */}
        <h2 id="page-title" className="text-xl sm:text-2xl font-bold text-slate-800"></h2>
        {/* Adjusted font size for mobile (text-base) */}
        <p id="client-name-header" className="mt-0.5 sm:mt-1 text-base sm:text-lg text-slate-500 hidden">
            Roshan
        </p>
    </div>
    <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4">
        {/* VAD/Pause Button Group */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 p-0.5 sm:p-1 rounded-md sm:rounded-lg">
            {VAD2 !== undefined && !VAD2.loading ? (
                <div>
                    {VAD2.listening ? (
                        <button
                            id="pause-btn"
                            // Reduced padding and size on mobile (p-1.5)
                            className={`p-1.5 sm:p-2 rounded-md hover:bg-slate-200 text-slate-600 ${timerState === "paused" ? "text-sky-600" : ""}`}
                            onClick={() => {
                                setManualVadStatus(false)
                            }}
                        >
                            {/* Reduced SVG size on mobile (w-5 h-5) */}
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5.75 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25A.75.75 0 005.75 4.5zm8.5 0a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75z"></path>
                            </svg>
                        </button>
                    ) : (
                        <button
                            id="start-btn"
                            // Reduced padding and size on mobile (p-1.5)
                            className={`p-1.5 sm:p-2 rounded-md hover:bg-slate-200 text-slate-600 ${timerState === "running" ? "text-sky-600" : ""}`}
                            onClick={() => {
                                setManualVadStatus(true)
                            }}
                        >
                            {/* Reduced SVG size on mobile (w-5 h-5) */}
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
                            </svg>
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} className="p-1 sm:p-2">
                    <TailSpin
                        // Reduced size for mobile view
                        stroke="red"
                        strokeOpacity={1}
                        speed={0.95}
                        style={{ margin: "0.5rem", width: "0.8rem", height: "0.8rem" }}
                    />
                </div>
            )}
        </div>
        {/* Timer */}
        <div id="timer" 
             // Reduced font size and padding for mobile 
             className="text-base sm:text-lg font-mono font-semibold text-slate-700 bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg">
            {minutes}:{seconds}
        </div>
        {/* Logout */}
        <a onClick={handleLogout} style={{ cursor: "pointer" }} 
           // Reduced font size for mobile
           className="text-blue-600 hover:underline text-sm sm:text-base">
            Logout
        </a>
    </div>
</header>
  )
}
