import React,{createContext,useContext, useState} from 'react'


const Auth = createContext('Auth')

export function useAuth(){
    return useContext(Auth)
}

export default function AuthContext({children}:{children:React.ReactNode}) {
  
    const [currentUser,setCurrentUser] = useState(null)

  let values = {
    currentUser,setCurrentUser
  }
  return (
    // @ts-ignore
    <Auth.Provider value={values}>
        {children}
    </Auth.Provider>
  )
}
