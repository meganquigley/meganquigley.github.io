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
  const foods = JSON.parse(document.getElementById('basket-data').textContent);
  const belt = document.getElementById('food-belt');
  const buttons = [...belt.querySelectorAll('[data-food]')];
  const runway = document.querySelector('.conveyor-scroll');
  const sticky = document.querySelector('.checkout-sticky');
  const hurdleRunway = document.querySelector('.hurdle-runway');
  const hurdleStage = document.querySelector('.hurdle-sticky');
  const hurdleCards = [...document.querySelectorAll('[data-hurdle]')];
  const hurdleAccounts = [...document.querySelectorAll('[data-account]')];
  let selected = 0, manualBelt = false;
  function selectFood(index, move = true) {
    selected = Math.max(0, Math.min(foods.length - 1, index));
    const food = foods[selected];
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === selected)));
    document.getElementById('selected-food').textContent = food.name + (food.price_cents === null ? ' · comparison only' : ' · $' + (food.price_cents / 100).toFixed(2));
    document.getElementById('carton-result').textContent = food.status;
    document.getElementById('egg-feedback').textContent = food.rule;
    document.querySelector('.scanner').dataset.result = food.wic_cents ? 'covered' : 'brown';
    document.getElementById('food-position').textContent = `${selected + 1} of ${foods.length}`;
    document.getElementById('food-prev').disabled = selected === 0;
    document.getElementById('food-next').disabled = selected === foods.length - 1;
    document.querySelectorAll('[data-receipt-food]').forEach(row => row.classList.toggle('selected', row.dataset.receiptFood === food.id));
    if (move) {
      const target = buttons[selected];
      belt.scrollTo({ left: target.offsetLeft - (belt.clientWidth - target.offsetWidth) / 2, behavior: reading || reduced.matches ? 'instant' : 'smooth' });
    }
  }
  buttons.forEach((button, i) => button.addEventListener('click', () => { manualBelt = true; document.querySelector('.scanner').setAttribute('aria-live', 'polite'); selectFood(i); }));
  document.getElementById('food-prev').addEventListener('click', () => { manualBelt = true; document.querySelector('.scanner').setAttribute('aria-live', 'polite'); selectFood(selected - 1); });
  document.getElementById('food-next').addEventListener('click', () => { manualBelt = true; document.querySelector('.scanner').setAttribute('aria-live', 'polite'); selectFood(selected + 1); });
  belt.addEventListener('keydown', event => {
    const action = { ArrowLeft: selected - 1, ArrowRight: selected + 1, Home: 0, End: foods.length - 1 }[event.key];
    if (action !== undefined) { event.preventDefault(); manualBelt = true; document.querySelector('.scanner').setAttribute('aria-live', 'polite'); selectFood(action); buttons[selected].focus({ preventScroll: true }); }
  });
  let touchStart = null;
  belt.addEventListener('touchstart', e => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
  belt.addEventListener('touchmove', e => { if (touchStart && Math.abs(e.touches[0].clientX - touchStart.x) > Math.abs(e.touches[0].clientY - touchStart.y) + 10) manualBelt = true; }, { passive: true });
  belt.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) manualBelt = true; }, { passive: true });
  belt.addEventListener('scroll', () => { document.querySelector('.conveyor').style.setProperty('--belt-shift', `${-(belt.scrollLeft % 26)}px`); }, { passive: true });
  selectFood(0, false);
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
    if (!reading && !reduced.matches && !manualBelt && innerHeight >= 720) {
      const bounds = runway.getBoundingClientRect();
      const travel = runway.offsetHeight - sticky.offsetHeight;
      const progress = Math.max(0, Math.min(1, ((innerWidth <= 600 ? 10 : 40) - bounds.top) / Math.max(1, travel)));
      belt.scrollLeft = progress * (belt.scrollWidth - belt.clientWidth);
      const center = belt.scrollLeft + belt.clientWidth / 2;
      const nearest = buttons.reduce((best, button, i) => Math.abs(button.offsetLeft + button.offsetWidth / 2 - center) < Math.abs(buttons[best].offsetLeft + buttons[best].offsetWidth / 2 - center) ? i : best, 0);
      const index = progress <= .01 ? 0 : progress >= .99 ? foods.length - 1 : nearest;
      if (index !== selected) { document.querySelector('.scanner').setAttribute('aria-live', 'off'); selectFood(index, false); }
    }
    const hurdleTravel = hurdleRunway.offsetHeight - hurdleStage.offsetHeight;
    const hurdleProgress = Math.max(0, Math.min(.999, ((innerWidth <= 600 ? 20 : 60) - hurdleRunway.getBoundingClientRect().top) / Math.max(1, hurdleTravel)));
    const hurdleIndex = Math.floor(hurdleProgress * 4);
    hurdleCards.forEach((card, i) => card.classList.toggle('active', !reading && i === hurdleIndex));
    hurdleAccounts.forEach((account, i) => account.classList.toggle('active', i === hurdleIndex));
    document.getElementById('conveyor-help').textContent = !reading && innerHeight >= 720 ? 'Scroll to move the belt. Select any grocery to explore its rule.' : 'Swipe or use the arrows. Select any grocery to explore its rule.';
    document.getElementById('chapter-position').textContent = active.dataset.chapter.padStart(2, '0');
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  modeButton.addEventListener('click', () => setReading(!reading));
  reduced.addEventListener('change', event => { if (event.matches) setReading(true); });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  setReading(reading);
})();
