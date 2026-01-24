import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const nextMatch = {
  date: "2026-01-30",
  day: "Thứ 6",
  month: "2026-01",
  field: "E",
  time: "B",
  match: "FC A vs Đội Bóng CCF",
  contact: "C",
  uniform: "D",
  result: "",
  goal: "",
  createdAt: admin.firestore.FieldValue.serverTimestamp()
};

await db.collection("matches").add(nextMatch);

console.log("✅ Đã thêm trận sắp tới!");
process.exit();
