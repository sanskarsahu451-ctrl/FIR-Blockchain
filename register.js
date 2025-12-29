/* --------------------------------------------------
   FIREBASE IMPORTS
-------------------------------------------------- */
import { app, db, auth } from "./firebaseconfig.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* --------------------------------------------------
   SHA-256 HASH FUNCTION
-------------------------------------------------- */
async function sha256(text) {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/* --------------------------------------------------
   AUTH CHECK
-------------------------------------------------- */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please login first.");
    window.location.replace("login.html");
  }
});

/* --------------------------------------------------
   FORM HANDLING
-------------------------------------------------- */
const firForm = document.getElementById("firForm");

if (!firForm) {
  console.error("FIR form not found. Check form ID.");
}

/* --------------------------------------------------
   SUBMIT EVENT
-------------------------------------------------- */
firForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("Authentication error. Please login again.");
    return;
  }

  /* 🔹 Collect FIR data */
  const firData = {
    userId: user.uid,
    name: document.getElementById("complaintant-name").value,
    location: document.getElementById("incident-location").value,
    date: document.getElementById("incident-date").value,
    time: document.getElementById("incident-time").value,
    description: document.getElementById("description").value,
    status: "Submitted",
    createdAt: serverTimestamp()
  };

  /* 🔹 Generate FIR ID */
  const now = new Date();

  const date =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const time =
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  const firId = `FIR-${date}-${time}`;

  /* 🔹 Generate hash (includes FIR ID) */
  const hash = await sha256(JSON.stringify({ firId, ...firData }));

  /* --------------------------------------------------
     SAVE TO FIRESTORE (FIR ID AS DOCUMENT ID)
  -------------------------------------------------- */
  try {
    await setDoc(doc(db, "firs", firId), {
      firId: firId,
      data: firData,
      sha256: hash
    });

    /* 🔹 Show FIR ID */
    document.getElementById("firIdOutput").innerText = firId;

    /* 🔹 Success alert */
    alert(
      `FIR submitted successfully!\n\n` +
      `Your FIR ID is:\n${firId}\n\n` +
      `Please keep this ID for future reference.`
    );

    firForm.reset();

  } catch (error) {
    console.error("Firestore Error:", error);
    alert("Failed to submit FIR. Please try again.");
  }
});
