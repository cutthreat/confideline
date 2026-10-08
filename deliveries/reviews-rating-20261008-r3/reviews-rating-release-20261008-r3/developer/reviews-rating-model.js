(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ReviewRatingModel = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function validateRating(input) {
    if (!['auto', 'manual'].includes(input.mode)) throw new Error('mode');
    if (input.mode === 'auto') return { mode: 'auto', rating: null, votes: null };
    const count = String(input.votes).trim();
    if (!/^\d+$/.test(count) || !Number.isSafeInteger(Number(count))) throw new Error('votes');
    const votes = Number(count);
    if (votes === 0) return { mode: 'manual', rating: null, votes: 0 };
    const raw = String(input.rating).trim().replace(',', '.');
    if (!/^[1-5](?:\.\d)?$/.test(raw) || Number(raw) > 5) throw new Error('rating');
    return { mode: 'manual', rating: Number(raw), votes: votes };
  }
  function aggregate(reviews, expertId, override) {
    const published = reviews.filter(function (r) { return r.expertId === expertId && r.status === 'published'; });
    const autoRating = published.length ? published.reduce(function (sum, r) { return sum + r.stars; }, 0) / published.length : null;
    const manual = override && override.mode === 'manual';
    return {
      mode: manual ? 'manual' : 'auto',
      rating: manual ? override.rating : autoRating,
      votes: manual ? override.votes : published.length,
      publishedCount: published.length,
      autoRating: autoRating
    };
  }
  function validateReview(input, profiles) {
    const profile = profiles.find(function (p) { return p.id === input.authorProfileId; });
    if (!profile || profile.active === false) throw new Error('author');
    if (!/^[1-5]$/.test(String(input.stars))) throw new Error('stars');
    const text = String(input.text || '').trim();
    if (!text || text.length > 1000) throw new Error('text');
    return { authorProfileId: profile.id, author: profile.name, stars: Number(input.stars), text: text, source: 'admin', consultation: null };
  }
  function validateReason(value) {
    const reason = String(value || '').trim();
    if (!reason || reason.length > 500) throw new Error('reason');
    return reason;
  }
  return { validateRating: validateRating, aggregate: aggregate, validateReview: validateReview, validateReason: validateReason };
});
