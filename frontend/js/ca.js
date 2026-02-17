import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { db } from "./firebaseconfig.js";

let map;

document.addEventListener("DOMContentLoaded", () => {
  map = L.map("crimeMap").setView([28.6139, 77.2090], 6);//sets initial view to Delhi

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  setTimeout(() => {//setTimeot() is used to adjuest map size after a short delay
    map.invalidateSize();
  }, 200);

  loadCrimeLocations();
});

async function loadCrimeLocations() {
  try {
    const snapshot = await getDocs(collection(db, "firs"));//gets all FIR attributes from firestore
    console.log("FIR count:", snapshot.size);

    snapshot.forEach(docSnap => {//iterates through each FIR document
      const fir = docSnap.data();
      const firId = docSnap.id;

      const coords = fir.data?.coordinates;//checks if coordinates exist
      if (!coords) return;

      L.marker([coords.lat, coords.lng]).addTo(map).bindPopup(`
          <b>FIR ID:</b> ${firId}<br>
          <b>Location:</b> ${fir.data.location}<br>
          <b>Crime:</b> ${fir.data.crime}<br>
          <b>Status:</b> ${fir.status}<br>
          <b>Total Updates:</b> ${fir.updateCount || 0}
        `);
    });

  } catch (err) {//used to catch error and print in console
    console.error("Error loading FIRs:", err);
  }
}

/* ===============================
   FETCH + PROCESS FIR DATA
================================ */
async function fetchFIRData() {
  const querySnapshot = await getDocs(collection(db, "firs"));
  const crimeCount = {};

  querySnapshot.forEach((docSnap) => {
    const fir = docSnap.data();

    // CORRECT PATH (this fixed everything)
    const crime = fir.data?.crime?.trim();

    if (!crime) return;

    crimeCount[crime] = (crimeCount[crime] || 0) + 1;
  });

  console.log("Processed Data:", crimeCount);
  return crimeCount;
}

/*RENDER CHART*/

// COLOR MAP
const CRIME_COLORS = {
  murder: "#7f1d1d",
  injury: "#dc2626",
  sexual: "#be185d",
  kidnapping: "#9d174d",

  theft: "#2563eb",
  trust: "#16a34a",
  trespass: "#0284c7",

  treason: "#7c2d12",
  public: "#f59e0b",

  drugs: "#9333ea",
  weapons: "#6d28d9",
  abetment: "#4b5563",

  default: "#64748b"
};

// ===============================
// RENDER CHART
// ===============================
async function renderCrimeChart() {
  const crimeCount = await fetchFIRData();

  const labels = Object.keys(crimeCount);
  const values = Object.values(crimeCount);

  // 🔑 backgroundColors MUST be created AFTER crimeCount exists
  const backgroundColors = labels.map(
    crime => CRIME_COLORS[crime] || CRIME_COLORS.default
  );

  const ctx = document
    .getElementById("crimeChart")
    .getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Number of FIRs",
        data: values,
        backgroundColor: backgroundColors,
        borderRadius: 6,
        barThickness: 30
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

//  Correct function call
renderCrimeChart();
