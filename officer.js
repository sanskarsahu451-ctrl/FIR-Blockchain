/* --------------------------------------------------
   FIREBASE IMPORTS
-------------------------------------------------- */
import { auth, db } from "./firebaseconfig.js";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  setDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* --------------------------------------------------
   SHA-256 (BROWSER SAFE)
-------------------------------------------------- */
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/* --------------------------------------------------
   AUTH CHECK (OFFICER ONLY)
-------------------------------------------------- */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Unauthorized access");
    window.location.href = "login.html";
  }
});

/* --------------------------------------------------
   UPDATE FIR (BLOCKCHAIN STYLE)
-------------------------------------------------- */
window.updateFIR = async function () {
  try {
    /* 🔹 Read form values */
    const firIdEl = document.getElementById("firId");
    const statusEl = document.getElementById("status");
    const officerEl = document.getElementById("AssignOfficer");
    const remarksEl = document.getElementById("description");

    if (!firIdEl || !statusEl || !officerEl || !remarksEl) {
      alert("Form fields missing (check HTML IDs)");
      return;
    }

    const firId = firIdEl.value.trim();
    const status = statusEl.value;
    const assignedOfficer = officerEl.value.trim();
    const remarks = remarksEl.value.trim();

    if (!firId) {
      alert("Enter FIR ID");
      return;
    }

    /* --------------------------------------------------
       1️⃣ Fetch FIR (HEAD BLOCK)
    -------------------------------------------------- */
    const firRef = doc(db, "firs", firId);
    const firSnap = await getDoc(firRef);

    if (!firSnap.exists()) {
      alert("FIR not found");
      return;
    }

    const fir = firSnap.data();

    const previousHash = fir.latestHash || fir.sha256 || "GENESIS";
    const blockNumber = (fir.updateCount || 0) + 1;

    /* --------------------------------------------------
       2️⃣ Create update payload
    -------------------------------------------------- */
    const updateData = {
      status,
      remarks,
      assignedOfficer,
      updatedByEmail: auth.currentUser.email
    };

    /* --------------------------------------------------
       3️⃣ Generate chained hash
    -------------------------------------------------- */
    const currentHash = await sha256(
      JSON.stringify(updateData) + previousHash
    );

    /* --------------------------------------------------
       4️⃣ Store update block (APPEND ONLY)
    -------------------------------------------------- */

    const updateId = `${firId}_BLOCK_${blockNumber}`;

    await setDoc(doc(db, "fir_updates", updateId), {
      firId,
      blockNumber,
      updateData,
      previousHash,
      currentHash,
      updatedBy: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });

    /* --------------------------------------------------
       5️⃣ Update FIR HEAD (POINTER)
    -------------------------------------------------- */
    await updateDoc(firRef, {
      status,
      latestHash: currentHash,
      updateCount: blockNumber,
      lastUpdatedAt: serverTimestamp()
    });

    alert(`FIR updated successfully\nBlock #${blockNumber} added`);

  } catch (error) {
    console.error("FIR Update Error:", error);
    alert("Update failed. Check console for details.");
  }
};
