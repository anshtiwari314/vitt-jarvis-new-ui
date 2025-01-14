import React,{useState,useEffect} from 'react'
import Send from '../assets/Send.svg'
import Mic from '../assets/Mic.svg'
import redMic from '../assets/redMic.svg'
import Time from '../assets/calendar.png'
import Calendar from '../assets/time.png'
import MsgWrapper from '../components/MsgWrapper'
import { useData } from '../context/DataWrapper';
import Msg from '../components/Msg';
import TokenMsg from '../components/TokenMsg'


function NewUi() {
    
    //@ts-ignore
    const {data,msgLoading,handleQuery,recordingOn,setRecordingOn,vadStatus,setVadStatus,audioServerUrl,setAudioServerUrl,question,setQuestion} = useData()

    const [query,setQuery] = useState<string>("")
    const [state,setState] = useState({date:'',time:''})

    function handleEnter(e:any){
        if(e.key==='Enter' && query.trim().length>0){
            handleQuery(query)
            setQuery('')
        }
    }

    useEffect(()=>{

        

        function updateTime(){
            let date = new Date()
            setState({date:date.toDateString(),time:date.toLocaleTimeString()})
            
        }

       let intervalId = setInterval(updateTime,1000)
        return ()=>clearInterval(intervalId)
    },[])

    return (
        <div style={{borderLeft:'0.1rem solid gray',width:'70%',paddingLeft:'4rem'}}>
            <div style={{width:'fit-content'}}>
            <input style={{marginTop:'0.2rem',padding:'1rem 0',fontSize:'1.5rem',width:'65vw'}} value={audioServerUrl} onChange={(e)=>setAudioServerUrl(e.target.value)}/>
            </div>
            
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
            {/* <div style={{
                width:'98%',
                padding:'0.5rem 0',
                backgroundColor:'#F7F7FB',
                display:'flex',
                alignItems:'center',
                marginTop:'1rem',
                borderRadius:'0.5rem'
            }}>
                <input placeholder='Type your Question here....'
                    onChange={(e)=>setQuestion(e.target.value)} 
                    //onKeyDown={handleEnter}
                    value={question}
                    style={{
                        width:'90%',
                        height:'3rem',
                        marginLeft:'1rem',
                        background:'transparent',
                        border:'none',
                        outline:'none',
                        //border:'0.1rem solid red'
                    }}

                />
                
                
                
            </div> */}

            <div style={{width:'98%',marginTop:'0.5rem',height:'76%',backgroundColor:'#F7F7FB',overflowY:'scroll'}}>
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
                    return <TokenMsg e={e} key={e.id}/>
                })}
               
            </div>
            <div style={{
                width:'98%',
                padding:'0.5rem 0',
                backgroundColor:'#F7F7FB',
                display:'flex',
                alignItems:'center',
                marginTop:'1rem',
                borderRadius:'0.5rem'
            }}>
                <input placeholder='Type your query here....'
                    onChange={(e)=>setQuery(e.target.value)} 
                    onKeyDown={handleEnter}
                    value={query}
                    style={{
                        width:'90%',
                        height:'3rem',
                        marginLeft:'1rem',
                        background:'transparent',
                        border:'none',
                        outline:'none',
                        //border:'0.1rem solid red'
                    }}

                />
                <div style={{
                    display:'flex',
                    width:'10%',
                    //border:'0.1rem solid red',
                    justifyContent:'space-around',

                    }}>
                    <img src={Send} style={{color:'white',cursor:'pointer'}} onClick={()=>handleQuery(query)}/>
                    
                    {vadStatus?
                    <img src={redMic}  style={{cursor:'pointer'}} onClick={()=>setVadStatus((p:any)=>!p)}/>
                    :
                    <img src={Mic}  style={{cursor:'pointer'}} onClick={()=>setVadStatus((p:any)=>!p)}/>
                    }
                    
                </div>
                
                
            </div>
        </div>
    )
}

export default NewUi
