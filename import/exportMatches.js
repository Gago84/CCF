import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const exportMatches = async () => {
  try {
    const snap = await db
      .collection("matches")
      .orderBy("date", "desc")
      .get();

    const matches = snap.docs.map((doc) => {
      const data = doc.data();

      return {
        date: data.date || "",
        day: data.day || "",
        month: data.month || "",
        field: data.field || "",
        time: data.time || "",
        match: data.match || "",
        contact: data.contact || "",
        uniform: data.uniform || "",
        result: data.result || "",
        goal: data.goal || "",
        assist: data.assist || "",
        highlight: data.highlight || ""
      };
    });

    fs.writeFileSync("./matches.json", JSON.stringify(matches, null, 2), "utf8");

    console.log("Export thanh cong Firestore ra matches.json!");
    process.exit(0);
  } catch (error) {
    console.error("Loi export matches:", error);
    process.exit(1);
  }
};

exportMatches();
