import {v4 as uuidv4} from 'uuid'
import { getCurrentFormattedTime } from './generalFn'

export function resolvePlayableAudiourl(data: any): string | null {
    const base64 = data?.audiobase64 != null ? String(data.audiobase64).trim() : ''
    if (base64.length >= 16) {
        return `data:audio/wav;base64,${base64}`
    }
    const url = data?.audio_url != null ? String(data.audio_url).trim() : ''
    if (url.length > 0) {
        return url
    }
    return null
}

export function handleData(data:any){
    console.log('handleData',data)
    //setMsgLoading(false)
    let arr:Data[] =[]
    //@ts-ignore
    let obj:Data = {}
// "sessionid": <str>, "audiofiletimestamp": <str>
    let audiourl: string | null = null

    
    if(data?.loading){
        return ;
    }

    if(data?.type === 'cues' || data?.type === 'cues-update'){
        return { arr: [], audiourl: null }
    }

    data.msg_receiving_timestamp = getCurrentFormattedTime()

    audiourl = resolvePlayableAudiourl(data)
    if(data?.imageurl){
        //@ts-ignore
        obj["id"]= uuidv4()
        obj["type"]="ImageMsg"
        obj["imageUrl"] = data.imageurl;
        obj["iconName"] = 'fa-solid fa-forward-fast'
        obj["similarity_query"] = data.similarity_query;
        obj["color"]= data.color;
        obj["iconColor"] = data.iconColor 
        obj["sessionid"] = data.sessionid;
        obj["audiofiletimestamp"]=data.audiofiletimestamp
        obj["istranscription"] = data.istranscription
        //arr.push(obj)
        arr = [...arr,obj]
        //@ts-ignore
        obj = {}
    }
    if(data?.value){
        //@ts-ignore
        obj["id"]= uuidv4()
        obj["type"]="InputForm"
        obj["iconName"] = "fa-regular fa-pen-to-square"
        obj["value"] = data.value 
        obj["label"] = data.label 
        obj["color"] = data.color 
        obj["iconColor"] = data.iconColor 
        obj["similarity_query"] = data.similarity_query;
        obj["sessionid"] = data.sessionid
        obj["audiofiletimestamp"]=data.audiofiletimestamp
        obj["istranscription"] = data.istranscription
        //arr.push(obj)
        arr = [...arr,obj]
        //@ts-ignore
        obj = {}
    }
    if(data?.radio){
        //@ts-ignore
        obj["id"]= uuidv4()
        obj["type"]="RadioForm"
        obj["iconName"] = 'fa-regular fa-pen-to-square'
        obj["label"] = data.label 
        obj["radio"] = data.radio
        obj["color"] = data.color
        obj["iconColor"] = data.iconColor 
        obj["similarity_query"] = data.similarity_query;
        obj["sessionid"] = data.sessionid
        obj["audiofiletimestamp"]=data.audiofiletimestamp
        obj["istranscription"] = data.istranscription
        //arr.push(obj)
        arr = [...arr,obj]
        //@ts-ignore
        obj={}
    }
    if(data?.text){
        //@ts-ignore
        obj["id"] = uuidv4()
        obj["type"] = "TextMsg"
        obj["content"] = data.text
        obj["is_outgoing"] = false
        obj["iconName"] = 'fa-solid fa-circle-question'
        obj["color"] = data?.color ?? '#7D11E9'
        obj["iconColor"] = data?.iconColor ?? 'blue'
        obj["similarity_query"] = data?.similarity_query ?? ''
        obj["sessionid"] = data.sessionid
        obj["audiofiletimestamp"] = data?.audiofiletimestamp
        obj["istranscription"] = data?.istranscription
        obj["msg_receiving_timestamp"] = data?.msg_receiving_timestamp
        const msgAudioUrl = resolvePlayableAudiourl(data)
        if (msgAudioUrl) {
            obj["audio_url"] = msgAudioUrl
        }
        arr = [...arr, obj]
        //@ts-ignore
        obj = {}
    }

    if(data?.content){
        data.content.map((e:any,i:number)=>{
            //@ts-ignore
            obj["id"]= uuidv4()
            obj["type"]="TextMsg"
            obj["content"] = ''
            obj["is_outgoing"] = e?.is_outgoing
            obj["iconName"] = 'fa-solid fa-circle-question'
            obj["color"]= data?.color 
            obj["iconColor"] = data?.iconColor
            obj["similarity_query"] = e.similarity_query;
            obj["sessionid"] = data.sessionid
            obj["audiofiletimestamp"]=data?.audiofiletimestamp
            obj["istranscription"] = data?.istranscription
            obj["msg_receiving_timestamp"] = data?.msg_receiving_timestamp
            //arr.push(obj)
            arr = [...arr,obj]
            //@ts-ignore
            obj={}
        })
        
    }
    // if(data?.initquery.length>"1"){
    //         obj["id"]= uuidv4()
    //         obj["type"]="TextMsg"
    //         obj["content"] = data.initquery
    //         obj["iconName"] = 'fa-solid fa-circle-question'
    //         obj["color"]= data.color 
    //         obj["iconColor"] = data.iconColor
    //         obj["similarity_query"] = "Transcription captured";
    //         obj["sessionid"] = data.sessionid
    //         obj["audiofiletimestamp"]=data.audiofiletimestamp
    //         obj["initquery"] = true
    //         //arr.push(obj)
    //         arr = [...arr,obj]
    //         //@ts-ignore
    //         obj={}
    // }
    if(data?.replies){
        //@ts-ignore
        obj["id"]= uuidv4()
        obj["type"] = "SuggestiveMsg"
        obj["replies"] = data.replies
        obj["color"] = data.color
        obj["iconColor"] = data.iconColor 
        obj["similarity_query"] = data.similarity_query;
        obj["iconName"] = 'fa-solid fa-forward-fast'
        obj["sessionid"] = data.sessionid
        obj["audiofiletimestamp"]=data.audiofiletimestamp
        obj["istranscription"] = data.istranscription
        //arr.push(obj)
        arr = [...arr,obj]
        //@ts-ignore
        obj={}
       
    } 
    if(data?.isOutgoing){
        obj["id"]= uuidv4()
        obj["type"] = "SuggestiveMsg"
        //obj["replies"] = data.replies
        //obj["color"] = data.color
        //obj["iconColor"] = data.iconColor 
        obj["similarity_query"] = data.similarity_query;
        //obj["iconName"] = 'fa-solid fa-forward-fast'
        obj["sessionid"] = data.sessionid
        obj["content"] = '' 
        obj["is_outgoing"] = true
        //obj["audiofiletimestamp"]=data.audiofiletimestamp
        //obj["istranscription"] = data.istranscription

        arr = [...arr,obj]
        obj = {}

    }
   console.log(arr)

   return {arr,audiourl} ;
   //setData(prev=>[...arr,...prev])
   //console.log(obj)
}