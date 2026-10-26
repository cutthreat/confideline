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
    const publishedSum = published.reduce(function (sum, r) { return sum + r.stars; }, 0);
    const autoRating = published.length ? publishedSum / published.length : null;
    const manual = override && override.mode === 'manual';
    const base = manual ? validateRating(override) : {rating:null,votes:0};
    const votes = base.votes + published.length;
    if (!Number.isSafeInteger(votes)) throw new Error('votes');
    // Rebuild from the base and current records; never feed a rounded total back in.
    const sum = publishedSum + (base.votes ? base.rating * base.votes : 0);
    return {
      mode: manual ? 'manual' : 'auto',
      rating: votes ? sum / votes : null,
      votes: votes,
      publishedCount: published.length,
      textCount: published.filter(function (r) { return String(r.text || '').trim().length > 0; }).length,
      autoRating: autoRating,
      publishedSum: publishedSum,
      baseRating: base.rating,
      baseVotes: base.votes
    };
  }
  function validateReview(input, profiles, maxTextLength) {
    const profile = profiles.find(function (p) { return p.id === input.authorProfileId; });
    if (!profile || profile.active === false) throw new Error('author');
    if (!/^[1-5]$/.test(String(input.stars))) throw new Error('stars');
    const text = String(input.text || '').trim();
    if (text.length > (maxTextLength === undefined ? 1000 : maxTextLength)) throw new Error('text');
    if (input.anonymous !== undefined && typeof input.anonymous !== 'boolean') throw new Error('anonymous');
    return { authorProfileId: profile.id, author: profile.name, stars: Number(input.stars), text: text, anonymous: input.anonymous === true, source: 'admin', consultation: null };
  }
  function validateReason(value) {
    const reason = String(value || '').trim();
    if (!reason || reason.length > 500) throw new Error('reason');
    return reason;
  }
  return { validateRating: validateRating, aggregate: aggregate, validateReview: validateReview, validateReason: validateReason };
});
