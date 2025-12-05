import type React from "react"
import { useState, createContext, useContext, useEffect } from "react"
import { io, type Socket } from "socket.io-client"
import { useDispatch } from "react-redux"
import { useAppSelector } from "../store/store"
import { 
    updateAlerts,updateBasicInfo,
    addCues,
    updateCues,updateFollowUpQn,initSalesState,
    updatePlanSummary,updateRecommendation, updateHeathProfile,
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


import {config as AppConfig, config} from '../configuration.js'


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
  const [pref_language,setPref_language]=useState("")
  const navigation = useAppSelector((state) => state.healthManagmentReducer.navigation)
  const {roomId,candid,name} = useAppSelector((state) => state.qpReducer);
  const healthManageMentState = useAppSelector((state) => state.healthManagmentReducer);
  const [recommendationsGenerated,setRecommendationsGenerated] = useState(false)
  const [lms_data,setLms_data]=useState<any>();
  const [circularProgress,setCircularProgress]=useState<boolean>(false);
  const agentId = 'anuj'
  //console.log("sales state", navigation)

  function updateSalesState(data:any) {
    console.log("handle incoming data", data, " the data type", data.type)
    switch (data.type) {
      case "basic-info":
        console.log(data,"int the basic section info");
        dispatch(updateBasicInfo(data.basicInfo))
        break
      case "plan-summary":
        console.log('plan summary data aaya',data)
        dispatch(updatePlanSummary(data.data))
        break
      case "health-profile":
        console.log('health profile data aaya',data.HealthProfile)
        dispatch(updateHeathProfile(data.HealthProfile))
        break
      case "recommendations":
        console.log('---recommendation---- ----data---',data)
        dispatch(updateRecommendation(data.Recommendations))
        break
      // case "follow-up-qn":
      //   dispatch(updateFollowUpQn(data.followUpQn))
      //   break
      case "add-cues":
        console.log("add cues", data);
        dispatch(addCues(data))
        const obj = {
          header: data.header, 
          // type: data.type,  
          data: data.data.map((item, index) => ({
            id: `unique${index + 1}`,
            text: `${item.text}`   
          })),
          card_id:data.card_id,
        };
        
        if(data.header!=='Follow-up Question')
        {
        // console.log(obj,"updated obj for cues");
        // dispatch(updateCues(obj))
        }
        else
        {
        dispatch(updateFollowUpQn(obj))
        }
        break
      case "update-cues":
         const obj2 = {
          header: data.header, 
          // type: data.type,  
          data: data.data.map((item, index) => ({
            id: `unique${index + 1}`,
            text: `${item.text}`   
          })),
          card_id:data.card_id,
        };
        console.log("update cues", data);
        dispatch(updateCues(obj2))
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
    console.log("health state",healthManageMentState)
  },[])


  function updateNotifications(data){
   // {"status": "completed", "msg": "Product Recommendation ready"}
      console.log('update notifications',data)
      if(data.status ==='completed')
        setRecommendationsGenerated(true)
      else
        setRecommendationsGenerated(false)
  }

 useEffect(() => {

  const socketUrl =AppConfig.wsUrl

  //const socketUrl = 'https://b18e4904236b.ngrok-free.app'
  // 500ms delay before connecting
  
  //const timer = setTimeout(() => {
  
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
    tempSocket.on('notifications',updateNotifications)
    setSocket(tempSocket)
    return () => {
      //timer && clearTimeout(timer)
      if (tempSocket) {
        tempSocket.off("connect1", connected)
        tempSocket.off("disconnect1", disconnect)
        tempSocket.off("questions_loader_res", initialisationSalesState)
        tempSocket.off("ai_suggestion_res", updateSalesState)
        tempSocket.disconnect()
      }
    }

  //}, 500) 

}, [])

 

useEffect(() => {
    if (!socket) {
      return
    }
    if(navigation==='Plan Summary')return;
    const data = {
      roomid: roomId,
      jobid: "abcde",
      agentid: '',
      
      name: name,
      selected_topic: navigation,
      agent_name:JSON.parse(localStorage.getItem('agent_name') || '{}')?.agent_name || ''
    }
    console.log("it happened",navigation,data);
    socket.emit("selected_topic_req_health_ins", data)
}, [socket,navigation])





  

  const values = {
    socket,
    setSocket,isSocketConnected,
    //socketConnected: socketConnected && socketReady,
    //ngrokServerUrl: "http://localhost:5000",
    setMsgLoading: (loading: boolean) => console.log("Loading:", loading),

    oneWayUrl: 'http://localhost:5000', 

  
    updateNotifications,
    recommendationsGenerated,setRecommendationsGenerated,
    pref_language,setPref_language,agentId,lms_data,circularProgress,setLms_data,setCircularProgress
  }
  return <Context.Provider value={values}>{children}</Context.Provider>
}
