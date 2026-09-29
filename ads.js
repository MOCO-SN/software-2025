// Ads configuration

function loadAds() {
  const container = document.getElementById("ads-container"); 
  if (!container) return; // Exit if container doesn't exist

  try {
    // 1. Set the ad options
    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.innerHTML = `
      atOptions = {
        'key' : '222168bd103ed785238174857d7093a0',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;
    container.appendChild(optionsScript);

    // 2. Load the ad network script
    // Using createElement ensures the browser actually executes the script
    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.src = 'https://asaacaciafeint.com/222168bd103ed785238174857d7093a0/invoke.js';
    container.appendChild(adScript);

  } catch (error) {
    console.error("Error loading ads:", error);
  }
}

// Run the function automatically when the page loads
window.addEventListener("DOMContentLoaded", loadAds);
