import React, { useState } from 'react'
import {Link} from 'react-router-dom'

export default function SignUp() {

    const [email,setEmail] = useState('')
    const [pass,setPass ] = useState('')
    const [confirmPass,setConfirmPass] = useState('')
    const [name,setName] = useState('')
    const [error,setError] = useState<string|null>(null)
    const [loading,setLoading] = useState(false)

    function handleChecks(){
        if(email==='' ){
            setError("Email field can't be empty")
            return ;
        }
        if(pass===''){
            setError("Password field can't be empty")
            return ;
        }
        if(confirmPass===''){
            setError('please confirm password')
            return ;
        }
        if(name===''){
            setError(`Name field can't be empty`)
            return 
        }
        if(pass!==confirmPass){
            setError('Passwords not matched')
            return ;
        }
       
        handleAuth()
    }
    function handleAuth(){
        setLoading(true)
        let url = `http://127.0.0.1:5000/register`
        
        fetch(url,{
            method:'POST',
            headers:{
               'Accept':'application.json',
               'Content-Type':'application/json'
            },
    
            body:JSON.stringify({
               name:name,
               email:email,
               password:pass,

            }),
            cache:'default',}).then(res=>{
               console.log("res from audio server",res)
               return res.json()

            }).then((result)=>{

              setLoading(false)
              //setMsg((prev)=>[...prev,...result])
              if(result.result.error!==null)
              setError(result.result.error)
              console.log(result)

            })
    }
  return (
    <div className="auth-wrapper">
        <div  className="auth-container">
                <h1 style={{color:"tomato",fontSize:"2.5rem",textDecoration:"underline"}}>{error}</h1>
                <h2 className="auth-heading" style={{fontSize:"3rem",color:"white"}}>Sign Up</h2>
                <div >
                    <div className="auth-box">
                        <div className="auth-label">
                            <label htmlFor='signup-name'>Name :</label>
                        </div>
                        <input
                            type="text" 
                            placeholder='please enter your name'
                            className='auth-input'
                            id = 'signup-name'
                            value={name}
                            onChange={(e)=>setName(e.target.value.trim())}
                        />
                    </div>
                    <div className="auth-box">
                        <div className="auth-label">
                            <label htmlFor='signup-email'>Email :</label>
                        </div>
                        <input
                            type="email" 
                            placeholder='please enter your email'
                            className='auth-input'
                            id='signup-email'
                            value={email}
                            onChange={(e)=>setEmail(e.target.value.trim())}
                        />
                    </div>
                    <div className="auth-box">
                        <div className="auth-label">
                            <label htmlFor='signup-pass'>Password :</label>
                        </div>
                        <input
                            type="password" 
                            placeholder='please enter your password'
                            className='auth-input'
                            id='signup-pass'
                            value={pass}
                            onChange={(e)=>setPass(e.target.value.trim())}
                        />
                    </div>
                    <div className="auth-box">
                        <div className="auth-label">
                            <label htmlFor='signup-confirm-pass'>Confirm Password :</label>
                        </div>
                        <input
                            type="text" 
                            placeholder='please confirm your password'
                            className='auth-input'
                            id='signup-confirm-pass'
                            value={confirmPass}
                            onChange={(e)=>setConfirmPass(e.target.value.trim())}
                        />
                    </div>
                    <button className='auth-button' onClick={()=>handleChecks()}>Register</button>
                </div>
                <div style={{margin:"1.5rem 0"}}>
                    <pre style={{fontSize:"2rem",color:"white"}}>already registred ? trying
                    <Link 
                        to="/" 
                        style={{
                            color:"tomato",
                            margin:"0.8rem",
                            textDecoration:"none",
                            fontSize:"2.2rem",
                            letterSpacing:"0.001rem"
                            }}>
                        signin
                    </Link>
                    </pre>
                </div>
        </div>    
    </div>
  )
}
