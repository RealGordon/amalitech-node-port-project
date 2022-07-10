import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { onLogout } from "./init_app.js"
//var {useState,useEffect}=React;
function w3_open() {
  document.getElementById("mySidebar").style.display = "block";
}

function w3_close() {
  document.getElementById("mySidebar").style.display = "none";
}

const UserCardMenu = ({ name, user }) => {
  const [sendEmail, setSendEmail] = useState({ display: 'hide', state: 'idle' });
  const verify = <button className="w3-bar-item w3-blue w3-btn" onClick={sendEmailVerification} >Verify</button>;
  let emailVerified;
  if (user) ({ emailVerified } = user);
  sendEmailVerification.setSendEmail = emailVerificationQuery.setSendEmail = setSendEmail;
  sendEmailVerification.sendEmail = sendEmail;
  const close = () => {
    setSendEmail(s => ({ ...s, state: 'idle', display: 'hide' }))
  };
  const content = (
    <div className="w3-sidebar w3-bar-block w3-border-right" style={{ display: "none" }}
      id="mySidebar">
      <MessageBox2 close={close}
        display={sendEmail.display} state={sendEmail.state}
        message={sendEmail.message} buttons={sendEmail.state === 'query' ? verify : null} />
      <button onClick={w3_close} className="w3-bar-item w3-large">Close <span className="w3-right">&times;</span></button>
      <button className="w3-bar-item w3-button">{name}</button>
      {emailVerified ? null :
        <button onClick={emailVerificationQuery} className="w3-bar-item w3-button">Verify Email</button>}
      <button id="log-out" onClick={user && onLogout} className="w3-bar-item w3-button">Logout</button>
    </div>);
  let container = document.getElementById('logout-menu');
  if (!container) {
    const body = document.querySelector('body');
    const check = body.children[0];
    // if(check.id!=='logout-menu'){
    container = document.createElement('div');
    container.id = 'logout-menu';
    body.insertBefore(container, check)
    //}
  }
  return ReactDOM.createPortal(content, container)
}
const emailVerificationQuery = (e) => {
  e.stopPropagation();
  if (sendEmailVerification.sendEmail.state === 'fulfilled') {
    return  sendEmailVerification.setSendEmail(s => ({...s,
      display:"show",message:"Email already Sent"}));
    
  };
  emailVerificationQuery.setSendEmail((
    {
      state: 'query', display: 'on',
      message: 'To verify your email address,  click on "Verify" button below'
    }));

}
const sendEmailVerification = () => {
  sendEmailVerification.setSendEmail(s => ({ ...s, state: 'loading' }));
  const currentUser = firebase.auth().currentUser;
  if (currentUser.emailVerified) {
    return sendEmailVerification.setSendEmail(s => ({
      ...s, state: 'fulfilled',
      message: `email account: ${currentUser.email} already verified!`
    }));
  }
  
currentUser.sendEmailVerification().then(() => {
  sendEmailVerification.setSendEmail(s => ({
    ...s, state: 'fulfilled',
    message:
      `Authentication Email sent to ${currentUser.email}! (If authentication email is not found in primary inbox,` +
      'check for it in the spam folder.'
  }))

}, (e) => {
  console.log(e)
  sendEmailVerification.setSendEmail(s => ({
    ...s, state: 'fulfilled',
    message: `Error occurred while sending authentication Email to ${currentUser.email}`
  }))
});
}
const UserCard = ({ name, page, user }) => {

  const userCard = (<div className="w3-right">
    <div id="avatar" className="chip">
      <button onClick={w3_open} style={{ display: "contents" }}>
        <img src={(page === 'index' ? '' : "/static/") + "images/img_avatar_man.png"} alt="Person" width="96" height="96" /></button>
      <span className="w3-hide-small">{name || 'UnKnown User'}</span>
      {user && <UserCardMenu name={name} user={user} />}</div></div>);

  return userCard
}

const site_pages = {
  admin: {
    admin: 'File Upload', adminfilehistory: 'File History',
    siteUsers: 'Users'
  }, user: {
    emailSender: 'Email Sender',
    files: 'Files'
  }
}

export const Navigation = (props) => {
  const { user, page } = props;
  let pages = { index: 'Home' },
    buttons;
  if (!user) {
    pages.signin = 'Sign Up/Login';
    buttons = Object.keys(pages).map((v, i) => {
      if (v === props.page) return null;
      return (<a key={i} className="w3-bar-item w3-button tablink"
        href={v + '.html'}>{pages[v]}</a>)
    });
  }
  else {
    if (user.pos === 'user') {
      pages = { ...pages, ...site_pages.user };
    }
    else if (user.pos === 'admin') pages = { ...pages, ...site_pages.admin };

    buttons = Object.keys(pages).map((v, i) => {
      if (v === props.page) return null;
      return (<NavLink key={i} className="w3-bar-item w3-button tablink"
        to={v === 'index' ? '../index.html' : (page === 'index' ?
          user.pos + '/' : '') + v + '.html'}>{pages[v]}</NavLink>)
    });
  }
  const navigation = (<div className="w3-bar w3-black">
    {buttons}
    <UserCard page={page} name={user ? user.displayName : 'unknown'} user={user} />
  </div>)
  document.getElementById('id0l').style.display = 'none';
  return ReactDOM.createPortal(navigation, document.getElementsByTagName('nav')[0])

}



export const IndexCardMenu = ({ page, user }) => {
  const [searchParams, setSearchParms] = useSearchParams();
  const login = searchParams.get('login');
  const navigate = useNavigate();
  if (page !== 'index') return null;

  let pages = {}, buttons;
  if (!user) {
    pages = pages.signin = 'Sign Up/Login';
    return null;
  }
  else {
    if (user.pos === 'user') {
      pages = { ...pages, ...site_pages.user };
    }
    else if (user.pos === 'admin') pages = { ...pages, ...site_pages.admin };
  }
  const menu_pics = {
    admin: {
      admin: '/static/images/file_icon.png',
      adminfilehistory: '/static/images/file_icon.png',
      siteUsers: '/static/images/img_avatar_woman.png'
    }, user: {
      emailSender: '/static/images/email_icon.jpg',
      files: '/static/images/file_icon.png'
    }
  };
  const onButtonClick = (e) => {
    const { currentTarget } = e;
    const link = currentTarget.dataset.link;
    navigate(link)
    //const aTag=currentTarget.parentElement.firstElementChild;
    //aTag.href=link;
    //aTag.click();
  }
  if (user) {
    buttons = Object.keys(pages).map((v) => {
      return (<div onClick={onButtonClick} key={v} className='w3-card-4 w3-margin w3-light-blue w3-padding w3-animate-left'
        style={{ maxWidth: 300, height: 100 }}
        data-link={'/' + user.pos + '/' + v + '.html'}
      >
        <img src={menu_pics[user.pos][v]} className="w3-left w3-circle w3-margin-right"
          style={{ "width": "50px" }} />
        <p>{pages[v]}</p>
      </div>)
    });
  }


  return <div
    className='w3-main w3-container' style={{ marginLeft: 200 }}>
    <MessageBox state={login ? "on" : "off"} message={'login to access this site'} />
    <a style={{ display: 'none' }} className="w3-bar-item w3-button tablink" />
    {buttons}</div>

}

export const MessageBox = ({ state, message, setModal }) => {
  const [status, setStatus] = useState(null);

  if (state === 'off' || (!setModal && status === 'off')) return null;
  const turnOff = () => {
    if (setModal) return setModal(s => ({ ...s, state: 'off' }));
    setStatus('off');
  }
  return (
    <div id='id02' className="w3-modal" style={{ display: 'block' }}>
      <div className="w3-modal-content  w3-card-4 w3-animate-zoom" style={{ maxHeight: 500, maxWidth: 400 }}>
        <header className="w3-teal w3-container">Message</header>
        <p className="w3-container">{message}</p>
        <div className="w3-container">
          <button onClick={turnOff} className='w3-btn w3-right w3-border w3-white'>Close</button>
        </div>
      </div>
    </div>
  )


}

export const SpinnerLoader = ({ state }) => {
  const spinner = document.getElementById('id0l');
  let change = 'none';
  if (state === 'pending') change = 'block';
  spinner.style.display = change;
  return null
}

function spinnerAction(s) {
  //show or hide spinner
  //var loader=document.getElementById(this.spinner_id),change;
  var wrapper = document.getElementById(this.spinner_id), change;
  if (s) {
    if (s === "off") { wrapper.style.display = "none"; this.status = false }
    else { wrapper.style.display = "block"; this.status = true }
    return
  }

  else {
    if (wrapper.style.display === "none") { change = "block"; this.status = true }
    else { change = "none"; this.status = false }
    wrapper.style.display = change;
  }
  //document.getElementById(loader.parentNode.id).style.display = change;
  //loader.style.display = change;
}
export function cSpinner(spinner_id, x) {
  if (x) this.x = x;
  this.attempt = 0;
  this.spinner_id = spinner_id;
  this.id = Date.now();
}
cSpinner.prototype.action = spinnerAction;

export const MessageBox2 = (props) => {
  const [status, setStatus] = useState(null);
  let { close, message, state, change, display, buttons, component, size } = props;
  if (state === 'loading'||state === 'pending') message = '<h2>loading</h2>';
  if (display === 'hide' || status === 'off') return null;
  if (!message && !component) return null;
  //if( modalState.state==='off')return null;
  const turnOff = () => {
    if (close) return close();
    else if (change) return change(s => ({ ...s, display: 'hide' }));
    setStatus('off')

  }

  const sdprops = { height: "65%" };
  const dprops = { style: sdprops };
  message ? dprops.dangerouslySetInnerHTML = { __html: (message) } : {};
  const styleProps = {};
  switch (size) {
    case 'l':
      styleProps.height = "80%";
      styleProps.maxWidth = "65%";
      break;
    case 'm':
      styleProps.maxWidth = 650;
      styleProps.height = "60%"; break;
    default:
      styleProps.maxWidth = 400; styleProps.height = 300; break;


  }

  const modal = (<div className="w3-modal" style={{ display: 'block' }}
  >
    <div style={styleProps}
      className="w3-modal-content  w3-card-4 w3-animate-zoom"
    >
      <header className="w3-container w3-teal"><h3>Message</h3></header>
      <div className="w3-container"
        {...dprops}
      >{component}</div>
      <footer className="w3-bar w3-center w3-container">

        {buttons && buttons}
        <button onClick={turnOff}
          className='w3-bar-item  w3-btn w3-right w3-border w3-white'>Close</button>
      </footer>
    </div>

  </div>);

  return ReactDOM.createPortal(modal, document.getElementById("id02"))

}