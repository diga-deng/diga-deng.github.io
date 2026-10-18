(() => {
  'use strict';
  const dialog = document.getElementById('email-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const address = document.getElementById('email-address');
  const status = document.getElementById('email-copy-status');
  const projectLabel = document.getElementById('email-project');
  const webMessage = document.getElementById('email-web-message');
  let trigger;

  document.querySelectorAll('[data-email-open]').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', dialog.id);
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      trigger = link;
      const interest = link.dataset.emailInterest;
      const subject = interest ? `[Startup interest] ${interest}` : 'Hello Peijia';
      projectLabel.textContent = interest || '';
      projectLabel.hidden = !interest;
      status.textContent = '';
      const gmail = new URL('https://mail.google.com/mail/');
      gmail.search = new URLSearchParams({ view: 'cm', fs: '1', to: address.value, su: subject });
      document.getElementById('email-gmail').href = gmail.href;
      document.getElementById('email-mail-app').href = `mailto:${address.value}?subject=${encodeURIComponent(subject)}`;
      webMessage.dataset.startupInterest = interest || 'General conversation';
      dialog.showModal();
    });
  });

  document.getElementById('email-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(address.value);
      status.textContent = 'Email address copied.';
    } catch (_) {
      address.focus();
      address.select();
      status.textContent = 'Select and copy the email address above.';
    }
  });
  dialog.querySelector('[data-email-close]').addEventListener('click', () => dialog.close());
  webMessage.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => trigger?.focus({ preventScroll: true }));

  let startedOnBackdrop = false;
  const outsideDialog = event => {
    const bounds = dialog.getBoundingClientRect();
    return event.target === dialog &&
      (event.clientX < bounds.left || event.clientX > bounds.right ||
       event.clientY < bounds.top || event.clientY > bounds.bottom);
  };
  dialog.addEventListener('pointerdown', event => { startedOnBackdrop = outsideDialog(event); });
  dialog.addEventListener('click', event => {
    if (startedOnBackdrop && outsideDialog(event)) dialog.close();
    startedOnBackdrop = false;
  });
})();
