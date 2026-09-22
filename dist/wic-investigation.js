(() => {
  'use strict';
  const body = document.body;
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const modeButton = document.getElementById('reading-mode');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let reading = reduced.matches || new URLSearchParams(location.search).get('motion') === 'off';
  body.classList.add('js');
  function setReading(value) {
    reading = value;
    body.classList.toggle('reading', reading);
    modeButton.setAttribute('aria-pressed', String(reading));
    modeButton.textContent = reading ? 'Use scrolling effects' : 'Read without effects';
    update();
  }
  const results = {
    white: ['Can qualify', 'Large white eggs, in an approved package, with enough egg benefit available. Qualifying cage-free eggs are allowed.'],
    brown: ['Not authorized', 'Brown eggs are excluded under California’s April 2026 rules. The state cites cost containment—not a difference in nutrition.']
  };
  document.querySelectorAll('[data-carton]').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.dataset.carton;
      document.querySelectorAll('[data-carton]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.getElementById('carton-result').textContent = results[type][0];
      document.getElementById('egg-feedback').textContent = results[type][1];
      document.querySelector('.scanner').dataset.result = type;
      document.querySelector('.conveyor').style.setProperty('--belt-shift', type === 'brown' ? '-26px' : '0px');
    });
  });
  let queued = false;
  function update() {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    document.querySelector('.reading-progress span').style.width = `${max > 0 ? Math.min(100, Math.max(0, scrollY / max * 100)) : 0}%`;
    let active = chapters[0];
    chapters.forEach(chapter => {
      const bounds = chapter.getBoundingClientRect();
      if (bounds.top < innerHeight * .45) active = chapter;
      if (bounds.top < innerHeight * .85 && bounds.bottom > 0) chapter.classList.add('in-view');
      if (!reading) {
        const steps = [...chapter.querySelectorAll('.step')];
        let phase = 0;
        steps.forEach((step, index) => { if (step.getBoundingClientRect().top < innerHeight * .55) phase = index; });
        chapter.dataset.phase = String(phase);
      } else { delete chapter.dataset.phase; }
    });
    document.getElementById('chapter-position').textContent = active.dataset.chapter.padStart(2, '0');
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  modeButton.addEventListener('click', () => setReading(!reading));
  reduced.addEventListener('change', event => { if (event.matches) setReading(true); });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  setReading(reading);
})();
