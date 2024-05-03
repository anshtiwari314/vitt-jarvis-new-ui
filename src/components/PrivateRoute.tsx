import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

import {Route,redirect,Navigate} from 'react-router-dom'

export default function PrivateRoute({component,...rest}:{component:React.ReactNode}) {
    //@ts-ignore
    const {currentUser} = useAuth()
    // console.log('current user in private route',currentUser)
   // const navigate = useNavigate()
    console.log('calling current user from private route',currentUser)
    
    

    console.log(component)
    if(currentUser===null){
        return component
    }else {
      //  redirect("/#/mainpage")
     // window.location.href = '/#/mainpage'
     // navigate.to('/#/mainpage')
     //<Navigate to="/#/mainpage" />
     return <Navigate to="/mainpage" replace />
    }

}