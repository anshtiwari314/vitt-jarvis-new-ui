import React,{useEffect, useState,useRef} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faClipboardQuestion,
    faExclamation,
    faForwardFast,
    faCircleQuestion,
    faPen,
} from '@fortawesome/free-solid-svg-icons'
import AddImageMsg from './AddImageMsg'
import AddOnlySuggestiveMsg from './AddOnlySuggestiveMsg'
import AddTextMsg from './AddTextMsg'
import AddForm,{ InputForm,RadioForm } from './AddForm'
import AddTableMsg from './AddTableMsg'


function IconColor(identiyingColor:string){
    if(identiyingColor==='red')
    return '#D60000'
    else if(identiyingColor === 'green')
    return '#16a34a'
    else if(identiyingColor === 'yellow')
    return '#ca8a04'
    else if(identiyingColor === 'blue')
    return '#7D11E9'
    else if(identiyingColor==='pink')
    return '#D60067'
}
function MsgIcon({ iconColor }: { iconColor: string }) {
    let icon = faCircleQuestion
    if (iconColor === 'red') icon = faClipboardQuestion
    else if (iconColor === 'green') icon = faExclamation
    else if (iconColor === 'yellow') icon = faForwardFast
    else if (iconColor === 'pink') icon = faPen

    return (
        <FontAwesomeIcon
            icon={icon}
            className="msg-card__icon-glyph"
            style={{ color: IconColor(iconColor) }}
        />
    )
}
function MsgTypeSelector({e}:{e:any}){
    if(e.type ==="TextMsg")
        return <AddTextMsg e={e}/>
    else if(e.type === "SuggestiveMsg")
        return <AddOnlySuggestiveMsg e={e} />
    else if(e.type === "ImageMsg")
        return <AddImageMsg e={e} />
    else if(e.type === "InputForm")
        //@ts-ignore
        return <AddForm e={e} Component={InputForm}/>
                    
    else if(e.type === "RadioForm")
    //@ts-ignore
        return <AddForm e={e} Component={RadioForm}/>
    return <></>
                
}
function handleFeedback(e:any,url:string){
    console.log(e)
    fetch(url,{
        method:'POST',
        headers:{
           'Accept':'application.json',
           'Content-Type':'application/json'
        },
        body:JSON.stringify({
            sessionid: e.sessionid, 
            audiofiletimestamp: e.audiofiletimestamp ,
            istranscription:e.istranscription
        }),
        cache:'default',}).then(res=>{
           console.log("res from feedback server",res)
           return res.json()
        }).then((result)=>{
          console.log(result)
        })
}

function FeedbackToggle({checked, onToggle, onActivate}:{checked:boolean, onToggle:()=>void, onActivate:()=>void}) {
    return (
        <label className="msg-feedback-toggle" title="Mark as reviewed">
            <input
                className="response-radio"
                type="checkbox"
                checked={checked}
                onChange={() => {
                    onActivate()
                    onToggle()
                }}
            />
            <span className="msg-feedback-toggle__track">
                <i className={checked ? "fa-solid fa-check" : "fa-regular fa-circle"} />
            </span>
        </label>
    )
}

export default function Msg({e}:{e:any}) {
    const [checked,setChecked] = useState<boolean>(false)
    let radioRef = useRef(false)

    useEffect(()=>{
        if(radioRef.current ===false)
        return ;
        
        if(checked===true){
            let url = 'https://qhpv9mvz1h.execute-api.ap-south-1.amazonaws.com/prod/fail-feedback'
            handleFeedback(e,url)
        }else{
            let url = `https://qhpv9mvz1h.execute-api.ap-south-1.amazonaws.com/prod/pass-feedback`
            handleFeedback(e,url)
        }
    },[checked])

    const colorMod = e.iconColor ? `msg--${e.iconColor}` : 'msg--blue'

  return (
    <article className={`msg ${colorMod}`}>
        <div className="msg-card">
            <div className="msg-card__icon">
                <MsgIcon iconColor={e.iconColor} />
            </div>

            <div className="msg-card__body">
                {e.similarity_query ? (
                    <p className="msg-card__query">{e.similarity_query}</p>
                ) : null}
                <div className="msg-card__content">
                    <MsgTypeSelector e={e}/>
                </div>
            </div>

            <div className="msg-card__feedback">
                <FeedbackToggle
                    checked={checked}
                    onToggle={() => setChecked(prev => !prev)}
                    onActivate={() => { radioRef.current = true }}
                />
            </div>
        </div>
    </article>
  )
}
