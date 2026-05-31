(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PartnerInteractionSimulator = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const periods = ['today', '7d', '30d', 'all'];
  const directions = ['all', 'client_to_expert', 'expert_to_client'];
  const eventTypes = [
    'profileViews',
    'favorites',
    'chatStarts',
    'clientMessages',
    'expertReplies',
    'paidConsultations',
    'repeatRequests',
    'blocks',
    'reports'
  ];

  function cloneFixture(fixture) {
    return JSON.parse(JSON.stringify(fixture));
  }

  function randomFilters(fixture, rng) {
    const partnerIds = unique(fixture.assignments.map(item => item.partnerId));
    return {
      partnerId: pick(partnerIds, rng),
      period: pick(periods, rng),
      direction: pick(directions, rng)
    };
  }

  function generateEvent(fixture, filters, rng) {
    const partnerId = Number(filters.partnerId || fixture.meta.defaultPartnerId);
    const expertId = Number(filters.expertId || 0);
    const assignments = fixture.assignments.filter(item => item.partnerId === partnerId);
    const expertIds = expertId > 0 ? [expertId] : assignments.map(item => item.expertId);
    const clients = fixture.users.filter(user => user.role === 'client');
    const experts = fixture.users.filter(user => expertIds.includes(user.id));
    const expert = pick(experts.length ? experts : fixture.users.filter(user => user.role === 'expert'), rng);
    const client = pick(clients, rng);
    const type = pick(eventTypes, rng);
    const clientOnly = ['chatStarts', 'clientMessages', 'paidConsultations', 'favorites', 'repeatRequests', 'reports'].includes(type);
    const expertOnly = ['expertReplies'].includes(type);
    const expertActs = expertOnly || (!clientOnly && ((filters.direction === 'expert_to_client') || (filters.direction === 'all' && rng() > 0.52)));
    const actor = expertActs ? expert : client;
    const target = expertActs ? client : expert;
    const count = ['clientMessages', 'expertReplies'].includes(type) ? randomInt(1, 8, rng) : 1;
    const createdAt = randomDateForPeriod(fixture.meta.now, filters.period || fixture.meta.defaultPeriod, rng);

    return {
      type,
      actorId: actor.id,
      targetId: target.id,
      createdAt,
      count,
      simulated: true
    };
  }

  function applyEvents(fixture, events) {
    fixture.events.push(...events);
    return fixture;
  }

  function buildPayload(fixture, filters, result, trigger, generatedEvents) {
    const endpoint = filters.audience === 'expert'
      ? '/expert/interaction/index'
      : filters.audience === 'partner'
        ? '/admin/partner-interaction/my'
        : '/admin/partner-interaction/index';

    return {
      endpoint,
      method: 'GET',
      mode: 'offline-mock',
      trigger,
      query: {
        partnerId: Number(filters.partnerId),
        expertId: Number(filters.expertId || 0),
        period: filters.period,
        direction: filters.direction,
        query: filters.query || '',
        minActions: Number(filters.minActions || 0),
        sort: filters.sort || 'total_desc',
        page: Number(filters.page || 1),
        pageSize: Number(filters.pageSize || 50),
        expertIds: result.experts.map(expert => expert.id).join(',')
      },
      responseShape: {
        rows: result.rows.length,
        totalRows: result.pagination.totalRows,
        summary: result.summary,
        riskSummary: result.riskSummary,
        warnings: result.warnings.length
      },
      generatedEvents: generatedEvents.slice(-5)
    };
  }

  function createRng(seed) {
    let value = Number(seed || Date.now()) % 2147483647;
    if (value <= 0) value += 2147483646;
    return function rng() {
      value = value * 16807 % 2147483647;
      return (value - 1) / 2147483646;
    };
  }

  function pick(items, rng) {
    return items[Math.floor(rng() * items.length)];
  }

  function randomInt(min, max, rng) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  function randomDateForPeriod(nowIso, period, rng) {
    const now = new Date(nowIso);
    let maxDays = 30;
    if (period === 'today') maxDays = 0;
    if (period === '7d') maxDays = 7;
    if (period === 'all') maxDays = 45;
    const dayOffset = maxDays === 0 ? 0 : randomInt(0, maxDays, rng);
    const minuteOffset = randomInt(1, 720, rng);
    const date = new Date(now.getTime() - (dayOffset * 24 * 60 + minuteOffset) * 60 * 1000);
    return date.toISOString();
  }

  function unique(items) {
    return Array.from(new Set(items));
  }

  return {
    cloneFixture,
    createRng,
    randomFilters,
    generateEvent,
    applyEvents,
    buildPayload
  };
});
