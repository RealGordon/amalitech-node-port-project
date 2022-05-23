
      initApp = async function(startFunc) {
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var uid = user.uid;
            var phoneNumber = user.phoneNumber;
            var providerData = user.providerData;
            window.user={uid};
            if(startFunc)startFunc(user);
            document.getElementById('avatar').children[1].textContent = displayName;
            /*
            user.getIdToken().then(function(accessToken) {
              document.getElementById('sign-in-status').textContent = 'Signed in';
              
              document.getElementById('account-details').textContent = JSON.stringify({
                displayName: displayName,
                email: email,
                emailVerified: emailVerified,
                phoneNumber: phoneNumber,
                photoURL: photoURL,
                uid: uid,
                accessToken: accessToken,
                providerData: providerData
              }, null, '  ');
            });*/
          } else {
            // User is signed out.
            console.log('Signed out')
            console.log('account-details null')
            /*
            document.getElementById('sign-in-status').textContent = 'Signed out';  
            document.getElementById('account-details').textContent = 'null';
            */
          }
        }, function(error) {
          console.log(error);
        });
      };
   
     