import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDO0l4P0fQjMu88HRtdVh3pdDk4zXFZ5zY",
  authDomain: "lotto-ticket-tracker.firebaseapp.com",
  projectId: "lotto-ticket-tracker",
  storageBucket: "lotto-ticket-tracker.appspot.com",
  messagingSenderId: "902647750288",
  appId: "1:902647750288:web:612fcfb35a9044f2490215"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database };
