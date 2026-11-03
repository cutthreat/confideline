(function (root, factory) {
  const policy = factory();
  if (typeof module === 'object' && module.exports) module.exports = policy;
  else root.CatalogPreviewPolicy = policy;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  function derive(audience, flags) {
    const guest = audience === 'guest';
    return {
      onlineOnly: guest && flags.hideDirectory !== true && flags.onlineOnly === true,
      hideDirectory: guest && flags.hideDirectory === true,
      hideProfiles: guest && flags.hideProfiles === true,
      hideFields: guest && flags.hideFields === true
    };
  }
  function visibleProfiles(profiles, policy) {
    if (policy.hideDirectory) return [];
    if (!policy.onlineOnly) return profiles.slice();
    return profiles.filter(profile => profile.isExpert === true && profile.status === 'online');
  }
  function fromQuery(audience, search, savedOnline, savedHidden) {
    const query = new URLSearchParams(search);
    const explicit = query.get('preview') === '1';
    return derive(audience, {
      onlineOnly: explicit ? query.get('onlineOnly') === '1' : savedOnline === true,
      hideDirectory: explicit ? query.get('hideDirectory') === '1' : savedHidden === true,
      hideProfiles: explicit && query.get('hideProfiles') === '1',
      hideFields: explicit && query.get('hideFields') === '1'
    });
  }
  return { derive, visibleProfiles, fromQuery };
});
