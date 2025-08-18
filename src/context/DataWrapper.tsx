import type React from "react"
import { useState, createContext, useContext, useEffect } from "react"
import { io, type Socket } from "socket.io-client"
import { useDispatch } from "react-redux"
import { useAppSelector } from "../store/store"
import { 
    updateAlerts,updateBasicInfo,
    updateCues,updateFollowUpQn,initSalesState,
    updatePlanSummary,updateRecommendation, updateHeathProfile
    }from 
    "../reducers/healthManagmentReducer"

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

  const navigation = useAppSelector((state) => state.healthManagmentReducer.navigation)
  const {roomId,candid,name} = useAppSelector((state) => state.qpReducer);

  //console.log("sales state", navigation)

  function updateSalesState(data:any) {
    console.log("handle incoming data", data, " the data type", data.type)
    switch (data.type) {
      case "basic-info":
        console.log(data,"int the basic section info");
        dispatch(updateBasicInfo(data.basicInfo))
        break
      case "plan-summary":
        dispatch(updatePlanSummary(data.planSummary))
        break
      case "health-profile":
        console.log('health profile data aaya',data.HealthProfile)
        dispatch(updateHeathProfile(data.HealthProfile))
        break
      case "recommendations":
        console.log('---recommendation---- ----data---',data)
        dispatch(updateRecommendation(data.recommendations))
        break
      case "follow-up-qn":
        dispatch(updateFollowUpQn(data.followUpQn))
        break
      case "cues":
        dispatch(updateCues(data.cues))
        break
      case "alert":
        dispatch(updateAlerts(data.alert))
        break
      default:
        console.warn(`Unhandled action type: ${data.type}`)
    }
  }

  function initialisationSalesState(data: any) {
    console.log('init sales data',data)
    dispatch(initSalesState(data))
  }


 useEffect(() => {
  const socketUrl = 'http://localhost:8000'

  // 500ms delay before connecting
  const timer = setTimeout(() => {
    const tempSocket = io(socketUrl)

    function connected() {
      tempSocket.emit("connected", tempSocket.id);
      setIsSocketConnected(true)
    }

    function disconnect() {
      console.log("Socket disconnected");
      setIsSocketConnected(false)
    }

    tempSocket.on("connect1", connected)  
    tempSocket.on("disconnect1", disconnect)

    tempSocket.on('questions_loader_res', initialisationSalesState)
    tempSocket.on('ai_suggestion_res', updateSalesState)

    setSocket(tempSocket)
    return () => {
      clearTimeout(timer)
      if (socket) {
        socket.off("connect1", connected)
        socket.off("disconnect1", disconnect)
        socket.off("questions_loader_res", initialisationSalesState)
        socket.off("ai_suggestion_res", updateSalesState)
        socket.disconnect()
      }
    }
  }, 500) 

}, [])

 

  useEffect(() => {
    if (!socket) {
      return
    }

    const data = {
      roomid: "17-aug-2025",
      jobid: "abcde",
      agentid: "1234",
      name: name,
      selected_topic: navigation,
    }

    socket.emit("selected_topic_req_v2", data)
  }, [navigation,socket])

  const values = {
    socket,
    setSocket,isSocketConnected,
    //socketConnected: socketConnected && socketReady,
    //ngrokServerUrl: "http://localhost:5000",
    setMsgLoading: (loading: boolean) => console.log("Loading:", loading),
    oneWayUrl: "http://localhost:8000", 
  }
  return <Context.Provider value={values}>{children}</Context.Provider>
}
