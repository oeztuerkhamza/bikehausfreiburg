// ============================================
// BikeHaus Bulk Editor - Background Service Worker
// MV3 compatible: uses chrome.storage.local for state persistence
// and chrome.alarms instead of setTimeout (which dies with the worker).
//
// Flow: open edit tab → content script fills & clicks save →
//       page navigates to success page → content script detects "Geschafft!" →
//       background closes tab → alarm fires → opens next ad
// ============================================

// ── In-memory state (restored from storage on every wake-up) ──
let editQueue = [];
let currentIndex = -1;
let isRunning = false;
let settings = {};
let results = { done: 0, failed: 0, log: [] };
let currentTabId = null;

// ── State persistence ──────────────────────────────────────────

let _stateLoaded = false;
let _loadPromise = null;

function ensureStateLoaded() {
  if (_stateLoaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = chrome.storage.local.get('bulkEditState').then((data) => {
      if (data.bulkEditState) {
        const s = data.bulkEditState;
        editQueue = s.editQueue || [];
        currentIndex = s.currentIndex ?? -1;
        isRunning = s.isRunning || false;
        settings = s.settings || {};
        results = s.results || { done: 0, failed: 0, log: [] };
        currentTabId = s.currentTabId ?? null;
      }
      _stateLoaded = true;
      console.log(
        '[BulkEdit BG] State loaded. running:',
        isRunning,
        'idx:',
        currentIndex,
        '/',
        editQueue.length,
        'tab:',
        currentTabId,
      );
    });
  }
  return _loadPromise;
}

async function saveState() {
  await chrome.storage.local.set({
    bulkEditState: {
      editQueue,
      currentIndex,
      isRunning,
      settings,
      results,
      currentTabId,
    },
  });
}

// ── Helpers ─────────────────────────────────────────────────────

function addLog(text) {
  results.log.push({ time: new Date().toLocaleTimeString('de-DE'), text });
}

// ── Alarm handler (replaces all setTimeout) ─────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  await ensureStateLoaded();

  if (alarm.name === 'processNext' && isRunning) {
    await processNext();
  }

  if (alarm.name === 'safetyTimeout') {
    if (isRunning && currentIndex >= 0 && currentIndex < editQueue.length) {
      const adId = editQueue[currentIndex] || '?';
      results.failed++;
      addLog(`⚠️ ${adId} — Zeitüberschreitung (45s), überspringe...`);
      if (currentTabId) {
        try {
          await chrome.tabs.remove(currentTabId);
        } catch {}
        currentTabId = null;
      }
      await saveState();
      const delay = Math.max((settings.delay || 3) / 60, 0.05);
      chrome.alarms.create('processNext', { delayInMinutes: delay });
    }
  }

  // Keepalive: just wakes the worker periodically while running
  if (alarm.name === 'keepalive') {
    console.log('[BulkEdit BG] keepalive ping, running:', isRunning);
    if (!isRunning) {
      chrome.alarms.clear('keepalive');
    }
  }
});

// ── Service worker startup: resume if killed mid-processing ─────

ensureStateLoaded().then(async () => {
  if (!isRunning) {
    chrome.action.setBadgeText({ text: '' });
    return;
  }

  console.log('[BulkEdit BG] Startup recovery — running, checking tab...');

  if (currentTabId) {
    try {
      await chrome.tabs.get(currentTabId);
      // Tab still exists → re-arm safety timeout, content script should still be working
      console.log(
        '[BulkEdit BG] Tab',
        currentTabId,
        'still alive, re-arming timeout',
      );
      chrome.alarms.create('safetyTimeout', { delayInMinutes: 0.75 });
    } catch {
      // Tab is gone → skip to next
      console.log('[BulkEdit BG] Tab gone, scheduling next');
      currentTabId = null;
      await saveState();
      chrome.alarms.create('processNext', { delayInMinutes: 0.05 });
    }
  } else {
    // No active tab but isRunning → schedule next
    console.log('[BulkEdit BG] No active tab, scheduling next');
    chrome.alarms.create('processNext', { delayInMinutes: 0.05 });
  }
});

// ── Message handler ─────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((err) => {
      console.error('[BulkEdit BG] Message error:', err);
      sendResponse({ success: false, error: err.message });
    });
  return true; // keep channel open for async sendResponse
});

async function handleMessage(message, sender) {
  await ensureStateLoaded();

  // ── Start bulk edit ──
  if (message.type === 'BULK_START') {
    await chrome.alarms.clearAll();
    editQueue = message.adIds || [];
    settings = message.settings || {};
    currentIndex = -1;
    currentTabId = null;
    isRunning = true;
    results = { done: 0, failed: 0, log: [] };
    await saveState();
    // Keepalive alarm: wakes worker every ~25s so it never dies mid-processing
    chrome.alarms.create('keepalive', { periodInMinutes: 0.4 });
    await processNext();
    return { success: true, total: editQueue.length };
  }

  // ── Stop bulk edit ──
  if (message.type === 'BULK_STOP') {
    isRunning = false;
    await chrome.alarms.clearAll();
    addLog('⏹ Vom Benutzer gestoppt');
    if (currentTabId) {
      try {
        await chrome.tabs.remove(currentTabId);
      } catch {}
      currentTabId = null;
    }
    await saveState();
    return { success: true };
  }

  // ── Get current status ──
  if (message.type === 'BULK_STATUS') {
    return {
      isRunning,
      currentIndex,
      total: editQueue.length,
      results,
      currentAdId:
        currentIndex >= 0 && currentIndex < editQueue.length
          ? editQueue[currentIndex]
          : null,
    };
  }

  // ── Content script: form edit failed ──
  if (message.type === 'EDIT_RESULT') {
    if (!message.success) {
      await chrome.alarms.clear('safetyTimeout');
      const adId = editQueue[currentIndex] || '?';
      results.failed++;
      addLog(`❌ ${adId} — ${message.error || 'Fehler'}`);
      if (currentTabId) {
        try {
          await chrome.tabs.remove(currentTabId);
        } catch {}
        currentTabId = null;
      }
      await saveState();
      const delay = Math.max((settings.delay || 3) / 60, 0.05);
      chrome.alarms.create('processNext', { delayInMinutes: delay });
    }
    return { success: true };
  }

  // ── Content script: save button clicked ──
  if (message.type === 'EDIT_SAVE_CLICKED') {
    const adId = editQueue[currentIndex] || '?';
    addLog(
      `💾 ${adId} — "Anzeige speichern" geklickt, warte auf Bestätigung...`,
    );
    await saveState();
    return { success: true };
  }

  // ── Content script: success page "Geschafft!" detected ──
  if (message.type === 'EDIT_SAVE_CONFIRMED') {
    console.log(
      '[BulkEdit BG] EDIT_SAVE_CONFIRMED from tab:',
      sender.tab?.id,
      'currentTabId:',
      currentTabId,
      'running:',
      isRunning,
    );

    if (sender.tab && sender.tab.id === currentTabId && isRunning) {
      await chrome.alarms.clear('safetyTimeout');
      const adId = editQueue[currentIndex] || '?';
      results.done++;
      addLog(`✅ ${adId} — Geschafft! Erfolgreich gespeichert.`);

      // Close the success tab immediately
      try {
        await chrome.tabs.remove(currentTabId);
      } catch {}
      currentTabId = null;
      await saveState();

      // Schedule next ad via alarm (survives worker termination)
      const delay = Math.max((settings.delay || 3) / 60, 0.05);
      chrome.alarms.create('processNext', { delayInMinutes: delay });
    }
    return { success: true };
  }

  // ── Content script asks for edit instructions ──
  if (message.type === 'GET_EDIT_INSTRUCTIONS') {
    if (
      sender.tab &&
      sender.tab.id === currentTabId &&
      isRunning &&
      currentIndex >= 0
    ) {
      return { active: true, adId: editQueue[currentIndex], settings };
    }
    return { active: false };
  }

  return { success: false, error: 'Unknown message type' };
}

// ── Process next ad in queue ────────────────────────────────────

async function processNext() {
  if (!isRunning) return;

  // Clean up any leftover tab
  if (currentTabId) {
    try {
      await chrome.tabs.remove(currentTabId);
    } catch {}
    currentTabId = null;
  }

  currentIndex++;

  if (currentIndex >= editQueue.length) {
    isRunning = false;
    addLog(`🏁 Fertig! ${results.done} erfolgreich, ${results.failed} Fehler`);
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#27ae60' });
    await chrome.alarms.clearAll();
    await saveState();
    return;
  }

  const adId = editQueue[currentIndex];
  addLog(`🔄 Bearbeite ${adId} (${currentIndex + 1}/${editQueue.length})...`);

  chrome.action.setBadgeText({ text: `${currentIndex + 1}` });
  chrome.action.setBadgeBackgroundColor({ color: '#3498db' });

  // Safety timeout: extend when photos need uploading (≈15s per photo + 45s base)
  const photoCount = (settings.photos && settings.photos.length) || 0;
  const safetyMinutes = photoCount > 0 ? Math.max(1.5, 0.75 + photoCount * 0.25) : 0.75;
  chrome.alarms.create('safetyTimeout', { delayInMinutes: safetyMinutes });

  // Open edit page
  const url = `https://www.kleinanzeigen.de/p-anzeige-bearbeiten.html?adId=${adId}`;
  const tab = await chrome.tabs.create({ url, active: true });
  currentTabId = tab.id;
  console.log('[BulkEdit BG] Opened tab', tab.id, 'for adId:', adId);

  await saveState();
}

// ── Tab closed by user → skip to next ───────────────────────────

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await ensureStateLoaded();

  if (tabId === currentTabId && isRunning) {
    console.log('[BulkEdit BG] Tab manually closed');
    await chrome.alarms.clear('safetyTimeout');
    currentTabId = null;

    const adId = editQueue[currentIndex] || '?';
    results.failed++;
    addLog(`⚠️ ${adId} — Tab manuell geschlossen`);

    await saveState();
    const delay = Math.max((settings.delay || 3) / 60, 0.05);
    chrome.alarms.create('processNext', { delayInMinutes: delay });
  }
});
