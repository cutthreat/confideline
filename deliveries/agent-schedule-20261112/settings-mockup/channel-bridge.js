// Local preview bridge: reads only the two settings belonging to these mockups.
const scenario = new URLSearchParams(location.search).get('scenario') || '';
const suffix = /^[a-z0-9-]{1,40}$/.test(scenario) ? '-' + scenario : '';
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== window.parent || event.data?.type !== 'get-availability-channels') return;
  try {
    const admin = JSON.parse(localStorage.getItem('confideline-integrated-settings-v2-chat' + suffix)) || {};
    const user = JSON.parse(localStorage.getItem('confideline-settings-reference-v1' + suffix)) || {};
    const allowed = ['site', 'email'].filter(channel => admin[channel === 'site' ? 'availableSite' : 'availableEmail'] !== false);
    const selected = Array.isArray(user.preferredAvailability) ? user.preferredAvailability : ['site'];
    event.source.postMessage({type: 'availability-channels', requestId: event.data.requestId, allowed, selected: selected.filter(channel => allowed.includes(channel))}, event.origin);
  } catch (_) {
    event.source.postMessage({type: 'availability-channels', requestId: event.data.requestId, error: true}, event.origin);
  }
});
