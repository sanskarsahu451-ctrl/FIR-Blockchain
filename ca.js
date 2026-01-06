import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { db } from "./firebaseconfig.js";

let map;

document.addEventListener("DOMContentLoaded", () => {
  map = L.map("crimeMap").setView([28.6139, 77.2090], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  setTimeout(() => {
    map.invalidateSize();
  }, 200);

  loadCrimeLocations();
});

async function loadCrimeLocations() {
  try {
    const snapshot = await getDocs(collection(db, "firs"));
    console.log("FIR count:", snapshot.size);

    snapshot.forEach(docSnap => {
      const fir = docSnap.data();
      const firId = docSnap.id;

      const coords = fir.data?.coordinates;
      if (!coords) return;

      L.marker([coords.lat, coords.lng]).addTo(map).bindPopup(`
          <b>FIR ID:</b> ${firId}<br>
          <b>Location:</b> ${fir.data.location}<br>
          <b>Crime:</b> ${fir.data.crime}<br>
          <b>Status:</b> ${fir.status}<br>
          <b>Total Updates:</b> ${fir.updateCount || 0}
        `);
    });

  } catch (err) {
    console.error("Error loading FIRs:", err);
  }
}
