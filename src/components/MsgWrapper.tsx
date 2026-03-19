import React, { useState } from 'react';
import { useData } from '../context/DataWrapper';
import Msg from './Msg';

export default function MsgWrapper() {
    //@ts-ignore
    const {data,msgLoading} = useData()
  return (
            <div className='msg-box'>
            { 
            msgLoading==true ?
            <div className='msg-loader-wrapper'>
                <img src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif" className='msg-loader'/>
            </div>
             :
            null
            }
            {data && data.map((e:any,i:number)=>{
                return <Msg e={e} key={e.id}/>
            })}
            </div>
            
  )
}
