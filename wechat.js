(() => {
  const trigger = document.querySelector('[data-wechat-open]');
  const dialog = document.getElementById('wechat-dialog');
  if (!trigger || !dialog || typeof dialog.showModal !== 'function') return;

  // Keep the image link usable when JavaScript or native dialogs are unavailable.
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', dialog.id);
  trigger.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    dialog.showModal();
  });

  dialog.querySelector('[data-wechat-close]').addEventListener('click', () => dialog.close());
  let startedOnBackdrop = false;
  const outsideDialog = (event) => {
    const bounds = dialog.getBoundingClientRect();
    return event.target === dialog &&
      (event.clientX < bounds.left || event.clientX > bounds.right ||
       event.clientY < bounds.top || event.clientY > bounds.bottom);
  };
  dialog.addEventListener('pointerdown', (event) => {
    startedOnBackdrop = outsideDialog(event);
  });
  dialog.addEventListener('click', (event) => {
    if (startedOnBackdrop && outsideDialog(event)) dialog.close();
    startedOnBackdrop = false;
  });
  dialog.addEventListener('close', () => trigger.focus({ preventScroll: true }));
})();
