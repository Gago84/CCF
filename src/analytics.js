import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "./firebase/config";

export const increaseView = async () => {
  try {
    await setDoc(
      doc(db, "analytics", "views"),
      {
        count: increment(1)
      },
      { merge: true }
    );
  } catch (err) {
    console.error("View error:", err);
  }
};