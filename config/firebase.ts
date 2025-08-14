// config/firebase.ts

import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔐 Ձեր Firebase-ի կոնֆիգուրացիան
const firebaseConfig = {
  apiKey: "AIzaSyBQ2KGheZVAG61tuDnq2EU5pRBZqvJ6xoU",
  authDomain: "newsapp-ea699.firebaseapp.com",
  projectId: "newsapp-ea699",
  storageBucket: "newsapp-ea699.appspot.com",
  messagingSenderId: "273216501570",
  appId: "1:273216501570:ios:c918a0f02a61ff1e697adb"
};

// Ստուգում ենք, որպեսզի Firebase-ը մի քանի անգամ չսկզբնականացվի
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Auth-ը հեռացված է
export { app, db, storage };