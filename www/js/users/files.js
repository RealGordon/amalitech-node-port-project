import React,{useState,useEffect} from "react";
import { SpinnerLoader } from "../General";
//const { useState, useEffect } = React;
function onDownLoad(e){
  e.stopPropagation();
  const currentTarget=e.currentTarget;
  if(currentTarget.dataset.disabled==='pending')return;
  const spans=currentTarget.parentElement.querySelectorAll('span');
  const title=spans[1].textContent;
  const filename=spans[0].textContent;
  var aTag=currentTarget.previousElementSibling;
  const snap=onDownLoad.docs.find(snap=>{
return snap.get('filename')===filename && snap.get('title')==title
  })
  var docId=snap.get('AdminFileId');
  var storage = firebase.storage();
  var storageRef = storage.ref(snap.get('fileId'));
  onDownLoad.setDownStatus({status:'pending',file:snap.get('fileId')})
  storageRef.getDownloadURL()
  .then((url) => {console.log(url);
    
     var xhr = new XMLHttpRequest();
     xhr.responseType = 'blob';
     xhr.onload = (event) => {
       var blob = xhr.response;
       onDownLoad.setDownStatus(s=>({...s,status:'idle'}))
  aTag.download=filename;
  aTag.href=URL.createObjectURL(blob);
  
  
  aTag.target='_blank';
  aTag.click();
  
  recordDownload(docId);
  

     };
     xhr.open('GET', url);
     xhr.send();
  
  
  })
};
const db=firebase.firestore();
function loadFiles(func,uid){

db.collection('users').doc(uid.substring(0,10)).collection('files')
.limit(20)
.get()
.then((qsnap)=>{
  func({docs:[...qsnap.docs],status:'fulfilled'});
  /*
    qsnap.forEach(snap=>{
        if(!snap.exists)return;
        const li=document.createElement('li');
        const butt=document.createElement('button');
        butt.textContent='download';
        butt.onclick=onDownLoad;
        butt.className='w3-btn w3-blue';
        li.textContent=(snap.get('filename'))
        li.appendChild(butt)
        li.className="w3-padding-hor-16";
        list_container.appendChild(li)
    })
    */
})
}
const recordDownload=(docId)=>{
db.collection('files').doc(docId).update(
  {downloads:firebase.firestore.FieldValue.increment(1)})
  
}
export const Files=(props)=>{
  const [Docs,setDocs]=useState({docs:[],status:'pending'});
  const [downStatus,setDownStatus]=useState({status:'idle',file:null});
const {docs,status}=Docs;
useEffect(()=>{
 
  loadFiles(setDocs,props.user.uid)
  
},[])

if(docs.length==0 && (status==='fulfilled')){
  return (<h2>No files to download</h2>);}
if(docs.length==0 && (status==='idle' ||status==='pending')){
  return (<h2>Loading ...</h2>);
}
  onDownLoad.docs=docs;
  onDownLoad.setDownStatus=setDownStatus;
const files=docs.map((snap,i)=>{
  const filename=snap.get('filename');
  return  (<li   id={i} key={i} className="w3-padding-hor-16">
  <a style={{display:'none'}} ></a>
 
  {(snap.get('fileId')===downStatus.file && downStatus.status==='pending')?
  <h3 className="w3-right">loading...</h3>
  :<a title="download file" 
  onClick={onDownLoad}
  data-disabled={downStatus.status} 
  className="w3-btn w3-margin-right w3-right w3-circle"><img 
  src="/static/images/digital-download-icon-6.jpg"  style={{"width":"40px"}}/></a>
  
  }
  <img src="/static/images/file_icon.png" className="w3-left w3-circle w3-margin-right"
   style={{"width":"50px"}} />
  <span className="w3-large" >{filename}</span><br />
  <span>{snap.get('title')}</span>
</li>)
})
return <React.Fragment><SpinnerLoader  state={downStatus.status==='pending'} />
<ul id="file-list" className="w3-ul w3-card-4" style={{maxWidth: 600}}>
  {files}</ul></React.Fragment>
  
}
//const container=document.getElementById('file-list');
//const LocalComponent=Files;
