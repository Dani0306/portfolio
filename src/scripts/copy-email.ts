/**
 * "Copy email" buttons stay hidden without JavaScript, where the mailto link
 * and the visible address already cover it. Their messages come from data
 * attributes, so they read in the page's language.
 */
const RESET_AFTER_MS = 2000;

for (const button of document.querySelectorAll<HTMLButtonElement>('button[data-copy-email]')) {
  const label = button.querySelector<HTMLElement>('[data-label]');
  const status = button.querySelector<HTMLElement>('[role="status"]');
  const idle = label?.textContent ?? '';
  const { copied = 'Copied', failed = 'Copy failed', failedLong = failed } = button.dataset;
  let timer = 0;

  button.hidden = false;
  button.addEventListener('click', async () => {
    let ok = true;
    try {
      await navigator.clipboard.writeText(button.dataset.copyEmail ?? '');
    } catch {
      ok = false;
    }
    if (label) label.textContent = ok ? copied : failed;
    if (status) status.textContent = ok ? copied : failedLong;

    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (label) label.textContent = idle;
      if (status) status.textContent = '';
    }, RESET_AFTER_MS);
  });
}
