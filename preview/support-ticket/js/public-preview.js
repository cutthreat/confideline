(function () {
  'use strict';
  function localLink(href) {
    var url;
    try { url = new URL(href, location.href); } catch (e) { return href; }
    if (url.hostname !== 'confideline.com') return href;
    if (/\/admin\/support\/index$/.test(url.pathname)) return 'support-ticket-queue-final.html' + url.search;
    if (/\/admin\/support\/view$/.test(url.pathname)) return 'support-ticket-chat-final.html' + url.search;
    return href;
  }
  document.querySelectorAll('a[href]').forEach(function (link) { link.setAttribute('href', localLink(link.getAttribute('href'))); });
  document.addEventListener('submit', function (event) { event.preventDefault(); }, true);
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link) return;
    var url; try { url = new URL(link.href); } catch (e) { return; }
    if (url.hostname === 'confideline.com' || url.hostname === 'youdate.website') event.preventDefault();
  }, true);
})();
