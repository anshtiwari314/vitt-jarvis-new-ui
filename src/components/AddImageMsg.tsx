import React from 'react'

function handleFullSize(){

}
export default function AddImageMsg({e}:{e:any}) {
  return (
    <div className='image-msg'>
        <img src={e.imageUrl} />
    </div>
  )
}
