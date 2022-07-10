import React  from "react";
// --------------- API:BEGIN --------------
/**
 * Search users by name
 * @param {string} query - The query to search users by
 * @return {Promise<{ name: string; email: string; }[]>} Search result
 */



const searchDocsByQuery=(query,user)=>{
  query=query.split(' ');
  return new Promise(
    (resolve)=>{
      const db=firebase.firestore();
db.collection('users').doc(user.uid.substring(0,10)).collection("files")
.where('tags','array-contains-any',query)
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
       fileId:data.fileId,filename:data.filename,docId:doc.id})
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

export const Search = (props) => {
  const {useState,useEffect}=React;
  const [text,setText]=useState('');
  const [results,setResults]=useState({res:[],state:'idle'})
  const [resultFound,setResultFound]=useState(true);
  const [attachments,setAttachments]=useState([]);
  useEffect(()=>{
    
  async function getData(){
   
   const res= await searchDocsByQuery(text.trim(),props.user);
   setResults(s=>({...s,res,state:'fulfilled'}));
   //setResultFound(true)
  }
  if(text!=='' && results.state==='search'){
   getData()
  }
  },[results.state,text])
  const items=!resultFound && results.state=='fulfilled' && text==results.text ?( results.res.map((v,i)=>{
    return <Item key={v.text.substring(0,3)+i} name={v.text} />
  })):[];
  const onResultClick=(e)=>{
    setResultFound(true)
   setText(e.target.textContent)
   results.res.some(v=>{
     if(v.text===e.target.textContent){
       setAttachments(s=>([...s,v]))
       return true;
     }
   })
  }
  removeFile.setAttachments=setAttachments;
  window.cardAttachments=attachments;
  var showitems="w3-dropdown-content w3-bar-block w3-card w3-light-grey";
  if(items.length!==0)showitems+=' w3-show';
  const onButtonClick=(e)=>{
    e.stopPropagation();
  setResultFound(false);
 setResults(s=>({...s,text,state:"search"})) ;
 
   
  }
  return (<>
    <div id="search-bar-container" className="w3-container">
    <div className="w3-dropdown">
      <h3 >Search Files</h3>
      <div style={{maxWidth:"700px",display:'flex'}}>
     
      <input
        className="w3-input w3-padding w3-border"
        type="text"
        value={text}
        onChange={(e)=>{
          const {value}=e.target;
          if(value===text)return;
          setText(value)
        }}
          placeholder='search the name of file,ext...'
      />
      <button type="button" onClick={onButtonClick} className="w3-button w3-blue w3-right">search</button>
      </div>
      <ul  onClick={onResultClick}
      className={showitems} >{items}</ul>
     
    </div></div>
     <Attachments files={attachments}/>
     </>
  );
  

};

const Item = ({name}) => (
  <li
    role="button"
    className="w3-bar-item w3-button"
  >
    {name}
  </li>
);

const Attachments=({files})=>{
var attachments=files.map((v,i)=>{
  return (<li  key={i}><span style={{overflowX:'hidden'}} className="w3-margin-right">{v.text}</span> 
  <span  role="button" onClick={removeFile} className="w3-right w3-blue">&times;</span></li>)
})
return <div id="emailAttachments" className="w3-margin-top">
<ul className="w3-ul w3-card-4 w3-hoverable">{attachments}</ul>
</div>
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




//document.forms.emailForm.onsubmit=onFormSubmit;


//const LocalComponent=Search;
//const container=document.getElementById('search-bar-container');
const db=firebase.firestore();