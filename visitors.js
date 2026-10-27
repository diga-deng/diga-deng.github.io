(() => {
  'use strict';
  const base = "https://diga-visitor-map.leafy-ocean-6866.chatgpt.site";
  const image = document.querySelector('[data-visitor-map]');
  const link = document.querySelector('[data-visitor-stats]');
  const status = document.querySelector('[data-visitor-status]');
  if (!image || !link || !status) return;
  const updateMap = () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    image.src = base + '/map.svg?theme=' + theme + '&v=' + Date.now();
    link.href = base + '/?theme=' + theme;
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
