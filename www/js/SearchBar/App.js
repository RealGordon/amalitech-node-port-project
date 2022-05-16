// --------------- API:BEGIN --------------

faker.seed(42);

const users = Array.from({ length: 100 }).map(() => ({
  name: faker.name.findName(),
  email: faker.internet.email(),
}));

const fuse = new Fuse(users, {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ['name'],
});

/**
 * Search users by name
 * @param {string} query - The query to search users by
 * @return {Promise<{ name: string; email: string; }[]>} Search result
 */
const searchUsersByName = (query) => new Promise((resolve) => resolve(fuse.search(query)));

// ---------------- API:END ---------------
const searchDocsByQuery=(query)=>{
  query=query.split(' ');
  return new Promise(
    (resolve)=>{
var col_list=db.collection("users").doc(id).collection('files')
.where('tags','array-contains-any',query)
//.where('tg','==',_this.target_id)
//.where('d','==',d)
//.where("tu_s","==",unique_serial)
//.orderBy('last_time','desc')
.limit(10)
.get()
.then((querySnapshot) => {
 var  resultArray=[];
  
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        var data=doc.data();
       resultArray.push({text:data.title+" ( "+data.filename+" )",id:data.fileId})
    });
  resolve(resultArray);
  
})
.catch((error) => {
    console.log("Error getting documents: ", error);
})
}
)
}

const App = () => {
  const {useState,useEffect}=React;
  const [text,setText]=useState('');
  const [results,setResults]=useState([])
  const [resultFound,setResultFound]=useState(false);
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
  }
  return (
    <div className="search-bar">
      <h1 className="search-bar__title">Search Users</h1>
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


ReactDOM.render(
  <App />,
  document.getElementById('search-bar-container')
);
