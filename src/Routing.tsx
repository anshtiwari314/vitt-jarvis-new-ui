import React from 'react'
import {Route,Routes} from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import GlobalRoute from './components/GlobalRoute';
import Page from './pages/Page3'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import ErrorPage from './pages/ErrorPage'
import DataWrapper, { useData } from './context/DataWrapper'

export default function Routing() {
  return (
    <Routes>
            {/* @ts-ignore */}
            <Route path='/' element={<PrivateRoute component={<Login/>}/>}/>
            {/* @ts-ignore */}
            <Route path='/signup' element={<PrivateRoute component={<SignUp/>}/>}/>
            {/* @ts-ignore */}
            <Route path='/mainpage' element={<GlobalRoute component={<DataWrapper><Page/></DataWrapper>}/>}/>
            <Route path='*' element={<ErrorPage/>}/>
    </Routes>
  )
}
