// ============================================
// BikeHaus Kleinanzeigen - Content Script
// Auto-fills Kleinanzeigen ad form with bike data
// ============================================

(function () {
  'use strict';

  let pendingBike = null;
  let panelElement = null;

  // ── Standard description template ──
  const STANDARD_FOOTER = `
Bike Haus Freiburg – Ihr gebrauchte Fahrradladen in Freiburg
✅ Neue Fahrrad 24 Monate Garantie
✅ Gebrauchte Fahrrad 3 Monate Garantie
✅ Rückgabe innerhalb von 3 Tagen möglich, falls Sie nicht zufrieden sind
✅ Probefahrt jederzeit möglich
✅ Fahrradreservierungen sind leider nicht möglich
Adresse & Öffnungszeiten:
Heckerstraße 27, Freiburg
Mo 11:00–17:00
Di 11:00–17:00
Mi 14:00–17:00
Do 11:00–17:00
Fr 14:00–17:00
Sa 11:30–17:00
Ankauf:
Wir kaufen nur qualitativ hochwertige Fahrräder (Cube, Bulls, KTM, Ghost, Frog, Woom, Pyro, Bergamont, Stevens, Giant, Kalkhoff, Steppenwolf).
Bilder und Preis bitte per Kleinanzeigen oder WhatsApp (+49 15566 300011) senden.
Ausstattung & Hinweis:
Fahrrad ist komplett überprüft und fahrbereit
Gepäckträger oder Fahrradkorb gegen Aufpreis erhältlich
Verkauf mit Rechnung/Kaufvertrag
Weitere Angebote finden Sie in unseren Anzeigen.`.trim();

  // ── Check for pending bike data ──
  chrome.runtime.sendMessage({ type: 'BIKEHAUS_GET_PENDING' }, (response) => {
    if (response && response.data) {
      pendingBike = response.data;
      showPanel();
    }
  });

  // ── Build description text ──
  function buildDescription(bike) {
    const lines = [];
    lines.push(`${bike.marke} ${bike.modell}`);
    lines.push('');

    if (bike.fahrradtyp) lines.push(`Fahrradtyp: ${bike.fahrradtyp}`);
    if (bike.rahmengroesse) lines.push(`Rahmengröße: ${bike.rahmengroesse}`);
    if (bike.reifengroesse) lines.push(`Reifengröße: ${bike.reifengroesse}`);
    if (bike.farbe) lines.push(`Farbe: ${bike.farbe}`);
    if (bike.gangschaltung) lines.push(`Gangschaltung: ${bike.gangschaltung}`);

    lines.push('');
    if (bike.beschreibung) {
      lines.push(bike.beschreibung);
      lines.push('');
    }

    lines.push(STANDARD_FOOTER);

    return lines.join('\n');
  }

  // ── Build title ──
  function buildTitle(bike) {
    const parts = [bike.marke, bike.modell];
    if (bike.fahrradtyp) parts.push(bike.fahrradtyp);
    if (bike.reifengroesse) parts.push(bike.reifengroesse);
    let title = parts.join(' ');
    // Kleinanzeigen title max 65 chars
    if (title.length > 65) {
      title = title.substring(0, 62) + '...';
    }
    return title;
  }

  // ── Set input value (works with React/Vue/Angular frameworks) ──
  function setInputValue(input, value) {
    if (!input) return false;

    // Use native setter to bypass framework wrappers
    const proto = input.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

    if (nativeSetter) {
      nativeSetter.call(input, value);
    } else {
      input.value = value;
    }

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    // React-specific
    input.dispatchEvent(new Event('keyup', { bubbles: true }));
    return true;
  }

  // ── Select a dropdown option by visible text or value ──
  function selectDropdownByText(selectEl, ...searchTexts) {
    if (!selectEl) return false;
    for (const opt of selectEl.options) {
      const optText = opt.textContent.trim().toLowerCase();
      const optVal = opt.value.toLowerCase();
      for (const search of searchTexts) {
        if (optText.includes(search.toLowerCase()) || optVal.includes(search.toLowerCase())) {
          selectEl.value = opt.value;
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
    }
    return false;
  }

  // ── Click a radio button or label by text/value ──
  function clickRadioByText(containerSelectors, ...searchTexts) {
    for (const containerSel of containerSelectors) {
      const containers = document.querySelectorAll(containerSel);
      for (const container of containers) {
        // Try labels
        const labels = container.querySelectorAll('label');
        for (const label of labels) {
          const labelText = label.textContent.trim().toLowerCase();
          for (const search of searchTexts) {
            if (labelText.includes(search.toLowerCase())) {
              label.click();
              const radio = label.querySelector('input[type="radio"]') || 
                           (label.htmlFor ? document.getElementById(label.htmlFor) : null);
              if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
              }
              return true;
            }
          }
        }
        // Try radio inputs directly
        const radios = container.querySelectorAll('input[type="radio"]');
        for (const radio of radios) {
          const val = radio.value.toLowerCase();
          const label = radio.closest('label') || document.querySelector(`label[for="${radio.id}"]`);
          const labelText = label ? label.textContent.trim().toLowerCase() : '';
          for (const search of searchTexts) {
            if (val.includes(search.toLowerCase()) || labelText.includes(search.toLowerCase())) {
              radio.checked = true;
              radio.click();
              radio.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  // ── Click a button/link by text ──
  function clickElementByText(selector, ...searchTexts) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      const elText = el.textContent.trim().toLowerCase();
      for (const search of searchTexts) {
        if (elText.includes(search.toLowerCase())) {
          el.click();
          return true;
        }
      }
    }
    return false;
  }

  // ── Find first matching element ──
  function findFirst(...selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  // ── Map fahrradtyp to Kleinanzeigen Typ dropdown ──
  function mapFahrradtypToKA(fahrradtyp) {
    if (!fahrradtyp) return [];
    const ft = fahrradtyp.toLowerCase();
    if (ft.includes('city') || ft.includes('urban')) return ['Citybike', 'City'];
    if (ft.includes('trekking') || ft.includes('tour')) return ['Trekkingrad', 'Trekking'];
    if (ft.includes('mountain') || ft.includes('mtb')) return ['Mountainbike', 'Mountain'];
    if (ft.includes('renn') || ft.includes('road') || ft.includes('race')) return ['Rennrad', 'Renn'];
    if (ft.includes('e-bike') || ft.includes('ebike') || ft.includes('elektro') || ft.includes('pedelec')) return ['E-Bike', 'Pedelec'];
    if (ft.includes('kinder') || ft.includes('kind') || ft.includes('jugend')) return ['Kinder', 'Jugend'];
    if (ft.includes('bmx')) return ['BMX'];
    if (ft.includes('cross') || ft.includes('gravel')) return ['Crossrad', 'Cross', 'Gravel'];
    if (ft.includes('falt') || ft.includes('klapp')) return ['Faltrad', 'Klapp'];
    if (ft.includes('cruiser')) return ['Cruiser'];
    if (ft.includes('hollandrad') || ft.includes('holland')) return ['Hollandrad', 'Holland'];
    if (ft.includes('lastenrad') || ft.includes('cargo')) return ['Lastenrad', 'Cargo'];
    if (ft.includes('tandem')) return ['Tandem'];
    return [fahrradtyp];
  }

  // ── Try to fill ALL form fields ──
  function fillForm() {
    if (!pendingBike) return {};

    const title = buildTitle(pendingBike);
    const description = buildDescription(pendingBike);
    const price = pendingBike.verkaufspreisVorschlag || '';
    const isNew = pendingBike.zustand === 'Neu';

    let filled = {
      title: false,
      description: false,
      price: false,
      zustand: false,
      versand: false,
      typ: false,
      art: false,
      priceType: false
    };

    // ── 1. Titel ──
    const titleEl = findFirst(
      '#postad-title',
      'input[id*="title"]',
      'input[name*="title"]',
      'input[placeholder*="Titel"]',
      'input[placeholder*="Was"]',
      'input[data-testid*="title"]'
    );
    if (titleEl) filled.title = setInputValue(titleEl, title);

    // ── 2. Beschreibung ──
    const descEl = findFirst(
      '#pstad-descrptn',
      'textarea[id*="descr"]',
      'textarea[name*="descr"]',
      'textarea[placeholder*="Beschreib"]',
      'textarea[data-testid*="description"]',
      'textarea'
    );
    if (descEl) filled.description = setInputValue(descEl, description);

    // ── 3. Preis ──
    if (price) {
      const priceEl = findFirst(
        '#postad-price',
        'input[id*="price"]',
        'input[name*="price"]',
        'input[placeholder*="Preis"]',
        'input[data-testid*="price"]'
      );
      if (priceEl) filled.price = setInputValue(priceEl, String(Math.round(price)));
    }

    // ── 4. Preistyp → Festpreis ──
    const priceTypeEl = findFirst(
      '#postad-priceType',
      'select[id*="price"]',
      'select[name*="price"]'
    );
    if (priceTypeEl && priceTypeEl.tagName === 'SELECT') {
      filled.priceType = selectDropdownByText(priceTypeEl, 'Festpreis', 'FIXED');
    }

    // ── 5. Zustand → Neu or Sehr Gut ──
    if (isNew) {
      // Try select/dropdown
      const zustandSel = findFirst('select[id*="zustand"]', 'select[id*="condition"]', 'select[name*="condition"]');
      if (zustandSel) {
        filled.zustand = selectDropdownByText(zustandSel, 'Neu');
      }
      // Try clickable items (Kleinanzeigen often uses buttons/links for condition)
      if (!filled.zustand) {
        filled.zustand = clickElementByText('button, a, span, div[role="option"], li', 'Neu');
      }
    } else {
      const zustandSel = findFirst('select[id*="zustand"]', 'select[id*="condition"]', 'select[name*="condition"]');
      if (zustandSel) {
        filled.zustand = selectDropdownByText(zustandSel, 'Sehr Gut', 'Sehr gut');
      }
      if (!filled.zustand) {
        filled.zustand = clickElementByText('button, a, span, div[role="option"], li', 'Sehr Gut', 'Sehr gut');
      }
    }

    // ── 6. Versand → Nur Abholung ──
    filled.versand = clickRadioByText(
      ['fieldset', 'div[class*="shipping"]', 'div[class*="versand"]', 'div[class*="Versand"]', 'form', 'body'],
      'Nur Abholung', 'nur abholung', 'PICKUP'
    );

    // ── 7. Typ (Fahrradtyp) ──
    if (pendingBike.fahrradtyp) {
      const typSel = findFirst(
        'select[id*="typ"]', 'select[id*="type"]',
        'select[name*="typ"]', 'select[name*="type"]'
      );
      const kaTypes = mapFahrradtypToKA(pendingBike.fahrradtyp);
      if (typSel && kaTypes.length > 0) {
        filled.typ = selectDropdownByText(typSel, ...kaTypes);
      }
    }

    // ── 8. Art (Herren/Damen/Kinder) ──
    if (pendingBike.art) {
      const artMappings = {
        'Herren': ['Herren', 'Herrenfahrrad', 'herren'],
        'Damen': ['Damen', 'Damenfahrrad', 'damen'],
        'Kinder': ['Kinder', 'Kinderfahrrad', 'kinder', 'Jugend']
      };
      const artSearchTerms = artMappings[pendingBike.art] || [pendingBike.art];

      // Try select dropdown
      const artSel = findFirst(
        'select[id*="art"]', 'select[name*="art"]',
        'select[id*="gender"]', 'select[name*="gender"]'
      );
      if (artSel) {
        filled.art = selectDropdownByText(artSel, ...artSearchTerms);
      }
      // Try radio/button approach
      if (!filled.art) {
        filled.art = clickRadioByText(
          ['fieldset', 'div[class*="art"]', 'div[class*="gender"]', 'form', 'body'],
          ...artSearchTerms
        );
      }
      // Try clickable elements
      if (!filled.art) {
        filled.art = clickElementByText('button, a, span, div[role="option"], li', ...artSearchTerms);
      }
    }

    return filled;
  }

  // ── Copy text to clipboard ──
  function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
      const orig = button.textContent;
      button.textContent = '✓ Kopiert!';
      button.style.background = '#27ae60';
      setTimeout(() => {
        button.textContent = orig;
        button.style.background = '';
      }, 1500);
    });
  }

  // ── Show floating panel ──
  function showPanel() {
    if (!pendingBike || panelElement) return;

    const title = buildTitle(pendingBike);
    const description = buildDescription(pendingBike);
    const price = pendingBike.verkaufspreisVorschlag
      ? `${Math.round(pendingBike.verkaufspreisVorschlag)} €`
      : 'Nicht festgelegt';

    const panel = document.createElement('div');
    panel.id = 'bikehaus-ka-panel';

    // ── Images section ──
    let imagesHtml = '';
    if (pendingBike.images && pendingBike.images.length > 0) {
      const imageItems = pendingBike.images.map((img, i) => {
        const imgUrl = pendingBike.apiBaseUrl
          ? `${pendingBike.apiBaseUrl}/public/gallery-image/${img.filePath}`
          : img.filePath;
        return `
          <div class="bk-img-item">
            <img src="${imgUrl}" alt="Foto ${i + 1}" crossorigin="anonymous" />
            <a href="${imgUrl}" download="fahrrad_${pendingBike.id}_${i + 1}.jpg" 
               class="bk-img-download" title="Herunterladen">⬇</a>
          </div>
        `;
      }).join('');

      imagesHtml = `
        <div class="bk-section">
          <div class="bk-section-title">📸 Fotos (${pendingBike.images.length})</div>
          <div class="bk-images-grid">${imageItems}</div>
          <button id="bk-download-all" class="bk-btn bk-btn-secondary">
            ⬇ Alle herunterladen
          </button>
        </div>
      `;
    }

    panel.innerHTML = `
      <div class="bk-header">
        <span class="bk-logo">🚲 BikeHaus</span>
        <div class="bk-header-actions">
          <button id="bk-minimize" class="bk-header-btn" title="Minimieren">−</button>
          <button id="bk-close" class="bk-header-btn" title="Schließen">✕</button>
        </div>
      </div>
      <div class="bk-body">
        <div class="bk-bike-name">${pendingBike.marke} ${pendingBike.modell}</div>
        <div class="bk-stok">${pendingBike.stokNo || ''}</div>

        <div class="bk-section">
          <div class="bk-section-title">Titel</div>
          <div class="bk-field-row">
            <input type="text" class="bk-input" id="bk-title" value="${title}" readonly />
            <button class="bk-btn-copy" data-copy="title">📋</button>
          </div>
        </div>

        <div class="bk-section">
          <div class="bk-section-title">Beschreibung</div>
          <div class="bk-field-row">
            <textarea class="bk-textarea" id="bk-desc" readonly>${description}</textarea>
            <button class="bk-btn-copy" data-copy="desc">📋</button>
          </div>
        </div>

        <div class="bk-section">
          <div class="bk-section-title">Preis</div>
          <div class="bk-field-row">
            <input type="text" class="bk-input" id="bk-price" value="${price}" readonly />
            <button class="bk-btn-copy" data-copy="price">📋</button>
          </div>
        </div>

        ${imagesHtml}

        <div class="bk-actions">
          <button id="bk-fill-form" class="bk-btn bk-btn-primary">
            ✨ Formular ausfüllen
          </button>
          <button id="bk-copy-all" class="bk-btn bk-btn-secondary">
            📋 Alles kopieren
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    panelElement = panel;

    // ── Event listeners ──

    // Close
    panel.querySelector('#bk-close').addEventListener('click', () => {
      panel.remove();
      panelElement = null;
      chrome.runtime.sendMessage({ type: 'BIKEHAUS_CLEAR_PENDING' });
    });

    // Minimize
    let minimized = false;
    panel.querySelector('#bk-minimize').addEventListener('click', () => {
      minimized = !minimized;
      panel.querySelector('.bk-body').style.display = minimized ? 'none' : 'block';
      panel.querySelector('#bk-minimize').textContent = minimized ? '+' : '−';
    });

    // Copy buttons
    panel.querySelectorAll('.bk-btn-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const field = btn.dataset.copy;
        let text = '';
        if (field === 'title') text = title;
        else if (field === 'desc') text = description;
        else if (field === 'price') text = pendingBike.verkaufspreisVorschlag ? String(Math.round(pendingBike.verkaufspreisVorschlag)) : '';
        copyToClipboard(text, btn);
      });
    });

    // Fill form
    panel.querySelector('#bk-fill-form').addEventListener('click', () => {
      const result = fillForm();
      const btn = panel.querySelector('#bk-fill-form');
      const filledFields = [];
      if (result.title) filledFields.push('Titel');
      if (result.description) filledFields.push('Beschreibung');
      if (result.price) filledFields.push('Preis');
      if (result.zustand) filledFields.push('Zustand');
      if (result.versand) filledFields.push('Versand');
      if (result.typ) filledFields.push('Typ');
      if (result.art) filledFields.push('Art');
      if (result.priceType) filledFields.push('Preistyp');

      if (filledFields.length > 0) {
        btn.textContent = `✓ ${filledFields.length} Felder ausgefüllt!`;
        btn.style.background = '#27ae60';
      } else {
        btn.textContent = '⚠ Keine Felder gefunden - bitte manuell kopieren';
        btn.style.background = '#e67e22';
      }
      setTimeout(() => {
        btn.textContent = '✨ Formular ausfüllen';
        btn.style.background = '';
      }, 3000);
    });

    // Copy all
    panel.querySelector('#bk-copy-all').addEventListener('click', () => {
      const allText = `${title}\n\n${description}\n\nPreis: ${price}`;
      const btn = panel.querySelector('#bk-copy-all');
      copyToClipboard(allText, btn);
    });

    // Download all images
    const downloadAllBtn = panel.querySelector('#bk-download-all');
    if (downloadAllBtn) {
      downloadAllBtn.addEventListener('click', () => {
        if (!pendingBike.images) return;
        pendingBike.images.forEach((img, i) => {
          const imgUrl = pendingBike.apiBaseUrl
            ? `${pendingBike.apiBaseUrl}/public/gallery-image/${img.filePath}`
            : img.filePath;

          // Fetch and download via background script
          chrome.runtime.sendMessage(
            { type: 'BIKEHAUS_FETCH_IMAGE', url: imgUrl },
            (response) => {
              if (response && response.dataUrl) {
                const a = document.createElement('a');
                a.href = response.dataUrl;
                a.download = `fahrrad_${pendingBike.id}_${i + 1}.jpg`;
                a.click();
              }
            }
          );
        });
        downloadAllBtn.textContent = '✓ Download gestartet!';
        setTimeout(() => {
          downloadAllBtn.textContent = '⬇ Alle herunterladen';
        }, 2000);
      });
    }

    // Make panel draggable
    makeDraggable(panel, panel.querySelector('.bk-header'));

    // Also try to auto-fill after a short delay (give page time to load)
    setTimeout(() => {
      fillForm();
    }, 2000);
  }

  // ── Make element draggable ──
  function makeDraggable(element, handle) {
    let isDragging = false;
    let offsetX, offsetY;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('bk-header-btn')) return;
      isDragging = true;
      offsetX = e.clientX - element.getBoundingClientRect().left;
      offsetY = e.clientY - element.getBoundingClientRect().top;
      handle.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      element.style.right = 'auto';
      element.style.left = (e.clientX - offsetX) + 'px';
      element.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      handle.style.cursor = 'grab';
    });
  }

  // ── Watch for page navigations (SPA) ──
  const observer = new MutationObserver(() => {
    if (pendingBike && !panelElement) {
      showPanel();
    }
    // Check for ad number on confirmation/success page
    detectAdNumber();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // ── Detect Kleinanzeigen Ad Number after creation ──
  function detectAdNumber() {
    if (!pendingBike) return;

    const url = window.location.href;

    // After posting, KA often shows the ad or a confirmation page
    // The ad URL format: /s-anzeige/{title}/{id} or confirmation page has a link to the ad

    // Method 1: Check if we're on the confirmation page
    if (url.includes('bestaetigung') || url.includes('success') || url.includes('p-anzeige-aufgeben-bestaetigung')) {
      // Look for the ad link on the confirmation page
      const adLinks = document.querySelectorAll('a[href*="/s-anzeige/"]');
      for (const link of adLinks) {
        const match = link.href.match(/\/s-anzeige\/[^/]+\/(\d+)/);
        if (match) {
          sendAdNumberToAdmin(match[1]);
          return;
        }
      }
      // Also look for the ad number in text
      const bodyText = document.body.innerText;
      const nrMatch = bodyText.match(/Anzeigennummer[:\s]*(\d+)/i) || bodyText.match(/Anzeige-Nr[.:\s]*(\d+)/i);
      if (nrMatch) {
        sendAdNumberToAdmin(nrMatch[1]);
        return;
      }
    }

    // Method 2: Check if we're viewing the created ad page
    const adUrlMatch = url.match(/\/s-anzeige\/[^/]+\/(\d+)/);
    if (adUrlMatch) {
      sendAdNumberToAdmin(adUrlMatch[1]);
      return;
    }
  }

  function sendAdNumberToAdmin(anzeigeNr) {
    if (!pendingBike || !anzeigeNr) return;
    const bicycleId = pendingBike.id;

    // Notify background to relay to admin
    chrome.runtime.sendMessage({
      type: 'BIKEHAUS_KA_AD_CREATED',
      bicycleId: bicycleId,
      anzeigeNr: anzeigeNr
    });

    // Show confirmation in panel
    if (panelElement) {
      const body = panelElement.querySelector('.bk-body');
      if (body) {
        const notice = document.createElement('div');
        notice.className = 'bk-notice bk-notice-success';
        notice.innerHTML = `✅ Anzeige-Nr <strong>${anzeigeNr}</strong> wurde an BikeHaus gesendet!`;
        notice.style.cssText = 'background:#27ae60;color:white;padding:8px 12px;border-radius:6px;margin:8px 0;font-size:13px;text-align:center;';
        body.prepend(notice);
      }
    }

    // Clear pending bike after successful ad creation
    chrome.runtime.sendMessage({ type: 'BIKEHAUS_CLEAR_PENDING' });
    pendingBike = null;
  }

  // ── Handle pending delete requests (on "Meine Anzeigen" page) ──
  chrome.runtime.sendMessage({ type: 'BIKEHAUS_GET_PENDING_DELETE' }, (response) => {
    if (response && response.anzeigeNr) {
      showDeleteHelper(response.anzeigeNr);
    }
  });

  function showDeleteHelper(anzeigeNr) {
    // Show a floating helper that highlights which ad to delete
    const helper = document.createElement('div');
    helper.id = 'bikehaus-delete-helper';
    helper.style.cssText = `
      position: fixed; top: 80px; right: 20px; z-index: 99999;
      background: #e74c3c; color: white; padding: 16px 20px;
      border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px; max-width: 350px; cursor: move;
    `;
    helper.innerHTML = `
      <div style="font-weight:bold;font-size:15px;margin-bottom:8px;">🗑️ BikeHaus – Anzeige löschen</div>
      <div>Bitte löschen Sie die Anzeige mit der Nr: <strong>${anzeigeNr}</strong></div>
      <div style="margin-top:8px;font-size:12px;opacity:0.9;">
        Suchen Sie die Anzeige in der Liste und klicken Sie auf "Löschen".
      </div>
      <button id="bk-delete-done" style="
        margin-top:12px; padding:8px 16px; background:white; color:#e74c3c;
        border:none; border-radius:6px; cursor:pointer; font-weight:bold; font-size:13px; width:100%;
      ">✓ Erledigt – Schließen</button>
    `;
    document.body.appendChild(helper);

    helper.querySelector('#bk-delete-done').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'BIKEHAUS_CLEAR_PENDING_DELETE' });
      helper.remove();
    });

    // Try to highlight the ad with this number on the page
    highlightAd(anzeigeNr);
  }

  function highlightAd(anzeigeNr) {
    // Look for the ad number in links or text on the "Meine Anzeigen" page
    const allLinks = document.querySelectorAll('a[href*="/s-anzeige/"]');
    for (const link of allLinks) {
      if (link.href.includes('/' + anzeigeNr)) {
        const adItem = link.closest('[class*="aditem"]') || link.closest('li') || link.closest('article') || link.parentElement;
        if (adItem) {
          adItem.style.outline = '3px solid #e74c3c';
          adItem.style.outlineOffset = '2px';
          adItem.style.borderRadius = '8px';
          adItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }
  }

  // Check for ad number on initial page load too
  setTimeout(detectAdNumber, 3000);

})();
