// ============================================
// BikeHaus Admin Panel - Content Script
// Bridges messages between Angular app and extension
// ============================================

(function () {
  'use strict';

  // Helper: safely send message to background (handles extension context invalidation)
  function safeSendMessage(msg, callback) {
    try {
      if (!chrome.runtime?.id) return; // Extension context invalidated
      chrome.runtime.sendMessage(msg, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('[BikeHaus Extension] Message error:', chrome.runtime.lastError.message);
          return;
        }
        if (callback) callback(response);
      });
    } catch (e) {
      console.warn('[BikeHaus Extension] Extension context invalidated. Please refresh the page.');
    }
  }

  // ── Angular → Extension: Send bike data to Kleinanzeigen ──
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    if (event.data && event.data.type === 'BIKEHAUS_KA_PUBLISH') {
      const bikeData = event.data.bicycle;

      // Send to background script to store and open Kleinanzeigen
      safeSendMessage(
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
      safeSendMessage({
        type: 'BIKEHAUS_KA_DELETE',
        anzeigeNr: event.data.anzeigeNr
      });
    }
  });

  // ── Extension → Angular: Receive ad number from Kleinanzeigen ──
  try {
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
  } catch (e) {
    console.warn('[BikeHaus Extension] Could not register message listener:', e.message);
  }

  console.log('[BikeHaus Extension] Admin content script loaded.');
})();
