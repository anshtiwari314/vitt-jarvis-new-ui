import React, { useState } from 'react';
import { useData } from '../context/DataWrapper';
import Msg from './Msg';

export default function MsgWrapper() {
    //@ts-ignore
    const {data,msgLoading} = useData()
    const messages = Array.isArray(data) ? data : []
    const orderedMessages = messages.slice().reverse() // show newest messages first
  return (
            <div style={{ padding: "1rem", textAlign: "left" }}>
              {msgLoading ? (
                <div className='msg-loader-wrapper'>
                  <img
                    src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif"
                    className='msg-loader'
                  />
                </div>
              ) : null}
              {orderedMessages.map((e:any)=>{
                return <Msg e={e} key={e.id}/>
              })}
            </div>
            
  )
}
