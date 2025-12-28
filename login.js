import { auth } from './firebaseconfig.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

//----- Login code start	  
	  document.getElementById("login-form").addEventListener("submit", function(e) {
		 e.preventDefault();	
		  var email =  document.getElementById("username").value;
		  var password = document.getElementById("password").value;

		  signInWithEmailAndPassword(auth, email, password)
		  .then((userCredential) => {
		    // Signed in 
		    const user = userCredential.user;
		    console.log(user);
		    alert(user.email+" Login successfully!!!");
		    document.getElementById('logout').style.display = 'block';
		    // ...
		  })
		  .catch((error) => {
		    const errorCode = error.code;
		    const errorMessage = error.message;
		    console.log(errorMessage);
		    alert(errorMessage);
		  });		  		  
	  });
	  //----- End of Login code

	  //----- Logout code start	  
	  document.getElementById("logout").addEventListener("submit", function() {
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
