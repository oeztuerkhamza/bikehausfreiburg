// ============================================
// BikeHaus Bulk Editor - Popup Script
// ============================================

const STANDARD_TEMPLATE = `Bike Haus Freiburg – Ihr gebrauchte Fahrradladen in Freiburg

✅ Neue Fahrrad 24 Monate Garantie
✅ Gebrauchte Fahrrad 3 Monate Garantie
✅ Rückgabe innerhalb von 3 Tagen möglich, falls Sie nicht zufrieden sind
✅ Probefahrt jederzeit möglich
✅ Fahrradreservierungen sind leider nicht möglich

Adresse & Öffnungszeiten:
Heckerstraße 27, Freiburg
Mo 11:00–17:30
Di 11:00–17:30
Mi 14:00–17:30
Do 11:00–17:30
Fr 11:00–13:00 & 15:00–18:00
Sa 11:30–17:00

Ankauf:
Wir kaufen nur qualitativ hochwertige Fahrräder (Cube, Bulls, KTM, Ghost, Frog, Woom, Pyro, Bergamont, Stevens, Giant, Kalkhoff, Steppenwolf).
Bilder und Preis bitte per Kleinanzeigen oder WhatsApp (+49 15566 300011) senden.

Ausstattung & Hinweis:
Fahrrad ist komplett überprüft und fahrbereit
Gepäckträger oder Fahrradkorb gegen Aufpreis erhältlich
Verkauf mit Rechnung/Kaufvertrag
Weitere Angebote finden Sie in unseren Anzeigen.`;

document.addEventListener('DOMContentLoaded', () => {
  // ── Elements ──
  const adIdsEl = document.getElementById('ad-ids');
  const adCountEl = document.getElementById('ad-count');
  const editModeEl = document.getElementById('edit-mode');
  const btnStart = document.getElementById('btn-start');
  const btnStop = document.getElementById('btn-stop');
  const btnLoadTemplate = document.getElementById('btn-load-template');
  const btnFetchApi = document.getElementById('btn-fetch-api');
  const apiUrlEl = document.getElementById('api-url');
  const apiStatusEl = document.getElementById('api-status');
  const listingTableContainer = document.getElementById(
    'listing-table-container',
  );
  const listingList = document.getElementById('listing-list');
  const selectedCountEl = document.getElementById('selected-count');
  const progressInfo = document.getElementById('progress-info');
  const progressBar = document.getElementById('progress-bar');
  const statDone = document.getElementById('stat-done');
  const statTotal = document.getElementById('stat-total');
  const statFail = document.getElementById('stat-fail');
  const progressLog = document.getElementById('progress-log');

  let allListings = []; // Fetched from API
  let selectedIds = new Set();
  let selectedPhotos = []; // [{name, type, data: base64DataURL}]

  // ── Tab switching ──
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document
        .querySelectorAll('.tab')
        .forEach((t) => t.classList.remove('active'));
      document
        .querySelectorAll('.tab-content')
        .forEach((tc) => tc.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // ── Mode switching ──
  editModeEl.addEventListener('change', () => {
    document
      .querySelectorAll('.mode-content')
      .forEach((mc) => mc.classList.remove('active'));
    document.getElementById('mode-' + editModeEl.value).classList.add('active');
  });

  // ── Parse ad IDs from textarea + selected listings ──
  function parseAdIds() {
    const ids = new Set(selectedIds);

    // Also parse manual textarea
    const raw = (adIdsEl.value || '').trim();
    if (raw) {
      raw
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          const urlMatch = line.match(/adId=(\d+)/);
          if (urlMatch) return urlMatch[1];
          const numMatch = line.match(/(\d{5,})/);
          if (numMatch) return numMatch[1];
          return line;
        })
        .filter((id) => /^\d+$/.test(id))
        .forEach((id) => ids.add(id));
    }

    return [...ids];
  }

  function updateAdCount() {
    adCountEl.textContent = parseAdIds().length;
  }

  // ── Update ad count ──
  adIdsEl.addEventListener('input', updateAdCount);

  // ── API Fetch: Get all listings from backend ──
  btnFetchApi.addEventListener('click', async () => {
    const apiBase = apiUrlEl.value.trim().replace(/\/+$/, '');
    if (!apiBase) {
      apiStatusEl.textContent = '❌ API adresi boş!';
      apiStatusEl.className = 'api-status error';
      return;
    }

    btnFetchApi.disabled = true;
    btnFetchApi.textContent = '⏳ Yükleniyor...';
    apiStatusEl.textContent = '';
    apiStatusEl.className = 'api-status';

    try {
      const response = await fetch(`${apiBase}/api/public/listings`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const listings = await response.json();
      allListings = listings.filter((l) => l.isActive && l.externalId);

      apiStatusEl.textContent = `✅ ${allListings.length} aktif ilan bulundu`;
      apiStatusEl.className = 'api-status success';

      // Save API URL
      chrome.storage.local.set({ apiUrl: apiBase });

      renderListingTable();
    } catch (err) {
      apiStatusEl.textContent = `❌ Hata: ${err.message}`;
      apiStatusEl.className = 'api-status error';
      listingTableContainer.style.display = 'none';
    } finally {
      btnFetchApi.disabled = false;
      btnFetchApi.textContent = "🔄 API'den Çek";
    }
  });

  // ── Render listing table with checkboxes ──
  function renderListingTable() {
    if (allListings.length === 0) {
      listingTableContainer.style.display = 'none';
      return;
    }

    listingTableContainer.style.display = 'block';

    listingList.innerHTML = allListings
      .map((listing) => {
        const price = listing.price
          ? `${listing.price} €`
          : listing.priceText || '-';
        const category = listing.category || '-';
        const shortTitle =
          listing.title.length > 50
            ? listing.title.substring(0, 47) + '...'
            : listing.title;

        return `
        <label class="listing-row" data-id="${listing.externalId}">
          <input type="checkbox" class="listing-check" value="${listing.externalId}" />
          <span class="listing-id">${listing.externalId}</span>
          <span class="listing-title" title="${listing.title}">${shortTitle}</span>
          <span class="listing-price">${price}</span>
          <span class="listing-cat">${category}</span>
        </label>
      `;
      })
      .join('');

    // Attach checkbox events
    listingList.querySelectorAll('.listing-check').forEach((cb) => {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          selectedIds.add(cb.value);
        } else {
          selectedIds.delete(cb.value);
        }
        selectedCountEl.textContent = selectedIds.size;
        updateAdCount();
      });
    });
  }

  // ── Select All / Deselect All ──
  document.getElementById('btn-select-all').addEventListener('click', () => {
    listingList.querySelectorAll('.listing-check').forEach((cb) => {
      cb.checked = true;
      selectedIds.add(cb.value);
    });
    selectedCountEl.textContent = selectedIds.size;
    updateAdCount();
  });

  document.getElementById('btn-deselect-all').addEventListener('click', () => {
    listingList.querySelectorAll('.listing-check').forEach((cb) => {
      cb.checked = false;
    });
    selectedIds.clear();
    selectedCountEl.textContent = 0;
    updateAdCount();
  });

  // ── Load template ──
  btnLoadTemplate.addEventListener('click', () => {
    document.getElementById('new-description').value = STANDARD_TEMPLATE;
  });

  // ── Gather settings ──
  function gatherSettings() {
    const mode = editModeEl.value;
    return {
      editMode: mode,
      newDescription: document.getElementById('new-description')?.value || '',
      findText: document.getElementById('find-text')?.value || '',
      replaceText: document.getElementById('replace-text')?.value || '',
      appendText: document.getElementById('append-text')?.value || '',
      prependText: document.getElementById('prepend-text')?.value || '',
      autoSave: document.getElementById('auto-save').checked,
      autoClose: document.getElementById('auto-close').checked,
      delay: parseInt(document.getElementById('delay').value, 10) || 3,
      photos: selectedPhotos,
      deleteExistingPhotos:
        document.getElementById('delete-existing-photos')?.checked || false,
    };
  }

  // ── Save state to storage ──
  function saveState() {
    chrome.storage.local.set({
      bulkEditState: {
        adIds: adIdsEl.value,
        editMode: editModeEl.value,
        newDescription: document.getElementById('new-description')?.value || '',
        findText: document.getElementById('find-text')?.value || '',
        replaceText: document.getElementById('replace-text')?.value || '',
        appendText: document.getElementById('append-text')?.value || '',
        prependText: document.getElementById('prepend-text')?.value || '',
        autoSave: document.getElementById('auto-save').checked,
        autoClose: document.getElementById('auto-close').checked,
        delay: document.getElementById('delay').value,
      },
    });
  }

  function loadState() {
    chrome.storage.local.get(['bulkEditState', 'apiUrl'], (result) => {
      // Restore API URL
      if (result.apiUrl) {
        apiUrlEl.value = result.apiUrl;
      }

      const s = result.bulkEditState;
      if (!s) return;
      adIdsEl.value = s.adIds || '';
      updateAdCount();
      editModeEl.value = s.editMode || 'replace-all';
      editModeEl.dispatchEvent(new Event('change'));
      if (s.newDescription)
        document.getElementById('new-description').value = s.newDescription;
      if (s.findText) document.getElementById('find-text').value = s.findText;
      if (s.replaceText)
        document.getElementById('replace-text').value = s.replaceText;
      if (s.appendText)
        document.getElementById('append-text').value = s.appendText;
      if (s.prependText)
        document.getElementById('prepend-text').value = s.prependText;
      document.getElementById('auto-save').checked = s.autoSave !== false;
      document.getElementById('auto-close').checked = s.autoClose !== false;
      document.getElementById('delay').value = s.delay || 3;
    });
  }

  // ── Start bulk edit ──
  btnStart.addEventListener('click', () => {
    const adIds = parseAdIds();
    if (adIds.length === 0) {
      alert('Bitte mindestens eine Anzeigen-ID eingeben.');
      return;
    }

    const settings = gatherSettings();

    // Validate mode-specific fields
    if (
      settings.editMode === 'replace-all' &&
      !settings.newDescription.trim()
    ) {
      alert('Bitte eine neue Beschreibung eingeben.');
      return;
    }
    if (settings.editMode === 'find-replace' && !settings.findText.trim()) {
      alert('Bitte den zu suchenden Text eingeben.');
      return;
    }

    // Save state
    saveState();

    // Switch to progress tab
    document
      .querySelectorAll('.tab')
      .forEach((t) => t.classList.remove('active'));
    document
      .querySelectorAll('.tab-content')
      .forEach((tc) => tc.classList.remove('active'));
    document.querySelector('[data-tab="tab-progress"]').classList.add('active');
    document.getElementById('tab-progress').classList.add('active');

    // Send to background
    chrome.runtime.sendMessage(
      {
        type: 'BULK_START',
        adIds,
        settings,
      },
      (response) => {
        if (response && response.success) {
          btnStart.style.display = 'none';
          btnStop.style.display = 'block';
          statTotal.textContent = response.total;
          progressInfo.textContent = 'Läuft...';
          progressLog.innerHTML = '';
          startPolling();
        }
      },
    );
  });

  // ── Stop bulk edit ──
  btnStop.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'BULK_STOP' }, () => {
      btnStart.style.display = 'block';
      btnStop.style.display = 'none';
      progressInfo.textContent = 'Gestoppt.';
    });
  });

  // ── Poll for progress updates ──
  let pollInterval = null;

  function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(updateProgress, 1000);
  }

  function updateProgress() {
    chrome.runtime.sendMessage({ type: 'BULK_STATUS' }, (status) => {
      if (!status) return;

      const total = status.total || 1;
      const done = status.results.done + status.results.failed;
      const pct = Math.round((done / total) * 100);

      progressBar.style.width = pct + '%';
      statDone.textContent = status.results.done;
      statTotal.textContent = total;
      statFail.textContent = status.results.failed;

      if (status.currentAdId) {
        progressInfo.textContent = `Bearbeite: ${status.currentAdId} (${status.currentIndex + 1}/${total})`;
      }

      // Update log
      progressLog.innerHTML = status.results.log
        .map(
          (entry) =>
            `<div class="log-entry"><span class="log-time">${entry.time}</span>${entry.text}</div>`,
        )
        .join('');
      progressLog.scrollTop = progressLog.scrollHeight;

      if (!status.isRunning) {
        clearInterval(pollInterval);
        pollInterval = null;
        btnStart.style.display = 'block';
        btnStop.style.display = 'none';
        progressInfo.textContent = `Fertig! ${status.results.done} erfolgreich, ${status.results.failed} Fehler`;
      }
    });
  }

  // ── Auto-save on input changes ──
  document.querySelectorAll('textarea, input, select').forEach((el) => {
    el.addEventListener('change', saveState);
  });

  // ── Initialize ──
  loadState();

  // ── Photo tab handlers ──
  const btnSelectPhotos = document.getElementById('btn-select-photos');
  const btnClearPhotos = document.getElementById('btn-clear-photos');
  const photoFileInput = document.getElementById('photo-file-input');
  const photoCountLabel = document.getElementById('photo-count-label');
  const photoPreviewGrid = document.getElementById('photo-preview-grid');
  const photoWarn = document.getElementById('photo-warn');

  function renderPhotosPreviews() {
    photoPreviewGrid.innerHTML = '';
    selectedPhotos.forEach((photo, idx) => {
      const thumb = document.createElement('div');
      thumb.className = 'photo-thumb';
      const img = document.createElement('img');
      img.src = photo.data;
      img.alt = photo.name;
      const nameEl = document.createElement('div');
      nameEl.className = 'photo-thumb-name';
      nameEl.textContent =
        photo.name.length > 18
          ? photo.name.substring(0, 15) + '...'
          : photo.name;
      const removeBtn = document.createElement('button');
      removeBtn.className = 'photo-thumb-remove';
      removeBtn.textContent = '✕';
      removeBtn.addEventListener('click', () => {
        selectedPhotos.splice(idx, 1);
        renderPhotosPreviews();
        updatePhotoUI();
        savePhotos();
      });
      thumb.appendChild(img);
      thumb.appendChild(nameEl);
      thumb.appendChild(removeBtn);
      photoPreviewGrid.appendChild(thumb);
    });
  }

  function updatePhotoUI() {
    const count = selectedPhotos.length;
    photoCountLabel.textContent = `${count} fotoğraf seçili`;
    btnClearPhotos.style.display = count > 0 ? 'inline-block' : 'none';
    // Warn if total size > 20 MB
    const totalSize = selectedPhotos.reduce(
      (sum, p) => sum + p.data.length * 0.75,
      0,
    );
    photoWarn.style.display = totalSize > 20 * 1024 * 1024 ? 'block' : 'none';
  }

  function savePhotos() {
    chrome.storage.local.set({ selectedPhotos });
  }

  if (btnSelectPhotos) {
    btnSelectPhotos.addEventListener('click', () => photoFileInput.click());
  }

  if (photoFileInput) {
    photoFileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      let pending = files.length;
      if (pending === 0) return;
      const MAX_PHOTOS = 5;
      files.forEach((file) => {
        if (selectedPhotos.length >= MAX_PHOTOS) {
          pending--;
          if (pending === 0) {
            renderPhotosPreviews();
            updatePhotoUI();
            savePhotos();
          }
          return; // slot full, ignore extra files
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (selectedPhotos.length < MAX_PHOTOS) {
            selectedPhotos.push({
              name: file.name,
              type: file.type,
              data: evt.target.result,
            });
          }
          pending--;
          if (pending === 0) {
            if (selectedPhotos.length >= MAX_PHOTOS) {
              alert(
                'Maksimum 5 fotoğraf seçebilirsiniz. İlk 5 fotoğraf alındı.',
              );
            }
            renderPhotosPreviews();
            updatePhotoUI();
            savePhotos();
          }
        };
        reader.readAsDataURL(file);
      });
      // Reset so same files can be selected again
      photoFileInput.value = '';
    });
  }

  if (btnClearPhotos) {
    btnClearPhotos.addEventListener('click', () => {
      selectedPhotos = [];
      renderPhotosPreviews();
      updatePhotoUI();
      savePhotos();
    });
  }

  // Load previously saved photos from storage
  chrome.storage.local.get(['selectedPhotos'], (result) => {
    if (result.selectedPhotos && Array.isArray(result.selectedPhotos)) {
      selectedPhotos = result.selectedPhotos;
      renderPhotosPreviews();
      updatePhotoUI();
    }
  });

  // Check if already running
  chrome.runtime.sendMessage({ type: 'BULK_STATUS' }, (status) => {
    if (status && status.isRunning) {
      btnStart.style.display = 'none';
      btnStop.style.display = 'block';
      // Switch to progress tab
      document
        .querySelectorAll('.tab')
        .forEach((t) => t.classList.remove('active'));
      document
        .querySelectorAll('.tab-content')
        .forEach((tc) => tc.classList.remove('active'));
      document
        .querySelector('[data-tab="tab-progress"]')
        .classList.add('active');
      document.getElementById('tab-progress').classList.add('active');
      startPolling();
    }
  });
});
