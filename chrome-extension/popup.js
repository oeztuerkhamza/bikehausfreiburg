// ============================================
// BikeHaus Kleinanzeigen Helper - Popup Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('status');
  const actionsEl = document.getElementById('actions');

  chrome.runtime.sendMessage({ type: 'BIKEHAUS_GET_PENDING' }, (response) => {
    if (response && response.data) {
      const bike = response.data;
      statusEl.className = 'status status-pending';
      statusEl.innerHTML = `
        <div>✅ Fahrrad bereit zum Veröffentlichen</div>
        <div class="bike-info">${bike.marke} ${bike.modell}</div>
      `;
      actionsEl.innerHTML = `
        <button id="btn-open" class="btn btn-primary">
          🔗 Kleinanzeigen öffnen
        </button>
        <button id="btn-clear" class="btn btn-danger">
          🗑️ Daten löschen
        </button>
      `;
      document.getElementById('btn-open').addEventListener('click', () => {
        chrome.tabs.create({
          url: 'https://www.kleinanzeigen.de/p-anzeige-aufgeben-schritt2.html'
        });
        window.close();
      });
      document.getElementById('btn-clear').addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'BIKEHAUS_CLEAR_PENDING' }, () => {
          statusEl.className = 'status status-empty';
          statusEl.innerHTML = 'Keine Fahrraddaten vorhanden.';
          actionsEl.innerHTML = '';
        });
      });
    } else {
      statusEl.className = 'status status-empty';
      statusEl.innerHTML = 'Keine Fahrraddaten vorhanden.';
    }
  });
});
