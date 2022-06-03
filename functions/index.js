

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();
const PROJECT_BUCKET='amalitech-node-project.appspot.com';
exports.createUserDoc = functions.auth.user().onCreate(async (user) => {
    // [END onCreateTrigger]
      // [START eventAttributes]
      const email = user.email; // The email of the user.
      const displayName = user.displayName; // The display name of the user.
      // [END eventAttributes]
      try{
      await admin.firestore().collection(
          'users').doc(user.uid.substring(0,10)).set(
          {
             name:displayName,
            email:email,
            status:true,
            id:user.uid,
            test:'local functions'
        });
        functions.logger.log('user created success ',email);
      }
      catch(e){
        functions.logger.log('user creation error ',email);
        functions.logger.log(e);
      }
      
    });
    //firebase functions:config:set gmail.email="myusername@gmail.com" gmail.password="secretpassword"
    const gmailEmail =functions.config().gmail.email;
    const gmailPassword =functions.config().gmail.password;
    const mailTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailEmail,
        pass: gmailPassword,
      },
    });
    async function sendEmail(recipientEmail, displayName, APP_NAME,text,attachments) {
      
      const mailOptions = {
          from: `${APP_NAME} <noreply@carddistributer.org>`,
          to: recipientEmail,
          //attachments:[{filename:fn||'file.jpg',content:fileBlob}]
          attachments:attachments
        };
      
        // The user subscribed to the newsletter.
        mailOptions.subject = text.subject;
        mailOptions.text = text.message;
        await mailTransport.sendMail(mailOptions);
        //functions.logger.log('New welcome email sent to:', recipientEmail);
        return null;
      }
      

// Listens for new messages added to /messages/:documentId/
// and changes value  at  /messages/:documentId/status
exports.SendUserEmail = functions.firestore.document('/emailSender/{documentId}')
.onCreate(async (snap, context) => {
  // Grab the current value of what was written to Firestore.
  const data=snap.data();
  const text = {message:data.message,subject:data.subject};
  const recipient= data.recipient;
  const sender=data.sender||'firestore@tester.org';
  const company=data.company||'card distributer';
  const files=data.files;
  const fileAttactments=[];

  const storage=admin.storage();
  
  if (files.length<=3){
  files.forEach((file)=>{
    const filePath=file.fileId;
    try{
   const fileBlob = await storage.bucket(PROJECT_BUCKET).file(
       filePath).download();
       fileAttactments.push({content:fileBlob[0],filename:file.filename})
     }
     catch(e){
       functions.logger.log('error occurred while downloading file from gcs ',
       file.filename);
     }
  })}
  
  try{
  await sendEmail(recipient, sender, company,text,fileAttactments);
  await admin.firestore().collection('emailSender').doc(context.params.documentId)
  .set({status:'sent'},{merge:true})
  }catch (e){
    functions.logger.log('error occurred while sending email for ',recipient);
    functions.logger.log(e);
   return  admin.firestore().collection('emailSender').doc(context.params.documentId)
    .set({status:'error'},{merge:true})
  }
  // Access the parameter `{documentId}` with `context.params`
  //functions.logger.log('Uppercasing', context.params.documentId, original);
  
  //const uppercase = original.toUpperCase();
  
  // You must return a Promise when performing asynchronous tasks inside a Functions
  // such as
  // writing to Firestore.
  // Setting an 'uppercase' field in Firestore document returns a Promise.
  //return snap.ref.parent.parent.parent.doc()set({uppercase}, {merge: true});
  
});
async function downloadIntoMemory() {
  // Downloads the file into a buffer in memory.
  const contents = await storage.bucket(bucketName).file(fileName).download();

  console.log(
    `Contents of gs://${bucketName}/${fileName} are ${contents.toString()}.`
  );
}
