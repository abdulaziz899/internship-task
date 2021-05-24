import React, { useState } from 'react';
import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

if (!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: '',
    username:''
  })
  const handleBlur = (e) => {
    let isFieldValid = true;
    if(e.target.name === 'email'){
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
      console.log(isFieldValid);
    }
    if(e.target.name === 'password'){
      const isPasswordValid = e.target.value.length > 8;
      const passwordHasNumber =  /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if(e.target.name === 'username'){
      const isUserNameValid = e.target.value.length > 6;
      const userNameHasNumber =  /\d{1}/.test(e.target.value);
      isFieldValid = isUserNameValid && userNameHasNumber;
      console.log(isFieldValid);
    }
    if(isFieldValid){
      const newUserInfo = {...user};
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  }
  const handleSubmit = (e) => {
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then( res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        newUserInfo.loginSuccess = false;
        setUser(newUserInfo);
        updateUserName(user.name);
      })
      .catch( error => {
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      });
    }

    if(!newUser && (user.email||user.username) && user.password){
      firebase.auth().signInWithEmailAndPassword((user.email||user.username), user.password)
      .then(res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.loginSuccess = true;
        newUserInfo.success = false;
        setUser(newUserInfo);
        console.log('sign in user info', res.user);
      })
      .catch(function(error) {
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.loginSuccess = false;
        setUser(newUserInfo);
      });
    }

    e.preventDefault();
  }

  const updateUserName = name =>{
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function() {
      console.log('user name updated successfully')
    }).catch(function(error) {
      console.log(error)
    });
  }

  return (
    <div className="App">
      <div className='fromContainer'>
        <h1>{newUser?"Sing up":"Login"}  From</h1>
        <form  onSubmit={handleSubmit}>
          {newUser&& <div>
            <input className="inputField"  name="name" type="text" onBlur={handleBlur} placeholder="Your name"/>
            <input className="inputField"  name="username" type="text" onBlur={handleBlur} required placeholder="user name"/>
            <input className="inputField"  name="email" type="email" onBlur={handleBlur} required placeholder="your email"/>
            <input className="inputField"   name="password" type="password" onBlur={handleBlur} required placeholder="your password"/>
          </div>}
          {!newUser &&<div>
            <input className="inputField"  type="text" name={!newUser && (user.email||user.username)} onBlur={handleBlur} placeholder="Your username/Email address" required/>
            <input className="inputField"   type="password" name="password" onBlur={handleBlur} placeholder="Your Password" required/>
          </div>}
          <input className="inputSubmit"  type="submit" value={newUser ? 'Sign up' : 'Sign in'}/>
        </form>
        <div >
          <input  type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id=""/>
          <label  htmlFor="newUser">New User Sign up</label>
        </div>
      </div>
      <p style={{color: 'red'}}>{user.error}</p>
      { user.success && newUser&& <p style={{color: 'green'}}>User created successfully</p>}
      { user.loginSuccess && !newUser&& <p style={{color: 'green'}}>UserLogged In successfully</p>}
    </div>
  );
}

export default App;