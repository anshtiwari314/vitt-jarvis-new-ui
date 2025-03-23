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
//genrate base 64 