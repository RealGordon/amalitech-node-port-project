
document.forms.docForm.onsubmit=function(e){
    e.preventDefault();
    var storageRef = firebase.storage().ref();
    var cardFile=this.cardFile;
    var file=cardFile.files[0];
    var category=this.category.value!=='other'?this.category.value:this.otherCategory.value;
    var name=(category!=='other'?category:'other')+'/'+(Math.random()*10000).toString(6);
    var fileRef=storageRef.child(name);
   
   
    //add user info
    var metadata={
        category:category,size:(""+file.size),
    customerId:this.customerId.value};
    
    //upload the file
    fileRef.put(file,metadata).then((snapshot) => {
        console.log('Uploaded '+file.name);
      });
}