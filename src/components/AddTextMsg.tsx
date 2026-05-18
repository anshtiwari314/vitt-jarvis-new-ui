import React, { useState } from 'react'
import Parser from 'html-react-parser'
import MessageAudioPlayer from './MessageAudioPlayer'

export default function AddTextMsg({e}:{e:any}) {

  const [toggle,setToggle] = useState(false)
  const isLong = e.content.split(" ").length > 100

  return (
    <div className={`text-msg${e.audio_url ? ' text-msg--audio' : ''}`}>
        <div className="text-msg__body">
          {isLong
            ? Parser(e.content.split(" ").slice(0, 100).join(" ") + "....")
            : Parser(e.content)}
          {toggle && isLong && (
            <span>{Parser(e.content.split(" ").slice(100).join(" "))}</span>
          )}
        </div>
        {isLong && (
          <a className="text-msg__read-more" onClick={() => setToggle(p => !p)}>
            {toggle ? "Show less" : "Read more"}
          </a>
        )}
        {e.audio_url ? (
          <MessageAudioPlayer messageAudioUrl={e.audio_url} />
        ) : null}
    </div>
  )
}
