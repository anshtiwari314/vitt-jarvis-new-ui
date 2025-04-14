import React from 'react'
import { useAuth } from '../context/AuthContext'

export function PostReq(url,data){
    const {currentUser} = useAuth()

    data = {...data,userid:currentUser.userid,sessionid:currentUser.sessionid}
    
    console.log('send to server hook called')

    fetch(url,{
        method:'POST',
        headers:{
           'Accept':'application.json',
           'Content-Type':'application/json',
           'mode': 'no-cors'
        },

        body:JSON.stringify(data),
        cache:'default',})
        .then(res=>{
           console.log("res from server",res)
           return res.json()
        }).then((result)=>{
          
          console.log(result)
          // if(result.error!==null)
          //   reject(result.error)
          // if(result.result===true){
          //  // console.log(result)
          //     resolve(result.data)
          // }
          resolve(result.data)
        })
}

export default function useRequest(){
    return {PostReq}
}