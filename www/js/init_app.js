import { Outlet ,useNavigate} from "react-router-dom";
import React from "react";
import { IndexCardMenu } from "./General";
/*
const App=(props)=>{
    const {AppComp,user,page}=props;
    document.getElementById('id0l').style.display='none';
    return (<React.Fragment>
      <Navigation  page={page}  user={user}/>
      {page==='index' && 
      <IndexCardMenu  user={user} page={page}/>}
      {AppComp && <AppComp user={user} />}
    </React.Fragment>)
  }
*/
const pageTest=/\/([a-zA-Z]+).html$/;
 export const App=(props)=>{
 const navigate=useNavigate();
 
  onLogout.navigate=navigate;
    const {AppComp}=props;
    let page;
    const pageMatch=window.location.pathname.match(pageTest);
  
    if (pageMatch)page=pageMatch[1];
    
    return (<React.Fragment>
      {page==='index'?
      <IndexCardMenu  user={user} page={page}/>: <Outlet user={user} />}
    </React.Fragment>)
  }


  
  export const onLogout=(e)=>{
    console.log("log out");
    console.log(e.target)
    if(  e.target.id!=='log-out')return;
    e.stopPropagation();
     firebase.auth().signOut().then(()=>{
       onLogout.setUser(null);
      onLogout.navigate("/static/index.html");
     })
   }

   export function startFunc(user,e){ 
    let error,offline="could not connect to server, check your internet connection";
       if(e){
         if(e.message && e.message.indexOf('offline')!==-1){
             error=offline;
           
         }
         else if(typeof e === 'string' && e.indexOf('offline')!==-1){
             error=offline;
         }
       }
       //if(window.LocalComponent)props.AppComp=LocalComponent;
       //if(!window.container){
         //window.container=document.createElement('div');
         //document.querySelector('body').appendChild(container);
       //}
        startFunc.setUser(user);
        startFunc.setError(error);
       
     }
     


/*
function startFunc(user){ 
  let page,props={};
  const pageMatch=window.location.pathname.match(pageTest);

  if (pageMatch)page=pageMatch[1];
  if(window.LocalComponent)props.AppComp=LocalComponent;
  if(!window.container){
    window.container=document.createElement('div');
    document.querySelector('body').appendChild(container);
  }

   ReactDOM.render(<App user={user} page={page} {...props} />,container)

}*/

//initApp(startFunc);