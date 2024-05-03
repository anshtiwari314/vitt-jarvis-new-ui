import React, { useEffect, useState } from 'react'
import Parser from 'html-react-parser'


export default function AddTextMsg({e}:{e:any}) {

  const [toggle,setToggle] = useState(false)

  return (
    <div className='second text-msg' style={{borderColor:e.color,border:'0.1rem solid tomato'}}>

        <span>
        {e.content.split(" ").length > 100 ? 
          Parser(e.content.split(" ").slice(0,100).join(" ")+"...."):
          Parser(e.content)}
        </span>
        {
          toggle===true && 
          <span>{
          e.content.split(" ").length > 100 ? 
          Parser(e.content.split(" ").slice(100,e.content.length).join(" ")):
          ''
          }
          </span>
        }
        {/* <div className='extra'>
            
        </div> */}
        <a onClick={()=>setToggle(p=>!p)} style={{display:e.content.split(" ").length < 100 ? "none":""}}>
          {toggle===false  ? "Read more" : "Read less"}
        </a>
    </div>
  )
}
