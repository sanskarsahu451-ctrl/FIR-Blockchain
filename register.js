import { app } from "./firebaseconfig.js";
import { db, auth } from "./firebaseconfig.js";
import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
// Reference to the "users" collection in Firestore

// 2️⃣ SHA-256 FUNCTION (WRITE IT HERE)
async function sha256(text) {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// 3️⃣ AUTH CHECK (OPTIONAL BUT RECOMMENDED)
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
  }
});

// 4️⃣ FORM SUBMISSION LOGIC
document.getElementById("firForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const firData = {
    userId: user.uid,
    name: document.getElementById("complaintant-name").value,
    location: document.getElementById("incident-location").value,
    date: document.getElementById("incident-date").value,
    time: document.getElementById("incident-time").value,
    description: document.getElementById("description").value,
    createdAt: serverTimestamp(),
    status: "Submitted"
  };

  // 5️⃣ GENERATE HASH HERE
  const hash = await sha256(JSON.stringify(firData));

  // 6️⃣ SAVE TO FIRESTORE
  await addDoc(collection(db, "firCollection"), {
    data: firData,
    sha256: hash
  });

  alert("FIR submitted successfully!");
  document.getElementsByClassName("fir-form")[0].reset();
});

