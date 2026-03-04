// ============================================
// BikeHaus Admin Panel - Content Script
// Listens for messages from the admin panel
// and sends bicycle data to the extension
// ============================================

(function () {
  'use strict';

  // Listen for messages from the Angular app
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    if (event.data && event.data.type === 'BIKEHAUS_KA_PUBLISH') {
      const bikeData = event.data.bicycle;

      // Send to background script to store and open Kleinanzeigen
      chrome.runtime.sendMessage(
        {
          type: 'BIKEHAUS_OPEN_KLEINANZEIGEN',
          data: bikeData
        },
        (response) => {
          if (response && response.success) {
            console.log('[BikeHaus Extension] Kleinanzeigen page opening with bike data...');
          }
        }
      );
    }
  });

  console.log('[BikeHaus Extension] Admin content script loaded.');
})();
