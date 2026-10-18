/**
 * Live local time in Medellín. Each [data-local-time] element carries its
 * template ("Medellín · {time}") and locale; the server rendered text (the
 * time zone) stays when JavaScript is off.
 */
const clocks = [...document.querySelectorAll<HTMLElement>('[data-local-time]')];

function render() {
  const now = new Date();
  for (const clock of clocks) {
    const { timeZone = 'America/Bogota', locale = 'en-US', template = '{time}' } = clock.dataset;
    const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone }).format(now);
    clock.textContent = template.replace('{time}', time);
  }
}

if (clocks.length > 0) {
  render();
  // Tick on the minute, then every minute after.
  window.setTimeout(() => {
    render();
    window.setInterval(render, 60_000);
  }, 60_000 - (Date.now() % 60_000));
}
