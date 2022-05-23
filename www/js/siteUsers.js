var db;
function loadFiles(reactLoader){
db=firebase.firestore();
db.collection('users').limit(10).get()
.then((querysnap)=>{
   results=new Array(querysnap.docs.length);
    querysnap.forEach(snap => {
        results.push(snap.data())
    });
    reactLoader({docs:results,status:'fulfilled'})
})
}
const onRemove=()=>{
    e.stopPropagation();
    const spans=e.target.parent.querySelectorAll('span');
    const email=spans[2].textContent;
    const name=spans[1].textContent;
    onRemove.setDocs(s=>{
        return {...s,docs:s.docs.filter(v=>(v.email!==email && v.name!==name))} 
    })
}
const onActivate=(e)=>{
    e.stopPropagation();
    if(e.target.tagName.toLowerCase()!=='button')return;
    const spans=e.currentTarget.querySelectorAll('span');
    const email=spans[2].textContent;
    const name=spans[1].textContent;
   const targetDoc=onActivate.docs.find(snap=>(snap.name===name && snap.email===email));
    db.collection('users').doc(targetDoc.id.substring(0,10)).update({status:true})
    .then(()=>{
        onActivate.setDocs(s=>{
            return {docs:s.map(snap=>{
                if(snap.name===name && snap.email===email){
                    return (snap.status=true,snap);
                };
                return snap
            }),
            status:'fulfilled'}
            
        })
    })
}
const Users=()=>{
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
  onActivate.setDocs=onRemove.setDocs=setDocs;
  onActivate.docs=docs;


  const users=docs.map((snap,i)=>{
    return (<li  onClick={onActivate} key={i} className="w3-padding-hor-16">
<span onClick={onRemove} 
   className="w3-closebtn w3-padding w3-margin-right w3-large">×</span>
   <ActivateButton  activated={snap.status} />
   <img src="images/img_avatar_man.png" className="w3-left w3-circle w3-margin-right" 
   style={{"width":"50px"}} />
   <span className="w3-large">{snap.name}</span><br />
   <span>{snap.email}</span>
 </li>)
  })
  return users
  }

const ActivateButton=({activated})=>{
 if(activated)return  (<img src="images/tick_mark.png" 
 className="w3-left w3-circle w3-margin-right" 
 style={{"width":"40px"}} />);
return <button  className="w3-margin-right w3-btn w3-blue"
>Activate</button>
  }
function startFunc(){
  
   ReactDOM.render(<Users />, document.getElementById('user-list'))
  
}
initApp(startFunc)
