import { PostReq } from "./requests"

import { utils } from "@ricky0123/vad-react"
import WavToMp3 from './wavToMp3'


export function getCurrentFormattedTime() {
  const now = new Date();

  // Get the current hour and minute
  let hours = now.getHours();
  let minutes = now.getMinutes();

  // Determine AM or PM
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'

  // Add a leading zero to minutes if less than 10
  minutes = minutes < 10 ? '0' + minutes : minutes;

  // Get the day of the month and month abbreviation
  const day = now.getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[now.getMonth()];

  // Return the formatted string
  return `${hours}:${minutes} ${ampm}, ${day} ${month}`;
}

export function getTimeStamp(){

    let dateOb = new Date()

    let dateFormat= `${dateOb.getDate()}.${dateOb.getMonth()+1}.${dateOb.getUTCFullYear()}` 
    let timeFormat = `${dateOb.getHours()}.${dateOb.getMinutes()}.${dateOb.getSeconds()}.${dateOb.getMilliseconds()}`

    return `${dateFormat}-${timeFormat}`
}

export function getOldTimeStamp(){

    let dateOb = new Date()

    let dateFormat= `${dateOb.getDate()}/${dateOb.getMonth()+1}/${dateOb.getUTCFullYear()}` 
    let timeFormat = `${dateOb.getHours()}:${dateOb.getMinutes()}:${dateOb.getSeconds()}:${dateOb.getMilliseconds()}`

    return `${dateFormat} ${timeFormat}`
}

export function generateBase64(blob){
    return new Promise((resolve,reject)=>{

        let reader = new FileReader()
        reader.onloadend = ()=>{
            resolve(reader.result)
        }
    reader.readAsDataURL(blob)
    })
}

