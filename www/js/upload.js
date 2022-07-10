var uForm=document.forms.docForm;
var form_inputs=document.querySelectorAll('form input');
var clearFormInfo=()=>{
    var info=document.getElementById('form-info')
    if(info.textContent==='')return;
    info.textContent='';
};
Array.prototype.forEach.call(form_inputs,(v)=>{
v.addEventListener('change',clearFormInfo);
});
const onRadioChange=(e)=>{
    if(e.target.checked && e.target.id==='otherRadio'){
        uForm.otherCategory.disabled=false;
    
    }
    else{ uForm.otherCategory.disabled=true;
    }
    }
Array.prototype.forEach.call(uForm.category,(radio)=>{
radio.onchange=onRadioChange;
})
uForm.onsubmit=function(e){
    e.preventDefault();
    
    var loader=new cSpinner('id0l');
    loader.action();
    var storageRef = firebase.storage().ref();
    var cardFile=this.cardFile;
    var file=cardFile.files[0];
    var category=this.category.value!=='other'?this.category.value:this.otherCategory.value;
    var name=(category!=='other'?category:'other')+'/'+(Math.random()*1000000).toString(6).split('.')[0];
    var fileRef=storageRef.child(name);
   
   
    //add user info
    var metadata={
        category:category,size:(""+file.size),
   uid:this.customerId.value,filename:file.name};
    var tags=[file.name];
    if(file.name.indexOf('.')!==-1){
        var piece,pieces=file.name.split('.'); 
       for (piece of pieces){
           if(pieces!=='')tags.push(piece);
       }
    }
    if(this.category.value==='other')tags.push(this.otherRadio.value);
  var form_info=document.getElementById('form-info');
  _this=this;
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

