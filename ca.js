/*************************************************
 * CRIME ANALYTICS MODULE (FIXED)
 *************************************************/


import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import { db } from "./firebaseconfig.js";
import Chart from "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js";


/* ==============================
   GLOBAL STATE
============================== */
let FIR_CACHE = [];

/* ==============================
   FETCH FIRs ONCE
============================== */
async function loadFIRs() {
  const snapshot = await getDocs(collection(db, "firs"));
  FIR_CACHE = snapshot.docs.map(doc => doc.data());
}

/* ==============================
   CRIME BY TYPE
   (TEMP: derived from description)
============================== */
function crimeByType() {
  const stats = {};

  FIR_CACHE.forEach(fir => {
    // TEMP FIX: since crime field doesn't exist
    const crime = "General Complaint";
    stats[crime] = (stats[crime] || 0) + 1;
  });

  return stats;
}

/* ==============================
   CRIME BY LOCATION
============================== */
function crimeByLocation() {
  const locations = {};

  FIR_CACHE.forEach(fir => {
    const loc = fir.data?.location || "Unknown";
    locations[loc] = (locations[loc] || 0) + 1;
  });

  return locations;
}

/* ==============================
   MONTHLY TREND
============================== */
function monthlyCrimeTrend() {
  const trend = {};

  FIR_CACHE.forEach(fir => {
    const date = fir.data?.date;
    if (!date) return;

    const month = date.slice(0, 7);
    trend[month] = (trend[month] || 0) + 1;
  });

  return trend;
}

/* ==============================
   STATUS DISTRIBUTION
============================== */
function caseStatusStats() {
  const statusCount = {};

  FIR_CACHE.forEach(fir => {
    const status = fir.data?.status || "Unknown";
    statusCount[status] = (statusCount[status] || 0) + 1;
  });

  return statusCount;
}

/* ==============================
   RENDER CHARTS
============================== */
function renderChart(canvasId, type, labels, data) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new Chart(ctx, {
    type,
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          "#38bdf8", "#22c55e", "#f97316", "#ef4444", "#a855f7"
        ]
      }]
    }
  });
}

/* ==============================
   DASHBOARD INIT
============================== */
async function initDashboard() {
  await loadFIRs();

  if (FIR_CACHE.length === 0) {
    console.warn("No FIR data found");
    return;
  }

  renderChart(
    "crimeTypeChart",
    "bar",
    Object.keys(crimeByType()),
    Object.values(crimeByType())
  );

  renderChart(
    "locationChart",
    "bar",
    Object.keys(crimeByLocation()),
    Object.values(crimeByLocation())
  );

  renderChart(
    "trendChart",
    "line",
    Object.keys(monthlyCrimeTrend()),
    Object.values(monthlyCrimeTrend())
  );

  renderChart(
    "statusChart",
    "doughnut",
    Object.keys(caseStatusStats()),
    Object.values(caseStatusStats())
  );
}

/* ==============================
   START AFTER DOM LOAD
============================== */
document.addEventListener("DOMContentLoaded", initDashboard);

console.log("ca.js is running")