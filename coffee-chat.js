(() => {
  'use strict';
  const form = document.getElementById('coffee-form');
  if (!form) return;
  const time = document.getElementById('coffee-time');
  const zone = document.getElementById('coffee-timezone');
  const zoneLabel = document.getElementById('coffee-zone-label');
  const preview = document.getElementById('coffee-time-preview');
  const seattle = document.getElementById('coffee-seattle');
  const utc = document.getElementById('coffee-utc');
  const pad = n => String(n).padStart(2, '0');
  const localInputValue = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // The native date/time picker and Date parser both use the visitor's device zone.
  zone.value = localZone || 'Visitor device local time (see UTC time)';
  zoneLabel.textContent = `Choose a time in your local time zone: ${localZone || 'device local time'}. Seattle time will appear below.`;
  const seattleFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', weekday: 'short', year: 'numeric',
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
  });
  function refreshMinimum() {
    time.min = localInputValue(new Date(Math.ceil(Date.now() / 60000) * 60000));
  }
  function validateTime() {
    refreshMinimum();
    time.setCustomValidity('');
    seattle.value = '';
    utc.value = '';
    preview.textContent = '';
    delete preview.dataset.error;
    if (!time.value) return false;
    const requested = new Date(time.value);
    let error = '';
    if (!Number.isFinite(requested.getTime()) || localInputValue(requested) !== time.value) {
      error = 'Please choose a valid local time. This time may fall within a daylight saving clock change.';
    } else if (requested.getTime() <= Date.now()) {
      error = 'Please choose a time in the future.';
    }
    if (error) {
      time.setCustomValidity(error);
      preview.textContent = error;
      preview.dataset.error = 'true';
      return false;
    }
    const offset = -requested.getTimezoneOffset();
    const offsetLabel = `UTC${offset >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
    zone.value = `${localZone || 'Device local time'} (${offsetLabel} at selected time)`;
    seattle.value = seattleFormatter.format(requested);
    utc.value = requested.toISOString();
    preview.textContent = `In Seattle: ${seattle.value}`;
    return true;
  }
  time.addEventListener('input', validateTime);
  time.addEventListener('change', validateTime);
  time.addEventListener('focus', () => { refreshMinimum(); if (time.value) validateTime(); });
  // Do not intercept submission with AJAX: the provider handles CAPTCHA, delivery,
  // errors and the success redirect. Never display success before its response.
  form.addEventListener('submit', event => {
    if (!validateTime()) { event.preventDefault(); time.reportValidity(); }
  });
  window.addEventListener('pageshow', () => { refreshMinimum(); if (time.value) validateTime(); });
  if (location.hash === '#leave-message') document.getElementById('leave-message').open = true;
  refreshMinimum();
})();
