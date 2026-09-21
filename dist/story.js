const grid = document.querySelector('#tax-dots');
function paintRate(rate) {
  grid.replaceChildren(...Array.from({length:100}, (_, i) => {
    const dot = document.createElement('span');
    dot.className = i < rate ? 'claimed' : '';
    return dot;
  }));
}
paintRate(98);
document.querySelectorAll('[data-rate]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-rate]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  document.querySelector('#tax-rate').textContent = button.dataset.rate;
  document.querySelector('#tax-label').textContent = button.dataset.label;
  paintRate(Number(button.dataset.rate));
}));
document.querySelectorAll('[data-process]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-process]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  const after = button.dataset.process === 'after';
  document.querySelector('#process-flow').innerHTML = after
    ? '<div class="process-step repaired">One combined PSLF / TEPSLF form<span>Introduced November 2020</span></div><span class="flow-arrow">↓</span><div class="process-step">Consideration for forgiveness<span>Program eligibility still applies.</span></div>'
    : '<div class="process-step">Request expanded forgiveness</div><span class="flow-arrow">↓</span><div class="process-step process-trap">Separate PSLF application required<span>Missing it could stop the request.</span></div><span class="flow-arrow">↓</span><div class="process-step">Consideration for TEPSLF</div>';
  document.querySelector('#process-note').textContent = after ? 'A combined form removed the need for that separate application. It did not remove eligibility requirements.' : 'The extra application was a documented obstacle in the original process.';
}));
