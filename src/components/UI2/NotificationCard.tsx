import React, { useState,useEffect } from "react";
import { useAppSelector } from "../../store/store";
import { useData } from "../../context/DataWrapper";
import { useDispatch } from "react-redux";
import { updateSalesCopilotState } from "../../reducers/salesCopilotReducer";
import ReactHtmlParser from 'react-html-parser';

export default function NotificationCard({card}){

  const [selectedOption,setSelectedOption] = useState(null)
  const {toggleNotificationModal,setToggleNotificationModal,socket} = useData()
  const {roomId,candid,name} = useAppSelector((state) => state.qpReducer);
  const dispatch = useDispatch()

  console.log('notification',card)

  function handleOption(option){
    let data = {
      selected_option:option,
      rendered_json:option.toLowerCase() ==='yes' ? card.new_json_raw : card.old_json_raw,  
      roomid: roomId,
      jobid: "abcde",
      agentid: "1234",
      name: name,
    }
    let updated_json = option.toLowerCase() ==='yes' ? card.new_json : card.old_json
    socket.emit('user_feedback_ins_v2',data)
    setSelectedOption(option)
    dispatch(updateSalesCopilotState(updated_json))
  }

  return (
    <div className={`
      bg-slate-100 border border-slate-300 p-4 rounded-lg 
      flex flex-col space-y-3 shadow-sm my-2
      flex-shrink-0    /* <--- 💡 THE FIX (Part 1): Added flex-shrink-0 */
      min-w-64         /* <--- 💡 THE FIX (Part 2): Added min-w to match other cards */
      sm:min-w-96      /* <--- 💡 THE FIX (Part 3): Added sm:min-w to match other cards */
      sm:max-h-32 overflow-y-scroll
      lg:max-h-64
      lg:min-w-64 lg:w-full lg:max-w-full lg:mx-8 /* <--- Added responsive classes for lg screens */
      `}
      
    >
        <h4 className="font-semibold text-slate-700 flex items-center">
          <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
          </svg>
          Suggested Change
        </h4>
        <div className="flex flex-col space-y-2">
          
          <p>{ReactHtmlParser(card.text)}</p>
        </div>
        {/* Buttons for Accept and Reject */}
        <div className="flex justify-end space-x-2 mt-4">
          
          {
            !selectedOption && card.options.map((option,idx)=>{
             
              return(
                    <button
                    key={idx}
                    onClick={() => handleOption(option)}
                    className={`px-5 py-2.5 text-sm font-medium text-white ${option.toLowerCase()==='yes' ? 'bg-blue-800':'bg-red-500'} rounded-lg
                              hover:${option.toLowerCase()==='yes'?'bg-blue-700':'bg-red-700'} focus:ring-1 focus:outline-none focus:${option.toLowerCase()==='yes'?'ring-blue-300':'ring-red-300'}
                              shadow-md hover:shadow-lg transition-all duration-200 ease-in-out
                              transform hover:scale-105 active:scale-100`}
                >
                    {option}
                </button>
              )
            })

          }
          {

            selectedOption && 
            <div className={`px-5 py-2.5 text-sm font-medium text-white ${selectedOption.toLowerCase()==='yes' ? 'bg-blue-800':'bg-red-500'} rounded-lg
                              shadow-md transition-all duration-200 ease-in-out
                              transform scale-100`}
            >
                You selected: {selectedOption}
            </div>
          }
        </div>
      </div>
  )
}