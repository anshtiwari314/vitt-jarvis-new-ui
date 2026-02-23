import React,{useEffect, useState} from 'react'
import Like from '../assets/Like.svg'
import LikeFilled from '../assets/Like-filled.svg'
import Dislike from '../assets/Dislike.svg'
import DislikeFiLLed from '../assets/Dislike-filled.svg'
import Pin from '../assets/Pin.svg'
import PinFilled from '../assets/Pin-filled.svg'
import Parser from 'html-react-parser'

interface Props {}

function TokenMsg({e}:{e:any}) {
    
    //const [toggleLikeBtn,setToggleLikeBtn] = useState<boolean>(false)
    //const [toggleDislikeBtn,setToggleDislikeBtn] = useState<boolean>(false)
    const [togglePinBtn,setTogglePinBtn] = useState<boolean>(false)

    const [feedback,setFeedback] = useState<null|boolean>(null)

    let failFeedbackUrl = 'https://qhpv9mvz1h.execute-api.ap-south-1.amazonaws.com/prod/fail-feedback'
    let passFeedbackUrl = 'https://qhpv9mvz1h.execute-api.ap-south-1.amazonaws.com/prod/pass-feedback'

    function handleFeedback(e:any,url:string){
        console.log(e)
        fetch(url,{
            method:'POST',
            headers:{
               'Accept':'application.json',
               'Content-Type':'application/json'
            },
            body:JSON.stringify({
                sessionid: e.sessionid, 
                audiofiletimestamp: e.audiofiletimestamp ,
                istranscription:e.istranscription
            }),
            cache:'default',}).then(res=>{
               console.log("res from feedback server",res)
               return res.json()
            }).then((result)=>{
              
              // //setMsg((prev)=>[...prev,...result])
              console.log(result)
            })
    }

    useEffect(()=>{
        if(feedback===null)
        return ;
        
        // if(feedback===true)
        // handleFeedback(e,passFeedbackUrl)
        // else handleFeedback(e,failFeedbackUrl)

    },[feedback])

    useEffect(()=>{
        console.log("e from tokenmsg",e)
    },[])
    return (
        <div style={{
            //width:'fit-content',
            //minWidth:'60%',
            minWidth:'30%',
            width:e.is_outgoing=== true ? 'fit-content':'85%',
            maxWidth: '100%',
            //border:'0.1rem solid tomato',
            display:'flex',
            backgroundColor:'white',
            margin:'var(--spacing-lg) var(--spacing-lg)',
            padding:e.is_outgoing=== true ? 0 :'var(--spacing-lg) var(--spacing-sm)',
            borderRadius:'2rem'
            //border:'0.1rem solid red'
            }}>
        <div style={{width:'100%',height:'fit-content',flex:e.is_outgoing?1: 0.8,margin:'var(--spacing-sm) 0'}}>
            {/* <h5 style={{
                fontFamily: '"DM Sans", sans-serif',
                //fontWeight:700,
                padding:'1rem 2rem',
                lineHeight:'2.8rem',
                fontSize:'1.7rem',
                textAlign:'right'
                }}>
                {e.similarity_query}    
                
            </h5> */}
            <p style={{
                fontSize:'1.6rem',
                padding:'var(--spacing-sm) var(--spacing-lg)',
                fontFamily: '"DM Sans", sans-serif',
                fontWeight:400,
                color:'#343541',
                lineHeight:'2.8rem'
                }}>
                    {e?.type === 'cues'
                      ? Parser(e?.content ?? '')
                      : Parser(e?.similarity_query ?? '')}
                </p>
        </div>

        {e?.is_outgoing===false &&
        <div style={{
            flex:0.2,
            //border:'0.1rem solid tomato',
            display:'flex',
            flexDirection:'column',
            justifyContent:'space-between'
            }}>
            <div style={{
                display:'flex',
                justifyContent:'space-around',
               // border:'0.1rem solid violet'
               width:'80%',
               margin:'0 auto'
                }}>
                
                    <>
                    { feedback===true ? 
                        <img src={LikeFilled} style={{width:'var(--icon-size-sm)',height:'var(--icon-size-sm)',cursor:'pointer'}} aria-label="Like" />
                        :
                        <img src={Like} style={{width:'var(--icon-size-sm)',height:'var(--icon-size-sm)',cursor:'pointer'}}  onClick={()=>{setFeedback(true);handleFeedback(e,passFeedbackUrl)}} aria-label="Like"/>
                        }
                        {
                        feedback===false ?
                        <img src={DislikeFiLLed} style={{width:'var(--icon-size-sm)',height:'var(--icon-size-sm)',cursor:'pointer'}} aria-label="Dislike" />
                        :
                        <img src={Dislike} style={{width:'var(--icon-size-sm)',height:'var(--icon-size-sm)',cursor:'pointer'}} onClick={()=>{setFeedback(false);handleFeedback(e,failFeedbackUrl)}} aria-label="Dislike"/>
                        }
                        {
                        togglePinBtn===false ?
                        <img src={Pin} style={{width:'var(--icon-size-sm)',height:'var(--icon-size-sm)',cursor:'pointer'}}  onClick={()=>setTogglePinBtn(p=>!p)} aria-label="Pin"/>
                        :
                        <img src={PinFilled} style={{width:'var(--icon-size-sm)',height:'var(--icon-size-sm)',cursor:'pointer'}} onClick={()=>setTogglePinBtn(p=>!p)} aria-label="Pin"/>
                        }
                    </>

                
                
                
                
            </div>
            
            <div style={{
                //border:'0.1rem solid violet'
                }}>
                <p style={{
                    fontSize:'1.4rem',
                    textAlign:'center',
                    fontFamily: '"Inter", sans-serif',
                    fontWeight:400,
                    color:'#343541'
                    }}>{e?.msg_receiving_timestamp}</p>
            </div>
        </div>
}
    </div>
    )
}

export default TokenMsg
