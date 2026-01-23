import admin from "firebase-admin";
import fs from "fs";

// 👉 đường dẫn tới file key Firebase
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

// 👉 khởi tạo firebase admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 👉 đọc file json
const data = JSON.parse(fs.readFileSync("./matches.json", "utf8"));

const importData = async () => {
  try {
    for (const item of data) {
      await db.collection("matches").add({
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    console.log("✅ Import thành công toàn bộ matches!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi import:", error);
    process.exit(1);
  }
};

importData();
