import { db, auth } from "./firebaseconfig.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* AUTH CHECK */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please login first");
    window.location.replace("login.html");
  }
});

/* TRACK FIR */
window.trackFIR = async function () {

  const firIdInput = document.getElementById("firIdInput").value.trim();

  if (firIdInput === "") {
    alert("Please enter FIR ID");
    return;
  }

 // Fetch FIR (current state)
  const firRef = doc(db, "firs", firIdInput);
  const firSnap = await getDoc(firRef);

  if (!firSnap.exists()) {
    alert("FIR not found");
    return;
  }

  const firDoc = firSnap.data();
  const data = firDoc.data;

  // Default values (in case no updates yet)
  let latestOfficer = "Not assigned";
  let latestRemarks = "No remarks yet";

  // Fetch blockchain history
  const q = query(
    collection(db, "fir_updates"),
    where("firId", "==", firIdInput),
    orderBy("blockNumber", "desc")
  );

  const updatesSnap = await getDocs(q);//getting all the documents matching the query

  if (!updatesSnap.empty) {
    const latestBlock = updatesSnap.docs[0].data();
    latestOfficer = latestBlock.updateData?.assignedOfficer || latestOfficer;
    latestRemarks = latestBlock.updateData?.remarks || latestRemarks;
  }

  /* 🔹 Fill dynamic data (KEEPING YOUR UI SAME) */
  document.getElementById("firId").innerText = firIdInput;
  document.getElementById("status").innerText = firDoc.status; 
  document.getElementById("officer").innerText = latestOfficer;
  document.getElementById("remarks").innerText = latestRemarks;
  document.getElementById("location").innerText = data.location;

  /* 🔹 Show the card */
  document.getElementById("firCard").classList.remove("hidden");//removes hidden class to display the card
};
