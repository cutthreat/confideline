(function () {
  const syncClientTitles = () => {
    const useMobileTitle = window.innerWidth <= 576;
    document.querySelectorAll('.apn-clients__title[data-mobile-title]').forEach((node) => {
      node.textContent = useMobileTitle ? node.dataset.mobileTitle : node.dataset.desktopTitle;
    });
    document.querySelectorAll('.apn-reasons__title[data-mobile-title]').forEach((node) => {
      node.textContent = useMobileTitle ? node.dataset.mobileTitle : node.dataset.desktopTitle;
    });
  };
  const mobileAnswerCards = {
    3: {
      title: 'Convenience of Psychic Phone Reading and Online Psychic Readings',
      preview: 'Nowadays, psychic services have also taken a leap from traditional readings to more convenient phone readings, online consultations, and even a mobile app...'
    },
    4: {
      title: 'How Do Psychic Readings by Phone Work?',
      preview: 'During a psychic reading, the practitioner may use a variety of tools. They need it to access the spiritual energy and provide guidance. Some popular tools include:'
    },
    5: {
      title: 'Affordability of Psychic Phone Readings',
      preview: 'The flexibility in the price range of our psychic phone readings accommodates every budget. Everyone can call for our spiritual guidance. Nebula has made it its mission to ensure that quality...'
    }
  };
  const syncAnswerCards = () => {
    const items = Array.from(document.querySelectorAll('.apn-answer-stack > details'));
    if (items.length < 6) return;
    // Figma keeps this variant in the tree, but its parent frame is hidden
    // on the approved breakpoints. Do not render hidden design variants.
    items[1].hidden = true;
    items[1].style.display = 'none';
    const usePhoneSeoSet = window.innerWidth <= 576;
    items.slice(2).forEach((item, index) => {
      const itemIndex = index + 2;
      const title = item.querySelector('.apn-answer-title');
      const preview = item.querySelector('.apn-answer-preview');
      if (!title) return;
      if (!item.dataset.desktopTitle) {
        item.dataset.desktopTitle = title.textContent.trim();
        if (preview) item.dataset.desktopPreview = preview.textContent.trim();
      }
      const mobile = mobileAnswerCards[itemIndex];
      if (usePhoneSeoSet && mobile) {
        title.textContent = mobile.title;
        if (preview) preview.textContent = mobile.preview;
      } else {
        title.textContent = item.dataset.desktopTitle;
        if (preview) preview.textContent = item.dataset.desktopPreview || '';
      }
    });
  };
  const syncAccordionItemState = (item) => {
    item.classList.toggle('apn-answer-item--open', item.open && item.classList.contains('apn-answer-item'));
    const summary = item.querySelector('summary');
    if (summary) {
      summary.setAttribute('aria-expanded', item.open ? 'true' : 'false');
    }
  };
  const bindAccordions = () => {
    document.querySelectorAll('[data-accordion-root]').forEach((root) => {
      root.querySelectorAll('details').forEach((item) => {
        syncAccordionItemState(item);
        if (item.dataset.accordionBound === 'true') return;
        item.dataset.accordionBound = 'true';
        item.addEventListener('toggle', () => {
          syncAccordionItemState(item);
          if (!item.open) return;
          root.querySelectorAll('details').forEach((other) => {
            if (other !== item) {
              other.open = false;
              syncAccordionItemState(other);
            }
          });
        });
      });
    });
  };
  const syncExpertFactColors = () => {
    document.querySelectorAll('.apn-love-card__fact').forEach((node) => {
      if (node.querySelector('.apn-love-card__fact-accent')) return;
      const text = node.textContent.trim();
      const match = text.match(/^(\d+\s+years|\d+)\s+(.+)$/);
      if (!match) return;
      node.replaceChildren();
      const textWrap = document.createElement('span');
      textWrap.className = 'apn-love-card__fact-text';
      const accent = document.createElement('span');
      accent.className = 'apn-love-card__fact-accent';
      accent.textContent = match[1];
      const muted = document.createElement('span');
      muted.className = 'apn-love-card__fact-muted';
      muted.textContent = match[2];
      const spacer = document.createElement('span');
      spacer.className = 'apn-love-card__fact-space';
      spacer.textContent = ' ';
      textWrap.append(accent, spacer, muted);
      node.append(textWrap);
    });
  };
  const syncMobileLoveCardOrder = () => {
    const shouldUseFigmaMobileOrder = window.matchMedia('(max-width:992px)').matches;
    const cards = document.querySelectorAll('.apn-love-host .apn-love__grid > .apn-love-card');
    if (cards.length < 2) return;
    const source = cards[0];
    cards.forEach((card) => {
      if (!card.dataset.apnOriginalHtml) card.dataset.apnOriginalHtml = card.innerHTML;
      if (shouldUseFigmaMobileOrder) {
        card.innerHTML = source.dataset.apnOriginalHtml || source.innerHTML;
      } else {
        card.innerHTML = card.dataset.apnOriginalHtml;
      }
    });
    syncExpertFactColors();
  };
  const syncResponsiveCatalogCards = () => {
    const shouldUseFigmaTabletSet = window.matchMedia('(max-width:992px)').matches;
    const cards = document.querySelectorAll('.apn-neuro-catalog__grid > .apn-love-card');
    if (cards.length < 2) return;
    const source = cards[0];
    cards.forEach((card) => {
      if (!card.dataset.apnOriginalHtml) card.dataset.apnOriginalHtml = card.innerHTML;
      if (shouldUseFigmaTabletSet) {
        card.innerHTML = source.dataset.apnOriginalHtml || source.innerHTML;
      } else {
        card.innerHTML = card.dataset.apnOriginalHtml;
      }
    });
    syncExpertFactColors();
  };
  const syncResponsiveOnlineCards = () => {
    const shouldUseFigmaTabletSet = window.matchMedia('(max-width:992px)').matches;
    const cards = document.querySelectorAll('.apn-online-host .apn-online__grid > .apn-love-card');
    if (cards.length < 2) return;
    const source = cards[0];
    cards.forEach((card) => {
      if (!card.dataset.apnOriginalHtml) card.dataset.apnOriginalHtml = card.innerHTML;
      if (shouldUseFigmaTabletSet) {
        card.innerHTML = source.dataset.apnOriginalHtml || source.innerHTML;
      } else {
        card.innerHTML = card.dataset.apnOriginalHtml;
      }
    });
    syncExpertFactColors();
  };
  window.addEventListener('DOMContentLoaded', bindAccordions);
  window.addEventListener('DOMContentLoaded', syncClientTitles);
  window.addEventListener('DOMContentLoaded', syncAnswerCards);
  window.addEventListener('DOMContentLoaded', syncExpertFactColors);
  window.addEventListener('DOMContentLoaded', syncMobileLoveCardOrder);
  window.addEventListener('DOMContentLoaded', syncResponsiveCatalogCards);
  window.addEventListener('DOMContentLoaded', syncResponsiveOnlineCards);
  window.addEventListener('resize', syncClientTitles);
  window.addEventListener('resize', syncAnswerCards);
  window.addEventListener('resize', syncMobileLoveCardOrder);
  window.addEventListener('resize', syncResponsiveCatalogCards);
  window.addEventListener('resize', syncResponsiveOnlineCards);
  bindAccordions();
  syncClientTitles();
  syncAnswerCards();
  syncExpertFactColors();
  syncMobileLoveCardOrder();
  syncResponsiveCatalogCards();
  syncResponsiveOnlineCards();
})();
