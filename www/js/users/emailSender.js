import React, { useEffect, useState } from "react";
import { Search } from "../SearchBar/App2";
import { cSpinner } from "../General";
export const EmailSender=(props)=>{
  const[info,setInfo]=useState('');
  onFormSubmit.setInfo=setInfo;
return <>
 <label className="w3-green" id="form-info">{info}</label><br />
<form onSubmit={onFormSubmit} name="emailForm" className="w3-container w3-margin" action="/upload/doc" 
method="POST" 
encType="multipart/form-data">
 
  <div className="w3-container">
    <fieldset className="w3-container w3-margin">
      <legend>Address</legend>
      <div className="w3-margin">
      <label  className="form-info">Subject</label>
      <input onChange={()=>(info!=='' && setInfo(''))} name="subject" required /><br /></div>
      <div className="w3-margin">
      <label  className="form-info">Recipient</label>
      <input type="email" name="recipient" required /><br /></div>
      </fieldset>
     
        <h3>Document/Message</h3>
        <Search  user={props.user} />
        <div className="w3-margin-top">
        <h3>Message</h3><br />
        <textarea placeholder="write your message here ..." className="w3-input w3-margin" 
        name="message"></textarea> 
      </div>
        
        <div style={{display:"inline-block",margin:0}}>
        <button type="reset" className="w3-btn w3-red w3-margin">Reset</button>
        <button className="w3-btn w3-blue w3-margin" type="submit">Submit</button></div>
    </div>
    </form>
    </>
}
let db;
function onFormSubmit(e){
    e.preventDefault();
    onFormSubmit.setInfo('');
    var loader =new cSpinner('id0l');
    loader.action();
    if(!db)db=firebase.firestore();
  var formData=new FormData(e.currentTarget);
  var key,value,data={};
    for([key,value] of formData.entries()){
      data[key]=value;
    }
  data.files=cardAttachments;
  //console.log(cardAttachments);
  db.collection('emailSender').add(data)
  .then((docRef)=>{
  var listener=docRef.onSnapshot({
    next:(docSnap)=>{
      if (docSnap.get('status')==='sent'){
        loader.action('off')
        onFormSubmit.setInfo('Email to '+docSnap.get(
          'recipient')+' Sent!');
      return   listener();
      }
      if (docSnap.get('status')==='error'){
        loader.action('off');
      onFormSubmit.setInfo('Error occured while sending email to '+
        docSnap.get('recipient'));
      return listener();
      }
    },
    error:(error)=>{
      console.log(error);
      loader.action('off');
      onFormSubmit.setInfo('Error occured while sending email to '+
      docSnap.get('recipient'));
      listener();
    }
  })
  })
  }
  var clearFormInfo=()=>{
    var info=document.getElementById('form-info')
    if(info.textContent==='')return;
    info.textContent='';
};