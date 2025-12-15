import React from 'react'
import {Route,Routes} from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import GlobalRoute from './components/GlobalRoute';
//import Page3 from './pages/Page3'
//import SignIn from './mui-sign-in/SignIn'
//import SignUp from './components/SignUp';
//import Login from './pages/Login'
//import ErrorPage from './pages/ErrorPage'
import DataWrapper, { useData } from './context/DataWrapper'
import { VadWrapper } from './context/VadWrapper';
//import MediaRecorderWrapper from './context/MediaRecorderWrapper';
import MobileMeetingApp from './pages/MobileMeetingPage';

// export function MainComponent(){
//   return (
//     <DataWrapper>
//       <VadWrapper>
//         <MediaRecorderWrapper>
//             <Page3/>
//         </MediaRecorderWrapper>
        
//       </VadWrapper>
//     </DataWrapper>
//   )
// }

export default function Routing() {
  return (
    <Routes>
            {/* @ts-ignore */}
            {/* <Route path='/' element={<PrivateRoute component={<Login/>}/>}/> */}
            {/* @ts-ignore */}
            {/* <Route path='/signup' element={<PrivateRoute component={<SignIn/>}/>}/> */}
            {/* @ts-ignore */}
            <Route path='/mainpage' element={<GlobalRoute component={
              
              <DataWrapper>
                <VadWrapper>
                  <MobileMeetingApp/>
                </VadWrapper> 
              </DataWrapper>
              }/>}/>
            {/* <Route path='*' element={<ErrorPage/>}/> */}
    </Routes>
  )
}
