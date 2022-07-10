import React, { useEffect, useState } from "react";
import { BrowserRouter as Router,Routes,Route, Navigate, useNavigate } from "react-router-dom";
//import { Files } from "./files";
import { FilesHistory } from "./admin/filehistory";
import { Users } from "./admin/siteUsers";
import { Navigation ,MessageBox,IndexCardMenu} from "./General";
import { Files } from "./users/files";
import { App,onLogout,startFunc } from "./init_app";
import { AdminForm } from "./admin/adminform";
import { EmailSender } from "./users/emailSender";
import  ReactDOM  from "react-dom";

const pageTest=/\/([a-zA-Z]+).html$/;
const MainApp=()=>{
  
  const [user,setUser]=useState(null);
  const [error,setError]=useState(null);
  useEffect(()=>{
    initApp(startFunc);
    document.getElementById('id0l').style.display='none';
  },[])
  let page;
  const pageMatch=window.location.pathname.match(pageTest);
  onLogout.setUser=startFunc.setUser=setUser;
  startFunc.setError=setError;
 

 
  const props={user,error}
  if (pageMatch)page=pageMatch[1];
 
return <Router onClick={onLogout} >
    <Navigation {...props} page={page}  />
    <MessageBox state={error?"on":"off"} message={error} />
    <Routes>
    <Route element={<IndexCardMenu page={page}  user={user}/>} path='/static/index.html' />
    <Route path="/" element={<App  {...props} />}    >
    {user && user.pos==='admin' && <Route path="admin" >
    [<Route element={<AdminForm />} path='admin.html' />,
    <Route element={<FilesHistory />} path='adminfilehistory.html' />,
    <Route element={<Users />} path='siteUsers.html' />]
    </Route>}
    {user && user.pos==='user' && <Route path="user" >
    [<Route element={<Files user={user} />} path='files.html' />,
    <Route element={<EmailSender  user={user} />} path='emailSender.html' />]
    </Route>}
    </Route>
    <Route element={<Navigate to='/static/index.html'  />}  path="*" />
    </Routes>
    </Router>

}


  const container=document.querySelector('#main-body');
  ReactDOM.render(<MainApp  />,container)
  