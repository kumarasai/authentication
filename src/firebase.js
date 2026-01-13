import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
 
} from "firebase/auth";
import firebase from "firebase/compat/app";


const firebaseConfig = {
  apiKey: "cAIzaSyCp90L-MZQ3QSQH_nqHnLsh-wJfucwIQKk",
  authDomain: "sign-in-3dff6.firebaseapp.com",
  projectId: "sign-in-3dff6",
  storageBucket: "sign-in-3dff6.firebasestorage.app",
  messagingSenderId: "204533076156",
  appId: "1:204533076156:web:a1300b51a1d7940e64c0b9",
  measurementId: "G-BMYMDMYFP1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


//here
// Initialize Firebase

const auth = getAuth(app);


export { auth }