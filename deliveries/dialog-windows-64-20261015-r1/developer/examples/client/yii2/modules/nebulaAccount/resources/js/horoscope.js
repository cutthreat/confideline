(() => {
  const root = document.querySelector('[data-nebula-horoscope]');
  if (!root || root.dataset.horoscopeBound === 'true') return;
  root.dataset.horoscopeBound = 'true';
  const emit = (name, detail) => root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
  const status = root.querySelector('[data-horoscope-status]');
  const announce = (message) => { if (status) status.textContent = message; };
  const title = root.querySelector('[data-horoscope-title]');
  const range = root.querySelector('[data-horoscope-range]');
  const date = root.querySelector('[data-horoscope-date]');
  const copy = root.querySelector('[data-horoscope-copy]');
  const zodiac = [...root.querySelectorAll('[data-horoscope-zodiac]')];
  const periods = [...root.querySelectorAll('[data-horoscope-period]')];
  const zodiacData = {
    Aries: ['Aries daily horoscope', 'Mar 21 - Apr 19', 'April 17, 2026', 'Today, Aries energy helps you act with courage and focus. Start with one clear step and let momentum build without rushing your decisions.'],
    Taurus: ['Taurus daily horoscope', 'Apr 20 - May 20', 'April 17, 2026', 'Today, Taurus, the fiery energy of the Aries moon ignites your passion and determination. Use this momentum to take charge while keeping your choices grounded.'],
    Gemini: ['Gemini daily horoscope', 'May 21 - Jun 20', 'April 17, 2026', 'Today, Gemini, curiosity opens a useful conversation. Ask one thoughtful question and listen for the detail that changes your perspective.'],
    Cancer: ['Cancer daily horoscope', 'Jun 21 - Jul 22', 'April 17, 2026', 'Today, Cancer, protect your energy while making room for honest connection. A calm boundary can make your next step feel lighter.'],
    Leo: ['Leo daily horoscope', 'Jul 23 - Aug 22', 'April 17, 2026', 'Today, Leo, your confidence is most effective when it leaves room for collaboration. Share your idea, then invite another point of view.'],
    Virgo: ['Virgo daily horoscope', 'Aug 23 - Sep 22', 'April 17, 2026', 'Today, Virgo, practical details support a bigger intention. Organize one priority and let the rest wait until you have more clarity.'],
    Libra: ['Libra daily horoscope', 'Sep 23 - Oct 22', 'April 17, 2026', 'Today, Libra, balance is a decision rather than a pause. Name what matters most and make space for a fair exchange.'],
    Scorpio: ['Scorpio daily horoscope', 'Oct 23 - Nov 21', 'April 17, 2026', 'Today, Scorpio, trust your instincts but test assumptions with a direct question. Quiet focus helps you notice what is ready to change.'],
    Sagittarius: ['Sagittarius daily horoscope', 'Nov 22 - Dec 21', 'April 17, 2026', 'Today, Sagittarius, a wider view brings optimism back into a practical plan. Choose a direction and leave room for discovery.'],
    Capricorn: ['Capricorn daily horoscope', 'Dec 22 - Jan 19', 'April 17, 2026', 'Today, Capricorn, steady effort creates more progress than a dramatic reset. Protect your time and finish the next achievable task.'],
    Aquarius: ['Aquarius daily horoscope', 'Jan 20 - Feb 18', 'April 17, 2026', 'Today, Aquarius, a new idea becomes useful when you give it a human context. Share it with someone who can help you shape it.'],
    Pisces: ['Pisces daily horoscope', 'Feb 19 - Mar 20', 'April 17, 2026', 'Today, Pisces, intuition and compassion can work together. Keep one concrete promise to yourself while you follow the feeling.']
  };
  const periodData = {
    today: ['Today', 'April 17, 2026', 'Today is a good moment to act on one clear intention and keep your energy balanced.'],
    tomorrow: ['Tomorrow', 'April 18, 2026', 'Tomorrow favors a patient conversation. Give your plans enough space to become specific before you commit.'],
    week: ['This week', 'April 14 - 20, 2026', 'This week supports steady progress: protect your focus, ask for clarity, and make room for a helpful connection.'],
    month: ['This month', 'April 2026', 'This month is about turning insight into a repeatable habit. Small choices will have more impact than a sudden change of direction.'],
    year: ['This year', '2026', 'This year invites a longer view. Let your priorities evolve while you keep returning to the values that guide you.']
  };
  let selectedZodiac = 'Taurus';
  let selectedPeriod = 'today';
  const renderContent = () => {
    const data = zodiacData[selectedZodiac] || zodiacData.Taurus;
    const currentPeriod = periodData[selectedPeriod] || periodData.today;
    if (title) title.textContent = data[0];
    if (range) range.textContent = data[1];
    if (date) date.textContent = selectedPeriod === 'today' ? data[2] : currentPeriod[1];
    if (copy) copy.textContent = selectedPeriod === 'today' ? data[3] : `${currentPeriod[2]} ${selectedZodiac} energy makes this a useful time to move with intention.`;
  };
  const chooseZodiac = (item) => {
    selectedZodiac = item.dataset.horoscopeZodiac || 'Taurus';
    zodiac.forEach((candidate) => { const selected = candidate === item; candidate.setAttribute('aria-pressed', String(selected)); candidate.tabIndex = selected ? 0 : -1; candidate.classList.toggle('is-selected', selected); });
    renderContent();
    announce(`${selectedZodiac} selected. This preview stays local until the horoscope host confirms the reading.`);
    emit('nebula:horoscope-zodiac-intent', { zodiac: selectedZodiac, backendRequired: true, contentRecomputed: false, staticProjection: true });
  };
  const choosePeriod = (button) => {
    selectedPeriod = button.dataset.horoscopePeriod || 'today';
    periods.forEach((candidate) => { const selected = candidate === button; candidate.setAttribute('aria-selected', String(selected)); candidate.classList.toggle('is-selected', selected); });
    renderContent();
    const label = periodData[selectedPeriod]?.[0] || 'Today';
    announce(`${label} selected for ${selectedZodiac}. This preview stays local until the horoscope host supplies the period reading.`);
    emit('nebula:horoscope-period-intent', { period: selectedPeriod, zodiac: selectedZodiac, contentRecomputed: false, staticProjection: true });
  };
  const moveFocus = (items, item, key, columns) => {
    const current = items.indexOf(item); if (current < 0 || !items.length) return;
    let next = current;
    if (key === 'ArrowRight') next = (current + 1) % items.length;
    if (key === 'ArrowLeft') next = (current - 1 + items.length) % items.length;
    if (key === 'ArrowDown') next = (current + columns) % items.length;
    if (key === 'ArrowUp') next = (current - columns + items.length) % items.length;
    if (key === 'Home') next = 0; if (key === 'End') next = items.length - 1;
    items.forEach((candidate, index) => { candidate.tabIndex = index === next ? 0 : -1; }); items[next].focus();
  };
  const zodiacColumns = () => window.matchMedia('(max-width: 400px)').matches ? 3 : 6;
  zodiac.forEach((item) => {
    item.addEventListener('click', () => chooseZodiac(item));
    item.addEventListener('keydown', (event) => { if (['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(event.key)) { event.preventDefault(); moveFocus(zodiac, item, event.key, zodiacColumns()); } if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); chooseZodiac(item); } });
  });
  periods.forEach((item, index) => {
    item.tabIndex = index === 0 ? 0 : -1;
    item.addEventListener('click', () => choosePeriod(item));
    item.addEventListener('keydown', (event) => { if (['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) { event.preventDefault(); moveFocus(periods, item, event.key, 1); } if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choosePeriod(item); } });
  });
  const focusHeading = root.querySelector('[data-focus-heading]');
  root.querySelectorAll('[data-horoscope-focus]').forEach((link) => link.addEventListener('click', () => { const focus = link.dataset.horoscopeFocus || 'career'; if (focusHeading) focusHeading.textContent = focus.charAt(0).toUpperCase() + focus.slice(1); announce(`${focus} psychic search prepared. The psychics catalogue will open with a host-ranked list.`); emit('nebula:horoscope-focus-intent', { focus, backendRequired: true, route: link.getAttribute('href'), staticProjection: true, consultationCreated: false }); }));
  root.querySelectorAll('[data-horoscope-start]').forEach((link) => link.addEventListener('click', () => { announce('Free consultation request prepared. The chat host will decide the next step.'); emit('nebula:horoscope-start-consultation-intent', { backendRequired: true, route: link.getAttribute('href'), sessionCreated: false, paymentStarted: false, staticProjection: true }); }));
  root.querySelector('[data-horoscope-find-psychic]')?.addEventListener('click', (event) => { announce('Psychic search prepared. The catalogue will open without creating a consultation.'); emit('nebula:horoscope-find-psychic-intent', { backendRequired: true, route: event.currentTarget.getAttribute('href'), consultationCreated: false, staticProjection: true }); });

  const dialog = root.querySelector('[data-horoscope-advisor-dialog]');
  const dialogPanel = dialog?.querySelector('[role="dialog"]');
  const advisorInput = dialog?.querySelector('[data-horoscope-advisor-input]');
  const feedback = dialog?.querySelector('[data-horoscope-advisor-feedback]');
  let dialogOpener = null;
  const advisorBackground = dialog ? [...root.children].filter((node) => node !== dialog) : [];
  const advisorBackgroundState = new Map();
  const setAdvisorBackground = (inert) => {
    advisorBackground.forEach((node) => {
      if (inert) {
        advisorBackgroundState.set(node, { inert: node.inert, ariaHidden: node.getAttribute('aria-hidden') });
        node.inert = true;
        node.setAttribute('aria-hidden', 'true');
      } else {
        const previous = advisorBackgroundState.get(node);
        node.inert = Boolean(previous?.inert);
        if (previous?.ariaHidden === null || previous?.ariaHidden === undefined) node.removeAttribute('aria-hidden');
        else node.setAttribute('aria-hidden', previous.ariaHidden);
      }
    });
    if (!inert) advisorBackgroundState.clear();
  };
  const closeAdvisor = () => {
    if (!dialog || dialog.hidden) return;
    dialog.hidden = true;
    setAdvisorBackground(false);
    dialogOpener?.focus();
  };
  const openAdvisor = (opener) => {
    if (!dialog) return;
    dialogOpener = opener;
    setAdvisorBackground(true);
    dialog.hidden = false;
    feedback.textContent = '';
    advisorInput?.focus();
  };
  root.querySelectorAll('[data-horoscope-action="ask-advisor"]').forEach((button) => button.addEventListener('click', () => openAdvisor(button)));
  dialog?.querySelectorAll('[data-horoscope-advisor-close]').forEach((node) => node.addEventListener('click', closeAdvisor));
  dialog?.querySelector('[data-horoscope-advisor-submit]')?.addEventListener('click', () => { const question = advisorInput?.value.trim() || ''; if (!question) { feedback.textContent = 'Add a question before preparing the request.'; advisorInput?.focus(); return; } feedback.textContent = 'Request prepared locally. The advisor host must confirm availability; no consultation was created.'; announce('Advisor request prepared for the host. No consultation was created in this preview.'); emit('nebula:horoscope-advisor-required', { question, backendRequired: true, staticProjection: true, consultationCreated: false, noMutation: true }); });
  dialog?.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); closeAdvisor(); return; } if (event.key !== 'Tab' || !dialogPanel) return; const focusable = [...dialogPanel.querySelectorAll('button,textarea')].filter((node) => !node.disabled); const first = focusable[0]; const last = focusable[focusable.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } });

  const bioDates = [...root.querySelectorAll('[data-bio-date]')];
  const marker = root.querySelector('.nh-today-marker');
  const insight = root.querySelector('[data-bio-insight]');
  const insightTitle = root.querySelector('[data-bio-insight-title]');
  const bioInsights = ['Physical energy is building. Keep movement gentle and consistent today.', 'Emotional energy is settling. Choose a calm conversation over a rushed answer.', 'Intellectual energy is high. Capture ideas before deciding which one to pursue.', 'Emotional energy is rising. Use confidence for connection, but keep balance and humility.', 'Physical energy is steady. A practical routine will help you keep momentum.', 'Intellectual energy is recovering. Review what you learned before adding new inputs.', 'Your three cycles are changing together. Keep the next step simple and intentional.'];
  const updateBio = (button) => { const index = Number(button.dataset.bioIndex || 0); const x = 55 + index * 87; if (marker) marker.setAttribute('d', `M${x} 30V250`); bioDates.forEach((candidate) => { const selected = candidate === button; candidate.setAttribute('aria-selected', String(selected)); candidate.tabIndex = selected ? 0 : -1; candidate.classList.toggle('is-selected', selected); }); const label = button.dataset.bioDate || '04/17'; if (insightTitle) insightTitle.textContent = label === '04/17' ? 'Today insight' : `${label} insight`; if (insight) insight.textContent = bioInsights[index] || bioInsights[3]; announce(`Biorhythm date ${label} selected. The chart preview updated locally.`); emit('nebula:horoscope-biorhythm-intent', { date: label, backendRequired: true, chartRecomputed: false, staticProjection: true }); };
  bioDates.forEach((button) => { button.tabIndex = button.getAttribute('aria-selected') === 'true' ? 0 : -1; button.addEventListener('click', () => updateBio(button)); button.addEventListener('keydown', (event) => { if (['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) { event.preventDefault(); moveFocus(bioDates, button, event.key, 1); } if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); updateBio(button); } }); });
  root.querySelectorAll('[data-bio-series]').forEach((toggle) => toggle.addEventListener('click', () => { const series = toggle.dataset.bioSeries; const active = toggle.getAttribute('aria-pressed') === 'true'; toggle.setAttribute('aria-pressed', String(!active)); toggle.classList.toggle('is-active', !active); root.querySelector(`.nh-${series}`)?.classList.toggle('is-hidden', active); announce(`${series.charAt(0).toUpperCase() + series.slice(1)} biorhythm ${active ? 'hidden' : 'shown'}.`); }));
})();
