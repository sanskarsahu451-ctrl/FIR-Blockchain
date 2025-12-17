  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
  import { getAuth, createUserWithEmailAndPassword , signInWithEmailAndPassword , signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDUSCjcZGsIjkLatSgjJcbtw31MO1hFhf8",
    authDomain: "fir-blockchain-system.firebaseapp.com",
    projectId: "fir-blockchain-system",
    storageBucket: "fir-blockchain-system.firebasestorage.app",
    messagingSenderId: "168639946908",
    appId: "1:168639946908:web:0ee8e1a8def933f3c64d59",
    measurementId: "G-E2BXYHW1CX"
  };

  // Initialize Firebase
  export const app = initializeApp(firebaseConfig);
  export const analytics = getAnalytics(app);
  export const auth = getAuth(app);
  export const db = getFirestore(app);
  console.log(app);

