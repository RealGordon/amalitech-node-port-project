import React, { useEffect } from "react";
import { cSpinner } from "../General";
export const AdminForm=()=>{
  useEffect(()=>{
    setup();
  },[]);
  return   <form  onSubmit={onFormSubmit}   
  name="docForm" 
  action="/upload/doc" method="POST" 
  encType="multipart/form-data">
    <label  id="form-info"></label><br />
    <div className="w3-container">
      <fieldset className="w3-container w3-margin">
        <legend>Customer/User Details</legend>
        <input name="customerId" required className="w3-input w3-margin" />
        </fieldset>
      <fieldset className="w3-container w3-margin">
        <legend>Category</legend>
      <input type="radio" name="category" value="invitation" />
      <label>Invitation Card</label><br />
      <input type="radio" name="category" value="form" />
      <label>Form</label><br />
      <input type="radio" name="category" value="greeting" />
      <label>Greeting card</label><br />
      
      <input id="otherRadio" type="radio" name="category" value="other" />
      <label>Other</label><br />
    <input type="text" disabled name="otherCategory" />
    </fieldset>
    <div className="w3-container w3-margin">
      <label htmlFor="myfile">Select your File:</label>
      <input type="file" id="myfile" name="cardFile" className="w3-input"
      accept=".pdf, .jpg, .jpeg, .png, .doc, .docx, application/msword"
      required /><br /><br />
    </div>
    </div>
    <div className="container">
      <fieldset className="w3-container w3-margin">
        <legend>Title</legend>
        <label></label><br />
        <input  className="w3-input w3-margin" 
        placeholder="title goes here..." name="title" /> 
        
        
      </fieldset>
      <fieldset className="w3-container w3-margin">
        <legend>Description</legend>
        <label></label><br />
        <textarea placeholder="description goes here ..." className="w3-input w3-margin" 
        name="description"></textarea>    
        </fieldset>
    </div>
    <div style={{margin:0,width:"70%"}} className="w3-center">
      <input className="w3-btn w3-red w3-margin" type="reset" />
    <input className="w3-btn w3-blue w3-margin" type="submit" />
  </div>
    </form>
}



var clearFormInfo=()=>{
    var info=document.getElementById('form-info')
    if(info.textContent==='')return;
    info.textContent='';
};

const onRadioChange=(e)=>{
  var uForm=document.forms.docForm;
    if(e.target.checked && e.target.id==='otherRadio'){
        uForm.otherCategory.disabled=false;
    
    }
    else{ uForm.otherCategory.disabled=true;
    }
    }

const setup=()=>{
  var uForm=document.forms.docForm;
  var form_inputs=document.querySelectorAll('form input');
  Array.prototype.forEach.call(form_inputs,(v)=>{
    v.addEventListener('change',clearFormInfo);
    });
  Array.prototype.forEach.call(uForm.category,(radio)=>{
    radio.onchange=onRadioChange;
    })
}
const onFormSubmit=function(e){
    e.preventDefault();
    var _this=e.currentTarget;
    var loader=new cSpinner('id0l');
    loader.action();
    var storageRef = firebase.storage().ref();
    var cardFile=_this.cardFile;
    var file=cardFile.files[0];
    var category=_this.category.value!=='other'?_this.category.value:_this.otherCategory.value;
    var name=(category!=='other'?category:'other')+'/'+(Math.random()*1000000).toString(6).split('.')[0];
    var fileRef=storageRef.child(name);
   
   
    //add user info
    var metadata={
        category:category,size:(""+file.size),
   uid:_this.customerId.value,filename:file.name};
    var tags=[file.name];
    if(file.name.indexOf('.')!==-1){
        var piece,pieces=file.name.split('.'); 
       for (piece of pieces){
           if(pieces!=='')tags.push(piece);
       }
    }
    if(_this.category.value==='other')tags.push(_this.otherRadio.value);
  var form_info=document.getElementById('form-info');

    //upload the file
    fileRef.put(file,metadata).then((snapshot) => {
        console.log('Uploaded '+file.name);
       // loader.action('off');
       form_info.classList.remove('w3-text-red');
       form_info.classList.add('w3-text-green');
        form_info.textContent='Upload Success';
        metadata.tags=tags;
        metadata.fileId=name;
        metadata.description=_this.description.value;
        var title=_this.title.value;
        metadata.title=title;
        title=title.split(' ');
        tags.concat(title);
       
      return  recordUpload(metadata,_this.customerId.value).then(
        ()=>loader.action('off'));
       
      },(e)=>{console.log('error occurred while uploading '+file.name);})
      .catch((e)=>{console.log('error occurred while recording upload for '+file.name);
      console.log(e);
      form_info.classList.remove('w3-text-green');
        form_info.classList.add('w3-text-red');
      form_info.textContent='Upload Error';
      loader.action('off')
    
    });
}

const recordUpload=(metadata,id)=>{
  var db=firebase.firestore();
 const batch=db.batch();
 const fileRef=db.collection('files').doc();
 const userFilesRef=db.collection('users').doc(id.substring(0,10)).collection(
   'files').doc(fileRef.id);
 batch.set(fileRef,{...metadata})
 delete metadata['uid'];
 batch.set(userFilesRef,{...metadata,AdminFileId:fileRef.id})
 return batch.commit()
    
}

