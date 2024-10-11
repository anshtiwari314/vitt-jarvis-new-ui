import React, { useEffect, useState } from 'react'

export default function HomePage() {
  const [submitBtnClicked,setSubmitBtnClicked] = useState<boolean>(false)
  const [mobile,setMobile] = useState<string>("");

  function generateNewLink(){
    
  }
  function handleSubmit(){
    if(mobile.length<10 )
      return ;
    fetch('https://qhpv9mvz1h.execute-api.ap-south-1.amazonaws.com/prod/fetch-customerid',{
        method:'POST',
        headers:{
            'Accept':'application.json',
            'Content-Type':'application/json'
        },
        body:JSON.stringify({mobileno:mobile}),
        cache:'default'
        }).then((res)=>{
            return res.json()
        }).then(result=>{
            
            console.log(result) 
        }).catch((err)=>{
            console.log(err)
            //meetingBtn.disabled = false
        })
  }
  useEffect(()=>{
    if(submitBtnClicked===false)
      return ;
    
  },[])
  return (
    <div className='home-page'>
      <div className='wrap'>
        <h1>Hdfc Life Queues App</h1>
        <div className='inline'>
            <input 
              placeholder='Enter application number' 
              onChange={(e)=>setMobile(e.target.value)}
              value={mobile}
              /> 
            <button className='Btn' onClick={()=>handleSubmit()}>Link</button>
        </div>
      </div>
        
    </div>
  )
}

