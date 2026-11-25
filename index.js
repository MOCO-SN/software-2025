const db = firebase.database();

// Deterministic SHA-256 hex digest (works across https, http, and file://)
function hashAccessCode(input) {
  const utf8 = unescape(encodeURIComponent(String(input)));
  const bytes = [];
  for (let i = 0; i < utf8.length; i++) {
    bytes.push(utf8.charCodeAt(i));
  }

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) {
    bytes.push(0);
  }
  const highBits = Math.floor(bitLen / 0x100000000);
  const lowBits = bitLen >>> 0;
  for (let i = 3; i >= 0; i--) bytes.push((highBits >>> (i * 8)) & 0xff);
  for (let i = 3; i >= 0; i--) bytes.push((lowBits >>> (i * 8)) & 0xff);

  const w = new Array(64);
  const rotr = (n, x) => (x >>> n) | (x << (32 - n));

  for (let i = 0; i < bytes.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      const j = i + t * 4;
      w[t] = (bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3];
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(7, w[t - 15]) ^ rotr(18, w[t - 15]) ^ (w[t - 15] >>> 3);
      const s1 = rotr(17, w[t - 2]) ^ rotr(19, w[t - 2]) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }

    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + S1 + ch + K[t] + w[t]) | 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    H[0] = (H[0] + a) | 0;
    H[1] = (H[1] + b) | 0;
    H[2] = (H[2] + c) | 0;
    H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0;
    H[5] = (H[5] + f) | 0;
    H[6] = (H[6] + g) | 0;
    H[7] = (H[7] + h) | 0;
  }

  return H.map(val => (val >>> 0).toString(16).padStart(8, '0')).join('');
}

window.hashAccessCode = hashAccessCode;

function formatSnKey(raw) {
  const cleaned = String(raw || '').trim().replace(/^sn-/i, '');
  return cleaned ? `SN-${cleaned}` : '';
}

window.formatSnKey = formatSnKey;

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
  const accessCodeEl = document.getElementById('appAccessCode');
  const rawSuffix = accessCodeEl ? accessCodeEl.value.trim().replace(/^sn-/i, '').trim() : '';
  const accessCode = formatSnKey(rawSuffix);

  if (!name || !desc || !icon || !apkUrl) {
    showToast("Please fill Name, Description, Icon URL, and APK URL.");
    return Promise.resolve(null);
  }

  if (accessCodeEl && rawSuffix.length < 4) {
    showToast("Custom key after SN- must be at least 4 characters.");
    accessCodeEl.focus();
    return Promise.resolve(null);
  }

  const submitBtn = document.getElementById('uploadSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.dataset.originalHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Listing App...';
  }

  const payload = {
    name,
    description: desc,
    iconUrl: icon,
    apkUrl,
    category,
    developer,
    version,
    size,
    views: 0,
    likes: 0,
    createdAt: Date.now()
  };

  if (accessCode) {
    payload.accessCodeHash = hashAccessCode(accessCode);
  }

  const newAppRef = db.ref('apps').push();

  return newAppRef.set(payload)
    .then(() => {
      ['appName', 'appDesc', 'appIcon', 'appApk', 'appCategory', 'appDeveloper', 'appVersion', 'appSize']
        .forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
      if (accessCodeEl) accessCodeEl.value = '';

      showToast("App listed successfully!");

      const result = { id: newAppRef.key, name, accessCode };
      if (typeof window.onAppUploaded === 'function') {
        window.onAppUploaded(result);
      }
      return result;
    })
    .catch((error) => {
      showToast("Error listing app: " + error.message);
      return null;
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        if (submitBtn.dataset.originalHtml) {
          submitBtn.innerHTML = submitBtn.dataset.originalHtml;
        }
      }
    });
}

// Simple toast function
function showToast(message) {
  const existing = document.getElementById('mocoToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'mocoToast';
  toast.innerText = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '30px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = 'rgba(0,0,0,0.85)';
  toast.style.color = '#fff';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '25px';
  toast.style.fontSize = '14px';
  toast.style.zIndex = '9999';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.35s';

  document.body.appendChild(toast);

  setTimeout(() => { toast.style.opacity = '1'; }, 50);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.remove(); }, 350);
  }, 2600);
}
