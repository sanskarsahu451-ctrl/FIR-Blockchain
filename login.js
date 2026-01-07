import { auth } from './firebaseconfig.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

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
	  document.getElementById("metamaskLogin").addEventListener("click", loginWithMetaMask);//event listener for button click

	async function loginWithMetaMask() {//async function to check metamask and get wallet address
      if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    const accounts = await ethereum.request({
     method: "eth_requestAccounts"
     });

    const walletAddress = accounts[0];

    const message = `Login to FIR Portal at ${new Date().toISOString()}`;

    const signature = await ethereum.request({
    method: "personal_sign",
    params: [message, walletAddress]
  });

  // Store proof in Firestore
  await setDoc(doc(db, "walletUsers", walletAddress), {
    wallet: walletAddress,
    signature,
    message,
    linkedAt: serverTimestamp()
  });

  alert("MetaMask verified successfully");
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
	  //----- End
