import React from 'react'

export default function AddOnlySuggestiveMsg({e}:{e:any}) {

  return (
    <div className='suggestive-msg'>
        {e.replies.map((btnValue:string,i:number)=>{
            return <button key={i}>{btnValue}</button>
        })}
    </div>
  )
}
