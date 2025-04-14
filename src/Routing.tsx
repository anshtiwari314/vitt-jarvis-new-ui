import React from 'react'
import {Route,Routes} from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import GlobalRoute from './components/GlobalRoute';
import Page1 from './pages/Page3'
import SignIn from './mui-sign-in/SignIn'
//import SignUp from './components/SignUp';
import Login from './pages/Login'
import ErrorPage from './pages/ErrorPage'
import DataWrapper, { useData } from './context/DataWrapper'
import { VadWrapper } from './context/VadWrapper';

export default function Routing() {
  return (
    <Routes>
            {/* @ts-ignore */}
            <Route path='/' element={<PrivateRoute component={<Login/>}/>}/>
            {/* @ts-ignore */}
            <Route path='/signup' element={<PrivateRoute component={<SignIn/>}/>}/>
            {/* @ts-ignore */}
            <Route path='/mainpage' element={<GlobalRoute component={<DataWrapper><VadWrapper><Page1/></VadWrapper></DataWrapper>}/>}/>
            <Route path='*' element={<ErrorPage/>}/>
    </Routes>
  )
}
