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
  // (after saving, Kleinanzeigen shows "Geschafft!")
  // ═══════════════════════════════════════════
  if (!currentUrl.includes('p-anzeige-bearbeiten')) {
    // Check immediately and also poll (page may still be loading)
    function checkForSuccess() {
      const bodyText = document.body?.textContent || '';
      if (
        bodyText.includes('Geschafft') ||
        bodyText.includes('Änderungen gehen online')
      ) {
        console.log(
          '[BikeHaus BulkEdit] ✅ Erfolgsseite erkannt! (Geschafft!)',
        );
        chrome.runtime.sendMessage({ type: 'EDIT_SAVE_CONFIRMED' });
        return true;
      }
      return false;
    }

    // Try immediately
    if (!checkForSuccess()) {
      // Retry a few times
      let retries = 0;
      const interval = setInterval(() => {
        retries++;
        if (checkForSuccess() || retries >= 10) {
          clearInterval(interval);
        }
      }, 500);
    }
    return; // Not an edit page, stop here
  }

  // ═══════════════════════════════════════════
  // STEP 2: We are on the EDIT page
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
    console.log('[BikeHaus BulkEdit] Settings:', response.settings);

    waitForForm()
      .then(() => {
        performEdit(response.settings);
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

  // Wait for the description textarea to appear on the page
  function waitForForm() {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      function check() {
        const descEl = findDescriptionField();
        if (descEl) {
          console.log('[BikeHaus BulkEdit] Description field found.');
          resolve(descEl);
          return;
        }
        if (Date.now() - startTime > MAX_WAIT_MS) {
          reject('Timeout waiting for description field');
          return;
        }
        setTimeout(check, POLL_INTERVAL_MS);
      }

      check();
    });
  }

  // Find the description textarea
  function findDescriptionField() {
    // Try known selectors for Kleinanzeigen edit form
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

    // Fallback: Find textarea near a "Beschreibung" label
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

    // Last resort: first textarea on page
    const allTextareas = document.querySelectorAll('textarea');
    if (allTextareas.length === 1) return allTextareas[0];

    return null;
  }

  // Set a value on an input/textarea (framework-compatible)
  function setFieldValue(element, value) {
    // Focus the element first so framework detects interaction
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

    // Dispatch all events frameworks might listen to
    element.dispatchEvent(new Event('focus', { bubbles: true }));
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('keydown', { bubbles: true }));
    element.dispatchEvent(new Event('keyup', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));

    console.log('[BikeHaus BulkEdit] Field value set, length:', value.length);
  }

  // Perform the actual edit
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
    const mode = settings.editMode || 'replace-all';

    switch (mode) {
      case 'replace-all':
        newText = settings.newDescription || '';
        break;

      case 'find-replace':
        if (settings.findText) {
          // Use global replace
          newText = currentText
            .split(settings.findText)
            .join(settings.replaceText || '');
        }
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

    // Auto-save if configured
    if (settings.autoSave) {
      setTimeout(() => clickSaveButton(), 1500);
    } else {
      chrome.runtime.sendMessage({
        type: 'EDIT_RESULT',
        success: true,
      });
    }
  }

  // Find and click the "Anzeige speichern" button
  // Does NOT send EDIT_RESULT — background waits for the success page ("Geschafft!")
  function clickSaveButton() {
    console.log('[BikeHaus BulkEdit] Looking for save button...');

    // Tell background we clicked save (but NOT result yet)
    function reportClicked() {
      chrome.runtime.sendMessage({ type: 'EDIT_SAVE_CLICKED' });
    }

    // Strategy 1: Find "Anzeige speichern" button by text
    const allButtons = document.querySelectorAll('button');
    for (const btn of allButtons) {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('anzeige speichern')) {
        console.log(
          '[BikeHaus BulkEdit] Found "Anzeige speichern" button, clicking...',
        );
        reportClicked();
        btn.click();
        return;
      }
    }

    // Strategy 2: Find by bg-primary class
    const primaryBtns = document.querySelectorAll(
      'button[class*="bg-primary"], button[class*="bg-primaryContainer"]',
    );
    for (const btn of primaryBtns) {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('speichern') || text.includes('veröffentlichen')) {
        console.log('[BikeHaus BulkEdit] Found primary button:', text);
        reportClicked();
        btn.click();
        return;
      }
    }

    // Strategy 3: Any button with "speichern" text
    for (const btn of allButtons) {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('speichern')) {
        console.log('[BikeHaus BulkEdit] Found button with speichern:', text);
        reportClicked();
        btn.click();
        return;
      }
    }

    // Strategy 4: Submit the form directly
    const form = document.querySelector('form');
    if (form) {
      const csrfField = form.querySelector('input[name="_csrf"]');
      const adIdField = form.querySelector('input[name="adId"]');
      if (csrfField || adIdField) {
        console.log('[BikeHaus BulkEdit] Submitting form directly...');
        reportClicked();
        form.submit();
        return;
      }
    }

    // Strategy 5: Fallback submit buttons
    const fallbackSelectors = ['button[type="submit"]', 'input[type="submit"]'];
    for (const sel of fallbackSelectors) {
      const btn = document.querySelector(sel);
      if (btn) {
        console.log('[BikeHaus BulkEdit] Clicking fallback button:', sel);
        reportClicked();
        btn.click();
        return;
      }
    }

    console.log('[BikeHaus BulkEdit] ERROR: No save button found on page');
    chrome.runtime.sendMessage({
      type: 'EDIT_RESULT',
      success: false,
      error: '"Anzeige speichern" Button nicht gefunden',
    });
  }
})();
