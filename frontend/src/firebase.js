// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB34nk1bgphmwtCr3qkTvS7yi_Emt1Mm7Y",
  authDomain: "fot-tt.firebaseapp.com",
  projectId: "fot-tt",
  storageBucket: "fot-tt.firebasestorage.app",
  messagingSenderId: "804120759196",
  appId: "1:804120759196:web:3ef57978f74ff7d43e5659",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;