import React, { useState } from 'react';
import { useData } from '../context/DataWrapper';
import Msg from './Msg';

export default function MsgWrapper() {
    //@ts-ignore
    const {data,msgLoading} = useData()
  return (
            <div className='msg-box'>
                {/* {data && data.map((e:any,i:number)=>{
                    console.log(e)
                    if(e.type ==="TextMsg")
                        return <AddTextMsg data={e} key={i}/>
                    else if(e.type === "SuggestiveMsg")
                        return <AddOnlySuggestiveMsg data={e} key={i}/>
                    else if(e.type === "ImageMsg")
                        return <AddImageMsg data={e} key={i}/>
                    else if(e.type === "InputForm")
                        return <AddInputForm data={e} key={i}/>
                    else if(e.type === "RadioForm")
                        return <AddRadioForm data={e} key={i}/>;
                })} */}
            

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
            <button>hello</button>
            </div>
            
  )
}
