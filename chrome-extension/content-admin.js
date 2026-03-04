// ============================================
// BikeHaus Admin Panel - Content Script
// Bridges messages between Angular app and extension
// ============================================

(function () {
  'use strict';

  // ── Angular → Extension: Send bike data to Kleinanzeigen ──
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

    // ── Angular → Extension: Delete KA ad ──
    if (event.data && event.data.type === 'BIKEHAUS_KA_DELETE') {
      chrome.runtime.sendMessage({
        type: 'BIKEHAUS_KA_DELETE',
        anzeigeNr: event.data.anzeigeNr
      });
    }
  });

  // ── Extension → Angular: Receive ad number from Kleinanzeigen ──
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'BIKEHAUS_KA_AD_CREATED') {
      // Forward to Angular app via postMessage
      window.postMessage({
        type: 'BIKEHAUS_KA_AD_SAVED',
        bicycleId: message.bicycleId,
        anzeigeNr: message.anzeigeNr
      }, '*');
      sendResponse({ success: true });
    }
    return true;
  });

  console.log('[BikeHaus Extension] Admin content script loaded.');
})();
