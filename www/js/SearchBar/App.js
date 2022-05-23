// --------------- API:BEGIN --------------
/**
 * Search users by name
 * @param {string} query - The query to search users by
 * @return {Promise<{ name: string; email: string; }[]>} Search result
 */

const searchDocsByQuery=(query)=>{
  query=query.split(' ');
  return new Promise(
    (resolve)=>{
db.collection('users').doc(window.user.uid.substring(0,10)).collection("files")
.where('tags','array-contains-any',query)
//.where('tg','==',_this.target_id)
//.where('d','==',d)
//.where("tu_s","==",unique_serial)
//.orderBy('last_time','desc')
.limit(10)
.get()
.then((querySnapshot) => {
 var  resultArray=[];
 var data;
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        if(!doc.exists)return;
        data=doc.data();
       resultArray.push({text:data.title+" ( "+data.filename+" )",
       fileId:data.fileId,filename:data.filename})
    });
  resolve(resultArray);
  
})
.catch((error) => {
    console.log("Error getting documents: ", error);
})
}
)
}



//const searchUsersByName = (query) => new Promise((resolve) => resolve(fuse.search(query)));

// ---------------- API:END ---------------

const App = () => {
  const {useState,useEffect}=React;
  const [text,setText]=useState('');
  const [results,setResults]=useState([])
  const [resultFound,setResultFound]=useState(false);
  const [attachments,setAttachments]=useState([]);
  useEffect(()=>{
    
  async function getData(){
   
   const res= await searchDocsByQuery(text.trim());
   setResults(res)
  }
  if(text!=='' && !resultFound){
   getData()
  }
  },[text])
  const items=!resultFound ?( results.map((v,i)=>{
    return <Item key={v.text.substring(0,3)+i} name={v.text} />
  })):[];
  const onResultClick=(e)=>{
    setResultFound(true)
   setText(e.target.textContent)
   results.some(v=>{
     if(v.text===e.target.textContent){
       setAttachments(s=>([...s,v]))
       return true;
     }
   })
  }
  removeFile.setAttachments=setAttachments;
  window.cardAttachments=attachments;
  return (
    <div className="search-bar">
      <h1 className="search-bar__title">Search Files</h1>
      <input
        className="search-bar__input"
        type="text"
        value={text}
        onChange={(e)=>{
          if(resultFound)setResultFound(false);
          const {value}=e.target;
          if(value===text)return;
          setText(value)}}
      />
      <div  onClick={onResultClick}
      className="search-bar__autocomplete-container" >{items}</div>
      <Attachments files={attachments}/>
    </div>
  );
};

const Item = ({name}) => (
  <div
    role="button"
    className="search-bar__autocomplete-item"
  >
    {name}
  </div>
);

const Attachments=({files})=>{
var attachments=files.map((v,i)=>{
  return (<li key={i}><span className="w3-margin-right">{v.text}</span> 
  <button onClick={removeFile} className="w3-btn w3-blue">remove</button></li>)
})
return ReactDOM.createPortal(attachments,
  document.getElementById('emailAttachments').firstElementChild)
}
/*
const renderDocName=(filename)=>{
  var li=document.createElement('li'),
  butt=document.createElement('button');
  butt.onclick=removeFile;
  butt.className='w3-btn w3-blue';
  li.textContent=filename;
  li.appendChild(butt)
  document.getElementById('emailAttachments').firstElementChild.appendChild(li);
}
*/
const removeFile=(e)=>{
  e.preventDefault();
 var spanText=e.target.previousElementSibling.textContent;
 removeFile.setAttachments(s=>s.filter(
  v=>v.text!==spanText))
}
ReactDOM.render(
  <App />,
  document.getElementById('search-bar-container')
);

function onFormSubmit(e){
  e.preventDefault();
  var loader =new cSpinner('admin-wrapper');
  loader.action();
var formData=new FormData(this);
var key,value,data={};
  for([key,value] of formData){
    data[key]=value;
  }
data.files=cardAttachments;

db.collection('emailSender').add(data)
.then((docRef)=>{
var listener=docRef.onSnapshot({
  next:(docSnap)=>{
    if (docSnap.get('status')==='sent'){
      loader.action('off')
      document.getElementById('form-info').textContent='Email to '+docSnap.get('recipient')+' Sent!';
    return   listener();
    }
    if (docSnap.get('status')==='error'){
      loader.action('off');
    document.getElementById('form-info').textContent='Error occured while sending email to '+docSnap.get('recipient')+' Sent!';
    return listener();
    }
  },
  error:(error)=>{
    console.log(error);
    loader.action('off');
    document.getElementById('form-info').textContent='Error occured while sending email to '+docSnap.get('recipient')+' Sent!';
    listener();
  }
})
})
}
initApp();
var db=firebase.firestore();
document.forms.emailForm.onsubmit=onFormSubmit;