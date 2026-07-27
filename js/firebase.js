// ===== js/firebase.js =====
// Firebase configuration - Replace with your own
const firebaseConfig = {
  apiKey: "AIzaSyAvW0n21SzMcG0cT8GdafjHN8LtcLpF89s",
  authDomain: "moco-player-f396a.firebaseapp.com",
  databaseURL: "https://moco-player-f396a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "moco-player-f396a",
  storageBucket: "moco-player-f396a.appspot.com",
  messagingSenderId: "96132308835",
  appId: "1:96132308835:web:90f34c7a8e3cafbbdbbd56",
  measurementId: "G-CRWNKC0M5N"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const storage = firebase.storage();

// Reference to apps node
const appsRef = database.ref('apps');

// Export for use in other files
window.db = database;
window.storage = storage;
window.appsRef = appsRef;