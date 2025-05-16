import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Օգտագործել `firebase/auth`
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 🔐 Կոնֆիգ
const firebaseConfig = {
  apiKey: "AIzaSyBQ2KGheZVAG61tuDnq2EU5pRBZqvJ6xoU",
  authDomain: "newsapp-ea699.firebaseapp.com",
  projectId: "newsapp-ea699",
  storageBucket: "newsapp-ea699.appspot.com",
  messagingSenderId: "273216501570",
  appId: "1:273216501570:ios:c918a0f02a61ff1e697adb"
};

// Ստեղծում ենք Firebase app-ը (եթե արդեն գոյություն չունի)
const app = initializeApp(firebaseConfig);

// Firebase Auth-ով (պահպանելու վիճակ)
const auth = getAuth(app); // Անհրաժեշտ է միայն `getAuth`

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
