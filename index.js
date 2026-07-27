const db = firebase.database();

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

  db.ref('apps').push({ 
    name, description: desc, iconUrl: icon, apkUrl, category, developer, version, size, views: 0, likes: 0 
  })
  .then(() => {
    ['appName','appDesc','appIcon','appApk','appCategory','appDeveloper','appVersion','appSize']
      .forEach(id => document.getElementById(id).value = '');
    
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

  setTimeout(() => { toast.style.opacity = '1'; }, 100);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { document.body.removeChild(toast); }, 500);
  }, 2500);
}
