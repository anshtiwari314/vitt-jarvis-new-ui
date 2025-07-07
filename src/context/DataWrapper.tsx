import type React from "react"
import { useState, createContext, useContext, useEffect } from "react"
import { io, type Socket } from "socket.io-client"
import {
  initSalesState,
  updateBasicInfo,
  updateAssets,
  updateLiabilities,
  updateFinancialGoals,
  updatePlanSummary,
  updateRecommendations,
  updateFollowUpQn,
  updateCues,
  updateAlerts,
} from "../reducers/salesCopilotReducer"
import { useDispatch } from "react-redux"
import { useAppSelector } from "../store/store"

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
  const navigation = useAppSelector((state) => state.salesCopilotReducer.navigation)
  const [socketConnected, setSocketConnected] = useState(false)
  const [socketReady, setSocketReady] = useState(false) 

  console.log("sales state", navigation)

  function updateSalesState(data:any) {
    console.log("handle incoming data", data, " the data type", data.type)
    switch (data.type) {
      case "basic-info":
        console.log(data,"int the basic section info");
        dispatch(updateBasicInfo(data.basicInfo))
        break
      case "assets":
        dispatch(updateAssets(data.assets))
        break
      case "liabilities":
        dispatch(updateLiabilities(data.liabilities))
        break
      case "financial-goals":
        dispatch(updateFinancialGoals(data.financialGoals))
        break
      case "plan-summary":
        dispatch(updatePlanSummary(data.planSummary))
        break
      case "recommendations":
        dispatch(updateRecommendations(data.recommendations))
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
    dispatch(initSalesState(data))
  }

    useEffect(()=>{
        const socketUrl = 'http://localhost:3001'

        const tempSocket = io(socketUrl)

        console.log('Socket has been created',tempSocket)


        function connected() {
           // console.log("Socket is connected",tempSocket?.id);
            tempSocket.emit("connected",tempSocket.id);
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

        tempSocket.on('init-state',initialisationSalesState)
        tempSocket.on('update-state',updateSalesState)

    setSocket(tempSocket)

    return () => {
      tempSocket.off("connect", connected)
      tempSocket.off("disconnect", disconnect)
      tempSocket.off("questions_loader_res", initialisationSalesState)
      tempSocket.off("ai_suggestion_res", updateSalesState)
      tempSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!socket || !socketConnected) {
      return
    }

    const data = {
      roomid: "12344",
      jobid: "abcde",
      agentid: "1234",
      name: "varun bayya",
      selected_topic: navigation,
    }

    socket.emit("selected_topic_req_v2", data)
  }, [navigation,socket])

  const values = {
    socket,
    setSocket,isSocketConnected,
    socketConnected: socketConnected && socketReady,
    ngrokServerUrl: "http://localhost:5000",
    setMsgLoading: (loading: boolean) => console.log("Loading:", loading),
    oneWayUrl: "http://localhost:5000", 
  }
  return <Context.Provider value={values}>{children}</Context.Provider>
}
