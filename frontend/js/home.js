import { auth, db } from "./firebaseconfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const trackBtn = document.getElementById("trackUpdateBtn");

let isOfficer = false;

// Watch auth state
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    isOfficer = false;
    return;
  }

  const officerRef = doc(db, "officers", user.email);
  const officerSnap = await getDoc(officerRef);

  isOfficer = officerSnap.exists();
});

// Button click logic
trackBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (isOfficer) {
    window.location.href = "officer.html"; // officer
  } else {
    window.location.href = "track.html";   // normal user
  }
});
