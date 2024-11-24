import React,{useRef, useState,useEffect} from 'react'
import Send from '../assets/Send.svg'
import Mic from '../assets/Mic.svg'
import redMic from '../assets/redMic.svg'
import Time from '../assets/calendar.png'
import Calendar from '../assets/time.png'
import MsgWrapper from '../components/MsgWrapper'
import { useData } from '../context/DataWrapper';
import Msg from '../components/Msg';
import TokenMsg from '../components/TokenMsg'
//import Popup from '../components/Popup'
import PinkPanther from '../../PinkPanther30.wav'
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch,faMicrophone,faMicrophoneSlash,faPlusCircle,faTimesCircle,faRecordVinyl,faMicrophoneAlt,faMicrophoneAltSlash,faWonSign,faShare } from '@fortawesome/free-solid-svg-icons'

function NewUi() {
    
    //@ts-ignore
    const {data,msgLoading,handleQuery,recordingOn,setRecordingOn,audioUrl,setAudioUrl,recordingActive,setRecordingActive} = useData()
    const audioRef = useRef(null)
    const [query,setQuery] = useState<string>("")
    const [state,setState] = useState({date:'',time:''})

    function handleEnter(e:any){
        if(e.key==='Enter' && query.trim().length>0){
            handleQuery(query)
            setQuery('')
        }
    }

    function handleCopyToClipboard(){
        //console.log(data[data.length-1].content)
        navigator.clipboard.writeText(data[data.length-1].content);
        window.alert("Content copied")
    }

    useEffect(()=>{
        if(audioRef.current===null)
        return ;

        let audioElem = audioRef.current 
        //@ts-ignore
        audioElem.src = audioUrl
        
  
        //@ts-ignore
        audioElem.addEventListener("canplaythrough", (event) => {
          /* the audio is now playable; play it if permissions allow */

          //@ts-ignore
          audioElem.play();
        });
      },[audioUrl])

    // useEffect(()=>{
    //     if(audioRef.current===null)
    //     return ;

    //     let audioElem = audioRef.current 
    //     //@ts-ignore
    //     audioElem.src = PinkPanther
        
  
    //     //@ts-ignore
    //     audioElem.addEventListener("canplaythrough", (event) => {
    //       /* the audio is now playable; play it if permissions allow */

    //       //@ts-ignore
    //       audioElem.play();
    //     });
    //   },[audioUrl])

    // useEffect(()=>{
    //     setInterval(()=>{
    //         setAudioUrl(uuidv4())
    //     },5000)
    // },[])

    useEffect(()=>{

        

        function updateTime(){
            let date = new Date()
            setState({date:date.toDateString(),time:date.toLocaleTimeString()})
            
        }

       let intervalId = setInterval(updateTime,1000)
        return ()=>clearInterval(intervalId)
    },[])
  

    return (
        <div style={{//border:'0.1rem solid black',
            width:'80%',paddingLeft:'4rem',height:'100%'
            //new changes from here 
            // ,height:'100vh',
            // width:'100vw',
            // padding:'0 1rem',
            
            }}>
                <audio style={{display:'none'}} src={audioUrl} ref={audioRef}></audio>
                
            <div>   
                {/* <h2 style={{fontSize:'2.5rem',fontFamily: '"DM Sans", sans-serif',fontWeight:700}}>Meeting title</h2> */}
                <h3 style={{fontSize:'2rem',fontFamily: '"DM Sans", sans-serif',fontWeight:700,margin:'0.5rem 0',color:'#1B1B1B'}}>Ongoing call</h3>
                <div style={{display:'flex',margin:'0.5rem 0',color:'#95969B'}}>
                    <div style={{display:'flex',alignItems:'center'}}>
                        <img src={Time} style={{width:'1.3rem',height:'1.5rem',objectFit:'contain'}}/>
                        <pre style={{marginRight:'0.3rem',marginBottom:'0',fontSize:'1.2rem',fontFamily:'"Inter", sans-serif',fontWeight:400}}>{state.date} | </pre>
                        
                        <img src={Calendar} style={{width:'1.1rem',height:'1.1rem',objectFit:'contain'}}/>
                        <pre style={{marginLeft:'0.3rem',marginBottom:'0',fontSize:'1.2rem',fontFamily: '"Inter", sans-serif',fontWeight:400}}>{state.time}</pre>
                    </div>
                    
                    
                </div>
            </div>
            <div style={{width:'98%',height:'80%',backgroundColor:'#F7F7FB',overflowY:'scroll'}}>
                { 
                msgLoading==true ?
                <div className='msg-loader-wrapper'>
                    <img src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif" className='msg-loader'/>
                </div>
                :
                null
                }
                {/* {data && data.map((e:any,i:number)=>{
                    return <Msg e={e} key={e.id}/>
                })} */}
                {data && data.map((e:any,i:number)=>{
                    if(i===0){
                        return <>
                        <TokenMsg e={e} key={e.id}/>
                        {/*<button className="btn btn-primary" style={{
                    
                    // backgroundColor:'#adacac',
                    // color:'white',
                    width:'20rem',
                    margin:'0.5rem 2rem',
                    padding:'1rem 1rem',
                    textAlign:'center',
                    fontSize:'1.5rem',
                    // display:'flex',
                    // justifyContent:'center',
                    outline:'none',border:'none',borderRadius:'1rem'
                }} onClick={handleCopyToClipboard}>Copy</button>*/}
                        </>
                    }else{
                        return <TokenMsg e={e} key={e.id}/>
                    }
                    
                })}
                
                
            </div>
            <div style={{
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center',
                width:'50vw',
                margin:'0 auto',
                //border:'0.1rem solid tomato'
            }} 

            >
                {/* {recordingOn?
                    <img src={redMic}  style={{cursor:'pointer'}} onClick={()=>setRecordingOn((p:any)=>!p)}/>
                    :
                    <img src={Mic}  style={{cursor:'pointer'}} onClick={()=>setRecordingOn((p:any)=>!p)}/>
                    } */}
                    {/* {
                        recordingOn?
                        <FontAwesomeIcon icon={faMicrophone} style={{fontSize:'2.5rem',cursor:'pointer',color:'gray'}} onClick={()=>setRecordingOn((p:any)=>!p)}/>:
                        <FontAwesomeIcon icon={faMicrophoneSlash} style={{fontSize:'2.5rem',cursor:'pointer',color:'gray'}} onClick={()=>setRecordingOn((p:any)=>!p)}/>
                    }
                    {
                        recordingActive?
                        <FontAwesomeIcon icon={faRecordVinyl} style={{fontSize:'2.5rem',color:'red',cursor:'pointer'}} onClick={()=>setRecordingActive(p=>!p)}/>:
                        <FontAwesomeIcon icon={faRecordVinyl} style={{fontSize:'2.5rem',color:'gray',cursor:'pointer'}} onClick={()=>setRecordingActive(p=>!p)}/>
                    } */}
            </div>
            <div style={{
                width:'98%',
                padding:'0.5rem 0',
                backgroundColor:'#F7F7FB',
                display:'flex',
                alignItems:'center',
                marginTop:'1rem',
                borderRadius:'0.5rem',
                //border:'0.1rem solid tomato',
                //new changes 
                // width:'fit-content'
            }}>
                <input placeholder='Type your query here....'
                    onChange={(e)=>setQuery(e.target.value)} 
                    onKeyDown={handleEnter}
                    value={query}
                    style={{
                        width:'100%',
                        height:'3rem',
                        marginLeft:'1rem',
                        background:'transparent',
                        border:'none',
                        outline:'none',
                        fontSize:'1.5rem',
                        //border:'0.1rem solid red'

                        //new changes 
                        //width:'80vw'
                    }}

                />
                <div style={{
                    display:'flex',
                    width:'10%',
                    //border:'0.1rem solid red',
                    justifyContent:'space-around',
                    alignItems:'center',

                    //new changes 
                    width:'10vw',

                    }}>
                    {/* <FontAwesomeIcon icon={faShare} style={{fontSize:'2rem',color:'gray'}} onClick={()=>{handleQuery(query);setQuery('')}}/> */}
                    <img src={Send} style={{color:'white',cursor:'pointer'}} onClick={()=>{handleQuery(query);setQuery('')}}/>
                    {recordingOn?
                    <img src={redMic}  style={{cursor:'pointer'}} onClick={()=>setRecordingOn((p:any)=>!p)}/>
                    :
                    <img src={Mic}  style={{cursor:'pointer'}} onClick={()=>setRecordingOn((p:any)=>!p)}/>
                    }
                    {
                        recordingActive?
                        <FontAwesomeIcon icon={faRecordVinyl} style={{fontSize:'2.5rem',color:'red',cursor:'pointer'}} onClick={()=>setRecordingActive(p=>!p)}/>:
                        <FontAwesomeIcon icon={faRecordVinyl} style={{fontSize:'2.5rem',color:'gray',cursor:'pointer'}} onClick={()=>setRecordingActive(p=>!p)}/>
                    }
                </div>
                
                
            </div>
        </div>
    )
}

export default NewUi
