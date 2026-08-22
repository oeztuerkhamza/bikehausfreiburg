// ============================================
// BikeHaus Bulk Editor - Background Service Worker
// MV3 compatible: uses chrome.storage.local for state persistence
// and chrome.alarms instead of setTimeout (which dies with the worker).
//
// Supports 1-5 PARALLEL tabs (settings.parallelTabs).
// Flow per tab: open edit tab → content script fills & clicks save →
//   (Top-Anzeige upsell popup wird automatisch weggeklickt) →
//   page navigates to success page → content script detects "Geschafft!" →
//   background closes tab → schedules next ad launch (staggered by delay)
// ============================================

// ── In-memory state (restored from storage on every wake-up) ──
let editQueue = [];
let nextIndex = 0; // next queue position to launch
let isRunning = false;
let settings = {};
let results = { done: 0, failed: 0, log: [] };
let activeTabs = {}; // tabId -> { adId, index }
let alarmSeq = 0; // unique launch-alarm names (parallel-safe)

// ── State persistence ──────────────────────────────────────────
// NOTE: key is 'bulkEditRuntime' — the popup uses 'bulkEditState' for its
// form fields. They used to share one key and clobbered each other.

let _stateLoaded = false;
let _loadPromise = null;

function ensureStateLoaded() {
  if (_stateLoaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = chrome.storage.local.get('bulkEditRuntime').then((data) => {
      if (data.bulkEditRuntime) {
        const s = data.bulkEditRuntime;
        editQueue = s.editQueue || [];
        nextIndex = s.nextIndex ?? 0;
        isRunning = s.isRunning || false;
        settings = s.settings || {};
        results = s.results || { done: 0, failed: 0, log: [] };
        activeTabs = s.activeTabs || {};
        alarmSeq = s.alarmSeq || 0;
      }
      _stateLoaded = true;
      console.log(
        '[BulkEdit BG] State loaded. running:',
        isRunning,
        'next:',
        nextIndex,
        '/',
        editQueue.length,
        'active tabs:',
        Object.keys(activeTabs).length,
      );
    });
  }
  return _loadPromise;
}

async function saveState() {
  await chrome.storage.local.set({
    bulkEditRuntime: {
      editQueue,
      nextIndex,
      isRunning,
      settings,
      results,
      activeTabs,
      alarmSeq,
    },
  });
}

// ── Helpers ─────────────────────────────────────────────────────

function addLog(text) {
  results.log.push({ time: new Date().toLocaleTimeString('de-DE'), text });
}

function parallelLimit() {
  const n = parseInt(settings.parallelTabs, 10) || 1;
  return Math.min(Math.max(n, 1), 5);
}

function activeCount() {
  return Object.keys(activeTabs).length;
}

function updateBadge() {
  if (!isRunning) return;
  chrome.action.setBadgeText({
    text: String(results.done + results.failed),
  });
  chrome.action.setBadgeBackgroundColor({ color: '#3498db' });
}

function safetyMinutes() {
  // Extend when photos need uploading (≈15s per photo + 45s base)
  const photoCount = (settings.photos && settings.photos.length) || 0;
  return photoCount > 0 ? Math.max(1.5, 0.75 + photoCount * 0.25) : 0.75;
}

function scheduleLaunch() {
  const delay = Math.max((settings.delay || 3) / 60, 0.05);
  alarmSeq++;
  chrome.alarms.create('launch_' + alarmSeq, { delayInMinutes: delay });
}

// ── Launch one ad in a new tab (fills free pool slots) ──────────

async function launchOne() {
  if (!isRunning) return;
  if (activeCount() >= parallelLimit()) return;
  if (nextIndex >= editQueue.length) {
    await checkFinished();
    return;
  }

  const index = nextIndex++;
  const adId = editQueue[index];
  addLog(`🔄 Bearbeite ${adId} (${index + 1}/${editQueue.length})...`);
  updateBadge();

  const url = `https://www.kleinanzeigen.de/p-anzeige-bearbeiten.html?adId=${adId}`;
  // Parallel mode: open in background so tabs don't fight over focus
  const tab = await chrome.tabs.create({ url, active: parallelLimit() === 1 });
  activeTabs[tab.id] = { adId, index };
  console.log('[BulkEdit BG] Opened tab', tab.id, 'for adId:', adId);

  // Per-tab safety timeout
  chrome.alarms.create('safety_' + tab.id, {
    delayInMinutes: safetyMinutes(),
  });

  await saveState();

  // More free slots? Stagger the next launch by `delay`
  if (activeCount() < parallelLimit() && nextIndex < editQueue.length) {
    scheduleLaunch();
  }
}

// ── Finish one tab (success or failure) ─────────────────────────

async function finishTab(tabId, success, errorMsg) {
  const info = activeTabs[tabId];
  if (!info) return;
  delete activeTabs[tabId];
  await chrome.alarms.clear('safety_' + tabId);

  if (success) {
    results.done++;
    addLog(`✅ ${info.adId} — Geschafft! Erfolgreich gespeichert.`);
  } else {
    results.failed++;
    addLog(`❌ ${info.adId} — ${errorMsg || 'Fehler'}`);
  }

  try {
    await chrome.tabs.remove(tabId);
  } catch {}

  updateBadge();
  await saveState();

  if (isRunning) {
    if (nextIndex < editQueue.length) {
      scheduleLaunch();
    } else {
      await checkFinished();
    }
  }
}

async function checkFinished() {
  if (isRunning && nextIndex >= editQueue.length && activeCount() === 0) {
    isRunning = false;
    addLog(`🏁 Fertig! ${results.done} erfolgreich, ${results.failed} Fehler`);
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#27ae60' });
    await chrome.alarms.clearAll();
    await saveState();
  }
}

// ── Alarm handler (replaces all setTimeout) ─────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  await ensureStateLoaded();

  if (alarm.name.startsWith('launch_')) {
    if (isRunning) await launchOne();
    return;
  }

  if (alarm.name.startsWith('safety_')) {
    const tabId = parseInt(alarm.name.slice('safety_'.length), 10);
    if (isRunning && activeTabs[tabId]) {
      await finishTab(tabId, false, 'Zeitüberschreitung, überspringe...');
    }
    return;
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

  console.log('[BulkEdit BG] Startup recovery — running, checking tabs...');

  for (const tabIdStr of Object.keys(activeTabs)) {
    const tabId = parseInt(tabIdStr, 10);
    try {
      await chrome.tabs.get(tabId);
      // Tab still exists → re-arm its safety timeout
      chrome.alarms.create('safety_' + tabId, {
        delayInMinutes: safetyMinutes(),
      });
      console.log('[BulkEdit BG] Tab', tabId, 'still alive');
    } catch {
      const info = activeTabs[tabId];
      delete activeTabs[tabId];
      results.failed++;
      addLog(`⚠️ ${info.adId} — Tab verloren (Neustart), überspringe...`);
      console.log('[BulkEdit BG] Tab', tabId, 'gone');
    }
  }
  await saveState();

  if (nextIndex < editQueue.length && activeCount() < parallelLimit()) {
    scheduleLaunch();
  } else {
    await checkFinished();
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
  const senderTabId = sender.tab ? sender.tab.id : null;

  // ── Start bulk edit ──
  if (message.type === 'BULK_START') {
    await chrome.alarms.clearAll();
    editQueue = message.adIds || [];
    settings = message.settings || {};
    nextIndex = 0;
    activeTabs = {};
    alarmSeq = 0;
    isRunning = true;
    results = { done: 0, failed: 0, log: [] };
    await saveState();
    // Keepalive alarm: wakes worker every ~25s so it never dies mid-processing
    chrome.alarms.create('keepalive', { periodInMinutes: 0.4 });
    await launchOne();
    return { success: true, total: editQueue.length };
  }

  // ── Stop bulk edit ──
  if (message.type === 'BULK_STOP') {
    isRunning = false;
    await chrome.alarms.clearAll();
    addLog('⏹ Vom Benutzer gestoppt');
    for (const tabIdStr of Object.keys(activeTabs)) {
      try {
        await chrome.tabs.remove(parseInt(tabIdStr, 10));
      } catch {}
    }
    activeTabs = {};
    await saveState();
    return { success: true };
  }

  // ── Get current status ──
  if (message.type === 'BULK_STATUS') {
    const activeAds = Object.values(activeTabs).map((t) => t.adId);
    return {
      isRunning,
      launched: nextIndex,
      total: editQueue.length,
      results,
      activeAds,
      currentAdId: activeAds[0] || null,
    };
  }

  // ── Content script asks: is this tab part of the bulk run? ──
  if (message.type === 'IS_BULK_TAB') {
    return {
      isBulkTab: !!(isRunning && senderTabId && activeTabs[senderTabId]),
    };
  }

  // ── Content script: form edit failed ──
  if (message.type === 'EDIT_RESULT') {
    if (!message.success && senderTabId && activeTabs[senderTabId]) {
      await finishTab(senderTabId, false, message.error);
    }
    return { success: true };
  }

  // ── Content script: save button clicked ──
  if (message.type === 'EDIT_SAVE_CLICKED') {
    if (senderTabId && activeTabs[senderTabId]) {
      addLog(
        `💾 ${activeTabs[senderTabId].adId} — "Anzeige speichern" geklickt, warte auf Bestätigung...`,
      );
      await saveState();
    }
    return { success: true };
  }

  // ── Content script: success page "Geschafft!" detected ──
  if (message.type === 'EDIT_SAVE_CONFIRMED') {
    console.log(
      '[BulkEdit BG] EDIT_SAVE_CONFIRMED from tab:',
      senderTabId,
      'running:',
      isRunning,
    );
    if (isRunning && senderTabId && activeTabs[senderTabId]) {
      await finishTab(senderTabId, true);
    }
    return { success: true };
  }

  // ── Content script asks for edit instructions ──
  if (message.type === 'GET_EDIT_INSTRUCTIONS') {
    if (isRunning && senderTabId && activeTabs[senderTabId]) {
      return { active: true, adId: activeTabs[senderTabId].adId, settings };
    }
    return { active: false };
  }

  return { success: false, error: 'Unknown message type' };
}

// ── Tab closed by user → mark failed, launch next ───────────────

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await ensureStateLoaded();

  if (isRunning && activeTabs[tabId]) {
    console.log('[BulkEdit BG] Tab manually closed:', tabId);
    const info = activeTabs[tabId];
    delete activeTabs[tabId];
    await chrome.alarms.clear('safety_' + tabId);
    results.failed++;
    addLog(`⚠️ ${info.adId} — Tab manuell geschlossen`);
    await saveState();
    if (nextIndex < editQueue.length) {
      scheduleLaunch();
    } else {
      await checkFinished();
    }
  }
});
