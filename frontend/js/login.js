import { auth } from './firebaseconfig.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import { db } from "./firebaseconfig.js";


//----- Login code start	  

//addEventListener is being used to listen the submit event on the form with id login-form
	  document.getElementById("login-form").addEventListener("submit", function(e) {
		 e.preventDefault();	// to prevent default form submission

		 // since email and password is going to be used throughout the code using var 
		 //.value to get the value of the input in HTML with the respective ids
		  var email =  document.getElementById("username").value;
		  var password = document.getElementById("password").value;

		  //using a firebase function and then an arrow function to handle the promise returned
		  signInWithEmailAndPassword(auth, email, password)
		  .then((userCredential) => {
		    // Signed in 
		    const user = userCredential.user;
		    console.log(user);
		    alert(user.email+" Login successfully!!!");
		    document.getElementById('logout').style.display = 'block';
		    // ...
		  })
		  .catch((error) => {// to catch any error during sign in
		    const errorCode = error.code;
		    const errorMessage = error.message;
		    console.log(errorMessage);
		    alert(errorMessage);
			//error is displayed in the console and also as an alert
		  });		  		  
	  });
	  //----- End of Login code

	  /** Js code to login with Metamask */
	  document
  .getElementById("metamaskLogin")
  .addEventListener("click", loginWithMetaMask);

async function loginWithMetaMask() {
  try {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    // 1️⃣ Get wallet
    const accounts = await ethereum.request({
      method: "eth_requestAccounts"
    });
    const walletAddress = accounts[0];

    // 2️⃣ Sign login message
    const message = `Login to FIR Portal at ${new Date().toISOString()}`;
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [message, walletAddress]
    });

    // 3️⃣ Check Firestore for existing user
    const userRef = doc(db, "users", walletAddress);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("Wallet not registered. Please sign up first.");
      return;
    }

    // 4️⃣ Login success
    alert("MetaMask login successful!");

    // Optional: store session locally
    localStorage.setItem("walletAddress", walletAddress);

    // Redirect
    window.location.href = "home.html";

  } catch (err) {
    console.error(err);
    alert("MetaMask login failed");
  }
}




	  //----- Logout code start	  
	  document.getElementById("logout").addEventListener("click", function() {
		  signOut(auth).then(() => {
			  // Sign-out successful.
			  console.log('Sign-out successful.');
			  alert('Sign-out successful.');
			  document.getElementById('logout').style.display = 'none';
			}).catch((error) => {
			  // An error happened.
			  console.log('An error happened.');
			});		  		  
	});
	//End
