import React,{ useState,useEffect } from "react";
import { MessageBox,cSpinner } from "../General";
var db;
function loadFiles(reactLoader){
db=firebase.firestore();
db.collection('users').limit(10).get()
.then((querysnap)=>{
   const results=new Array();
    querysnap.forEach(snap => {
        results.push(snap.data())
    });
    reactLoader({docs:results,status:'fulfilled'})
},(e)=>{
reactLoader({docs:[],status:'fulfilled'})
console.log(e);
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
    const buttText=e.target.textContent;
    const loader=new cSpinner("id0l");
    loader.action();
    const spans=e.currentTarget.querySelectorAll('span');
    onActivate.setDocs(s=>{
      return ({...s,docs:s.docs.map(snap=>{
          if( snap.email===email){
              return ({...snap,loading:'pending'});
          };
          return snap
      })
    })
  });

    const email=spans[spans.length-1].textContent;
    const targetDoc=onActivate.docs.find(snap=>( snap.email===email));
    let   updateText= {user:targetDoc.id ,time:new Date(),
      o:'deactivate',status:false,pos:'user',email,s:(Math.random()*1e7).toString(6)},collection='activation';
    if(buttText==='Activate'){
       updateText= {...updateText, o:'activate',status:true};
      
    }
    
   
   const docRef=db.collection(collection).doc(targetDoc.id.substring(0,10));
   const firestoreActivate=async ()=>{
   await docRef.set(updateText,{merge:true});
    const listener=db.collection('activationOut').doc(targetDoc.id.substring(0,10))
    .onSnapshot({
      next:(docSnap)=>{
        const data=docSnap.data();
        console.log(data)
        onActivate.setDocs(s=>{
            return ({docs:s.docs.map(snap=>{
             
                if( snap.email===data.e){
                  let status=snap.status;
                  if(data.r==='success'){
                  if(data.o==='activate' ){
                    status=true
                  }
                  else if(data.o==='deactivate' ){
                    status=false
                  }
                }
                  console.log('idle')
                    return ({...snap,...data,status,loading:'idle'});
                
                  
                };
                return snap
            }),
            status:'fulfilled'})
            
        });
        loader.action('off');
        onActivate.setModal(s=>({state:'on',message:'operation '+(data.r)+ ' for '+email}));
        if(listener)listener();
    },error:(e)=>{
      console.log(e);
      loader.action('off');
      onActivate.setModal(s=>({state:'on',message:'operation failure'}));
      onActivate.setDocs(s=>{
        return ({docs:s.docs.map(snap=>{
            if( snap.email===email){ 
              console.log('e: idle')  
                return ({...snap,loading:'idle'});
            };
            return snap
        }),
        status:'fulfilled'})
        
    })
      
      if(listener)listener();
    }})
  }
  firestoreActivate();
}
export const Users=()=>{
    const [Docs,setDocs]=useState({docs:[],status:'pending'});
    const [modal,setModal]=useState({state:'off',message:''});
  const {docs,status}=Docs;
  useEffect(()=>{
   
    loadFiles(setDocs)
    
  },[])
  
  if(docs.length==0 && (status==='fulfilled')){
    return (<h2>No Site Users</h2>);}
  if(docs.length==0 && (status==='idle' ||status==='pending')){
    return (<h2>Loading ...</h2>);
  }
  onActivate.setDocs=onRemove.setDocs=setDocs;
  onActivate.docs=docs;
  onActivate.setModal=setModal;

 
  const users=docs.map((snap)=>{
    return (<LineItem onActivate={onActivate}  snap={snap} key={snap.id}  />)
  })
  return (<React.Fragment> 
    <MessageBox  state={modal.state} message={modal.message} setModal={setModal} />
    <ul id="user-list" className="w3-ul w3-card-4">{users}
  </ul></React.Fragment>)
  }

const ActivateButton=({pos,status,loading})=>{
 /*
 if()return  (<img src="images/tick_mark.png" 
 className="w3-left w3-circle w3-margin-right" 
 style={{"width":"40px"}} />);*/
 if(pos==='admin')return null;
 if(loading==='pending')return (<span className="w3-right">loading..</span>);
return (<button  className="w3-margin-right w3-btn w3-blue w3-right"
>{pos==='user' && status?'Deactivate':'Activate'}</button>)
  }

const LineItem=(props)=>{
const { onActivate,snap}=props;

    return (<li  onClick={onActivate}  className="w3-padding-hor-16">
   
    {false && (<span onClick={onRemove} 
 className="w3-closebtn w3-padding w3-margin-right w3-large">×</span>)}
 <ActivateButton loading={snap.loading}  pos={snap.pos} status={snap.status} />
 <img src="/static/images/img_avatar_man.png" 
 className="w3-left w3-circle w3-margin-right" 
 style={{"width":"50px"}} />
 <span className="w3-large">{snap.pos||'unknown'}</span><br />
 <span >{snap.email}</span>
</li>)
  }
/*
function startFunc(){
  
   ReactDOM.render(<Users />, document.getElementById('user-list'))
  
}
*/
//window.LocalComponent=Users;
//window.container=document.getElementById('user-list');
