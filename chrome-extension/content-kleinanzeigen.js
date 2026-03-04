// ============================================
// BikeHaus Kleinanzeigen - Content Script
// Auto-fills Kleinanzeigen ad form with bike data
// ============================================

(function () {
  'use strict';

  let pendingBike = null;
  let panelElement = null;
  let photosUploaded = false;

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

  // ── Find a <select> element by checking if its options contain specific text ──
  function findSelectByOptionTexts(...optionTexts) {
    const selects = document.querySelectorAll('select');
    for (const sel of selects) {
      for (const opt of sel.options) {
        const optText = opt.textContent.trim().toLowerCase();
        for (const search of optionTexts) {
          if (optText === search.toLowerCase() || optText.includes(search.toLowerCase())) {
            return sel;
          }
        }
      }
    }
    return null;
  }

  // ── Find a form field's input/select near a label with specific text ──
  function findFieldByLabelText(labelText, fieldTag = 'select') {
    // Strategy 1: look at all labels and text elements
    const candidates = document.querySelectorAll('label, span, div, p, h3, h4, legend');
    for (const el of candidates) {
      // Check direct text content (not children)
      const directText = Array.from(el.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent.trim())
        .join(' ');
      const fullText = el.textContent.trim();

      if (directText.toLowerCase() === labelText.toLowerCase() ||
          fullText.toLowerCase() === labelText.toLowerCase()) {
        // Found the label, traverse up to find the field container
        let parent = el.parentElement;
        for (let i = 0; i < 5 && parent; i++) {
          const field = parent.querySelector(fieldTag);
          if (field && field !== el) return field;
          parent = parent.parentElement;
        }
        // Try next siblings
        let sibling = el.nextElementSibling;
        for (let i = 0; i < 3 && sibling; i++) {
          if (sibling.matches(fieldTag)) return sibling;
          const nested = sibling.querySelector(fieldTag);
          if (nested) return nested;
          sibling = sibling.nextElementSibling;
        }
      }
    }
    return null;
  }

  // ── Convert data URL to File object ──
  function dataURLtoFile(dataUrl, filename) {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  // ── Fetch all images from the API and return File objects ──
  function fetchAllImages() {
    if (!pendingBike || !pendingBike.images || pendingBike.images.length === 0) {
      return Promise.resolve([]);
    }

    const images = pendingBike.images;
    const fetchPromises = images.map((img, i) => {
      const imgUrl = pendingBike.apiBaseUrl
        ? `${pendingBike.apiBaseUrl}/public/gallery-image/${img.filePath}`
        : img.filePath;

      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'BIKEHAUS_FETCH_IMAGE', url: imgUrl },
          (response) => {
            if (response && response.dataUrl) {
              const ext = img.filePath.split('.').pop() || 'jpg';
              const filename = `fahrrad_${pendingBike.id}_${i + 1}.${ext}`;
              const file = dataURLtoFile(response.dataUrl, filename);
              console.log(`[BikeHaus] Fetched image ${i + 1}: ${filename} (${file.size} bytes)`);
              resolve(file);
            } else {
              console.log(`[BikeHaus] Failed to fetch image ${i + 1}:`, response?.error);
              resolve(null);
            }
          }
        );
      });
    });

    return Promise.all(fetchPromises).then(files => files.filter(f => f !== null));
  }

  // ── Update panel to show photo upload status ──
  function updatePanelPhotoStatus(count, success) {
    if (!panelElement) return;
    const sections = panelElement.querySelectorAll('.bk-section-title');
    for (const section of sections) {
      if (section.textContent.includes('Fotos')) {
        if (success) {
          section.innerHTML = `📸 Fotos (${count}) - ✅ Hochgeladen!`;
        } else {
          section.innerHTML = `📸 Fotos - ⚠ Upload fehlgeschlagen`;
        }
        break;
      }
    }
  }

  // ── Upload photos to Kleinanzeigen form ──
  function uploadPhotosToForm() {
    if (photosUploaded) {
      console.log('[BikeHaus] Photos already uploaded, skipping');
      return;
    }
    if (!pendingBike || !pendingBike.images || pendingBike.images.length === 0) {
      console.log('[BikeHaus] No images to upload');
      return;
    }

    console.log(`[BikeHaus] Uploading ${pendingBike.images.length} photos...`);

    // Kleinanzeigen uses Plupload. Strategy order:
    // 1. Find file input inside #plupld or #pstad-pictureupload (Plupload hidden input)
    // 2. Try drop on #dropzone-box
    // 3. Try any file input on page
    // 4. Watch for lazily-created file inputs via MutationObserver

    // Strategy 1: Plupload hidden file input
    const pluploadInput = findPluploadFileInput();
    if (pluploadInput) {
      console.log('[BikeHaus] Found Plupload file input');
      uploadViaFileInput(pluploadInput);
      return;
    }

    // Strategy 2: Drop on Kleinanzeigen dropzone
    const dropZone = document.querySelector('#dropzone-box') ||
                     document.querySelector('#pstad-pictureupload .uploadbox') ||
                     document.querySelector('[class*="uploadbox"]');
    if (dropZone) {
      console.log('[BikeHaus] Found Kleinanzeigen dropzone, trying drop...');
      uploadViaDropZone(dropZone);
      return;
    }

    // Strategy 3: Any file input on the page
    const anyFileInput = document.querySelector('input[type="file"][accept*="image"]') ||
                         document.querySelector('input[type="file"]');
    if (anyFileInput) {
      console.log('[BikeHaus] Found generic file input');
      uploadViaFileInput(anyFileInput);
      return;
    }

    // Strategy 4: Wait for Plupload to initialize (it creates file inputs lazily)
    console.log('[BikeHaus] No upload element found yet, waiting for Plupload init...');
    waitForFileInputAndUpload();
  }

  // ── Find Plupload's hidden file input ──
  function findPluploadFileInput() {
    // Plupload creates an input[type=file] inside #plupld or a container with moxie/plupload id
    const containers = [
      document.querySelector('#plupld'),
      document.querySelector('#pstad-pictureupload'),
      document.querySelector('[id*="plupload"]'),
      document.querySelector('[id*="moxie"]'),
      document.querySelector('[class*="moxie"]')
    ].filter(Boolean);

    for (const container of containers) {
      // Plupload file inputs are often inside nested divs with moxie-shim styling
      const input = container.querySelector('input[type="file"]');
      if (input) return input;
    }

    // Also check for inputs with Plupload-specific attributes
    const allFileInputs = document.querySelectorAll('input[type="file"]');
    for (const input of allFileInputs) {
      const parent = input.parentElement;
      if (parent && (
        parent.id.includes('moxie') ||
        parent.id.includes('plupload') ||
        parent.style.overflow === 'hidden' ||
        parent.className.includes('moxie')
      )) {
        return input;
      }
    }

    return null;
  }

  // ── Upload files by setting them on a file input ──
  function uploadViaFileInput(fileInput) {
    fetchAllImages().then(validFiles => {
      if (validFiles.length === 0) {
        console.log('[BikeHaus] No valid images fetched');
        updatePanelPhotoStatus(0, false);
        return;
      }

      console.log(`[BikeHaus] Uploading ${validFiles.length} images via file input...`);

      // Upload one at a time for Plupload compatibility (it may only accept one file per change event)
      uploadFilesSequentially(fileInput, validFiles, 0);
    });
  }

  // ── Upload files one by one to work with Plupload ──
  function uploadFilesSequentially(fileInput, files, index) {
    if (index >= files.length) {
      console.log(`[BikeHaus] All ${files.length} photos uploaded successfully`);
      photosUploaded = true;
      updatePanelPhotoStatus(files.length, true);
      return;
    }

    const file = files[index];
    console.log(`[BikeHaus] Uploading image ${index + 1}/${files.length}: ${file.name}`);

    const dt = new DataTransfer();
    dt.items.add(file);

    // Try to make the input accept the file
    try {
      fileInput.files = dt.files;
    } catch (e) {
      // Some browsers/Plupload versions may block direct file assignment
      console.log('[BikeHaus] Direct file assignment blocked, trying alternative...');
      Object.defineProperty(fileInput, 'files', {
        value: dt.files,
        writable: true,
        configurable: true
      });
    }

    // Dispatch all relevant events that Plupload listens to
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    fileInput.dispatchEvent(new Event('input', { bubbles: true }));

    // Wait for Plupload to process the file before sending the next one
    setTimeout(() => {
      // Re-find the file input as Plupload may recreate it after each upload
      const freshInput = findPluploadFileInput() || fileInput;
      uploadFilesSequentially(freshInput, files, index + 1);
    }, 1500);
  }

  // ── Upload via drop event on the dropzone ──
  function uploadViaDropZone(dropZone) {
    fetchAllImages().then(validFiles => {
      if (validFiles.length === 0) {
        console.log('[BikeHaus] No valid images fetched');
        updatePanelPhotoStatus(0, false);
        return;
      }

      console.log(`[BikeHaus] Dropping ${validFiles.length} images on dropzone...`);

      // Create DataTransfer with all files
      const dt = new DataTransfer();
      validFiles.forEach(f => dt.items.add(f));

      // Simulate full drag & drop sequence
      const dragEnterEvent = new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
      });
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
      });
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
      });

      dropZone.dispatchEvent(dragEnterEvent);

      // Small delay between events for realism
      setTimeout(() => {
        dropZone.dispatchEvent(dragOverEvent);

        setTimeout(() => {
          dropZone.dispatchEvent(dropEvent);
          console.log('[BikeHaus] Drop events dispatched on dropzone');

          // Check after a delay if it worked (thumbnails should appear)
          setTimeout(() => {
            const thumbnails = document.querySelector('#j-pictureupload-thumbnails, .pictureupload-thumbnails');
            const hasImages = thumbnails && thumbnails.children.length > 0;

            if (hasImages) {
              console.log('[BikeHaus] Drop upload successful - thumbnails detected');
              photosUploaded = true;
              updatePanelPhotoStatus(validFiles.length, true);
            } else {
              console.log('[BikeHaus] Drop may not have worked, trying file input fallback...');
              // Fallback: try to find a file input that appeared after drop interaction
              const fallbackInput = findPluploadFileInput() ||
                                     document.querySelector('input[type="file"]');
              if (fallbackInput) {
                uploadFilesSequentially(fallbackInput, validFiles, 0);
              } else {
                // Last resort: try dropping files one by one
                dropFilesSequentially(dropZone, validFiles, 0);
              }
            }
          }, 2000);
        }, 100);
      }, 100);
    });
  }

  // ── Drop files one by one for upload ──
  function dropFilesSequentially(dropZone, files, index) {
    if (index >= files.length) {
      console.log(`[BikeHaus] All ${files.length} photos drop-uploaded`);
      photosUploaded = true;
      updatePanelPhotoStatus(files.length, true);
      return;
    }

    const file = files[index];
    const dt = new DataTransfer();
    dt.items.add(file);

    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer: dt
    });

    dropZone.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt }));
    dropZone.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
    dropZone.dispatchEvent(dropEvent);

    console.log(`[BikeHaus] Dropped image ${index + 1}/${files.length}`);

    setTimeout(() => {
      dropFilesSequentially(dropZone, files, index + 1);
    }, 1500);
  }

  // ── Wait for Plupload to create its file input (MutationObserver) ──
  function waitForFileInputAndUpload() {
    let attempts = 0;
    const maxAttempts = 20; // 20 * 500ms = 10 seconds max wait

    const checkInterval = setInterval(() => {
      attempts++;

      // Check for file input
      const plInput = findPluploadFileInput();
      if (plInput) {
        clearInterval(checkInterval);
        console.log(`[BikeHaus] Plupload file input found after ${attempts} attempts`);
        uploadViaFileInput(plInput);
        return;
      }

      // Check for dropzone
      const dz = document.querySelector('#dropzone-box') ||
                 document.querySelector('[class*="uploadbox"]');
      if (dz) {
        clearInterval(checkInterval);
        console.log(`[BikeHaus] Dropzone found after ${attempts} attempts`);
        uploadViaDropZone(dz);
        return;
      }

      // Check for any file input
      const anyInput = document.querySelector('input[type="file"]');
      if (anyInput) {
        clearInterval(checkInterval);
        console.log(`[BikeHaus] Generic file input found after ${attempts} attempts`);
        uploadViaFileInput(anyInput);
        return;
      }

      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.log('[BikeHaus] Gave up waiting for upload element after 10s');
        updatePanelPhotoStatus(0, false);
      }
    }, 500);

    // Also try triggering Plupload initialization by interacting with the upload area
    setTimeout(() => {
      const uploadArea = document.querySelector('#pstad-pictureupload') ||
                         document.querySelector('.pictureupload-text');
      if (uploadArea) {
        // Click the upload area to trigger Plupload initialization
        uploadArea.click();
        console.log('[BikeHaus] Clicked upload area to trigger Plupload init');
      }
    }, 1000);
  }

  // ── Map fahrradtyp to Kleinanzeigen Typ dropdown ──
  function mapFahrradtypToKA(fahrradtyp) {
    if (!fahrradtyp) return [];
    const ft = fahrradtyp.toLowerCase();
    if (ft.includes('city') || ft.includes('urban')) return ['Cityräder', 'Citybike', 'City'];
    if (ft.includes('trekking') || ft.includes('tour')) return ['Trekkingräder', 'Trekkingrad', 'Trekking'];
    if (ft.includes('mountain') || ft.includes('mtb')) return ['Mountainbikes', 'Mountainbike', 'Mountain'];
    if (ft.includes('renn') || ft.includes('road') || ft.includes('race')) return ['Rennräder', 'Rennrad', 'Renn'];
    if (ft.includes('e-bike') || ft.includes('ebike') || ft.includes('elektro') || ft.includes('pedelec')) return ['E-Bikes', 'E-Bike', 'Pedelec'];
    if (ft.includes('kinder') || ft.includes('kind') || ft.includes('jugend')) return ['Kinderfahrräder', 'Kinder', 'Jugend'];
    if (ft.includes('bmx')) return ['BMX'];
    if (ft.includes('cross') || ft.includes('gravel')) return ['Crossräder', 'Crossrad', 'Gravel'];
    if (ft.includes('falt') || ft.includes('klapp')) return ['Falträder', 'Faltrad', 'Klapp'];
    if (ft.includes('cruiser')) return ['Cruiser'];
    if (ft.includes('hollandrad') || ft.includes('holland')) return ['Hollandräder', 'Hollandrad', 'Holland'];
    if (ft.includes('lastenrad') || ft.includes('cargo')) return ['Lastenräder', 'Lastenrad', 'Cargo'];
    if (ft.includes('tandem')) return ['Tandem'];
    if (ft.includes('e-trekking')) return ['Trekkingräder', 'E-Bikes'];
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

    console.log('[BikeHaus] Filling form with data:', {
      title, price, zustand: pendingBike.zustand, art: pendingBike.art,
      fahrradtyp: pendingBike.fahrradtyp
    });

    // ── 1. Titel ──
    const titleEl = findFirst(
      '#postad-title',
      'input[id*="title"]',
      'input[name*="title"]',
      'input[placeholder*="Titel"]',
      'input[placeholder*="Was"]'
    );
    if (titleEl) {
      filled.title = setInputValue(titleEl, title);
      console.log('[BikeHaus] Title:', filled.title);
    }

    // ── 2. Beschreibung ──
    const descEl = findFirst(
      '#pstad-descrptn',
      'textarea[id*="descr"]',
      'textarea[name*="descr"]',
      'textarea[placeholder*="Beschreib"]',
      'textarea'
    );
    if (descEl) {
      filled.description = setInputValue(descEl, description);
      console.log('[BikeHaus] Description:', filled.description);
    }

    // ── 3. Preis ──
    if (price) {
      // Strategy 1: Known ID
      let priceEl = findFirst('#postad-price', 'input[id*="price"]', 'input[name*="price"]');
      // Strategy 2: Find by label text "Preis"
      if (!priceEl) {
        priceEl = findFieldByLabelText('Preis', 'input');
      }
      // Strategy 3: Find input near EUR text
      if (!priceEl) {
        const eurTexts = document.querySelectorAll('*');
        for (const el of eurTexts) {
          if (el.childNodes.length === 1 && el.textContent.trim().includes('EUR')) {
            const parent = el.parentElement;
            if (parent) {
              priceEl = parent.querySelector('input[type="text"], input[type="number"], input:not([type])');
              if (priceEl) break;
            }
          }
        }
      }
      if (priceEl) {
        filled.price = setInputValue(priceEl, String(Math.round(price)));
        console.log('[BikeHaus] Price:', filled.price);
      }
    }

    // ── 4. Preistyp → Festpreis ──
    // Find select that contains "Festpreis" option
    const priceTypeSel = findSelectByOptionTexts('Festpreis', 'VB', 'Zu verschenken');
    if (priceTypeSel) {
      filled.priceType = selectDropdownByText(priceTypeSel, 'Festpreis');
      console.log('[BikeHaus] PriceType:', filled.priceType);
    }

    // ── 5. Zustand ──
    // Zustand on KA Fahrrad is typically a clickable picker ("Bitte wählen >")
    // Try find by label, then try clicking
    const zustandText = isNew ? 'Neu' : 'Sehr gut';
    // Try select
    const zustandSel = findSelectByOptionTexts('Neu', 'Gebraucht', 'Sehr gut');
    if (zustandSel) {
      filled.zustand = selectDropdownByText(zustandSel, zustandText);
    }
    // Try clicking the "Bitte wählen" button to open picker, then select
    if (!filled.zustand) {
      // Look for the Zustand picker button
      const zustandBtn = findFieldByLabelText('Zustand', 'button, a, [role="button"], div[class*="select"], span');
      if (zustandBtn) {
        zustandBtn.click();
        // After click, look for the option in the opened list
        setTimeout(() => {
          clickElementByText('li, div[role="option"], button, a, span', zustandText);
        }, 500);
        filled.zustand = true;
      }
    }
    console.log('[BikeHaus] Zustand:', filled.zustand);

    // ── 6. Versand → Nur Abholung ──
    // Find ALL radio/input elements and labels on the page
    const allRadios = document.querySelectorAll('input[type="radio"]');
    for (const radio of allRadios) {
      // Check associated label
      const label = radio.closest('label') ||
                    document.querySelector(`label[for="${radio.id}"]`) ||
                    radio.parentElement;
      const labelText = label ? label.textContent.trim().toLowerCase() : '';
      if (labelText.includes('nur abholung') || labelText.includes('abholung')) {
        radio.checked = true;
        radio.click();
        radio.dispatchEvent(new Event('change', { bubbles: true }));
        radio.dispatchEvent(new Event('input', { bubbles: true }));
        filled.versand = true;
        console.log('[BikeHaus] Versand: found radio with label');
        break;
      }
    }
    // Fallback: click label directly
    if (!filled.versand) {
      const allLabels = document.querySelectorAll('label, span');
      for (const label of allLabels) {
        if (label.textContent.trim().toLowerCase().includes('nur abholung')) {
          label.click();
          filled.versand = true;
          console.log('[BikeHaus] Versand: clicked label directly');
          break;
        }
      }
    }

    // ── 7. Art (Herren/Damen/Kinder) ──
    // Find the Art select by its options: it contains "Herren", "Damen", etc.
    if (pendingBike.art) {
      const artSel = findSelectByOptionTexts('Herren', 'Damen');
      if (artSel) {
        const artMappings = {
          'Herren': ['Herren'],
          'Damen': ['Damen'],
          'Kinder': ['Kinder']
        };
        const searchTerms = artMappings[pendingBike.art] || [pendingBike.art];
        filled.art = selectDropdownByText(artSel, ...searchTerms);
        console.log('[BikeHaus] Art:', filled.art, '- selected:', pendingBike.art);
      } else {
        console.log('[BikeHaus] Art: no select found with Herren/Damen options');
      }
    }

    // ── 8. Typ (Fahrradtyp) ──
    // Find the Typ select by its options: it contains "Cityräder", "Mountainbikes", etc.
    if (pendingBike.fahrradtyp) {
      const typSel = findSelectByOptionTexts('Cityräder', 'Mountainbikes', 'Rennräder', 'Trekkingräder');
      const kaTypes = mapFahrradtypToKA(pendingBike.fahrradtyp);
      if (typSel && kaTypes.length > 0) {
        filled.typ = selectDropdownByText(typSel, ...kaTypes);
        console.log('[BikeHaus] Typ:', filled.typ, '- searched:', kaTypes);
      } else {
        console.log('[BikeHaus] Typ: no select found with bike type options');
      }
    }

    // ── 9. "Direkt kaufen" → Nein ──
    // Look for "Direkt kaufen" section and select "Nein"
    const allRadios2 = document.querySelectorAll('input[type="radio"]');
    for (const radio of allRadios2) {
      const label = radio.closest('label') ||
                    document.querySelector(`label[for="${radio.id}"]`) ||
                    radio.parentElement;
      const labelText = label ? label.textContent.trim().toLowerCase() : '';
      // Find "Nein" radio that is within a "Direkt kaufen" context
      if (labelText === 'nein' || labelText.includes('nein')) {
        // Check parent context for "direkt kaufen"
        let parent = radio.closest('[class*="field"]') || radio.parentElement?.parentElement?.parentElement;
        if (parent) {
          const parentText = parent.textContent.toLowerCase();
          if (parentText.includes('direkt kaufen') || parentText.includes('sofort-kaufen')) {
            radio.checked = true;
            radio.click();
            radio.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('[BikeHaus] Direkt kaufen: set to Nein');
            break;
          }
        }
      }
    }

    // ── 10. Upload Photos ──
    uploadPhotosToForm();

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
          <button id="bk-upload-photos" class="bk-btn bk-btn-primary" style="background:#8e44ad;">
            📸 Fotos hochladen
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

    // Upload photos manually
    const uploadBtn = panel.querySelector('#bk-upload-photos');
    if (uploadBtn) {
      if (!pendingBike.images || pendingBike.images.length === 0) {
        uploadBtn.style.display = 'none';
      }
      uploadBtn.addEventListener('click', () => {
        photosUploaded = false; // Reset flag to allow re-upload
        uploadBtn.textContent = '⏳ Fotos werden hochgeladen...';
        uploadBtn.disabled = true;
        uploadBtn.style.background = '#7f8c8d';
        uploadPhotosToForm();
        // Reset button after some time
        setTimeout(() => {
          if (!photosUploaded) {
            uploadBtn.textContent = '📸 Fotos erneut versuchen';
            uploadBtn.disabled = false;
            uploadBtn.style.background = '#8e44ad';
          } else {
            uploadBtn.textContent = '✅ Fotos hochgeladen!';
            uploadBtn.style.background = '#27ae60';
          }
        }, 8000);
      });
    }

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

    // Auto-fill with multiple retry attempts (KA React app renders fields at different times)
    const fillAttempts = [2000, 4000, 6000];
    fillAttempts.forEach(delay => {
      setTimeout(() => {
        console.log(`[BikeHaus] Auto-fill attempt at ${delay}ms`);
        fillForm();
      }, delay);
    });
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
