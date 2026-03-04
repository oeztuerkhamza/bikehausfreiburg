// ============================================
// BikeHaus Kleinanzeigen Helper - Background Service Worker
// ============================================

let adminTabId = null;

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BIKEHAUS_OPEN_KLEINANZEIGEN') {
    // Remember the admin tab
    adminTabId = sender.tab?.id || null;
    // Store bike data
    chrome.storage.local.set({ pendingBike: message.data }, () => {
      // Open Kleinanzeigen ad creation page (step 2 = form)
      chrome.tabs.create({
        url: 'https://www.kleinanzeigen.de/p-anzeige-aufgeben-schritt2.html'
      });
      sendResponse({ success: true });
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'BIKEHAUS_GET_PENDING') {
    chrome.storage.local.get('pendingBike', (result) => {
      sendResponse({ data: result.pendingBike || null });
    });
    return true;
  }

  if (message.type === 'BIKEHAUS_CLEAR_PENDING') {
    chrome.storage.local.remove('pendingBike', () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'BIKEHAUS_FETCH_IMAGE') {
    // Fetch image as blob and convert to base64
    fetch(message.url)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          sendResponse({ dataUrl: reader.result });
        };
        reader.readAsDataURL(blob);
      })
      .catch(err => {
        sendResponse({ error: err.message });
      });
    return true;
  }

  // Kleinanzeigen content script detected the ad number after creation
  if (message.type === 'BIKEHAUS_KA_AD_CREATED') {
    const { bicycleId, anzeigeNr } = message;
    // Send the ad number to the admin tab
    if (adminTabId) {
      chrome.tabs.sendMessage(adminTabId, {
        type: 'BIKEHAUS_KA_AD_CREATED',
        bicycleId,
        anzeigeNr
      }).catch(() => {
        // Admin tab may have been closed, try all admin tabs
        sendToAdminTabs(bicycleId, anzeigeNr);
      });
    } else {
      sendToAdminTabs(bicycleId, anzeigeNr);
    }
    sendResponse({ success: true });
    return true;
  }

  // Admin wants to delete a KA ad
  if (message.type === 'BIKEHAUS_KA_DELETE') {
    const { anzeigeNr } = message;
    // Open the Kleinanzeigen ad management page to delete
    chrome.tabs.create({
      url: `https://www.kleinanzeigen.de/m-meine-anzeigen.html`
    });
    // Store the delete request so the KA content script can act on it
    chrome.storage.local.set({ pendingDelete: anzeigeNr });
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'BIKEHAUS_GET_PENDING_DELETE') {
    chrome.storage.local.get('pendingDelete', (result) => {
      sendResponse({ anzeigeNr: result.pendingDelete || null });
    });
    return true;
  }

  if (message.type === 'BIKEHAUS_CLEAR_PENDING_DELETE') {
    chrome.storage.local.remove('pendingDelete', () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Send ad number to all admin tabs
function sendToAdminTabs(bicycleId, anzeigeNr) {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab.url && (tab.url.includes('localhost:4200') || tab.url.includes('admin.bikehausfreiburg.com'))) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'BIKEHAUS_KA_AD_CREATED',
          bicycleId,
          anzeigeNr
        }).catch(() => {});
      }
    }
  });
}

// Show badge when there's pending data
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.pendingBike) {
    if (changes.pendingBike.newValue) {
      chrome.action.setBadgeText({ text: '1' });
      chrome.action.setBadgeBackgroundColor({ color: '#e74c3c' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
});
