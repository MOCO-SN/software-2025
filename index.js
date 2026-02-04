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
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM Elements
const appGallery = document.getElementById('appGallery');
const modal = document.getElementById('uploadModal');
const openUpload = document.getElementById('openUpload');
const closeModal = document.getElementById('closeModal');
const searchInput = document.getElementById('searchInput');

// --------------------
// Upload Modal Logic
// --------------------
openUpload.addEventListener('click', () => modal.style.display = 'flex');
closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => { if(e.target === modal) modal.style.display = 'none'; });

// Upload app
function uploadApp() {
  const name = document.getElementById('appName').value.trim();
  const desc = document.getElementById('appDesc').value.trim();
  const icon = document.getElementById('appIcon').value.trim();
  const apkUrl = document.getElementById('appApk').value.trim();
  const category = document.getElementById('appCategory').value.trim();
  const developer = document.getElementById('appDeveloper').value.trim();
  const version = document.getElementById('appVersion').value.trim();
  const size = document.getElementById('appSize').value.trim();

  if (!name || !desc || !icon || !apkUrl) { 
    alert("Fill at least Name, Description, Icon, APK URL"); 
    return; 
  }

  // Push to Firebase
  db.ref('apps').push({ 
    name, description: desc, iconUrl: icon, apkUrl, category, developer, version, size, views: 0, likes: 0 
  })
  .then(() => {
    // Clear form
    ['appName','appDesc','appIcon','appApk','appCategory','appDeveloper','appVersion','appSize']
      .forEach(id => document.getElementById(id).value = '');
    
    modal.style.display = 'none';

    // Show toast
    showToast("App uploaded successfully!");
  })
  .catch((error) => {
    showToast("Error uploading app: " + error.message);
  });
}

// Simple toast function
function showToast(message) {
  let toast = document.createElement('div');
  toast.innerText = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '30px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = 'rgba(0,0,0,0.8)';
  toast.style.color = '#fff';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '25px';
  toast.style.fontSize = '14px';
  toast.style.zIndex = '9999';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.5s';

  document.body.appendChild(toast);

  // Fade in
  setTimeout(() => { toast.style.opacity = '1'; }, 100);

  // Fade out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { document.body.removeChild(toast); }, 500);
  }, 2500);
}

// --------------------
// Fetch & Render Apps
// --------------------
let allApps = {};
db.ref('apps').on('value', snapshot => {
  allApps = snapshot.val() || {};
  renderApps(allApps);
});

function renderApps(apps) {
  appGallery.innerHTML = '';

  Object.entries(apps).forEach(([key, app]) => {
    const iconUrl = app.iconUrl && app.iconUrl.trim() !== ''
      ? app.iconUrl
      : 'https://via.placeholder.com/100x100?text=No+Image';

    const appCard = document.createElement('div');
    appCard.classList.add('app-card');

    appCard.innerHTML = `
      <img class="cardimg" src="${iconUrl}" alt="${app.name}"
           onerror="this.src='https://demofree.sirv.com/nope-not-here.jpg'">

      <div class="infomain">
        <h3>${app.name}</h3>
        <p>${app.description}</p>
      </div>

      <div class="app-info">
        <span>Category: ${app.category || '-'}</span>
        <span>Developer: ${app.developer || '-'}</span>
        <span>Version: ${app.version || '-'}</span>
        <span>Size: ${app.size || '-'}</span>
        <span>
          <a href="${app.apkUrl}" target="_blank">
            <button class="Downloadbtn">Download</button>
          </a>
        </span>
      </div>

      <div class="app-footer">
        <span>👁 ${app.views || 0}</span>
        <span class="like-btn ${app.likes > 0 ? 'liked' : ''}" data-key="${key}">
          ❤️ ${app.likes || 0}
        </span>
      </div>
    `;

    // 👉 Card click = view count + redirect
    appCard.addEventListener('click', () => {
      db.ref('apps/' + key + '/views')
        .transaction(v => (v || 0) + 1);

      if (app.apkUrl) {
        window.open(app.apkUrl, '_blank');
      }
    });

    // ❤️ Like button (no redirect)
    appCard.querySelector('.like-btn').addEventListener('click', e => {
      e.stopPropagation();
      db.ref('apps/' + key + '/likes')
        .transaction(v => (v || 0) + 1);
    });

    // ⬇ Download button (no double redirect)
    appCard.querySelector('.Downloadbtn').addEventListener('click', e => {
      e.stopPropagation();
    });

    appGallery.appendChild(appCard);
  });
}

// --------------------
// Search Logic
// --------------------
searchInput.addEventListener('input', () => {
  const term = searchInput.value.toLowerCase().trim();
  if(!term) { renderApps(allApps); return; }

  const filteredApps = Object.fromEntries(
    Object.entries(allApps).filter(([key, app]) =>
      (app.name && app.name.toLowerCase().includes(term)) ||
      (app.description && app.description.toLowerCase().includes(term))
    )
  );
  renderApps(filteredApps);
});



document.addEventListener("DOMContentLoaded", function() {
  var overlay = document.getElementById("overlay");
  var okBtn = document.getElementById("okBtn");
  var updateBtn = document.getElementById("updateBtn");

  // Function to handle OK button click
  okBtn.addEventListener("click", function() {
      overlay.style.display = "none";


      // window.location.href = "index.html";
  });

  // Function to handle Update button click
  updateBtn.addEventListener("click", function() {
      // Redirect user to the update URL
      window.location.href = "https://www.instagram.com/_sachin_2006_01/";
  });

  // Show the overlay on startup
  overlay.style.display = "block";
  
});