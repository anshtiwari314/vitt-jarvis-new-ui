import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Mic, Square, ChevronDown, FileText,X } from "lucide-react";
import { useDispatch,useSelector } from 'react-redux';
import { setQP } from "../reducers/queryparamReducer";
import Parser from 'html-react-parser'
import { useData } from "../context/DataWrapper";
import { useVad } from "../context/VadWrapper";
import LoadingIcons, { 
  Audio, BallTriangle, Bars, Circles, Grid, Hearts, Oval, 
  Puff, Rings, SpinningCircles, TailSpin, ThreeDots 
} from 'react-loading-icons';
import AppPromoPopup from "../components/AppPromoPopup";

const MobileMeetingApp = () => {


  //@ts-ignore
    const {
      data,
      msgLoading,
      handleQuery,
      
      manualVadRecordingOn,
      setManualVadRecordingOn,
      audioUrl,
      setAudioUrl,
      recordingActive,
      setRecordingActive,
      sessionUid ,ngrokServerUrl,setNgrokServerUrl,audioRef,isFilesLoaded,
      recordingServerUrl,setRecordingServerUrl,toggleChunking,setToggleChunking,
      toggleContinuousChunking,setToggleContinuousChunking,aiState, setAiState,
      askAiStatus,setAskAiStatus
    }:void = useData();
    
    const {manualVadStatus,setManualVadStatus,vadRecordingOn,
      setVadRecordingOn,vadStatus,setVadStatus,vadInstance,VAD2,userSpeaking} = useVad()
  

      const qpParams = useSelector((state: any) => state.qpReducer);
  // --- States ---
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);

  // AI / Chat States
  const [showAiModal, setShowAiModal] = useState(false);
  // const [aiState, setAiState] = useState("idle");
  const [qaHistory, setQaHistory] = useState([]);

  const timerRef = useRef(null);

  const dispatch = useDispatch()

  useEffect(()=>{
              function getMeetingInfo(){
              const query = window.location.href?.split('?')[1];
              const parts = query?.split("&");
              const customer_id = parts?.[0] || "";
              //const candidParam = parts[1] || "";
              const name = parts?.[1] || "";
             //let  language = parts?.[2] || "english"
              //language = language.charAt(0).toUpperCase() + language.slice(1)

              //http://localhost:5173/?anuj-anuj-anuj&cid_7761
              //new URLSearchParams(window.location.href)[1]
              console.log('query params',customer_id,name)

              const qParams = {
               customer_id,
             // candid: candidParam,
             // agentId,
              //isHost: login.isAuthenticated,
              name,
              //pref_language:language
              //meetingIsLegit: true,
            };
      
              dispatch(setQP(qParams))
              //setPref_language(language)
          } 
              getMeetingInfo()
          },[])

          
  // --- Timer Logic ---
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);



  



  // --- Helpers ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleRecord = () => {
    if (!isRecording) {
      //setRecordingActive(true)
      setManualVadStatus(true)
      setIsRecording(true);
      setIsPaused(false);
      
    } else {
      //setRecordingActive(false)
      setManualVadStatus(!manualVadStatus)
      setIsPaused(!isPaused);
      
    }
  };

  


  const endMeeting = () => {
    if (
      window.confirm("Are you sure you want to STOP and SAVE this meeting?")
    ) {
      setIsRecording(false);
      setDuration(0);
      setQaHistory([]);
      setShowAiModal(false);
      window.location.href = 'https://vitt-health-insurance.netlify.app/#/lead-management'
    }
  };

  const startAiQuery = () => {
    
    setManualVadStatus(true)
    setIsRecording(true);
    setIsPaused(false);
    setAskAiStatus(true);  
    setShowAiModal(true);
    setAiState("listening");

    // setTimeout(() => {
    //   setAiState("thinking");
    //   setTimeout(() => {
    //     const newQA = {
    //       id: Date.now(),
    //       question: "What is the foreclosure charge?",
    //       answer:
    //         "Foreclosure charges are 2% + GST if closed within 12 months. Nil charges after 12 months.",
    //       source: "Policy Doc: MSME_Lending_v4.pdf",
    //     };
    //     setQaHistory((prev) => [...prev, newQA]);
    //     setAiState("result");
    //   }, 1500);
    // }, 2000);

  };

  

  const closeAiModal = () => {
    setShowAiModal(false);
    setAskAiStatus(false);
    setAiState("idle");
  };

  useEffect(()=>{
    console.log("data",data)
  },[data])
  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden relative">
      {/* --- Top Space --- */}
      {qpParams.customer_id !=="" && <AppPromoPopup />}
      <div className="flex justify-center pt-10 pb-4 z-10">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
          Vitt AI
        </h2>
      </div>

      {/* --- Main Center Content --- */}
      <main className="flex-1 flex flex-col items-center justify-center pb-24 px-6">
        {/* Timer Display */}
        <div className="flex flex-col items-center mb-12 relative">
          {/* Enlarged Status Badge */}
          <span
            className={`absolute -top-10 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all ${
              isRecording
                ? isPaused
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-50 text-red-600 animate-pulse border border-red-100"
                : "opacity-0"
            }`}
          >
            {isPaused ? "Paused" : "Live Recording"}
          </span>

          <div
            className={`font-mono text-7xl font-semibold tracking-tighter tabular-nums transition-colors duration-300 ${
              isRecording && !isPaused ? "text-slate-800" : "text-slate-300"
            }`}
          >
            {formatTime(duration)}
          </div>
        </div>

        {/* --- The Cockpit Control Row (Horizontal) --- */}
        <div className="flex items-center justify-center gap-5 w-full max-w-sm">
          {/* 1. LEFT: Stop / End Session (Red by default) */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={endMeeting}
              className="w-20 h-20 rounded-3xl flex items-center justify-center bg-red-50 border-2 border-red-200 text-red-500 shadow-sm transition-all active:scale-95 active:bg-red-100"

            >
              <Square size={24} fill="currentColor" />
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Stop
            </span>
          </div>

          {/* 2. CENTER: Play / Pause (HERO BUTTON) */}
          <div className="flex flex-col items-center gap-3 -mt-6">

            {
              !VAD2.loading ?

              <button
              onClick={toggleRecord}
              className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 ${
                isRecording && !isPaused
                  ? "bg-amber-400 text-amber-950 shadow-amber-200"
                  : "bg-indigo-600 text-white shadow-indigo-200"
              }`}
            >
              {isRecording && !isPaused ? (
                <Pause size={48} fill="currentColor" />
              ) : (
                <Play size={48} fill="currentColor" className="ml-2" />
              )}
            </button>
            :
            <div style={{}}>
              <TailSpin stroke="red" strokeOpacity={1} speed={.95} style={{margin:'2rem'}}/>
            </div>
            }

            
            {/* Enlarged Status Text */}
            <span className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">
              {isRecording && !isPaused ? "Pause" : "Start"}
            </span>
          </div>


{/* {
          vadInstance ? 

         <CustomFillButtonWithIcon 
          color="#8236f5" 
          text="" 
          icon={faMicrophone}
          style={{
            backgroundColor: vadStatus ? 'red' : 'gray'
          }}
          className={wasClosedByUserRef.current?"microBtn":"hidden"}
          iconComp={<FontAwesomeIcon icon={faMicrophone} style={{ fontSize: '2rem' }} />} 
          onClick={() => setVadStatus((p) => !p)}
        />
        : 
        <div style={{}}>
          <TailSpin stroke="red" strokeOpacity={1} speed={.95} style={{margin:'2rem'}}/>
          </div>
        
        } */}

          {/* 3. RIGHT: Ask AI (Updated Border) */}
          <div className="flex flex-col items-center gap-3">
            {
              !VAD2.loading ?

              <button
              onClick={startAiQuery}
              //disabled={!isRecording}
              className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all active:scale-95 ${
                    "bg-white border-indigo-200 text-indigo-600 shadow-sm shadow-indigo-100/50 hover:bg-indigo-50"
              }`}
            >
              <Mic size={32} />
            </button>
            :
            <div style={{}}>
              <TailSpin stroke="red" strokeOpacity={1} speed={.95} style={{margin:'2rem'}}/>
            </div>
            }
            
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                 "text-indigo-400"
              }`}
            >
              Ask AI
            </span>
          </div>
        </div>
      </main>

      {/* --- AI Drawer (Unchanged) --- */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out transform ${
          showAiModal ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] h-[85vh] flex flex-col w-full max-w-md mx-auto border-t border-slate-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <span className="font-bold text-slate-800">AI Assistant</span>
            <button
              onClick={closeAiModal}
              className="p-2 bg-slate-50 rounded-full text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 bg-slate-50">

            {aiState === "listening" && (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Mic size={32} />
                </div>
                <p className="text-slate-500 font-medium">Listening...</p>
              </div>
            )}
            {aiState === "thinking" && (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
  <div className="relative w-12 h-12">
    {/* Large Gear - Spinning Clockwise */}
    <svg 
      className="absolute top-0 left-0 w-8 h-8 text-indigo-500 animate-spin" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
      style={{ animationDuration: '3s' }} // Slow down the spin slightly
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>

    {/* Small Gear - Spinning Counter-Clockwise */}
    <svg 
      className="absolute bottom-0 right-0 w-6 h-6 text-indigo-400 animate-spin" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
      style={{ animationDirection: 'reverse', animationDuration: '2s' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  </div>
  <p className="text-sm font-medium text-gray-500">Processing data...</p>
              </div>
            )}
              {data &&
          data.map((e: any, i: number) => {
            console.log(e)
            if (e.is_outgoing===true) {
            return <div
                  key={e.id}
                  className="mb-8 animate-in slide-in-from-bottom-2 fade-in"
                >
                  <div className="flex justify-end my-2">
                    <div className="bg-slate-200 text-slate-700 px-4 py-2 rounded-2xl rounded-br-none text-sm max-w-[85%]">
                      {e?.similarity_query}    
                    </div>
                  </div>
                  
                  
                </div>
            }else{
              return <div
                  key={e.id}
                  className="mb-8 animate-in slide-in-from-bottom-2 fade-in"
                >

                  <div className="bg-white border border-indigo-50 shadow-sm rounded-2xl p-4 my-2">
                    <p className="text-slate-800 text-sm leading-relaxed mb-3">
                      {Parser(e?.similarity_query)}
                    </p>
                    {/* <div className="flex items-center gap-1.5 pt-3 border-t border-slate-50">
                      <FileText size={12} className="text-indigo-400" />
                      <span className="text-[10px] text-indigo-500 font-semibold truncate">
                        Source: {qa.source}
                      </span>
                    </div> */}
                  </div>
                </div>
            }
          }) 
              }
            {qaHistory.map((qa) => (
                <div
                  key={qa.id}
                  className="mb-8 animate-in slide-in-from-bottom-2 fade-in"
                >
                  <div className="flex justify-end my-2">
                    <div className="bg-slate-200 text-slate-700 px-4 py-2 rounded-2xl rounded-br-none text-sm max-w-[85%]">
                      {qa.question}
                    </div>
                  </div>
                  
                  <div className="bg-white border border-indigo-50 shadow-sm rounded-2xl p-4 my-2">
                    <p className="text-slate-800 text-sm leading-relaxed mb-3">
                      {qa.answer}
                    </p>
                    <div className="flex items-center gap-1.5 pt-3 border-t border-slate-50">
                      <FileText size={12} className="text-indigo-400" />
                      <span className="text-[10px] text-indigo-500 font-semibold truncate">
                        Source: {qa.source}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border border-indigo-50 shadow-sm rounded-2xl p-4 my-2">
                    <p className="text-slate-800 text-sm leading-relaxed mb-3">
                      {qa.answer}
                    </p>
                    <div className="flex items-center gap-1.5 pt-3 border-t border-slate-50">
                      <FileText size={12} className="text-indigo-400" />
                      <span className="text-[10px] text-indigo-500 font-semibold truncate">
                        Source: {qa.source}
                      </span>
                    </div>
                  </div>
                </div>
              ))
              }
            {/* {aiState === "result" &&
              qaHistory.map((qa) => (
                <div
                  key={qa.id}
                  className="mb-8 animate-in slide-in-from-bottom-2 fade-in"
                >
                  <div className="flex justify-end mb-2">
                    <div className="bg-slate-200 text-slate-700 px-4 py-2 rounded-2xl rounded-br-none text-sm max-w-[85%]">
                      {qa.question}
                    </div>
                  </div>
                  <div className="bg-white border border-indigo-50 shadow-sm rounded-2xl p-4">
                    <p className="text-slate-800 text-sm leading-relaxed mb-3">
                      {qa.answer}
                    </p>
                    <div className="flex items-center gap-1.5 pt-3 border-t border-slate-50">
                      <FileText size={12} className="text-indigo-400" />
                      <span className="text-[10px] text-indigo-500 font-semibold truncate">
                        Source: {qa.source}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            } */}
          </div>
          <div className="p-4 bg-white border-t border-slate-50 safe-area-pb">
            <button
              onClick={startAiQuery}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-xl font-semibold active:scale-[0.98] transition-transform"
            >
              <Mic size={20} />
              Ask Another Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMeetingApp;
