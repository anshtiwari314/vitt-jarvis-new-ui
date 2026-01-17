import React from "react"
import { useAppSelector } from "../../store/store"
import DOMPurify from "dompurify"
const isHtml = (str = "") => /<\/?[a-z][\s\S]*>/i.test(str)
export default function RightPanel(){
    
    const [cues] = useAppSelector(state => [state.healthManagmentReducer.salesData.cues])

    // const salesState = useAppSelector(state => state.salesCopilotReducer)
    // const myAlert = useAppSelector(state => state.salesCopilotReducer.salesData.alert)
    // const myCues = useAppSelector(state=>state.salesCopilotReducer.salesData.cues)
    // const myFollowUp = useAppSelector(state=>state.salesCopilotReducer.salesData.followUpQn)

    // console.log('right panel state',salesState)
    // console.log('alert',alert,myAlert)
     console.log('cues in right panel',cues)
    // console.log('followUpQn',followUpQn,myFollowUp)

    return (
        <aside className="w-full h-full bg-white lg:border-l lg:border-slate-200 lg:shadow-none lg:px-2" style={{border:'none'}}>
      {/* <h3 className="text-lg font-bold text-slate-800 text-right">
        AI Cues
      </h3> */}


      {/* New UI element container for value changes, styled to match the existing cue cards */}
      
      
      
      <div style={{}} 
      className={`
      flex overflow-x-scroll mb-2
      sm:flex-row 
      lg:flex-col lg:items-center  lg:h-full lg:overflow-x-hidden lg:overflow-y-scroll lg:px-5 lg:mb-0` } >
      {cues?.cards?.map((card, index) => {
        const colorClass = card.color || "blue"; // Fallback color   //  
        return (
          <div 
          key={index} 
          className={`bg-${colorClass}-50 border border-${colorClass}-200 p-4 rounded-lg m-2 shadow-sm 
              max-w-80 max-h-32 flex-shrink-0 overflow-y-scroll
              sm:max-w-80
              lg:overflow-y-visible lg:min-w-64 lg:w-full lg:max-w-full lg:h-fit lg:max-h-max lg:mx-8`} style={{}}>
            <h4 className={`font-semibold text-${colorClass}-800 flex items-center mb-2`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
              {card?.header}
            </h4>
            <ul className={`list-disc list-inside space-y-1 text-${colorClass}-700 text-sm`}>
              {card.data?.map((item, subIndex) => (
               (
                                         <li key={index}>
                    {isHtml(item.text) ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(item.text),
                        }}
                      />
                    ) : (
                      item.text
                    )}
                  </li>
                                        )
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
    )
}



export function RightPanelOld(){
    
    const [alert,cues,followUpQn] = useAppSelector(state => [state.healthManagmentReducer.salesData.alert,state.healthManagmentReducer.salesData.cues,state.healthManagmentReducer.salesData.followUpQn])

    // const salesState = useAppSelector(state => state.salesCopilotReducer)
    // const myAlert = useAppSelector(state => state.salesCopilotReducer.salesData.alert)
    // const myCues = useAppSelector(state=>state.salesCopilotReducer.salesData.cues)
    // const myFollowUp = useAppSelector(state=>state.salesCopilotReducer.salesData.followUpQn)

    // console.log('right panel state',salesState)
    // console.log('alert',alert,myAlert)
    // console.log('cues',cues,myCues)
    // console.log('followUpQn',followUpQn,myFollowUp)

    return (
        <aside className="w-96 bg-white border-l border-slate-200 flex flex-col p-4 space-y-4 overflow-y-auto">
                        <h3 className="text-lg font-bold text-slate-800 text-right">AI Cues</h3>
                        {/* <!-- Cue Type 1: Follow-up Question --> */}
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-800 flex items-center mb-2">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {followUpQn?.header}
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                                {
                                    followUpQn?.data?.map((item,index)=>{
                                        return <li key={index}>{item.text}</li>
                                    })
                                }
                                {/* <li>Primary financial goals?</li>
                                <li>Typical month financially?</li> */}
                            </ul>
                        </div>
                        {/* <!-- Cue Type 2: Answer to Query --> */}
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-800 flex items-center mb-2">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                                {cues?.header}
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                                {
                                    cues?.data?.map((item,index)=>{
                                        return (
                                         <li key={index}>
                    {isHtml(item.text) ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(item.text),
                        }}
                      />
                    ) : (
                      item.text
                    )}
                  </li>
                                        )
                                    })
                                }
                                {/* <li>Financial safety net.</li>
                                <li>Covers loans, secures family's future.</li>
                                <li>Most affordable, high-cover option.</li> */}
                            </ul>
                        </div>
                        {/* <!-- Cue Type 3: Compliance Alert --> */}
                        <div className="bg-amber-50 border border-amber-300 p-4 rounded-lg">
                            <h4 className="font-semibold text-amber-800 flex items-center mb-2">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                {alert?.header}
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-amber-700 text-sm">
                                {
                                    alert?.data?.map((item,index)=>{
                                        return <li key={index}>{item.text}</li>
                                    })
                                }
                                {/* <li>Disclose commission structures if asked.</li>
                                <li>Avoid guaranteeing returns.</li> */}
                            </ul>
                        </div>
                    </aside>
    )
}