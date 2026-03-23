import "dotenv/config";
import fs from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccountPath) {
  throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS environment variable.");
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

function parseTalkTimeToSeconds(talkTime) {
  if (!talkTime || typeof talkTime !== "string") return 0;

  const parts = talkTime.split(":").map(Number);

  if (parts.some(Number.isNaN)) return 0;

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  return 0;
}

function getAgentName(call) {
  return call?.agentName || call?.agent || "Unknown";
}

async function backfillMonthlyAggregates() {
  console.log("Loading phone_calls...");
  const snapshot = await db.collection("phone_calls").get();

  const monthlyMap = new Map();

  snapshot.forEach((doc) => {
    const data = doc.data();

    const startDate = data.startDate ? new Date(data.startDate) : null;
    if (!startDate || Number.isNaN(startDate.getTime())) return;

    const year = data.year || startDate.getFullYear();
    const month = data.month || startDate.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;

    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        year,
        month,
        totalCalls: 0,
        totalTalkSeconds: 0,
        agentTotals: {},
        hourlyCounts: Array(24).fill(0),
        updatedAt: new Date().toISOString(),
      });
    }

    const row = monthlyMap.get(key);
    row.totalCalls += 1;
    row.totalTalkSeconds += parseTalkTimeToSeconds(data.talkTime);

    const agent = getAgentName(data);
    row.agentTotals[agent] = (row.agentTotals[agent] || 0) + 1;

    if (typeof data.startTime === "string") {
      const [hourStr] = data.startTime.split(":");
      const hour = parseInt(hourStr, 10);
      if (!Number.isNaN(hour) && hour >= 0 && hour <= 23) {
        row.hourlyCounts[hour] += 1;
      }
    }
  });

  console.log(`Writing ${monthlyMap.size} aggregate docs...`);

  const batchSize = 400;
  const entries = Array.from(monthlyMap.entries());

  for (let i = 0; i < entries.length; i += batchSize) {
    const chunk = entries.slice(i, i + batchSize);
    const batch = db.batch();

    chunk.forEach(([docId, value]) => {
      const ref = db.collection("phone_call_monthly_aggregates").doc(docId);
      batch.set(ref, value, { merge: true });
    });

    await batch.commit();
    console.log(`Committed ${Math.min(i + batchSize, entries.length)} / ${entries.length}`);
  }

  console.log("Backfill complete.");
}

backfillMonthlyAggregates().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
