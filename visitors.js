(() => {
  'use strict';
  const base = "https://diga-visitor-map.leafy-ocean-6866.chatgpt.site";
  const image = document.querySelector('[data-visitor-map]');
  const link = document.querySelector('[data-visitor-stats]');
  const status = document.querySelector('[data-visitor-status]');
  if (!image || !link || !status) return;
  const regions = document.querySelector('[data-visitor-regions]');
  let regionsRequest;
  const countryNames = typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;

  async function updateRegions() {
    if (!regions) return;
    if (regionsRequest) regionsRequest.abort();
    const controller = new AbortController();
    regionsRequest = controller;
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(base + '/api/stats', {
        mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer',
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Statistics unavailable');
      const data = await response.json();
      if (!Array.isArray(data.places)) throw new Error('Locations unavailable');
      const names = [];
      const seen = new Set();
      // Use the same places as the map; never substitute example locations.
      for (const place of data.places) {
        if (!place || typeof place !== 'object') continue;
        const city = typeof place.city === 'string' ? place.city.trim() : '';
        const region = typeof place.region === 'string' ? place.region.trim() : '';
        const country = typeof place.country === 'string' ? place.country.trim().toUpperCase() : '';
        const countryName = /^[A-Z]{2}$/.test(country) && country !== 'XX'
          ? (countryNames ? countryNames.of(country) : country) : '';
        const name = city || region || countryName;
        if (!name || seen.has(name.toLowerCase())) continue;
        seen.add(name.toLowerCase());
        names.push(name);
      }
      // A slower request must not overwrite a newer map refresh.
      if (regionsRequest !== controller) return;
      regions.textContent = names.length ? 'Visitors: ' + names.join(' · ') : '';
      regions.hidden = names.length === 0;
    } catch (_) {
      // Keep the map usable if the optional region summary cannot be loaded.
    } finally {
      clearTimeout(timeout);
    }
  }
  const updateMap = () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    image.src = base + '/map.svg?theme=' + theme + '&v=' + Date.now();
    link.href = base + '/?theme=' + theme;
    updateRegions();
  };
  image.addEventListener('error', () => { status.hidden = false; });
  image.addEventListener('load', () => { status.hidden = true; });
  new MutationObserver(updateMap).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  updateMap();
  // Read-only previews, privacy opt-outs, and the statistics page never count.
  if (location.origin !== 'https://diga-deng.github.io' ||
      navigator.doNotTrack === '1' || window.doNotTrack === '1' ||
      navigator.globalPrivacyControl === true) return;
  const id = crypto.randomUUID();
  async function record(attempt = 0) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(base + '/api/visit', {
        method: 'POST', mode: 'cors', credentials: 'omit', referrerPolicy: 'origin',
        headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ id }),
        signal: controller.signal, keepalive: true
      });
      if (!response.ok) throw new Error('Statistics unavailable');
      updateMap();
    } catch (_) {
      // Reuse the event ID: a timed-out request must not double-count.
      if (attempt === 0) setTimeout(() => record(1), 2000);
    } finally { clearTimeout(timeout); }
  }
  record();
})();

