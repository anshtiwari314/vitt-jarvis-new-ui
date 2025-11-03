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
  addCues
} from "../reducers/salesCopilotReducer"
import { useDispatch } from "react-redux"
import { useAppSelector } from "../store/store"
import {config as AppConfig} from '../configuration.js'
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
const [pref_language,setPref_language]=useState("English")
  const navigation = useAppSelector((state) => state.salesCopilotReducer.navigation)
  const {roomId,candid,name} = useAppSelector((state) => state.qpReducer);

  const [recommendationsGenerated,setRecommendationsGenerated] = useState(false)
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
    //console.log("handle incoming data", data, " the data type", data.type)
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
      case "add-cues":
        dispatch(addCues(data))
        break
      case "alert":
        dispatch(updateAlerts(data.alert))
        break
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

  function initialisationSalesState(data: any) {
    console.log('init sales data',data)
    //return null;
    
    dispatch(initSalesState(data))
  }

  
  //console.log('config',config)
  //console.log("hello world")
    useEffect(()=>{
        //const socketUrl = 'http://localhost:5000'
        //const socketUrl = 'https://0be7987cc39f.ngrok-free.app'
        
        const socketUrl = AppConfig.wsUrl

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
        tempSocket.on('notifications',updateNotifications)
        
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


  function updateField(fieldname,fieldvalue){
    console.log('update field',fieldname,fieldvalue)
    let ob = {
      roomid: roomId,
        jobid: 'abcde',
        agentid: '1234',
       
        name: name, 
      manual_transcript : `actually ${fieldname} is ${fieldvalue}`
    }
    socket?.emit('ai_suggestion_req_ins_v2',ob)
  }

  const values = {
    socket,
    setSocket,isSocketConnected,
    //socketConnected: socketConnected && socketReady,
    //ngrokServerUrl: "http://localhost:5000",
    setMsgLoading: (loading: boolean) => console.log("Loading:", loading),
    oneWayUrl: "http://localhost:5000", 
    toggleNotificationModal,setToggleNotificationModal,updateField,
    recommendationsGenerated,setRecommendationsGenerated,
    pref_language,setPref_language
  }
  return <Context.Provider value={values}>{children}</Context.Provider>
}
