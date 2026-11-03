(function () {
  'use strict';
  const root = document.querySelector('.cl-catalog');
  if (!root) return;
  let savedOnline = false;
  try { savedOnline = JSON.parse(localStorage.getItem('catalog-settings-preview-r3'))?.values?.guestOnlineOnly === true; } catch {}
  const policy = window.CatalogPreviewPolicy.fromQuery(root.dataset.audience, location.search, savedOnline);
  window.CatalogDemoAccess = policy;
  window.CatalogFilterFixtures = window.CatalogPreviewPolicy.visibleProfiles(window.CatalogFilterFixtures, policy);
  if (!policy.hideDirectory) return;
  const content = root.querySelector(':scope > .container');
  content.classList.add('cl-preview-content');
  content.hidden = true;
  const en = new URLSearchParams(location.search).get('lang') === 'en';
  const gate = document.createElement('section');
  gate.className = 'container cl-preview-gate';
  const heading = document.createElement('h1');
  heading.textContent = en ? 'Sign in to view the directory' : 'Войдите, чтобы открыть каталог';
  const link = document.createElement('a');
  link.className = 'btn btn-primary';
  link.href = 'catalog-filter-auth.html' + (en ? '?lang=en' : '?lang=ru');
  link.textContent = en ? 'Sign in' : 'Войти';
  gate.append(heading, link);
  root.append(gate);
})();
