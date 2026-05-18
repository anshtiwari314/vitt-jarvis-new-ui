import React from 'react';
import { useData } from '../context/DataWrapper';
import Msg from './Msg';

export default function MsgWrapper() {
    //@ts-ignore
    const {data,msgLoading} = useData()
    const messages = Array.isArray(data) ? data : []
  return (
            <div className="msg-list">
              {msgLoading ? (
                <div className='msg-loader-wrapper'>
                  <div className='msg-loader-skeleton' aria-label="Loading message" />
                </div>
              ) : null}
              {messages.map((e:any)=>{
                return <Msg e={e} key={e.id}/>
              })}
            </div>
  )
}
