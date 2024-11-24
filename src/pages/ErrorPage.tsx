import React, { useState,useEffect } from 'react'
import '../css/error-page.css'

export default function ErrorPage() {

    const [msg,setMsg] = useState('')

    useEffect(()=>{
        let tempMsg = '404 , oops look like u are in wrong page'
        let intervalId:any
        let count =0  
        intervalId = setInterval(()=>{
            if(count===tempMsg.length)
            clearInterval(intervalId)
            setMsg(tempMsg.substring(0,count++))
        },100)
        return ()=>clearInterval(intervalId)
    },[])

    let styling = {
        wrapper:{
            width:"100%",
            height:"100%",
            overflow:"hidden",
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            backgroundColor:"black"
        },
        container:{
            width:"fit-content",
            display:"flex",
            alignItems:"center" 
        },
        content:{
            fontSize:"3rem",
            color:"white",
            maxWidth:"70vw"
        },
        cursor:{
            width:"1rem",
            height:"2.5rem",
            backgroundColor:"white",
            marginLeft:"1rem"
        }
    }
  return (
    <div style={styling.wrapper}>
        <div style={styling.container}>
            <p style={styling.content}>{msg}
                
            </p>
            <p className='blink-cursor'></p>
        </div>
    </div>
  )
}
