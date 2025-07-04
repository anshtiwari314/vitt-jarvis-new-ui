import React, { useState,createContext, useContext, useEffect, useRef } from 'react'
import {connect, io,Socket} from 'socket.io-client';
import { initSalesState ,updateBasicInfo,updateAssets,
    updateLiabilities,updateFinancialGoals,
    updatePlanSummary,updateRecommendations,
    updateFollowUpQn,updateCues,updateAlerts

 } from '../reducers/salesCopilotReducer';
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/store/store";

const Context = createContext('')

export function useData(){
    return useContext(Context)
}
 
export default function DataWrapper({children}:{children:React.ReactNode}) {

    const dispatch = useDispatch();
    console.log("aaya")

    const [socket,setSocket] = useState<any>(null)
    // const useAppSelector((state) => state.nvReducer);

    function updateSalesState(data:{type:string;payload:any}){
        console.log('handle incoming data',data," the data type",data.type);
         switch (data.type) {
            case 'basic-info':
                dispatch(updateBasicInfo(data.payload))
                break
            case 'assets':
                dispatch(updateAssets(data.payload))
                break
            case 'liabilities':
                dispatch(updateLiabilities(data.payload))
                break
            case 'financial-goals':
                dispatch(updateFinancialGoals(data.payload))
                break
            case 'plan-summary':
                dispatch(updatePlanSummary(data.payload))
                break
            case 'recommendations':
                dispatch(updateRecommendations(data.payload))
                break
            case 'follow-up-qn':
                dispatch(updateFollowUpQn(data.payload))
                break
            case 'cues':
                dispatch(updateCues(data.payload))
                break
            case 'alert':
                dispatch(updateAlerts(data.payload))
                break
            default:
                console.warn(`⚠️ Unhandled action type: ${data.type}`)
            }
    }

    function initialisationSalesState(data){
        dispatch(initSalesState(data));
    }

    useEffect(()=>{
        const socketUrl = 'http://localhost:3001'

        const tempSocket = io(socketUrl)

        console.log('Socket has been created',tempSocket)


        function connected() {
            console.log("Socket is connected",tempSocket?.id);
            tempSocket.emit("connected",tempSocket.id);
            //   if (firstTimeConnectRef.current === true) {
            //     console.log("socket 1st connect triggered");
            //   } else {
            //     console.log("socket 2nd connect triggered");
            //     socket.emit("join-room", roomId, myId);
            //   }
        }

        function disconnect() {
        console.log("Socket disconnected");
        }

        tempSocket.on("connect", connected);
        tempSocket.on("disconnect", disconnect);

        tempSocket.on('init-state',initialisationSalesState)
        tempSocket.on('update-state',updateSalesState)

        setSocket(tempSocket)
        return ()=>{
            tempSocket.off('connect',connected)
            tempSocket.off("disconnect", disconnect);
            tempSocket.off('init-state',initSalesState);
            tempSocket.off('update-state',updateSalesState)
        }
    },[dispatch])

    let values = {
       socket,setSocket
    }
    return (
        //@ts-ignore
        <Context.Provider value={values}>
            {children}
        </Context.Provider>
    )
}