import { auth } from "./firebaseconfig.js";
import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import { db } from "./firebaseconfig.js";

//----- Sign-Up code start
const signupForm = document.getElementById('sign-up-form');

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = signupForm['username'].value;
  const password = signupForm['password'].value;

  createUserWithEmailAndPassword(auth, username, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);
      alert("Registration successful!!");
    })
    .catch((error) => {
      console.log(error.message);
      alert(error.message);
    });
});
//----- End of Sign-Up code

document
  .getElementById("metamaskSignup")
  .addEventListener("click", signupWithMetaMask);

async function signupWithMetaMask() {
  try {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    await signOut(auth);// Logging out if already logged in

    // Get wallet
    const accounts = await ethereum.request({
      method: "eth_requestAccounts"
    });
    const walletAddress = accounts[0];

    // Sign message
    const message = `Sign Up to FIR Portal at ${new Date().toISOString()}`;
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [message, walletAddress]
    });

    // Check Firestore
    const userRef = doc(db, "users", walletAddress);
    const userSnap = await getDoc(userRef);

    // Create Firebase user ONLY if new wallet
    if (!userSnap.exists()) {
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      await setDoc(userRef, {
        uid: uid,
        walletAddress: walletAddress,
        role: "citizen",
        createdAt: new Date(),
        signature: signature
      });

      alert("New MetaMask user registered successfully!");
    } else {
      alert("Wallet already registered. Logging in...");
    }

  } catch (err) {
    console.error(err);
    alert("MetaMask signup failed");
  }
}
