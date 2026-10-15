(() => {
  // Static account projections do not have a PHP partial, so they mount the
  // same notification contract at the fixture boundary. Production Yii2
  // pages render this markup server-side through account-topbar.php.
  document.querySelectorAll('header.nb-topbar').forEach((header) => {
    const summary = header.querySelector('.nb-account-summary');
    if (!summary || summary.querySelector('[data-notifications-link]')) return;
    header.setAttribute('data-account-shell', '');
    header.setAttribute('data-notification-shell', '');

    const notifications = document.createElement('a');
    notifications.className = 'nb-notifications-pill';
    notifications.href = 'notifications.html';
    notifications.setAttribute('data-notifications-link', '');
    notifications.dataset.notificationIndicator = 'count';
    notifications.dataset.notificationUnreadSource = 'preview-fixture';
    notifications.setAttribute('aria-label', 'Notifications, 2 unread notifications');

    const icon = document.createElement('span');
    icon.className = 'nb-notifications-pill__icon';
    icon.setAttribute('aria-hidden', 'true');
    const image = document.createElement('img');
    image.src = 'yii2/modules/nebulaAccount/resources/images/chatroom-notify/notify-bell.svg';
    image.alt = '';
    icon.append(image);

    const badge = document.createElement('b');
    badge.className = 'nb-notifications-pill__badge';
    badge.dataset.notificationUnreadCount = '';
    badge.dataset.topbarNotificationUnreadCount = '';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = '2';

    notifications.append(icon, badge);
    summary.insertBefore(notifications, summary.querySelector('.nb-credit-pill'));
  });

  if (new URLSearchParams(window.location.search).get('fixture') !== '1') return;
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'yii2/modules/nebulaAccount/resources/css/fixture-host.css';
  document.head.append(style);
  const script = document.createElement('script');
  script.src = 'yii2/modules/nebulaAccount/resources/js/fixture-host.js';
  script.async = false;
  document.body.append(script);
})();
