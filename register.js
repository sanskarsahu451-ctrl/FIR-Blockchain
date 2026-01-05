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
   OPENSTREETMAP + LEAFLET (REPLACES GOOGLE MAPS)
-------------------------------------------------- */
let map, marker;

// Initialize map
function initMap() {
  const defaultLatLng = [28.6139, 77.2090]; // Delhi

  map = L.map("map").setView(defaultLatLng, 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  marker = L.marker(defaultLatLng, {
    draggable: true
  }).addTo(map);

  // Save coords when marker is dragged
  marker.on("dragend", () => {
    const pos = marker.getLatLng();
    setLocation(pos.lat, pos.lng);
  });
}

// Convert text location → lat/lng (FREE GEOCODING)
async function geocodeLocation(place) {
  if (!place) return;

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`
  );

  const data = await res.json();
  if (!data.length) {
    alert("Location not found");
    return;
  }

  const lat = parseFloat(data[0].lat);
  const lng = parseFloat(data[0].lon);

  map.setView([lat, lng], 14);
  marker.setLatLng([lat, lng]);
  setLocation(lat, lng);
}

// Save coordinates to hidden inputs
function setLocation(lat, lng) {
  document.getElementById("lat").value = lat;
  document.getElementById("lng").value = lng;
}

// Trigger geocoding when location input changes
document
  .getElementById("incident-location")
  .addEventListener("change", (e) => {
    geocodeLocation(e.target.value);
  });

// Initialize map after page load
window.addEventListener("load", initMap);

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
    coordinates: {
      lat: parseFloat(document.getElementById("lat").value),
      lng: parseFloat(document.getElementById("lng").value)
    },
    crime: document.getElementById("crime-type").value,
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

  /* 🔹 Generate hash */
  const hash = await sha256(JSON.stringify({ firId, ...firData }));

  /* --------------------------------------------------
     SAVE TO FIRESTORE
  -------------------------------------------------- */
  try {
    await setDoc(doc(db, "firs", firId), {
      firId,
      data: firData,
      sha256: hash
    });

    document.getElementById("firIdOutput").innerText = firId;

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
