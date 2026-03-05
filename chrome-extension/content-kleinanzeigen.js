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
    const proto =
      input.tagName === 'TEXTAREA'
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
        if (
          optText.includes(search.toLowerCase()) ||
          optVal.includes(search.toLowerCase())
        ) {
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
              const radio =
                label.querySelector('input[type="radio"]') ||
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
          const label =
            radio.closest('label') ||
            document.querySelector(`label[for="${radio.id}"]`);
          const labelText = label ? label.textContent.trim().toLowerCase() : '';
          for (const search of searchTexts) {
            if (
              val.includes(search.toLowerCase()) ||
              labelText.includes(search.toLowerCase())
            ) {
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
          if (
            optText === search.toLowerCase() ||
            optText.includes(search.toLowerCase())
          ) {
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
    const candidates = document.querySelectorAll(
      'label, span, div, p, h3, h4, legend',
    );
    for (const el of candidates) {
      // Check direct text content (not children)
      const directText = Array.from(el.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent.trim())
        .join(' ');
      const fullText = el.textContent.trim();

      if (
        directText.toLowerCase() === labelText.toLowerCase() ||
        fullText.toLowerCase() === labelText.toLowerCase()
      ) {
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

  // ── Fetch all images from the API and return data URLs with filenames ──
  function fetchAllImageDataUrls() {
    if (
      !pendingBike ||
      !pendingBike.images ||
      pendingBike.images.length === 0
    ) {
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
              console.log(`[BikeHaus] Fetched image ${i + 1}: ${filename}`);
              resolve({ dataUrl: response.dataUrl, filename });
            } else {
              console.log(
                `[BikeHaus] Failed to fetch image ${i + 1}:`,
                response?.error,
              );
              resolve(null);
            }
          },
        );
      });
    });

    return Promise.all(fetchPromises).then((results) =>
      results.filter((r) => r !== null),
    );
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
    // Also update the upload button if it exists
    const uploadBtn = panelElement.querySelector('#bk-upload-photos');
    if (uploadBtn) {
      if (success) {
        uploadBtn.textContent = '✅ Fotos hochgeladen!';
        uploadBtn.style.background = '#27ae60';
        uploadBtn.disabled = false;
      }
    }
  }

  // ── Upload photos to Kleinanzeigen form ──
  // Strategy: Inject script into PAGE context to access Plupload's JS API directly.
  // Content scripts run in an isolated world and cannot access page JavaScript variables.
  // Plupload creates its own file input and event handlers internally, so manipulating
  // the DOM from content script context won't trigger Plupload's upload pipeline.
  function uploadPhotosToForm() {
    if (photosUploaded) {
      console.log('[BikeHaus] Photos already uploaded, skipping');
      return;
    }
    if (
      !pendingBike ||
      !pendingBike.images ||
      pendingBike.images.length === 0
    ) {
      console.log('[BikeHaus] No images to upload');
      return;
    }

    console.log(
      `[BikeHaus] Uploading ${pendingBike.images.length} photos via page context injection...`,
    );

    // Step 1: Fetch all images as data URLs
    fetchAllImageDataUrls().then((imageDataItems) => {
      if (imageDataItems.length === 0) {
        console.log('[BikeHaus] No valid images fetched');
        updatePanelPhotoStatus(0, false);
        return;
      }

      console.log(
        `[BikeHaus] Got ${imageDataItems.length} images, injecting into page context...`,
      );

      // Step 2: Store image data in a hidden DOM element (bridge between content script and page)
      const dataEl = document.createElement('div');
      dataEl.id = 'bikehaus-photo-data';
      dataEl.style.display = 'none';
      dataEl.setAttribute('data-photos', JSON.stringify(imageDataItems));
      document.body.appendChild(dataEl);

      // Step 3: Listen for result from injected script
      const resultHandler = (event) => {
        if (event.detail) {
          window.removeEventListener('bikehaus-upload-result', resultHandler);
          if (event.detail.success) {
            console.log(
              `[BikeHaus] Page-context upload succeeded: ${event.detail.count} files, method: ${event.detail.method}`,
            );
            photosUploaded = true;
            updatePanelPhotoStatus(event.detail.count, true);
          } else {
            console.log(
              `[BikeHaus] Page-context upload failed: ${event.detail.error}`,
            );
            updatePanelPhotoStatus(0, false);
          }
        }
      };
      window.addEventListener('bikehaus-upload-result', resultHandler);

      // Step 4: Inject script into PAGE context (not content script isolated world)
      // This runs in the MAIN world so it can access Plupload, jQuery, and dispatch
      // DragEvent with real dataTransfer objects that the page's handlers can read.
      const script = document.createElement('script');
      script.textContent = `
        (function() {
          try {
            var dataEl = document.getElementById('bikehaus-photo-data');
            if (!dataEl) {
              window.dispatchEvent(new CustomEvent('bikehaus-upload-result', { detail: { success: false, error: 'No data element found' } }));
              return;
            }
            var imageDataItems = JSON.parse(dataEl.getAttribute('data-photos'));
            dataEl.remove();

            console.log('[BikeHaus PageCtx] Starting upload of ' + imageDataItems.length + ' images');

            // Convert data URL to File
            function dataURLtoFile(dataUrl, filename) {
              var arr = dataUrl.split(',');
              var mime = arr[0].match(/:(.*?);/)[1];
              var bstr = atob(arr[1]);
              var n = bstr.length;
              var u8arr = new Uint8Array(n);
              while (n--) u8arr[n] = bstr.charCodeAt(n);
              return new File([u8arr], filename, { type: mime });
            }

            var files = imageDataItems.map(function(item) {
              return dataURLtoFile(item.dataUrl, item.filename);
            });

            function reportSuccess(count, method) {
              window.dispatchEvent(new CustomEvent('bikehaus-upload-result', {
                detail: { success: true, count: count, method: method }
              }));
            }
            function reportFail(error) {
              window.dispatchEvent(new CustomEvent('bikehaus-upload-result', {
                detail: { success: false, error: error }
              }));
            }

            // ═══════════════════════════════════════════════════════
            // Strategy 1 (PRIMARY): Drag & Drop on dropzone
            // Kleinanzeigen listens for drop events via jQuery/Plupload.
            // Try multiple selectors for different KA versions.
            // ═══════════════════════════════════════════════════════
            var dropZone = document.querySelector('#dropzone-box') ||
                           document.querySelector('[data-testid="picture-upload-dropzone"]') ||
                           document.querySelector('[data-testid="dropzone"]') ||
                           document.querySelector('.picture-upload-dropzone') ||
                           document.querySelector('.dropzone') ||
                           document.querySelector('.uploadbox') ||
                           document.querySelector('#pstad-pictureupload .formgroup-input') ||
                           document.querySelector('[class*="dropzone"]') ||
                           document.querySelector('[class*="picture-upload"]');

            console.log('[BikeHaus PageCtx] Looking for dropzone...');
            console.log('[BikeHaus PageCtx] All potential dropzones:', document.querySelectorAll('[class*="drop"], [class*="upload"], [data-testid*="upload"]'));

            if (dropZone) {
              console.log('[BikeHaus PageCtx] Found dropzone: ' + (dropZone.id || dropZone.className));

              // Build a proper DataTransfer with all files
              var dt = new DataTransfer();
              files.forEach(function(f) { dt.items.add(f); });

              // Simulate the full drag & drop sequence with proper timing
              // Step 1: dragenter
              var enterEvt = new DragEvent('dragenter', {
                bubbles: true, cancelable: true, dataTransfer: dt
              });
              dropZone.dispatchEvent(enterEvt);
              console.log('[BikeHaus PageCtx] dragenter dispatched');

              setTimeout(function() {
                // Step 2: dragover (must be called to allow drop)
                var overEvt = new DragEvent('dragover', {
                  bubbles: true, cancelable: true, dataTransfer: dt
                });
                dropZone.dispatchEvent(overEvt);
                console.log('[BikeHaus PageCtx] dragover dispatched');

                setTimeout(function() {
                  // Step 3: drop - the main event
                  var dropEvt = new DragEvent('drop', {
                    bubbles: true, cancelable: true, dataTransfer: dt
                  });
                  dropZone.dispatchEvent(dropEvt);
                  console.log('[BikeHaus PageCtx] drop dispatched with ' + files.length + ' files');

                  // Step 4: dragleave for cleanup
                  setTimeout(function() {
                    dropZone.dispatchEvent(new DragEvent('dragleave', {
                      bubbles: true, cancelable: true
                    }));

                    // Check if thumbnails appeared (Plupload processes and shows them)
                    setTimeout(function() {
                      var thumbs = document.querySelector('#j-pictureupload-thumbnails');
                      var thumbCount = thumbs ? thumbs.querySelectorAll('li').length : 0;
                      if (thumbCount > 0) {
                        console.log('[BikeHaus PageCtx] Drop SUCCESS - ' + thumbCount + ' thumbnails appeared');
                        reportSuccess(files.length, 'drag-drop');
                      } else {
                        console.log('[BikeHaus PageCtx] No thumbnails after drop, trying jQuery trigger...');
                        tryJQueryDrop(dropZone, files, dt);
                      }
                    }, 3000);
                  }, 50);

                }, 150);
              }, 150);
              return;
            }

            // ═══════════════════════════════════════════════════════
            // Strategy 2: Plupload API (addFile)
            // ═══════════════════════════════════════════════════════
            console.log('[BikeHaus PageCtx] No dropzone found, trying Plupload API...');
            var uploader = findPluploadInstance();

            if (uploader) {
              console.log('[BikeHaus PageCtx] Using Plupload API addFile()');
              var addIdx = 0;
              function addNext() {
                if (addIdx >= files.length) {
                  setTimeout(function() {
                    try { uploader.start(); } catch(e) {}
                    reportSuccess(files.length, 'plupload-api');
                  }, 500);
                  return;
                }
                try { uploader.addFile(files[addIdx]); } catch(e) {
                  console.log('[BikeHaus PageCtx] addFile error: ' + e.message);
                }
                addIdx++;
                setTimeout(addNext, 300);
              }
              addNext();
              return;
            }

            // ═══════════════════════════════════════════════════════
            // Strategy 3: File input (sequential)
            // ═══════════════════════════════════════════════════════
            console.log('[BikeHaus PageCtx] No Plupload, trying file input...');
            console.log('[BikeHaus PageCtx] All file inputs:', document.querySelectorAll('input[type="file"]'));
            var fileInput = document.querySelector('#plupld input[type="file"]') ||
                            document.querySelector('#pstad-pictureupload input[type="file"]') ||
                            document.querySelector('[data-testid*="picture"] input[type="file"]') ||
                            document.querySelector('[data-testid*="upload"] input[type="file"]') ||
                            document.querySelector('[class*="picture-upload"] input[type="file"]') ||
                            document.querySelector('[class*="dropzone"] input[type="file"]') ||
                            document.querySelector('input[type="file"][accept*="image"]') ||
                            document.querySelector('input[type="file"]');

            if (fileInput) {
              console.log('[BikeHaus PageCtx] Found file input:', fileInput);
              var fIdx = 0;
              function addNextInput() {
                if (fIdx >= files.length) {
                  reportSuccess(files.length, 'file-input');
                  return;
                }
                var fdt = new DataTransfer();
                fdt.items.add(files[fIdx]);
                fileInput.files = fdt.files;
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                fIdx++;
                setTimeout(function() {
                  fileInput = document.querySelector('#plupld input[type="file"]') ||
                              document.querySelector('[data-testid*="picture"] input[type="file"]') ||
                              document.querySelector('[class*="picture-upload"] input[type="file"]') ||
                              document.querySelector('input[type="file"][accept*="image"]') ||
                              document.querySelector('input[type="file"]');
                  addNextInput();
                }, 1500);
              }
              addNextInput();
              return;
            }

            console.log('[BikeHaus PageCtx] ERROR: No upload mechanism found on page');
            console.log('[BikeHaus PageCtx] Page body classes:', document.body.className);
            reportFail('No upload mechanism found');

            // ── Helper: Try jQuery-based drop event ──
            function tryJQueryDrop(zone, fileList, dataTransfer) {
              if (typeof jQuery === 'undefined') {
                // Try Plupload API as last resort
                var up = findPluploadInstance();
                if (up) {
                  var i = 0;
                  function addF() {
                    if (i >= fileList.length) {
                      try { up.start(); } catch(e) {}
                      reportSuccess(fileList.length, 'plupload-fallback');
                      return;
                    }
                    try { up.addFile(fileList[i]); } catch(e) {}
                    i++;
                    setTimeout(addF, 300);
                  }
                  addF();
                } else {
                  reportFail('Drop did not work and no fallback available');
                }
                return;
              }

              // Try triggering via jQuery's event system
              console.log('[BikeHaus PageCtx] Trying jQuery drop trigger...');
              var jqEvt = jQuery.Event('drop');
              jqEvt.originalEvent = { dataTransfer: { files: dataTransfer.files } };
              jQuery(zone).trigger(jqEvt);

              setTimeout(function() {
                var thumbs2 = document.querySelector('#j-pictureupload-thumbnails');
                var tc2 = thumbs2 ? thumbs2.querySelectorAll('li').length : 0;
                if (tc2 > 0) {
                  reportSuccess(fileList.length, 'jquery-drop');
                } else {
                  // Last resort: Plupload API
                  var up2 = findPluploadInstance();
                  if (up2) {
                    var j = 0;
                    function addF2() {
                      if (j >= fileList.length) {
                        try { up2.start(); } catch(e) {}
                        reportSuccess(fileList.length, 'plupload-final');
                        return;
                      }
                      try { up2.addFile(fileList[j]); } catch(e) {}
                      j++;
                      setTimeout(addF2, 300);
                    }
                    addF2();
                  } else {
                    reportFail('All upload methods failed');
                  }
                }
              }, 3000);
            }

            // ── Helper: Find Plupload instance ──
            function findPluploadInstance() {
              // Method A: plupload.instances
              if (typeof plupload !== 'undefined' && plupload.instances && plupload.instances.length > 0) {
                return plupload.instances[0];
              }
              // Method B: known global names
              var names = ['uploader', 'pictureUploader', 'imageUploader', 'fileUploader', 'pu'];
              for (var i = 0; i < names.length; i++) {
                if (window[names[i]] && typeof window[names[i]].addFile === 'function') return window[names[i]];
              }
              // Method C: jQuery data
              if (typeof jQuery !== 'undefined') {
                var sels = ['#pstad-pictureupload', '#dropzone-box', '#plupld', '.uploadbox'];
                for (var s = 0; s < sels.length; s++) {
                  var jq = jQuery(sels[s]);
                  if (jq.length > 0) {
                    var d = jq.data();
                    if (d) {
                      var keys = Object.keys(d);
                      for (var k = 0; k < keys.length; k++) {
                        var v = d[keys[k]];
                        if (v && typeof v === 'object' && typeof v.addFile === 'function') return v;
                      }
                    }
                  }
                }
              }
              // Method D: scan window
              try {
                var props = Object.getOwnPropertyNames(window);
                for (var p = 0; p < props.length; p++) {
                  try {
                    var o = window[props[p]];
                    if (o && typeof o === 'object' && o !== window && typeof o.addFile === 'function' && typeof o.start === 'function') return o;
                  } catch(e) {}
                }
              } catch(e) {}
              return null;
            }

          } catch(e) {
            console.error('[BikeHaus PageCtx] Error:', e);
            window.dispatchEvent(new CustomEvent('bikehaus-upload-result', {
              detail: { success: false, error: e.message }
            }));
          }
        })();
      `;
      document.body.appendChild(script);
      script.remove();

      // Timeout: if no result after 30s, consider it failed
      setTimeout(() => {
        window.removeEventListener('bikehaus-upload-result', resultHandler);
        if (!photosUploaded) {
          console.log('[BikeHaus] Photo upload timed out after 30s');
          updatePanelPhotoStatus(0, false);
        }
      }, 30000);
    });
  }

  // ── Map fahrradtyp to Kleinanzeigen Typ dropdown ──
  function mapFahrradtypToKA(fahrradtyp) {
    if (!fahrradtyp) return [];
    const ft = fahrradtyp.toLowerCase();
    if (ft.includes('city') || ft.includes('urban'))
      return ['Cityräder', 'Citybike', 'City'];
    if (ft.includes('trekking') || ft.includes('tour'))
      return ['Trekkingräder', 'Trekkingrad', 'Trekking'];
    if (ft.includes('mountain') || ft.includes('mtb'))
      return ['Mountainbikes', 'Mountainbike', 'Mountain'];
    if (ft.includes('renn') || ft.includes('road') || ft.includes('race'))
      return ['Rennräder', 'Rennrad', 'Renn'];
    if (
      ft.includes('e-bike') ||
      ft.includes('ebike') ||
      ft.includes('elektro') ||
      ft.includes('pedelec')
    )
      return ['E-Bikes', 'E-Bike', 'Pedelec'];
    if (ft.includes('kinder') || ft.includes('kind') || ft.includes('jugend'))
      return ['Kinderfahrräder', 'Kinder', 'Jugend'];
    if (ft.includes('bmx')) return ['BMX'];
    if (ft.includes('cross') || ft.includes('gravel'))
      return ['Crossräder', 'Crossrad', 'Gravel'];
    if (ft.includes('falt') || ft.includes('klapp'))
      return ['Falträder', 'Faltrad', 'Klapp'];
    if (ft.includes('cruiser')) return ['Cruiser'];
    if (ft.includes('hollandrad') || ft.includes('holland'))
      return ['Hollandräder', 'Hollandrad', 'Holland'];
    if (ft.includes('lastenrad') || ft.includes('cargo'))
      return ['Lastenräder', 'Lastenrad', 'Cargo'];
    if (ft.includes('tandem')) return ['Tandem'];
    if (ft.includes('e-trekking')) return ['Trekkingräder', 'E-Bikes'];
    return [fahrradtyp];
  }

  // ── Fill Zustand (condition) picker on Kleinanzeigen ──
  // KA uses a custom SingleSelect component, not a <select>.
  // The picker has a trigger button and a dropdown list of options.
  function fillZustandPicker(zustandText) {
    console.log(
      `[BikeHaus] Trying to fill Zustand picker with: "${zustandText}"`,
    );

    // Find the Zustand section by looking for various container patterns
    // KA typically uses: #postad-condition, or a formgroup containing "Zustand" label
    const zustandContainer = findZustandContainer();
    if (!zustandContainer) {
      console.log('[BikeHaus] Zustand container not found');
      return false;
    }

    console.log(
      '[BikeHaus] Found Zustand container:',
      zustandContainer.id || zustandContainer.className,
    );

    // Find the trigger button/element inside the container
    const trigger =
      zustandContainer.querySelector(
        '[class*="singleselect"] [class*="trigger"]',
      ) ||
      zustandContainer.querySelector('[role="button"]') ||
      zustandContainer.querySelector('button') ||
      zustandContainer.querySelector('[class*="singleselect"]') ||
      zustandContainer.querySelector('[class*="select"]') ||
      zustandContainer.querySelector('a');

    if (trigger) {
      console.log('[BikeHaus] Found Zustand trigger, clicking...');
      trigger.click();

      // Wait for dropdown to appear, then click the option
      setTimeout(() => {
        selectZustandOption(zustandContainer, zustandText);
      }, 600);

      // Also try again after a longer delay in case it takes time
      setTimeout(() => {
        selectZustandOption(zustandContainer, zustandText);
      }, 1200);

      return true;
    }

    // Fallback: try to find any clickable element in the container
    const clickable = zustandContainer.querySelector(
      'div[tabindex], span[tabindex], div[onclick], span[onclick]',
    );
    if (clickable) {
      clickable.click();
      setTimeout(() => {
        selectZustandOption(zustandContainer, zustandText);
      }, 600);
      return true;
    }

    console.log('[BikeHaus] No Zustand trigger element found');
    return false;
  }

  // Find the Zustand container element
  function findZustandContainer() {
    // Method 1: Known IDs
    const knownIds = ['postad-condition', 'condition', 'zustand'];
    for (const id of knownIds) {
      const el = document.getElementById(id);
      if (el) return el;
    }

    // Method 2: Find by label/legend text "Zustand"
    const allLabels = document.querySelectorAll('label, legend, span, div');
    for (const label of allLabels) {
      // Check direct text only (not deep children text)
      const directText = Array.from(label.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent.trim())
        .join('');

      if (directText.toLowerCase().includes('zustand')) {
        // Go up to find the form group container
        let parent = label.parentElement;
        for (let i = 0; i < 4 && parent; i++) {
          if (
            parent.classList.contains('formgroup') ||
            parent.id.includes('condition') ||
            parent.id.includes('zustand') ||
            parent.querySelector('[class*="singleselect"]') ||
            parent.querySelector('[role="button"]')
          ) {
            return parent;
          }
          parent = parent.parentElement;
        }
        // If no formgroup found, return the label's parent
        return label.parentElement;
      }
    }

    // Method 3: Find by singleselect class near a Zustand-related element
    const singleSelects = document.querySelectorAll('[class*="singleselect"]');
    for (const ss of singleSelects) {
      const parent = ss.closest('[class*="formgroup"]') || ss.parentElement;
      if (parent && parent.textContent.toLowerCase().includes('zustand')) {
        return parent;
      }
    }

    return null;
  }

  // Select an option from the opened Zustand dialog
  // KA opens a modal dialog with radio buttons + "Bestätigen" button
  function selectZustandOption(container, zustandText) {
    // The dialog may be a modal that appears anywhere on the page (portal)
    // Look for radio buttons with the matching label text
    const searchAreas = [document.body];

    for (const area of searchAreas) {
      // Find all radio buttons on the page
      const radios = area.querySelectorAll('input[type="radio"]');
      for (const radio of radios) {
        // Check the label/container around this radio
        const radioContainer =
          radio.closest('label') ||
          radio.closest('[class*="option"]') ||
          radio.closest('[class*="item"]') ||
          radio.parentElement;
        if (!radioContainer) continue;

        const containerText = radioContainer.textContent.trim();
        // Check if this radio's label starts with or matches the zustand text
        // "Sehr Gut" should match "Sehr Gut\nGepflegter Artikel mit..."
        // "Neu" should match "Neu\nUnbenutzter Artikel..."
        const firstLine = containerText.split('\n')[0].trim();

        if (
          firstLine.toLowerCase() === zustandText.toLowerCase() ||
          firstLine.toLowerCase().startsWith(zustandText.toLowerCase())
        ) {
          console.log(
            `[BikeHaus] Found Zustand radio: "${firstLine}", clicking...`,
          );

          // Click the radio button
          radio.checked = true;
          radio.click();
          radio.dispatchEvent(new Event('change', { bubbles: true }));
          radio.dispatchEvent(new Event('input', { bubbles: true }));

          // Also click the label/container (some frameworks listen on label click)
          radioContainer.click();

          // Now find and click the "Bestätigen" (Confirm) button
          setTimeout(() => {
            clickBestaetigenButton();
          }, 400);

          return true;
        }
      }
    }

    console.log(
      `[BikeHaus] Zustand option "${zustandText}" not found in dialog`,
    );
    return false;
  }

  // Click the "Bestätigen" button in the Zustand dialog
  function clickBestaetigenButton() {
    // Look for buttons with text "Bestätigen"
    const allButtons = document.querySelectorAll(
      'button, [role="button"], a, input[type="submit"]',
    );
    for (const btn of allButtons) {
      const btnText = btn.textContent.trim().toLowerCase();
      if (btnText === 'bestätigen' || btnText.includes('bestätigen')) {
        console.log('[BikeHaus] Clicking Bestätigen button');
        btn.click();
        return true;
      }
    }
    console.log('[BikeHaus] Bestätigen button not found');
    return false;
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
      priceType: false,
    };

    console.log('[BikeHaus] Filling form with data:', {
      title,
      price,
      zustand: pendingBike.zustand,
      art: pendingBike.art,
      fahrradtyp: pendingBike.fahrradtyp,
    });

    // ── 1. Titel ──
    const titleEl = findFirst(
      '#postad-title',
      'input[id*="title"]',
      'input[name*="title"]',
      'input[placeholder*="Titel"]',
      'input[placeholder*="Was"]',
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
      'textarea',
    );
    if (descEl) {
      filled.description = setInputValue(descEl, description);
      console.log('[BikeHaus] Description:', filled.description);
    }

    // ── 3. Preis ──
    if (price) {
      // Strategy 1: Known ID
      let priceEl = findFirst(
        '#postad-price',
        'input[id*="price"]',
        'input[name*="price"]',
      );
      // Strategy 2: Find by label text "Preis"
      if (!priceEl) {
        priceEl = findFieldByLabelText('Preis', 'input');
      }
      // Strategy 3: Find input near EUR text
      if (!priceEl) {
        const eurTexts = document.querySelectorAll('*');
        for (const el of eurTexts) {
          if (
            el.childNodes.length === 1 &&
            el.textContent.trim().includes('EUR')
          ) {
            const parent = el.parentElement;
            if (parent) {
              priceEl = parent.querySelector(
                'input[type="text"], input[type="number"], input:not([type])',
              );
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
    const priceTypeSel = findSelectByOptionTexts(
      'Festpreis',
      'VB',
      'Zu verschenken',
    );
    if (priceTypeSel) {
      filled.priceType = selectDropdownByText(priceTypeSel, 'Festpreis');
      console.log('[BikeHaus] PriceType:', filled.priceType);
    }

    // ── 5. Zustand ──
    // Kleinanzeigen uses a custom SingleSelect picker for Zustand, NOT a standard <select>.
    // It renders as a clickable button/div that opens a dropdown list of options.
    // We inject into page context to handle any JavaScript-bound click handlers.
    const zustandText = isNew ? 'Neu' : 'Sehr gut';

    // Strategy A: Standard <select> element
    const zustandSel = findSelectByOptionTexts('Neu', 'Gebraucht', 'Sehr gut');
    if (zustandSel) {
      filled.zustand = selectDropdownByText(zustandSel, zustandText);
    }

    // Strategy B: Custom SingleSelect picker - find by known IDs and class patterns
    if (!filled.zustand) {
      filled.zustand = fillZustandPicker(zustandText);
    }

    console.log('[BikeHaus] Zustand:', filled.zustand);

    // ── 6. Versand → Nur Abholung ──
    // Find ALL radio/input elements and labels on the page
    const allRadios = document.querySelectorAll('input[type="radio"]');
    for (const radio of allRadios) {
      // Check associated label
      const label =
        radio.closest('label') ||
        document.querySelector(`label[for="${radio.id}"]`) ||
        radio.parentElement;
      const labelText = label ? label.textContent.trim().toLowerCase() : '';
      if (
        labelText.includes('nur abholung') ||
        labelText.includes('abholung')
      ) {
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
          Herren: ['Herren'],
          Damen: ['Damen'],
          Kinder: ['Kinder'],
        };
        const searchTerms = artMappings[pendingBike.art] || [pendingBike.art];
        filled.art = selectDropdownByText(artSel, ...searchTerms);
        console.log(
          '[BikeHaus] Art:',
          filled.art,
          '- selected:',
          pendingBike.art,
        );
      } else {
        console.log(
          '[BikeHaus] Art: no select found with Herren/Damen options',
        );
      }
    }

    // ── 8. Typ (Fahrradtyp) ──
    // Find the Typ select by its options: it contains "Cityräder", "Mountainbikes", etc.
    if (pendingBike.fahrradtyp) {
      const typSel = findSelectByOptionTexts(
        'Cityräder',
        'Mountainbikes',
        'Rennräder',
        'Trekkingräder',
      );
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
      const label =
        radio.closest('label') ||
        document.querySelector(`label[for="${radio.id}"]`) ||
        radio.parentElement;
      const labelText = label ? label.textContent.trim().toLowerCase() : '';
      // Find "Nein" radio that is within a "Direkt kaufen" context
      if (labelText === 'nein' || labelText.includes('nein')) {
        // Check parent context for "direkt kaufen"
        let parent =
          radio.closest('[class*="field"]') ||
          radio.parentElement?.parentElement?.parentElement;
        if (parent) {
          const parentText = parent.textContent.toLowerCase();
          if (
            parentText.includes('direkt kaufen') ||
            parentText.includes('sofort-kaufen')
          ) {
            radio.checked = true;
            radio.click();
            radio.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('[BikeHaus] Direkt kaufen: set to Nein');
            break;
          }
        }
      }
    }

    // Photos are now handled via drag & drop from the panel

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

    // ── Images section (draggable photos) ──
    let imagesHtml = '';
    if (pendingBike.images && pendingBike.images.length > 0) {
      const imageItems = pendingBike.images
        .map((img, i) => {
          const imgUrl = pendingBike.apiBaseUrl
            ? `${pendingBike.apiBaseUrl}/public/gallery-image/${img.filePath}`
            : img.filePath;
          return `
          <div class="bk-img-item bk-draggable-photo" draggable="true" data-img-index="${i}" data-img-url="${imgUrl}" data-filename="fahrrad_${pendingBike.id}_${i + 1}.jpg" title="Foto ${i + 1} – In den Upload-Bereich ziehen">
            <img data-src="${imgUrl}" alt="Foto ${i + 1}" draggable="false" />
            <div class="bk-drag-badge">${i + 1}</div>
            <a class="bk-img-download" title="Herunterladen" data-dl-url="${imgUrl}" data-dl-name="fahrrad_${pendingBike.id}_${i + 1}.jpg">⬇</a>
          </div>
        `;
        })
        .join('');

      imagesHtml = `
        <div class="bk-section">
          <div class="bk-section-title">📸 Fotos (${pendingBike.images.length}) – Zum Upload-Bereich ziehen</div>
          <div class="bk-images-grid bk-draggable-grid">${imageItems}</div>
          <div class="bk-drag-hint">↕ Fotos einzeln oder alle auf einmal in den Upload-Bereich ziehen</div>
          <div class="bk-photo-actions">
            <button id="bk-select-all-photos" class="bk-btn bk-btn-secondary bk-btn-sm">☑ Alle auswählen</button>
            <button id="bk-download-all" class="bk-btn bk-btn-secondary bk-btn-sm">⬇ Alle herunterladen</button>
          </div>
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
      panel.querySelector('.bk-body').style.display = minimized
        ? 'none'
        : 'block';
      panel.querySelector('#bk-minimize').textContent = minimized ? '+' : '−';
    });

    // Copy buttons
    panel.querySelectorAll('.bk-btn-copy').forEach((btn) => {
      btn.addEventListener('click', () => {
        const field = btn.dataset.copy;
        let text = '';
        if (field === 'title') text = title;
        else if (field === 'desc') text = description;
        else if (field === 'price')
          text = pendingBike.verkaufspreisVorschlag
            ? String(Math.round(pendingBike.verkaufspreisVorschlag))
            : '';
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

    // ── Setup draggable photos ──
    setupDraggablePhotos(panel);

    // Select all photos button
    const selectAllBtn = panel.querySelector('#bk-select-all-photos');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        const photos = panel.querySelectorAll('.bk-draggable-photo');
        const allSelected = [...photos].every((p) =>
          p.classList.contains('bk-selected'),
        );
        photos.forEach((p) => {
          if (allSelected) {
            p.classList.remove('bk-selected');
          } else {
            p.classList.add('bk-selected');
          }
        });
        selectAllBtn.textContent = allSelected
          ? '☑ Alle auswählen'
          : '☐ Auswahl aufheben';
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
            },
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

    // Load images via background script to bypass CSP restrictions
    loadPanelImages(panel);
  }

  // ── Fetch images via background script and display as data URLs ──
  function loadPanelImages(panel) {
    const imgElements = panel.querySelectorAll(
      '.bk-draggable-photo img[data-src]',
    );
    imgElements.forEach((img) => {
      const url = img.dataset.src;
      chrome.runtime.sendMessage(
        { type: 'BIKEHAUS_FETCH_IMAGE', url },
        (response) => {
          if (response && response.dataUrl) {
            img.src = response.dataUrl;
          }
        },
      );
    });

    // Also setup download links to use fetched data
    const dlLinks = panel.querySelectorAll('.bk-img-download[data-dl-url]');
    dlLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dlUrl = link.dataset.dlUrl;
        const dlName = link.dataset.dlName;
        chrome.runtime.sendMessage(
          { type: 'BIKEHAUS_FETCH_IMAGE', url: dlUrl },
          (response) => {
            if (response && response.dataUrl) {
              const a = document.createElement('a');
              a.href = response.dataUrl;
              a.download = dlName;
              a.click();
            }
          },
        );
      });
    });
  }

  // ── Setup draggable photos in the panel ──
  function setupDraggablePhotos(panel) {
    const photos = panel.querySelectorAll('.bk-draggable-photo');
    if (photos.length === 0) return;

    // Pre-fetch all images as data URLs for drag operations
    const photoDataCache = new Map();

    photos.forEach((photo) => {
      const imgUrl = photo.dataset.imgUrl;
      const filename = photo.dataset.filename;
      const index = parseInt(photo.dataset.imgIndex);

      // Pre-fetch image data
      chrome.runtime.sendMessage(
        { type: 'BIKEHAUS_FETCH_IMAGE', url: imgUrl },
        (response) => {
          if (response && response.dataUrl) {
            photoDataCache.set(index, { dataUrl: response.dataUrl, filename });
            photo.classList.add('bk-photo-ready');
            console.log(`[BikeHaus] Photo ${index + 1} cached for drag`);
          }
        },
      );

      // Toggle selection on click
      photo.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') return; // Don't toggle when clicking download
        photo.classList.toggle('bk-selected');
      });

      // Drag start
      photo.addEventListener('dragstart', (e) => {
        // Collect files to drag: selected photos or just this one
        const selectedPhotos = panel.querySelectorAll(
          '.bk-draggable-photo.bk-selected',
        );
        let indicesToDrag = [];

        if (
          selectedPhotos.length > 0 &&
          photo.classList.contains('bk-selected')
        ) {
          // Drag all selected
          indicesToDrag = [...selectedPhotos].map((p) =>
            parseInt(p.dataset.imgIndex),
          );
        } else {
          // Drag just this one
          indicesToDrag = [index];
        }

        // Build file list from cache
        const filesToDrag = [];
        for (const idx of indicesToDrag) {
          const cached = photoDataCache.get(idx);
          if (cached) {
            filesToDrag.push(cached);
          }
        }

        if (filesToDrag.length === 0) {
          console.log('[BikeHaus] Photos not ready yet, please wait...');
          e.preventDefault();
          return;
        }

        // Convert data URLs to Files and add to DataTransfer
        for (const item of filesToDrag) {
          const file = dataURLtoFile(item.dataUrl, item.filename);
          e.dataTransfer.items.add(file);
        }

        e.dataTransfer.effectAllowed = 'copy';

        // Visual feedback
        photo.classList.add('bk-dragging');
        console.log(`[BikeHaus] Dragging ${filesToDrag.length} photo(s)`);

        // Set drag image
        const dragGhost = document.createElement('div');
        dragGhost.style.cssText =
          'position:fixed;top:-1000px;left:-1000px;background:#3498db;color:white;padding:8px 16px;border-radius:8px;font-size:14px;font-weight:bold;font-family:sans-serif;z-index:999999;pointer-events:none;';
        dragGhost.textContent = `\uD83D\uDCF7 ${filesToDrag.length} Foto${filesToDrag.length > 1 ? 's' : ''}`;
        document.body.appendChild(dragGhost);
        e.dataTransfer.setDragImage(dragGhost, 0, 0);
        setTimeout(() => dragGhost.remove(), 0);
      });

      photo.addEventListener('dragend', () => {
        photo.classList.remove('bk-dragging');
        // Clear selection after successful drag
        panel
          .querySelectorAll('.bk-draggable-photo.bk-selected')
          .forEach((p) => {
            p.classList.remove('bk-selected');
          });
      });
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
      element.style.left = e.clientX - offsetX + 'px';
      element.style.top = e.clientY - offsetY + 'px';
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
    if (
      url.includes('bestaetigung') ||
      url.includes('success') ||
      url.includes('p-anzeige-aufgeben-bestaetigung')
    ) {
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
      const nrMatch =
        bodyText.match(/Anzeigennummer[:\s]*(\d+)/i) ||
        bodyText.match(/Anzeige-Nr[.:\s]*(\d+)/i);
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
      anzeigeNr: anzeigeNr,
    });

    // Show confirmation in panel
    if (panelElement) {
      const body = panelElement.querySelector('.bk-body');
      if (body) {
        const notice = document.createElement('div');
        notice.className = 'bk-notice bk-notice-success';
        notice.innerHTML = `✅ Anzeige-Nr <strong>${anzeigeNr}</strong> wurde an BikeHaus gesendet!`;
        notice.style.cssText =
          'background:#27ae60;color:white;padding:8px 12px;border-radius:6px;margin:8px 0;font-size:13px;text-align:center;';
        body.prepend(notice);
      }
    }

    // Clear pending bike after successful ad creation
    chrome.runtime.sendMessage({ type: 'BIKEHAUS_CLEAR_PENDING' });
    pendingBike = null;
  }

  // ── Handle pending delete requests (on "Meine Anzeigen" page) ──
  chrome.runtime.sendMessage(
    { type: 'BIKEHAUS_GET_PENDING_DELETE' },
    (response) => {
      if (response && response.anzeigeNr) {
        showDeleteHelper(response.anzeigeNr);
      }
    },
  );

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
        const adItem =
          link.closest('[class*="aditem"]') ||
          link.closest('li') ||
          link.closest('article') ||
          link.parentElement;
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
