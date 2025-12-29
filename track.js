import { db, auth } from "./firebaseconfig.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* --------------------------------------------------
   AUTH CHECK
-------------------------------------------------- */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please login first");
    window.location.replace("login.html");
  }
});

/* --------------------------------------------------
   TRACK FIR
-------------------------------------------------- */
window.trackFIR = async function () {

  const firIdInput = document.getElementById("firIdInput").value.trim();

  if (firIdInput === "") {
    alert("Please enter FIR ID");
    return;
  }

  const firRef = doc(db, "firs", firIdInput);
  const firSnap = await getDoc(firRef);

  if (!firSnap.exists()) {
    alert("FIR not found");
    return;
  }

  const firDoc = firSnap.data();
  const data = firDoc.data;

  /* 🔹 Fill dynamic data */
  document.getElementById("firId").innerText = firDoc.firId;
  document.getElementById("status").innerText = data.status;
  document.getElementById("officer").innerText =
    data.assignedOfficer || "Not assigned";
  document.getElementById("remarks").innerText =
    data.description || "No remarks yet";
  document.getElementById("location").innerText = data.location;

  /* 🔹 Show the card */
  document.getElementById("firCard").classList.remove("hidden");
};
