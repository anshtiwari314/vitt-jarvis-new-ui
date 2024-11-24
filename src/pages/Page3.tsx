import React,{useState} from 'react'
import NewUi from './NewUi'



import Logo from '../assets/vitt-logo3.png'
import Search from '../assets/Search.svg'

import './page3.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch,faMicrophone,faPlusCircle,faTimesCircle,faRecordVinyl } from '@fortawesome/free-solid-svg-icons'
import { useData } from '../context/DataWrapper'
import { useAuth} from '../context/AuthContext'

import Meeting from '../assets/Meeting.svg'
import Home from '../assets/Home.svg'
import Setting from '../assets/Setting.svg'
import Inventory from './assets/Inventory.svg'
import Library from '../assets/Library.svg'
import Analytics from '../assets/Analytics.svg'
import Schedule from '../assets/Schedule.svg'
import Feedback from '../assets/Feedback.svg'
import ErrorPage from './ErrorPage'

export default function Page3() {
    
    //@ts-ignore
    const {tabs,activeTab,setActiveTab} = useData()
    //@ts-ignore
    const {currentUser} = useAuth()

    return (
        <div style={{//border:'0.1rem solid red',
            display:'flex',height:'99vh',position:'relative'}}>
            <div style={{borderRight:'0.1rem solid gray',
            width:'20%'

            //,position:'absolute',left:'-20vw',display:'none'
            }}>
                <div style={{
                    //border:'0.1rem solid blue',
                    display:'flex',
                    justifyContent:'center',
                    alignItems:'center',
                    flexDirection:'column',
                    //backgroundColor:'green',
                    marginBottom:'2rem'
                    }}>
                    <div>
                        <img src={Logo} style={{width:'12rem',height:'8rem',objectFit:'contain'}}/>
                    </div>
                    <div style={{
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                    }}>
                        <div style={{
                            display:'flex',
                            alignItems:'center',
                            width:'80%',
                            backgroundColor:'#F5F5F5',
                            borderRadius:'0.5rem'
                            }}>
                            <div style={{
                                // border:'0.1rem solid red',
                                width:'2rem',
                                display:'flex',
                                alignItems:'center',
                                justifyContent:'center',
                                flex:'0.1',
                                padding:'0 0.8rem'
                                }}>
                                <img src={Search} style={{width:'2rem',height:'2rem'}}/>
                            </div>
                            <div style={{flex:'0.9'}}>
                                <input 
                                    placeholder='Search...'
                                    style={{
                                        padding:'1rem',
                                        // border:'0.1rem solid red',
                                        outline:'none',
                                        background:'transparent',
                                        width:'100%',
                                        border:'none',
                                        fontSize:'1.5rem',
                                    }}
                                />
                            </div>
                            {/* <img src={Search} style={{width:'2rem',height:'2rem',margin:'0 0.5rem'}}/> */}
                            
                        </div>
                    </div>
                    
                </div>

                
                <div style={{
                   // border:'0.1rem solid tomato',
                    margin:'5rem 0',
                    paddingLeft:'2rem',
                    
                    }}>
                        {
                    tabs.map((e,i)=>{
                        return (
                            <div style={{
                                display:'flex',
                                //alignItems:'center',
                                justifyContent:'center',
                                margin:'1.5rem 0',
                              //  border:'0.1rem solid blue',
                                padding:'1.5rem 0',
                                cursor:'pointer'
                                }} onClick={()=>setActiveTab(i)}>
                                <span style={{flex:'0.2',display:'flex',justifyContent:'center'}}>
                                    <img src={e.icon}/>
                                </span>
                                <span style={{flex:'0.8'}}>
                                    <p style={{fontSize:'1.5rem',fontFamily: "'Open Sans', sans-serif",fontWeight:activeTab===i?700:400}}>{e.tab}</p>
                                </span>
                            </div>
                            )
                        })
                    }
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
            <div style={{width:'100%',height:'99.5vh'}}>
            {
                activeTab===0?<NewUi/>:null 
                    
            }
            {
                activeTab === 1? <div style={{//border:'0.1rem solid black',
                    width:'100%',height:'100%'}}>
                        <iframe
                        src={`https://vitt-pcvc-audit.netlify.app/#/analytics/${currentUser.sessionid}`}
                        title="Analytics page"
                        width="100%"
                        height="100%">
                        </iframe>
                    </div>:null
            }
            { 
                activeTab >1 ? <ErrorPage/>:null

            }
            </div>
        </div>
    )
}


