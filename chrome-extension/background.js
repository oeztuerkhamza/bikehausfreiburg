// ============================================
// BikeHaus Kleinanzeigen Helper - Background Service Worker
// ============================================

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BIKEHAUS_OPEN_KLEINANZEIGEN') {
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
});

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
