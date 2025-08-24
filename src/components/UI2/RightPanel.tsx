import React, { useState } from "react";
import { useAppSelector } from "../../store/store";
import { useData } from "../../context/DataWrapper";
import { useDispatch } from "react-redux";
import { updateSalesCopilotState } from "../../reducers/salesCopilotReducer";
import ReactHtmlParser from 'react-html-parser';
import DraggableWindow from "./DraggableWindow";

export default function RightPanel() {
  const [cues] = useAppSelector((state) => [state.salesCopilotReducer.salesData.cues]);

  // State to manage the input values for the new UI element
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const {toggleNotificationModal,setToggleNotificationModal,socket} = useData()
  const {roomId,candid,name} = useAppSelector((state) => state.qpReducer);
  
  const dispatch = useDispatch()

  // Handler functions for the new buttons
  // const handleAccept = () => {
  //   console.log("Accepted changes:", { oldValue, newValue });
  //   // Add logic here to handle the accept action, e.g., update state or make an API call
  // };

  // const handleReject = () => {
  //   console.log("Rejected changes:", { oldValue, newValue });
  //   // Add logic here to handle the reject action
  // };


  //console.log("cues", cues);
  

  return (
    <aside className="w-96 bg-white border-l border-slate-200 flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* <h3 className="text-lg font-bold text-slate-800 text-right">
        AI Cues
      </h3> */}

      
      
      


      {/* New UI element container for value changes, styled to match the existing cue cards */}
      
      
      
      <div style={{height:'100%',overflowY:'scroll'}}>
      {cues?.cards?.map((card, index) => {

        const colorClass = card.color || "blue";

        if(card.card_type === 'notification_card')
          return <NotificationCard key={index} card={card} />
         // Fallback color
        return (
          <div key={index} className={`bg-${colorClass}-50 border border-${colorClass}-200 p-4 rounded-lg my-2`}>
            <h4 className={`font-semibold text-${colorClass}-800 flex items-center mb-2`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
              {card?.header}
            </h4>
            <ul className={`list-disc list-inside space-y-1 text-${colorClass}-700 text-sm`}>
              {card.data?.map((item, subIndex) => (
                <li key={subIndex}>{item.text}</li>
              ))}
            </ul>
          </div>
        );
      })}
      </div>


      {/* {
        toggleNotificationModal.visibility && 
        <DraggableWindow title="Suggested Change" isOpen={true}>
          <NotificationsModal />
        </DraggableWindow>
        
      } */}
    </aside>
  );
}


function NotificationCard({card}){

  const [selectedOption,setSelectedOption] = useState(null)

  const {toggleNotificationModal,setToggleNotificationModal,socket} = useData()

  const {roomId,candid,name} = useAppSelector((state) => state.qpReducer);
  
  const dispatch = useDispatch()

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
    console.log("notification-card",data)
    //setToggleNotificationModal(p=>{return {...p,visibility:false}})
    dispatch(updateSalesCopilotState(updated_json))
  }

  return (
    <div className="bg-slate-100 border border-slate-300 p-4 rounded-lg flex flex-col space-y-3 shadow-sm my-2">
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
                              hover:${option.toLowerCase()==='yes'?'bg-blue-700':'bg-red-700'} focus:ring-4 focus:outline-none focus:${option.toLowerCase()==='yes'?'ring-blue-300':'ring-red-300'}
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

function NotificationsModal(){

  const {toggleNotificationModal,setToggleNotificationModal,socket} = useData()

  const {roomId,candid,name} = useAppSelector((state) => state.qpReducer);
  
  const dispatch = useDispatch()

  function handleOption(option){
    let data = {
      selected_option:option,
      rendered_json:option.toLowerCase() ==='yes' ? toggleNotificationModal.new_json_raw : toggleNotificationModal.old_json_raw,  
      roomid: roomId,
      jobid: "abcde",
      agentid: "1234",
      name: name,
    }

    let updated_json = option.toLowerCase() ==='yes' ? toggleNotificationModal.new_json : toggleNotificationModal.old_json
    
    socket.emit('user_feedback_ins_v2',data)
    setToggleNotificationModal(p=>{return {...p,visibility:false}})
    dispatch(updateSalesCopilotState(updated_json))
  }

  return (
    <div className="bg-slate-100 border border-slate-300 p-4 rounded-lg flex flex-col space-y-3 shadow-sm">
        {/* <h4 className="font-semibold text-slate-700 flex items-center">
          <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
          </svg>
          Suggested Change
        </h4> */}
        <div className="flex flex-col space-y-2">
          {/* Input field for old value */}
          {/* <input
            type="text"
            placeholder="Old Value"
            value={oldValue}
            onChange={(e) => setOldValue(e.target.value)}
            className="w-full p-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition duration-150 ease-in-out"
          />
          {/* Input field for new value 
          <input
            type="text"
            placeholder="New Value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-full p-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition duration-150 ease-in-out"
          /> */}
          <p>{ReactHtmlParser(toggleNotificationModal.text)}</p>
        </div>
        {/* Buttons for Accept and Reject */}
        <div className="flex justify-end space-x-2 mt-4">
          {/* <button
            onClick={handleReject}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-transparent border border-slate-300 rounded-md hover:bg-slate-200 transition duration-150 ease-in-out"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-md shadow-sm hover:bg-indigo-600 transition duration-150 ease-in-out"
          >
            Accept
          </button> */}
          {
            toggleNotificationModal.options.map((option,idx)=>{
             
              return(
                    <button
                    key={idx}
                    onClick={() => handleOption(option)}
                    className={`px-5 py-2.5 text-sm font-medium text-white ${option.toLowerCase()==='yes' ? 'bg-blue-800':'bg-red-500'} rounded-lg
                              hover:${option.toLowerCase()==='yes'?'bg-blue-700':'bg-red-700'} focus:ring-4 focus:outline-none focus:${option.toLowerCase()==='yes'?'ring-blue-300':'ring-red-300'}
                              shadow-md hover:shadow-lg transition-all duration-200 ease-in-out
                              transform hover:scale-105 active:scale-100`}
                >
                    {option}
                </button>
              )
            })

          }
        </div>
      </div>
  )
}