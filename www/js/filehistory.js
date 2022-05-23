const { useState, useEffect } = React;
function onDownLoad(e){
  e.stopPropagation();
  const currentTarget=e.currentTarget;
  if(currentTarget.disabled)return;
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
var db;
function loadFiles(func){
db=firebase.firestore();
db.collection('files')
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
const Files=()=>{
  const [Docs,setDocs]=useState({docs:[],status:'pending'});
  
const {docs,status}=Docs;
useEffect(()=>{
 
  loadFiles(setDocs)
  
},[])

if(docs.length==0 && (status==='fulfilled')){
  return (<h2>No files to download</h2>);}
if(docs.length==0 && (status==='idle' ||status==='pending')){
  return (<h2>Loading ...</h2>);
}
  
const files=docs.map((snap,i)=>{
  const filename=snap.get('filename');
  
  return  (<li   id={i} key={i} className="w3-padding-hor-16">
 <h3 className="w3-right">{snap.get('downloads')||0}</h3>

  <img src="images/file_icon.png" className="w3-left w3-circle w3-margin-right"
   style={{"width":"50px"}} />
  <span className="w3-large" >{filename}</span><br />
  <span>{snap.get('title')}</span>
</li>)
})
return [<li><span>files</span><span className="w3-right">downloads</span></li>,files]
}
function startFunc(){ 
 
   const list_container=document.getElementById('file-list');
   ReactDOM.render(<Files />,list_container)

}
initApp(startFunc);
