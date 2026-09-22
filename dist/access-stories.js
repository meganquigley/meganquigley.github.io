(() => {
  const body = document.body;
  const button = document.querySelector('[data-reading-toggle]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.querySelector('.story-progress span');
  const chapters = [...document.querySelectorAll('.story-chapter')];
  const links = [...document.querySelectorAll('.chapter-nav a')];
  function mode() {
    body.classList.toggle('motion-ready', !reduce.matches && !body.classList.contains('reading'));
    button.textContent = body.classList.contains('reading') ? 'Use scroll view' : 'Read without animation';
    button.setAttribute('aria-pressed', String(body.classList.contains('reading')));
  }
  button.hidden = false;
  button.addEventListener('click', () => { body.classList.toggle('reading'); mode(); });
  reduce.addEventListener('change', mode);
  mode();
  // Expanded source tables and short windows must never trap a tall sticky figure.
  const figures = [...document.querySelectorAll('.story-figure')];
  function fitFigures() {
    figures.forEach(el => el.classList.toggle('figure-tall', el.offsetHeight > innerHeight - 125));
  }
  if ('ResizeObserver' in window) {
    const sizeObserver = new ResizeObserver(fitFigures);
    figures.forEach(el => sizeObserver.observe(el));
  }
  addEventListener('resize', fitFigures);
  fitFigures();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('seen');
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.story-figure').forEach(el => observer.observe(el));
    const stepObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const chapter = entry.target.closest('.story-chapter');
        chapter.querySelectorAll('.story-step').forEach(el => el.classList.toggle('active', el === entry.target));
        chapter.dataset.step = entry.target.dataset.step;
      });
    }, { rootMargin: '-20% 0px -35% 0px', threshold: 0.1 });
    document.querySelectorAll('.story-step').forEach(el => stepObserver.observe(el));
  }
  let scheduled = false;
  function paint() {
    scheduled = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? Math.min(100, scrollY / max * 100) : 0}%`;
    let active = chapters[0];
    for (const chapter of chapters) if (chapter.getBoundingClientRect().top < innerHeight * .45) active = chapter;
    links.forEach(link => {
      if (link.hash === '#' + active.id) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(paint); } }, { passive: true });
  addEventListener('resize', paint);
  paint();
})();
