import type React from "react"
import { useEffect, useState } from "react"
import { useAppSelector } from "../../store/store"
import { useVad } from "../../context/VadWrapper"
import { TailSpin } from "react-loading-icons"
import { useDispatch } from "react-redux"
import { X } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataWrapper"
import { updatePrefLanguage } from "../../reducers/queryparamReducer"
import { LogOut } from "lucide-react"
import playSound from "../../assets/sound-play.gif"
import { updatePref_language } from "../../reducers/healthManagmentReducer"

export default function Header() {
  const { socket, setCircularProgress}=useData()
  const navigation = useAppSelector((state) => state.healthManagmentReducer.navigation)
  const pref_language = useAppSelector((state) => state.healthManagmentReducer.pref_language)
  const allLanguageOptions = useAppSelector((state) => state.healthManagmentReducer.language_ids)
  console.log("preferred language in header",pref_language,allLanguageOptions)

  // @ts-ignore
  const { manualVadStatus, setManualVadStatus, VAD2 } = useVad()

  const [clientName, qpParams] = useAppSelector((state) => [state.healthManagmentReducer.clientName, state.qpReducer])

  const { setCurrentUser }: any = useAuth()
  const dispatch = useDispatch()

  function handleLogout() {
    localStorage.removeItem("insurance-auth")
    setCurrentUser(null)
  }

  // ---------------- TIMER LOGIC -------------------
  const [timerSeconds, setTimerSeconds] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (VAD2 && VAD2.listening) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [VAD2])

  const minutes = Math.floor(timerSeconds / 60)
    .toString()
    .padStart(2, "0")
  const seconds = (timerSeconds % 60).toString().padStart(2, "0")

  // ---------------- CLIENT NAME VISIBILITY -------------------
  useEffect(() => {
    const clientNameHeader = document.getElementById("client-name-header")
    if (clientNameHeader) {
      setTimeout(() => {
        clientNameHeader.textContent = `| Client: ${clientName}`
        clientNameHeader.classList.remove("hidden")
      }, 2000)
    }
  }, [clientName])

  // ---------------- LANGUAGE CHANGE -------------------
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let selectedLang = e.target.value
    dispatch(updatePref_language(selectedLang))
    selectedLang = selectedLang.charAt(0).toUpperCase() + selectedLang.slice(1)

    setCircularProgress(true)
    setTimeout(() => {
      setCircularProgress(false)
    }, 4000)

    const pyLoad = {
      roomid: qpParams.roomId,
      pref_language: selectedLang,
    }
    socket && socket.emit("switch_pref_language_hi", pyLoad)
  }

  // ---------------- FLAG LOGIC -------------------
  const [flagOpen, setFlagOpen] = useState(false)
  const handleFlag = (flagType: string) => {
    const pyLoad = {
      roomid: qpParams.roomId,
      topic: navigation,
      report_message: flagType,
      type: "HI",
      agent_name: JSON.parse(localStorage.getItem("agent_name") || "{}")?.agent_name || "",
    }
    socket && socket.emit("save_flags_data", pyLoad)
    setFlagOpen(false)
    alert(`Flag raised: ${flagType}`)
  }

  return (
    <>
      {/* PARENT HEADER:
        - flex flex-wrap: Allows items to wrap naturally when space runs out.
        - justify-between: Pushes Div1 to left and Div2 to right.
        - items-center: Vertically centers everything.
        - gap-y-3: Adds vertical spacing only when the items wrap to a new line.
      */}
      <header className="bg-white p-4 border-b border-slate-200 flex flex-wrap justify-between items-center sticky top-0 z-10 gap-y-3">
        {/* --- DIV 1: Name & Visualizer --- */}
        <div className="flex items-center gap-3">
          <div>
            <h2 id="page-title" className="text-2xl font-bold text-slate-800"></h2>
            <p id="client-name-header" className="text-lg text-slate-500 hidden">
              Roshan
            </p>
          </div>

          {/* Audio Visualizer: w-16 on mobile, w-32 on desktop */}
          <div className="w-16 h-8">
            {VAD2?.userSpeaking && (
              <img src={playSound || "/placeholder.svg"} alt="User Speaking" className="w-16 h-8 object-contain" />
            )}
          </div>
        </div>

        {/* --- DIV 2: Control Icons --- */}
        {/* - ml-auto:Pushes this group to the right. 
           - If it wraps,it_will_drop_to_the_next_line_but_keep_aligned.
        */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
          {/* Flag Button */}
          <button
            onClick={() => setFlagOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold shadow-sm text-base flex-shrink-0"
          >
            ⚑
          </button>

          {/* VAD Play/Pause */}
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
              className="bg-slate-100 border border-slate-300 text-slate-700 text-base rounded-lg px-2 py-2 cursor-pointer hover:bg-slate-200 transition outline-none"
            >
              {allLanguageOptions?.map((lang: string) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>

          {/* Logout */}
          <button onClick={handleLogout} className="relative group text-red-600 hover:text-red-700 p-1 flex-shrink-0">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ------------------ FLAG POPUP MODAL ------------------ */}
     {flagOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="relative bg-white rounded-xl p-6 w-full max-w-sm shadow-xl text-slate-800">
            
            {/* Close Icon */}
            <button
              onClick={() => setFlagOpen(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 transition"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold mb-4">Raise a Flag</h3>
            <FlagOptions handleFlag={handleFlag} />
          </div>
        </div>
      )}
    </>
  )
}

function FlagOptions({ handleFlag }: { handleFlag: (msg: string) => void }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [inputText, setInputText] = useState("")

  const options = ["System Not Responding", "Incorrect Data Captured", "Incorrect Q/A", "Latency is High", "Others"]

  const handleOptionClick = (option: string) => {
    setSelectedOption(option)
    setInputText("")
  }

  const handleSubmit = () => {
    if (!inputText.trim()) return
    const flagMessage = selectedOption === "Others" ? inputText.trim() : `${selectedOption}: ${inputText.trim()}`
    handleFlag(flagMessage)
  }

  if (selectedOption) {
    return (
      <div className="space-y-3">
        <div className="bg-slate-100 px-3 py-2 rounded-md">
          <p className="text-sm text-slate-600 font-medium">{selectedOption}</p>
        </div>
        <textarea
          placeholder="Add your comment here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400 text-base resize-none min-h-[120px]"
          rows={5}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedOption(null)}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-3 rounded-md text-base"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-md text-base"
          >
            Submit
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {options.map((item) => (
        <button
          key={item}
          onClick={() => handleOptionClick(item)}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-md text-base"
        >
          {item}
        </button>
      ))}
    </div>
  )
}
