import { auth, db } from "./firebaseconfig.js";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { sha256 } from "./crypto/sha256.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* --------------------------------------------------
   AUTH CHECK (OFFICER ONLY)
-------------------------------------------------- */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Unauthorized");
    window.location.replace("login.html");
  }
});

/* --------------------------------------------------
   UPDATE FIR (BLOCKCHAIN STYLE)
-------------------------------------------------- */
window.updateFIR = async function () {

  const firId = document.getElementById("firId").value.trim();
  const status = document.getElementById("status").value;
  const remarks = document.getElementById("remarks").value;

  if (!firId) {
    alert("Enter FIR ID");
    return;
  }

  try {
    // 1️⃣ Fetch FIR (genesis info)
    const firRef = doc(db, "firs", firId);
    const firSnap = await getDoc(firRef);

    if (!firSnap.exists()) {
      alert("FIR not found");
      return;
    }

    const fir = firSnap.data();

    const previousHash = fir.latestHash || fir.genesisHash;
    const blockNumber = (fir.updateCount || 0) + 1;

    // 2️⃣ Create update payload
    const updateData = {
      status,
      remarks,
      assignedOfficer: auth.currentUser.email
    };

    // 3️⃣ Generate new hash (CHAINED)
    const currentHash = await sha256(
      JSON.stringify(updateData) + previousHash
    );

    // 4️⃣ Store update block
    await addDoc(collection(db, "fir_updates"), {
      firId,
      blockNumber,
      updateData,
      previousHash,
      currentHash,
      updatedBy: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });

    // 5️⃣ Update FIR head (pointer update)
    await updateDoc(firRef, {
      latestHash: currentHash,
      updateCount: blockNumber
    });

    alert(`FIR updated successfully\nBlock #${blockNumber} added`);

  } catch (error) {
    console.error(error);
    alert("Update failed");
  }
};
