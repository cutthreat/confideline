/* Public profile identities observed at confideline.com/ru/browse on 2026-10-23.
   Only this local preview remaps fixture identities. Events, roles and assignments are synthetic. */
(function () {
  'use strict';
  const profiles = [
    { fixtureId:184, id:184, name:'Orion Esposito', username:'OrionEsposito', image:'assets/demo/portraits/thumb_CLUre-mRxp6ZnPZmK2odQwqPmK3ktQI8.webp' },
    { fixtureId:185, id:183, name:'Orvian Mozart', username:'OrvianMozart', image:'assets/demo/portraits/thumb_tW1zYowqB9KFKkCiGLVKCHzlOW9nUbd5.webp' },
    { fixtureId:186, id:176, name:'Lunaret Sorn Sigurdsson', username:'LunaretSornSigurdsson', image:'assets/demo/portraits/thumb_QqEQ9OeOuu8K6ooN3UzkteXQ-hNkFUqZ.webp' },
    { fixtureId:1001, id:189, name:'QA Client 20260524-103509', username:'QAClient20260524103509', image:null }
  ];
  const data = window.PartnerInteractionExampleData;
  const identities = new Map(profiles.map(profile => [profile.fixtureId, profile]));
  const userKeys = new Set(['clientId','expertId','actorId','targetId','userId']);
  function remap(value) {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (userKeys.has(key) && identities.has(child)) value[key] = identities.get(child).id;
      else if (child && typeof child === 'object') remap(child);
    }
  }
  remap(data);
  data.users.forEach(user => {
    const profile = identities.get(user.id);
    if (profile) Object.assign(user, { id:profile.id, name:profile.name, username:profile.username });
  });
  window.ConfidelinePreviewProfiles = profiles;
})();
