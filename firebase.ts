import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD3Hu2rouq2RK24LXY4F5rtou60AO-wtBA",
  authDomain: "teemi-backend-projectcs.firebaseapp.com",
  projectId: "teemi-backend-projectcs",
  storageBucket: "teemi-backend-projectcs.appspot.com",
  messagingSenderId: "542692164186",
  appId: "1:542692164186:web:2eb3bf2709ed5f660e0e63",
  measurementId: "G-SS335VK1XL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);