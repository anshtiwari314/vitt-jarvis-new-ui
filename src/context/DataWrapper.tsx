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
  const [isSocketConnected,setIsSocketConnected] = useState(false)

  const navigation = useAppSelector((state) => state.salesCopilotReducer.navigation)
  const {roomId,candid,name} = useAppSelector((state) => state.qpReducer);

  //console.log("sales state", navigation)

  function updateSalesState(data:any) {
    //console.log("handle incoming data", data, " the data type", data.type)
    switch (data.type) {
      case "basic-info":
        console.log(data,"int the basic section info");
        dispatch(updateBasicInfo(data.basicInfo))
        break
      case "assets":
        console.log('receiving assets data',data)
        dispatch(updateAssets(data.assets))
        break
      case "liabilities":
        console.log('liabilities',data)
        dispatch(updateLiabilities(data.liabilities))
        break
      case "financial-goals":
        dispatch(updateFinancialGoals(data.financialGoals))
        break
      case "plan-summary":
        dispatch(updatePlanSummary(data.planSummary))
        break
      case "recommendations":
        console.log('recommendation data',data)
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
    console.log('init sales data',data)
    dispatch(initSalesState(data))
  }

    useEffect(()=>{
        //const socketUrl = 'http://localhost:5000'
        //const socketUrl = 'https://0e8d-2401-4900-882f-a188-7561-8415-780c-dcdf.ngrok-free.app'
        const socketUrl = 'wss://recruito.vitti.insure'

        const tempSocket = io(socketUrl)

        //console.log('Socket has been created',tempSocket)


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

        tempSocket.on('questions_loader_res',initialisationSalesState)
        tempSocket.on('ai_suggestion_res',updateSalesState)

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
    if (!socket) {
      return
    }

    const data = {
      roomid: roomId,
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
    oneWayUrl: "http://localhost:5000", 
  }
  return <Context.Provider value={values}>{children}</Context.Provider>
}
