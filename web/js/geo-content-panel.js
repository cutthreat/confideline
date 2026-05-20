(() => {
  const cards = [...document.querySelectorAll('[data-card]')];
  const search = document.getElementById('queueSearch');
  const visibleCount = document.getElementById('visibleCount');
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  let activeFilter = 'all';

  function matchesFilter(card) {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'problem') return card.dataset.status === 'problem';
    if (activeFilter === 'photo-missing') return card.dataset.photo === 'missing';
    if (activeFilter === 'upload-unknown') return card.dataset.upload === 'unknown';
    if (activeFilter === 'country' || activeFilter === 'city') return card.dataset.type === activeFilter;
    return true;
  }

  function applyFilters() {
    const query = (search?.value || '').trim().toLowerCase();
    let count = 0;
    cards.forEach((card) => {
      const haystack = card.dataset.search || '';
      const visible = matchesFilter(card) && (!query || haystack.includes(query));
      card.hidden = !visible;
      if (visible) count += 1;
    });
    if (visibleCount) visibleCount.textContent = String(count);
  }

  search?.addEventListener('input', applyFilters);
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      applyFilters();
    });
  });

  applyFilters();
})();
