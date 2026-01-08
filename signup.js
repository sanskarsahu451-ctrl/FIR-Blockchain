import { auth } from './firebaseconfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// signup form
const signupForm = document.getElementById('sign-up-form');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = signupForm['username'].value;
    const password = signupForm['password'].value;

    createUserWithEmailAndPassword(auth, username, password)//using firebase function we can create user with email and password
		  .then((userCredential) => {
		    // Signed in 
		    const user = userCredential.user;
		    console.log(user);
		    alert("Registration successful!!");
		    // ...
		  })
		  .catch((error) => {
		    const errorCode = error.code;
		    const errorMessage = error.message;
		    // ..
		    console.log(errorMessage);
		    alert(error);
		  });
});
