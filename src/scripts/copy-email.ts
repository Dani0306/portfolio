/**
 * "Copy email" buttons stay hidden without JavaScript, where the mailto link
 * and the visible address already cover it.
 */
const RESET_AFTER_MS = 2000;

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy-email]')) {
  const label = button.querySelector<HTMLElement>('[data-label]');
  const status = button.querySelector<HTMLElement>('[role="status"]');
  const idle = label?.textContent ?? '';
  let timer = 0;

  button.hidden = false;
  button.addEventListener('click', async () => {
    let message = 'Copied';
    try {
      await navigator.clipboard.writeText(button.dataset.copyEmail ?? '');
    } catch {
      message = 'Copy failed. Select the address instead.';
    }
    if (label) label.textContent = message === 'Copied' ? 'Copied' : 'Copy failed';
    if (status) status.textContent = message;

    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (label) label.textContent = idle;
      if (status) status.textContent = '';
    }, RESET_AFTER_MS);
  });
}
