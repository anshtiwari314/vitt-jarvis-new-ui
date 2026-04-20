import React, { useState,useEffect } from "react";
import { useAppSelector } from "../../store/store";
import { useData } from "../../context/DataWrapper";
import { useDispatch } from "react-redux";
import { updateSalesCopilotState } from "../../reducers/salesCopilotReducer";
import ReactHtmlParser from 'react-html-parser';
import DraggableWindow from "./DraggableWindow";
//import NotificationCard from "./NotificationCard";

const CUE_COLOR_STYLES: Record<string, { card: string; heading: string; body: string }> = {
  blue: {
    card: "bg-blue-50 border border-blue-200",
    heading: "text-blue-800",
    body: "text-blue-700",
  },
  green: {
    card: "bg-green-50 border border-green-200",
    heading: "text-green-800",
    body: "text-green-700",
  },
  orange: {
    card: "bg-orange-50 border border-orange-200",
    heading: "text-orange-800",
    body: "text-orange-700",
  },
};

export default function RightPanel() {
  const [cues] = useAppSelector((state) => [state.salesCopilotReducer.salesData.cues]);

  // State to manage the input values for the new UI element
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const {toggleNotificationModal,setToggleNotificationModal,socket} = useData()
  const {roomId,candid,name} = useAppSelector((state) => state.qpReducer);
  
  const dispatch = useDispatch()
  

  useEffect(()=>{
    console.log('cues in right panel',cues)
  },[cues])

  return (
    <aside className="w-full h-full bg-white lg:border-l lg:border-slate-200 lg:shadow-none lg:px-2" style={{}}>
      
      {/* This is your scrolling container. 
        It has overflow-x-scroll and flex (which defaults to flex-row).
        This is correct.
      */}
      <div style={{}} 
      className={`
      mb-2 flex overflow-x-auto
      sm:flex-row 
      lg:mb-0 lg:h-full lg:flex-col lg:items-stretch lg:overflow-x-hidden lg:overflow-y-scroll lg:px-5` } >
      {cues?.cards?.map((card, index) => {

        const colorClass = (card?.color || "blue").toLowerCase();
        const colorStyles = CUE_COLOR_STYLES[colorClass] ?? CUE_COLOR_STYLES.blue;

        if(card.card_type === 'notification_card')
          // The NotificationCard component itself needs to handle its own sizing
          return <NotificationCard key={card.id} card={card} />
         
        return (
          <div 
            key={index} 
            className={`
              ${colorStyles.card} p-4 rounded-lg m-2 shadow-sm 
              max-w-80 max-h-32 flex-shrink-0 overflow-y-scroll
              sm:max-w-80
              lg:min-w-0 lg:w-full lg:max-w-full lg:h-fit lg:max-h-max lg:overflow-y-visible lg:mx-0
               
            `} 
            style={{}}
          >
            <h4 className={`font-semibold ${colorStyles.heading} flex items-center mb-2`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
              {card?.header}
            </h4>
            <ul className={`list-disc list-inside space-y-1 ${colorStyles.body} text-sm`}>
              {card.data?.map((item, subIndex) => (
                <li key={subIndex}>{ReactHtmlParser(item?.text ?? "")}</li>
              ))}
            </ul>
          </div>
        );
      })}
      </div>

    </aside>
  );
}


function NotificationCard({card}){

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
      max-w-80
      max-h-32
      mx-2
      overflow-y-scroll

      sm:min-w-min
      sm:max-w-64     /* <--- 💡 THE FIX (Part 3): Added sm:min-w to match other cards */
      
      sm:max-h-32  
      
      lg:mx-0
      lg:h-fit       
                 
      lg:max-h-max
      lg:overflow-y-visible
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

// ... NotificationsModal remains the same
