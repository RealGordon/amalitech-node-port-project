// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');
const { Firestore }=require('@google-cloud/firestore')
// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
//const { firestore } = require('firebase-admin');
admin.initializeApp();

const PROJECT_BUCKET = 'amalitech-node-project.appspot.com';
exports.createUserDoc = functions.auth.user().onCreate(async (user) => {
  // [END onCreateTrigger]
  // [START eventAttributes]
  const email = user.email; // The email of the user.
  const displayName = user.displayName; // The display name of the user.
  // [END eventAttributes]
  try {
    await admin.firestore().collection(
      'users').doc(user.uid.substring(0, 10)).set(
        {
          name: displayName,
          email: email,
          status: false,
          id: user.uid,
          test: 'local functions'
        });
    functions.logger.log('user created success ', email);
  }
  catch (e) {
    functions.logger.log('user creation error ', email);
    functions.logger.log(e);
  }

});




// Listens for new messages added to /emailSender/:documentId/
// and changes value  at  /emailSender/:documentId/status
exports.SendUserEmail = functions.firestore.document('/emailSender/{documentId}')
  .onCreate(async (snap, context) => {
    // Grab the current value of what was written to Firestore.
    const gmailEmail = functions.config().gmail.email;
    const gmailPassword = functions.config().gmail.password;

    const emailTransporter = nodemailer.createTransport({
      host: 'smtp.mail.yahoo.com',
      port: 465,// or 587
      service:'yahoo',
      secure: false,
      auth: {
         user: gmailEmail,
         pass: gmailPassword
      },
      debug: false,
      logger: true 
    });
    async function sendEmail(recipientEmail, displayName, APP_NAME, text, attachments) {
    
      const mailOptions = {
        from: gmailEmail,
        to: recipientEmail,
        //attachments:[{filename:fn||'file.jpg',content:fileBlob}]
        attachments: attachments
      };
    
      // The user subscribed to the newsletter.
      mailOptions.subject = text.subject;
      mailOptions.text = text.message;
      await emailTransporter.sendMail(mailOptions);
      //functions.logger.log('New welcome email sent to:', recipientEmail);
      return null;
    }
    
    const data = snap.data();
    const text = { message: data.message, subject: data.subject };
    const recipient = data.recipient;
    const sender = data.sender || 'firestore@tester.org';
    const company = data.company || 'card distributer';
    const files = data.files;
    const fileAttactments = [];
    let attachments;
    const storage = admin.storage();

    for (const file  of files) {
    
        const filePath = file.fileId;
        try {
          const fileBlob = await storage.bucket(PROJECT_BUCKET).file(
            filePath).download();
          fileAttactments.push({ docId: file.docId, content: fileBlob[0], 
            filename: file.filename })
        }
        catch (e) {
          functions.logger.log('error occurred while downloading file from gcs ',
            file.filename);
        }
   
    }
    const firestore = new Firestore();//  
    const firestore1=admin.firestore();
    try {
      attachments=fileAttactments.map(v=>{
        const nv={...v};
        delete nv['docId'];
        return nv;
      });
      await sendEmail(recipient, sender, company, text, attachments);
      const batch = firestore.batch();

      const emailRef = firestore.doc('emailSender/'+context.params.documentId)
      batch.update(emailRef, { status: 'sent' })

      fileAttactments.forEach((file) => {
        const fileRef = firestore.doc('files/'+file.docId);
        batch.update(fileRef, { emails:Firestore.FieldValue.increment(1) })
      }
      )
      //send notifations
      await batch.commit()
    } catch (e) {
      functions.logger.log('error occurred while sending email for ', recipient);
      functions.logger.log(e);
      firestore1.collection('emailSender').doc(context.params.documentId)
        .set({ status: 'error' }, { merge: true })
    }
   

  });
  
  
  exports.newUserActivate = async (event, context) => {
    //const resource = context.resource;
     const firestore = new Firestore();
     const docId=event.value.name.split('/documents/activation/')[1];
     try{
     const  oldDoc= await firestore.collection('activationOut').doc(docId).get();
     const fields=event.value.fields;
       const userUID=fields.user.stringValue;
       const operation=fields.o.stringValue;
       const serial=fields.s.stringValue;
       const email=fields.email.stringValue;
       const pos=fields.pos.stringValue;
     if (oldDoc.exists){
        const oldDocData=oldDoc.data();
        if(serial===oldDocData.serial && operation ===oldDocData.operation)return null;
     }
     
       const customClaims={};
       admin.initializeApp();
      const  Auth=admin.auth();
       const userRecord= await Auth.getUser(userUID);
      if(operation==='activate'){
        customClaims.status=true;
        customClaims.pos='user';
      if( userRecord.customClaims.pos==='user' && userRecord.customClaims.status===true) return null;
      }
      else if(operation==='deactivate' && pos==='user'){
          customClaims.status=false;
          customClaims.pos='user';
          if( userRecord.customClaims.pos==='user' && userRecord.customClaims.status===false) return null;
      }
      else return null;
     
     
        
        await Auth.setCustomUserClaims(userUID,customClaims);
      let date;
  
      const userDoc=firestore.collection('users').doc(docId);
      const sigRef = firestore.collection('activationOut').doc(docId);
      const batch = firestore.batch();
      const userRef=firestore.collection('users').doc(docId).
      collection('activation').doc('history');
      date=new Date();
      batch.update(userDoc,{ time: date,r:'success',status:true,serial })
      .set(sigRef, { time:date,r:'success',s:serial ,e:email,o:operation})
      .set(userRef, {[operation]:Firestore.FieldValue.arrayUnion(
        { time: date,r:'success' ,s:serial})},{merge:true});
       await  batch.commit();
        console.log(`account ${operation}  for ${email}`);
      
        } catch (e) {
        await firestore.collection('activationOut').doc(docId)
          .set({o:operation, time: new Date(),r:'fail',s:serial }, { merge: true });
          console.log(`error occurred while ${operation} account for ${email}`);
          console.log(e)
        }
        return null;
    
  
  
  };

async function downloadIntoMemory() {
  // Downloads the file into a buffer in memory.
  const contents = await storage.bucket(bucketName).file(fileName).download();

  console.log(
    `Contents of gs://${bucketName}/${fileName} are ${contents.toString()}.`
  );
}
