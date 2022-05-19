const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();
exports.createUserDoc = functions.auth.user().onCreate(async (user) => {
    // [END onCreateTrigger]
      // [START eventAttributes]
      const email = user.email; // The email of the user.
      const displayName = user.displayName; // The display name of the user.
      // [END eventAttributes]
      await admin.firestore().collection(
          'users').add(
          {
             name:displayName,
            email:email,
            status:true,
            uid:user.uid,
            test:'local functions'
        });
      
    });
    //firebase functions:config:set gmail.email="myusername@gmail.com" gmail.password="secretpassword"
    const gmailEmail ='sukuuhubonline@gmail.com'; //functions.config().gmail.email;
    const gmailPassword = '###123hub';//functions.config().gmail.password;
    const mailTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailEmail,
        pass: gmailPassword,
      },
    });
    async function sendEmail(recipientEmail, displayName, APP_NAME,text,fileBlob,fn) {
        const mailOptions = {
          from: `${APP_NAME} <noreply@amalitech.org>`,
          to: recipientEmail,
          attachments:[{filename:fn||'file.jpg',content:fileBlob}]
        };
      
        // The user subscribed to the newsletter.
        mailOptions.subject = text.subject;
        mailOptions.text = text.message;
        await mailTransport.sendMail(mailOptions);
        //functions.logger.log('New welcome email sent to:', recipientEmail);
        return null;
      }
      

    // Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.SendUserEmail = functions.firestore.document('/emailSender/{documentId}')
.onCreate(async (snap, context) => {
  // Grab the current value of what was written to Firestore.
  const data=snap.data();
  const text = data.text;
  const recipient= data.recipient;
  const sender=data.sender||'firestore@tester.org';
  const company=data.company||'card distributer';
  const fileName=data.category+'/'+data.filename;
  //TODO : download the file

  const storage=admin.storage();
  const fileBlob = await storage.bucket().file(fileName).download();
  try{
  await sendEmail(recipient, sender, company,text,fileBlob,data.filename)
  }catch{
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
  admin.firestore().collection('emailSender').doc(context.params.documentId)
  .set({status:'sent'},{merge:true})
});
async function downloadIntoMemory() {
  // Downloads the file into a buffer in memory.
  const contents = await storage.bucket(bucketName).file(fileName).download();

  console.log(
    `Contents of gs://${bucketName}/${fileName} are ${contents.toString()}.`
  );
}
