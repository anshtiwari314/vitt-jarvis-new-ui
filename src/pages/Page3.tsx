import React, { useEffect, useRef, useState } from "react";
import NewUi from "./NewUi";

import Logo from "../assets/vitt-logo3.png";
import Search from "../assets/Search.svg";

import "./page3.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMicrophone,
  faPlusCircle,
  faTimesCircle,
  faRecordVinyl,
  faBars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useData } from "../context/DataWrapper";
import { useAuth } from "../context/AuthContext";

import Meeting from "../assets/Meeting.svg";
import Home from "../assets/Home.svg";
import Setting from "../assets/Setting.svg";
import Inventory from "./assets/Inventory.svg";
import Library from "../assets/Library.svg";
import Analytics from "../assets/Analytics.svg";
import Schedule from "../assets/Schedule.svg";
import Feedback from "../assets/Feedback.svg";
import ErrorPage from "./ErrorPage";
import { useDispatch } from 'react-redux';
import { setQP } from "../reducers/queryparamReducer";

export default function Page3() {
  //@ts-ignore
  const { tabs, activeTab, setActiveTab } = useData();
  const dispatch = useDispatch()
  //@ts-ignore
  const { currentUser } = useAuth();
  const ref = useRef(null);
  const btnRef = useRef(null);
  const btnCloseRef = useRef(null);
  // const onClickOfHamburger=()=>{
  //     if(ref.current){
  //         ref.current.classList.remove('ResizeTray')
  //         btnRef.current.style.setProperty("display","none","important")
  //     }
  // }
  const [isHamburgerClosed, setHamburgerClosed] = useState(false);
  const wasClosedByUserRef = useRef(false); 
  const onClickCloseHamburger = () => {
    if (ref.current) {
      ref.current.classList.add("ResizeTray");
      btnRef.current.style.setProperty("display", "inline-block", "important");
      wasClosedByUserRef.current=true;
    }
    setHamburgerClosed(true);
  };
  const [isFocused, setIsFocused] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 770) {
        if (ref.current && ref.current.classList.contains("ResizeTray")) {
          ref.current.classList.remove("ResizeTray");
        }
        if (btnRef.current) {
          btnRef.current.style.setProperty("display", "none", "important");
        }
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  useEffect(()=>{
              function getMeetingInfo(){
              const query = window.location.href?.split('?')[1];
              const parts = query?.split("&");
              const customer_id = parts?.[0] || "";
              //const candidParam = parts[1] || "";
              const name = parts?.[1] || "";
             
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

  return (
    <div
      style={{
        //border:'0.51rem solid red',
        display: "flex",
        height: "fit-content",
        position: "relative",
        overflow:"hidden"
      }}
    >
      {/* <button className='hamburger' ref={btnRef} onClick={onClickOfHamburger}>
                    
                </button> */}

      <div className="Sidebar ResizeTray" ref={ref} 
      style={{
        height:'max-content',
        //border:'0.2rem solid blue',
      }}>
        <button onClick={onClickCloseHamburger} className="close">
          <FontAwesomeIcon className="close-icon" icon={faXmark} />
        </button>
        <div
          style={{
            //border:'0.1rem solid blue',
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            //backgroundColor:'green',
            marginBottom: "2rem",
          }}
        >
          <div>
            <img
              src={Logo}
              className="logo-img"
              style={{ width: "14rem", height: "8rem", objectFit: "contain" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "80%",
                backgroundColor: "#F5F5F5",
                borderRadius: "0.5rem",
              }}
            >
              <div
                style={{
                  // border:'0.1rem solid red',
                  width: "2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0.1",
                  padding: "0 0.8rem",
                }}
              >
                <img
                  src={Search}
                  style={{ width: "2.1rem", height: "2.1rem" }}
                />
              </div>

              <div
                style={{ flex: "0.9", position: "relative" }}
                className="sidebar-side-search"
              >
                {!isFocused && (
                  <span className="typing-placeholder">Search...</span>
                )}
                <input
                  placeholder=""
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={{
                    padding: "1rem",
                    outline: "none",
                    background: "transparent",
                    width: "100%",
                    border: "none",
                    fontSize: "1.5rem",
                  }}
                />
              </div>
              {/* <img src={Search} style={{width:'2rem',height:'2rem',margin:'0 0.5rem'}}/> */}
            </div>
          </div>
        </div>

        <div
          style={{
            // border:'0.1rem solid tomato',
            margin: "5rem 0",
            paddingLeft: "2rem",
          }}
          className="sidebar-panel"
        >
          {tabs.map((e: any, i: any) => {
            return (
              <div
                style={{
                  display: "flex",
                  //alignItems:'center',
                  justifyContent: "center",
                  margin: "1.5rem 0",
                  //  border:'0.1rem solid blue',
                  padding: "1.5rem 0",
                  cursor: "pointer",
                }}
                onClick={() => setActiveTab(i)}
              >
                <span
                  style={{
                    flex: "0.2",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <img src={e.icon} />
                </span>
                <span style={{ flex: "0.8" }}>
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontFamily: "'Open Sans', sans-serif",
                      fontWeight: activeTab === i ? 700 : 400,
                    }}
                  >
                    {e.tab}
                  </p>
                </span>
              </div>
            );
          })}
          {/* <div style={{
                        display:'flex',
                        //alignItems:'center',
                        justifyContent:'center',
                        margin:'1.5rem 0',
                        border:'0.1rem solid blue',
                        padding:'1.5rem 0'
                        }}>
                        <span style={{flex:'0.2',display:'flex',justifyContent:'center'}}>
                            <img src={Home}/>
                        </span>
                        <span style={{flex:'0.8'}}>
                            <p style={{fontSize:'1.5rem',fontFamily: "'Open Sans', sans-serif",fontWeight:700}}>Dashboard</p>
                        </span>
                    </div>
                    <div style={{
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        margin:'1.5rem 0',
                        //border:'0.1rem solid blue',
                        padding:'1.5rem 0'
                        }}>
                        <span style={{flex:'0.2',display:'flex',justifyContent:'center'}}>
                            <img src={Meeting}/>
                        </span>
                        <span style={{flex:'0.8',display:'flex',alignItems:'center'}}>
                            <p style={{fontSize:'1.5rem',fontFamily: "'Open Sans', sans-serif",fontWeight:400}}>Recordings</p>
                        </span>
                    </div>
                    <div style={{
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        margin:'1.5rem 0',
                       // border:'0.1rem solid blue',
                        padding:'1.5rem 0'
                        }}>
                        <span style={{flex:'0.2',display:'flex',justifyContent:'center'}}>
                            <img src={Setting}/>
                        </span>
                        <span style={{flex:'0.8'}}>
                            <p style={{fontSize:'1.5rem',fontFamily: "'Open Sans', sans-serif",fontWeight:400}}>Language Setting</p>
                        </span>
                    </div>
                    <div style={{
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        margin:'1.5rem 0',
                       // border:'0.1rem solid blue',
                        padding:'1.5rem 0'
                        }}>
                        <span style={{flex:'0.2',display:'flex',justifyContent:'center'}}>
                            <img src={Analytics}/>
                        </span>
                        <span style={{flex:'0.8'}}>
                            <p style={{fontSize:'1.5rem',fontFamily: "'Open Sans', sans-serif",fontWeight:400}}>Advanced Analytics</p>
                        </span>
                    </div>
                    <div style={{
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        margin:'1.5rem 0',
                      //  border:'0.1rem solid blue',
                        padding:'1.5rem 0'
                        }}>
                        <span style={{flex:'0.2',display:'flex',justifyContent:'center'}}>
                            <img src={Schedule}/>
                        </span>
                        <span style={{flex:'0.8'}}>
                            <p style={{fontSize:'1.5rem',fontFamily: "'Open Sans', sans-serif",fontWeight:400}}>Schedule</p>
                        </span>
                    </div>
                    <div style={{
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        margin:'1.5rem 0',
                      //  border:'0.1rem solid blue',
                        padding:'1.5rem 0'
                        }}>
                        <span style={{flex:'0.2',display:'flex',justifyContent:'center'}}>
                            <img src={Library}/>
                        </span>
                        <span style={{flex:'0.8'}}>
                            <p style={{fontSize:'1.5rem',fontFamily: "'Open Sans', sans-serif",fontWeight:400}}>Library</p>
                        </span>
                    </div>
                    <div style={{
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        margin:'1.5rem 0',
                      //  border:'0.1rem solid blue',
                        padding:'1.5rem 0'
                        }}>
                        <span style={{flex:'0.2',display:'flex',justifyContent:'center'}}>
                            <img src={Feedback}/>
                        </span>
                        <span style={{flex:'0.8'}}>
                            <p style={{fontSize:'1.5rem',fontFamily: "'Open Sans', sans-serif",fontWeight:400}}>Your Feedback</p>
                        </span>
                    </div> */}
        </div>
      </div>
    <div
  style={{ 
    width: "100%", 
    height: "fit-content", 
    //border: "0.1rem solid green"
    // marginLeft: isHamburgerClosed ? "0" : "initial" // Remove this inline style for marginLeft
  }}
  className={`main-content ${isHamburgerClosed ? "override" : ""}`}
>
        {activeTab === 0 ? <NewUi sidebarRef={ref} btnRef={btnRef} wasClosedByUserRef={wasClosedByUserRef}  /> : null}
        {/* {
                activeTab === 1? <div style={{//border:'0.1rem solid black',
                    width:'100%',height:'100%'}}>
                        <iframe
                        src={`https://vitt-pcvc-audit.netlify.app/#/analytics/${currentUser.sessionid}`}
                        title="Analytics page"
                        width="100%"
                        height="100%">
                        </iframe>
                    </div>:null
            } */}
        {activeTab > 0 ? <ErrorPage /> : null}
      </div>
    </div>
  );
}
