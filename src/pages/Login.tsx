import React,{useState,useEffect, useRef} from 'react'
import { useAuth } from '../context/AuthContext'
import {Link} from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid';

export const styling = {
    body:{
        height:"100vh",
        width:"100vw",
        border:"0.1rem solid blue",
        display:"flex",
        justifyContent:"center",
        alignItems:"center"
    },
    container:{
        width:"fit-content",
        height:"fit-content",
        border:"0.1rem solid red",
        padding:"0 auto",
        textAlign:"center",
        transform:"translate(0,-25%)"
    },
    heading:{
        margin:"1.5rem 0",
        fontSize:"3rem"
    },
    box:{
        width:"fit-content",
        display:"flex",
        margin:"1rem 0"
    },
    label:{
        width:"20rem",
        // border:"0.1rem solid red",
        padding:"1rem 2rem",
        borderRadius:"1.5rem",
        // backgroundColor:"blue",
        color:"black",
        
    },
    input:{
        width:"30rem",
        border:"0.1rem solid black",
        margin:"0 1rem",
        borderRadius:"0.2rem",
        padding:"0 0.5rem",
        fontSize:"1.5rem"
    },
    button:{
        fontSize:"2rem",
        padding:"0.5rem 3rem",
        margin:"1rem",
        
    }
}

export default function Login() {

    const [loading,setLoading] = useState(false)
    const [email,setEmail] = useState('')
    const [pass,setPass] = useState('')
    const ref = useRef({})
    //@ts-ignore
    const {setCurrentUser} = useAuth()
    const [error,setError] = useState<string|null>(null)

    function handleChecks(){
        if(email==='' ){
            setError("Email field can't be empty")
            return ;
        }
        if(pass===''){
            setError("Password field can't be empty")
            return ;
        }
        
        handleAuth()
    }

    function handleAuth(){
        setLoading(true)
        let url = `https://qhpv9mvz1h.execute-api.ap-south-1.amazonaws.com/prod/check-jarvis-login`
        
        fetch(url,{
            method:'POST',
            headers:{
               'Accept':'application.json',
               'Content-Type':'application/json'
            },
    
            body:JSON.stringify({
            //    email:email,
            //    password:pass
            userid:email,
            password:pass
            }),
            cache:'default',}).then(res=>{
               console.log("res from audio server",res)
               return res.json()
            }).then((result)=>{
              setLoading(false)
              //setMsg((prev)=>[...prev,...result])
              console.log(result)
              if(result.error!==null)
                setError(result.error)
              if(result.result===true){
                  setCurrentUser({...result.data,sessionuid:uuidv4()})
              }
            })
    }

  return (
    <div className="auth-wrapper">
        <div  className="auth-container">
                <h1 style={{color:"tomato",fontSize:"2.5rem",textDecoration:"underline"}}>{error}</h1>
                <h2 className="auth-heading" style={{fontSize:"3rem",color:"white"}}>Login</h2>
                <div >
                    <div className="auth-box">
                        <div className="auth-label">
                            <label htmlFor='login-email'>Username :</label>
                        </div>
                        
                            <input
                                type="email" 
                                placeholder='please enter your username'
                                className='auth-input'
                                id='login-email'
                                value={email}
                                onChange={(e)=>setEmail(e.target.value.trim())}
                            />
                       
                       
                    </div>
                    <div className="auth-box">
                        <div className="auth-label">
                            <label htmlFor='login-pass'>Password :</label>
                        </div>
                        
                            <input
                                type="password" 
                                placeholder='please enter your password'
                                className='auth-input'
                                id='login-pass'
                                value={pass}
                                onChange={(e)=>setPass(e.target.value.trim())}
                            />
                    </div>
                    <button 
                        className='auth-button' 
                        onClick={()=>handleChecks()}
                        disabled={loading}
                        >
                            Login 
                    </button>
                </div>
                {/* <div style={{margin:"1.5rem 0"}}>
                    <pre style={{fontSize:"2rem",color:"white"}}>not have an account ? try  
                    <Link 
                        to="/signup" 
                        style={{
                            color:"tomato",
                            margin:"0.8rem",
                            textDecoration:"none",
                            fontSize:"2.2rem",
                            letterSpacing:"0.001rem"
                            }}>
                        signup
                    </Link>
                     first</pre>
                </div> */}
        </div>    
    </div>
  )
}
