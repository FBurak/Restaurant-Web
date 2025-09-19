/* ---------------- Helpers ---------------- */
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { REST_ID } from "../types";

export const fileNameFromUrl = (u: string) => {
  try {
    const path = new URL(u).pathname;
    const name = path.split("/").pop() || "image.jpg";
    return decodeURIComponent(name);
  } catch {
    return "image.jpg";
  }
};

export async function ensureRestaurantDoc() {
  const refDoc = doc(db, "restaurants", REST_ID);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) {
    await setDoc(
      refDoc,
      {
        name: "Kaffeewerk",
        aboutHtml: "",
        googleBusinessUrl: null,
        videoUrl: null,
        socials: {},
        isVisible: true,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

export async function uploadAndGetUrl(
  path: string,
  file: File
): Promise<string> {
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(ref(storage, path), file);    // storage referansı (uploads/.../dosya)
    task.on(
      "state_changed",
      undefined,
      (err) => reject(err),
      async () => resolve(await getDownloadURL(task.snapshot.ref))         // herkese açık indirme URL'i
    );
  });
}
