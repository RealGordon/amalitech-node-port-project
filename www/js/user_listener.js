
  var  initApp = async function(startFunc) {
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            //var photoURL = user.photoURL;
            var uid = user.uid;
            //var phoneNumber = user.phoneNumber;
            //var providerData = user.providerData;
            user.getIdTokenResult().then(({claims})=>{ 
              if(startFunc)startFunc({email,displayName,uid,
                pos:claims.pos,status:claims.status,emailVerified});
            }).catch((e)=>{
              console.log(e);
              if(startFunc)startFunc(null,e);
            })
           
         
          } else {
            // User is signed out.
            console.log('Signed out')
            console.log('account-details null')
            if(startFunc)startFunc(null);
           
          }
        }, function(error) {
          console.log(error);
        });
      };
   
     