import React from 'react'
import Ratings from './Ratings'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { useData } from '../context/DataWrapper'

export default function Popup({children,modelState,setModelState}) {
    //green rgb(0, 214, 0)
    // red rgb(255, 80, 11);
     // console.log(popupBox)
     //console.log(modelState)

     //@ts-ignore
     const {modelRef} = useData()

  return (
    <div className='popup' 
        style={{
            display:modelState?.status?"flex":"none",
            backgroundColor:"white",
            //border:'0.1rem solid red',
            height:'fit-content',
            width:'40%',
            borderRadius:'1.2rem',
            
            boxShadow:'0 0.4rem 0.4rem 0 rgba(0,0,0,0.25)',
            border: '1px solid rgba(85, 112, 241,0.42)',

            }} ref={modelRef}>
            <div style={{width:'100%',height:'100%',position:'relative',padding:'3rem 0',}}>
                <div style={{position:'absolute',right:'1.5rem',top:'1rem'}} onClick={()=>setModelState(p=>{return{data:p.data,status:false}})}>
                    <FontAwesomeIcon icon={faTimes} style={{color:'#C0C0C0',fontSize:'3rem',cursor:'pointer'}}/>
                </div>
                {children}
            </div>
    </div>
  )
}
