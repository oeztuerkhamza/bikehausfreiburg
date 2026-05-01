// ============================================
// BikeHaus Bulk Editor - Content Script
// Runs on ALL Kleinanzeigen pages.
// - On edit pages: fills form + clicks save
// - On success pages: detects "Geschafft!" and reports success
// ============================================

(function () {
  'use strict';

  const MAX_WAIT_MS = 15000;
  const POLL_INTERVAL_MS = 500;
  const currentUrl = window.location.href;

  // ═══════════════════════════════════════════
  // STEP 1: Check if this is a SUCCESS page
  // ═══════════════════════════════════════════
  if (!currentUrl.includes('p-anzeige-bearbeiten')) {
    function checkForSuccess() {
      const bodyText = document.body?.textContent || '';
      if (
        bodyText.includes('Geschafft') ||
        bodyText.includes('Änderungen gehen online')
      ) {
        console.log('[BikeHaus BulkEdit] ✅ Erfolgsseite erkannt!');
        chrome.runtime.sendMessage({ type: 'EDIT_SAVE_CONFIRMED' });
        return true;
      }
      return false;
    }
    if (!checkForSuccess()) {
      let retries = 0;
      const interval = setInterval(() => {
        retries++;
        if (checkForSuccess() || retries >= 10) clearInterval(interval);
      }, 500);
    }
    return;
  }

  // ═══════════════════════════════════════════
  // STEP 2: EDIT page
  // ═══════════════════════════════════════════
  chrome.runtime.sendMessage({ type: 'GET_EDIT_INSTRUCTIONS' }, (response) => {
    if (!response || !response.active) {
      console.log('[BikeHaus BulkEdit] No active edit task, skipping.');
      return;
    }
    console.log(
      '[BikeHaus BulkEdit] Edit task received for adId:',
      response.adId,
    );
    waitForForm()
      .then(async () => {
        await performEditWithPhotos(response.settings);
      })
      .catch((err) => {
        console.error('[BikeHaus BulkEdit] Form not found:', err);
        chrome.runtime.sendMessage({
          type: 'EDIT_RESULT',
          success: false,
          error: 'Formular nicht gefunden (Timeout)',
        });
      });
  });

  // ─── Wait for textarea ───────────────────────
  function waitForForm() {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      function check() {
        const el = findDescriptionField();
        if (el) {
          resolve(el);
          return;
        }
        if (Date.now() - startTime > MAX_WAIT_MS) {
          reject(new Error('Timeout'));
          return;
        }
        setTimeout(check, POLL_INTERVAL_MS);
      }
      check();
    });
  }

  // ─── Find description textarea ───────────────
  function findDescriptionField() {
    const selectors = [
      '#pstad-descrptn',
      'textarea[id*="descr"]',
      'textarea[name*="descr"]',
      'textarea[placeholder*="Beschreib"]',
      'textarea[data-testid*="description"]',
      'textarea[data-testid*="descr"]',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    const labels = document.querySelectorAll(
      'label, legend, span, div, h3, h4',
    );
    for (const label of labels) {
      const text = label.textContent.trim().toLowerCase();
      if (text.includes('beschreibung') || text.includes('description')) {
        let parent = label.parentElement;
        for (let i = 0; i < 5 && parent; i++) {
          const textarea = parent.querySelector('textarea');
          if (textarea) return textarea;
          parent = parent.parentElement;
        }
      }
    }
    const all = document.querySelectorAll('textarea');
    if (all.length === 1) return all[0];
    return null;
  }

  // ─── Set field value (React-compatible) ──────
  function setFieldValue(element, value) {
    element.focus();
    element.click();
    const proto =
      element.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(element, value);
    } else {
      element.value = value;
    }
    ['focus', 'input', 'change', 'keydown', 'keyup', 'blur'].forEach((ev) =>
      element.dispatchEvent(new Event(ev, { bubbles: true })),
    );
    console.log('[BikeHaus BulkEdit] Field value set, length:', value.length);
  }

  // ─── Sleep helper ────────────────────────────
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // ─── Find Kleinanzeigen Uppy file input ──────
  // Kleinanzeigen uses @uppy/xhr-upload. The hidden input is:
  //   <input type="file" accept="image/jpeg,image/gif,image/png,.heic,..." multiple class="hidden">
  // It sits right after the "Bilder hinzufügen" button.
  function findPhotoInput() {
    const specific = document.querySelector(
      'input[type="file"][accept*="image/jpeg"][multiple]',
    );
    if (specific) return specific;
    for (const sel of [
      'input[type="file"][accept*="image"][multiple]',
      'input[type="file"][accept*="image"]',
      'input[type="file"][multiple]',
      'input[type="file"]',
    ]) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  // Count existing photo thumbnails
  function countPhotoElements() {
    const selectors = [
      'img[alt="Bild zur Anzeige"]',
      'div[class*="group relative flex"][class*="size-"]',
      '[class*="galleryimage"]',
      '[class*="gallery-image"]',
      '[class*="ImageBox"]',
      '[class*="uploadedImage"]',
    ];
    let max = 0;
    for (const sel of selectors) {
      const count = document.querySelectorAll(sel).length;
      if (count > max) max = count;
    }
    return max;
  }

  // ─── Delete the LAST N photos from the listing ────────
  // Extension manages a fixed "slot" of up to 5 photos at the end.
  // Photos before this slot (e.g. shop promo at position 6+) are never touched.
  //
  // Algorithm: each iteration get all delete buttons, click the LAST one.
  // Repeat until we've deleted `n` photos or timeout.
  async function deleteLastNPhotos(n) {
    if (!n || n <= 0) return;
    console.log(`[BikeHaus BulkEdit] Deleting last ${n} photos...`);
    const maxWaitMs = 30000;
    const startTs = Date.now();
    let deleted = 0;

    while (deleted < n && Date.now() - startTs < maxWaitMs) {
      const deleteBtns = Array.from(
        document.querySelectorAll('button[aria-label="Bild entfernen"]'),
      ).filter((btn) => btn.offsetParent !== null);

      if (deleteBtns.length === 0) {
        console.log('[BikeHaus BulkEdit] No more photos to delete');
        break;
      }

      // Click the LAST button → removes the last photo, preserving earlier ones
      const lastBtn = deleteBtns[deleteBtns.length - 1];
      lastBtn.click();
      deleted++;
      console.log(`[BikeHaus BulkEdit] Deleted photo ${deleted}/${n}`);
      await sleep(700); // wait for DOM update
    }

    if (deleted > 0) await sleep(500);
    console.log(
      `[BikeHaus BulkEdit] Deletion done. Removed ${deleted} photos.`,
    );
  }

  // Upload photos via Uppy file input
  async function performPhotoUpload(photos) {
    console.log(`[BikeHaus BulkEdit] Uploading ${photos.length} photos...`);
    const fileInput = findPhotoInput();
    if (!fileInput) {
      console.warn('[BikeHaus BulkEdit] Photo input not found – skipping');
      return;
    }
    const dt = new DataTransfer();
    for (const photo of photos) {
      try {
        const b64 = photo.data.includes(',')
          ? photo.data.split(',')[1]
          : photo.data;
        const byteChars = atob(b64);
        const byteArr = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++)
          byteArr[i] = byteChars.charCodeAt(i);
        dt.items.add(
          new File([byteArr], photo.name, { type: photo.type || 'image/jpeg' }),
        );
        console.log(`[BikeHaus BulkEdit] Queued: ${photo.name}`);
      } catch (err) {
        console.error(
          `[BikeHaus BulkEdit] Error processing ${photo.name}:`,
          err,
        );
      }
    }
    if (dt.files.length === 0) {
      console.warn('[BikeHaus BulkEdit] No valid photos');
      return;
    }

    const beforeCount = countPhotoElements();
    console.log(`[BikeHaus BulkEdit] Photos before upload: ${beforeCount}`);

    fileInput.files = dt.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    fileInput.dispatchEvent(new Event('input', { bubbles: true }));

    const expectedMin = beforeCount + dt.files.length;
    const startTs = Date.now();
    while (Date.now() - startTs < 30000) {
      await sleep(600);
      const current = countPhotoElements();
      if (current >= expectedMin) {
        console.log(`[BikeHaus BulkEdit] Upload done – count: ${current}`);
        await sleep(800);
        return;
      }
    }
    console.warn('[BikeHaus BulkEdit] Upload wait timed out, proceeding...');
    await sleep(1000);
  }

  // ─── Edit: delete last-slot photos → upload new → edit description ────
  async function performEditWithPhotos(settings) {
    if (settings.deleteExistingPhotos) {
      // Delete exactly as many photos as we're about to add (max 5).
      // If no new photos selected, delete 5 (full slot reset).
      const deleteCount =
        settings.photos && settings.photos.length > 0
          ? settings.photos.length
          : 5;
      await deleteLastNPhotos(deleteCount);
    }
    if (settings.photos && settings.photos.length > 0) {
      await performPhotoUpload(settings.photos);
    }
    performEdit(settings);
  }

  // ─── Edit description ────────────────────────
  function performEdit(settings) {
    const descEl = findDescriptionField();
    if (!descEl) {
      chrome.runtime.sendMessage({
        type: 'EDIT_RESULT',
        success: false,
        error: 'Beschreibung-Feld nicht gefunden',
      });
      return;
    }
    const currentText = descEl.value || '';
    let newText = currentText;
    switch (settings.editMode || 'replace-all') {
      case 'replace-all':
        newText = settings.newDescription || '';
        break;
      case 'find-replace':
        newText = settings.findText
          ? currentText
              .split(settings.findText)
              .join(settings.replaceText || '')
          : currentText;
        break;
      case 'append':
        newText = currentText + '\n' + (settings.appendText || '');
        break;
      case 'prepend':
        newText = (settings.prependText || '') + '\n' + currentText;
        break;
    }
    console.log(
      '[BikeHaus BulkEdit] Setting description:',
      newText.substring(0, 100) + '...',
    );
    setFieldValue(descEl, newText);
    if (settings.autoSave) {
      setTimeout(() => clickSaveButton(), 1500);
    } else {
      chrome.runtime.sendMessage({ type: 'EDIT_RESULT', success: true });
    }
  }

  // ─── Click "Anzeige speichern" ───────────────
  function clickSaveButton() {
    console.log('[BikeHaus BulkEdit] Looking for save button...');
    function reportClicked() {
      chrome.runtime.sendMessage({ type: 'EDIT_SAVE_CLICKED' });
    }

    const allButtons = document.querySelectorAll('button');

    for (const btn of allButtons) {
      if (btn.textContent.trim().toLowerCase().includes('anzeige speichern')) {
        console.log('[BikeHaus BulkEdit] Found "Anzeige speichern"');
        reportClicked();
        btn.click();
        return;
      }
    }
    for (const btn of document.querySelectorAll(
      'button[class*="bg-primary"], button[class*="bg-primaryContainer"]',
    )) {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('speichern') || text.includes('veröffentlichen')) {
        console.log('[BikeHaus BulkEdit] Found primary button:', text);
        reportClicked();
        btn.click();
        return;
      }
    }
    for (const btn of allButtons) {
      if (btn.textContent.trim().toLowerCase().includes('speichern')) {
        console.log('[BikeHaus BulkEdit] Found speichern button');
        reportClicked();
        btn.click();
        return;
      }
    }
    const form = document.querySelector('form');
    if (
      form &&
      (form.querySelector('input[name="_csrf"]') ||
        form.querySelector('input[name="adId"]'))
    ) {
      console.log('[BikeHaus BulkEdit] Submitting form directly');
      reportClicked();
      form.submit();
      return;
    }
    for (const sel of ['button[type="submit"]', 'input[type="submit"]']) {
      const btn = document.querySelector(sel);
      if (btn) {
        console.log('[BikeHaus BulkEdit] Fallback submit button');
        reportClicked();
        btn.click();
        return;
      }
    }

    console.log('[BikeHaus BulkEdit] ERROR: No save button found');
    chrome.runtime.sendMessage({
      type: 'EDIT_RESULT',
      success: false,
      error: '"Anzeige speichern" nicht gefunden',
    });
  }
})();
