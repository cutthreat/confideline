(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PartnerInteractionAnalytics = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const metricKeys = [
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

  const periodLabels = {
    today: 'Сегодня',
    '7d': '7 дней',
    '30d': '30 дней',
    all: 'Весь период'
  };

  const sortOptions = {
    total_desc: (a, b) => b.total - a.total || a.actorId - b.actorId || a.targetId - b.targetId,
    total_asc: (a, b) => a.total - b.total || a.actorId - b.actorId || a.targetId - b.targetId,
    unanswered_first: (a, b) => {
      const aUnanswered = a.directionKey === 'client_to_expert' && a.messages > 0 ? 1 : 0;
      const bUnanswered = b.directionKey === 'client_to_expert' && b.messages > 0 ? 1 : 0;
      return bUnanswered - aUnanswered || b.total - a.total;
    }
  };

  function build(fixture, filters) {
    const normalized = normalizeFilters(fixture, filters);
    const users = new Map(fixture.users.map(user => [user.id, user]));
    const scopedExpertIds = getScopedExpertIds(fixture, normalized);
    const expertIds = normalized.expertId > 0 ? scopedExpertIds.filter(id => id === normalized.expertId) : scopedExpertIds;
    const expertSet = new Set(expertIds);
    const range = getRange(fixture.meta.now, normalized.period);
    const eventRows = filterEvents(fixture.events, expertSet, users, range);
    const pairs = new Map();

    eventRows.forEach(event => {
      if (event.type === 'messages') {
        const metric = expertSet.has(event.actorId) ? 'expertReplies' : 'clientMessages';
        addMetric(pairs, expertSet, users, event.actorId, event.targetId, metric, event.count || 1);
        return;
      }

      addMetric(pairs, expertSet, users, event.actorId, event.targetId, event.type, event.count || 1);
    });

    let rows = Array.from(pairs.values()).map(pair => {
      const actor = users.get(pair.actorId) || fallbackUser(pair.actorId);
      const target = users.get(pair.targetId) || fallbackUser(pair.targetId);
      const direction = expertSet.has(pair.actorId) ? 'Эксперт -> клиент' : 'Клиент -> эксперт';
      return {
        ...pair,
        actor,
        target,
        direction,
        directionKey: expertSet.has(pair.actorId) ? 'expert_to_client' : 'client_to_expert',
        messages: Number(pair.clientMessages || 0) + Number(pair.expertReplies || 0),
        total: total(pair)
      };
    });

    rows = filterRows(rows, normalized);
    rows.sort(getSort(normalized.sort));

    const totalRows = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / normalized.pageSize));
    const page = Math.min(normalized.page, totalPages);
    const pageStart = (page - 1) * normalized.pageSize;
    const pageRows = rows.slice(pageStart, pageStart + normalized.pageSize);

    return {
      meta: {
        ...fixture.meta,
        partnerId: normalized.partnerId,
        expertId: normalized.expertId,
        audience: normalized.audience,
        period: normalized.period,
        periodLabel: periodLabels[normalized.period] || normalized.period,
        direction: normalized.direction,
        rangeLabel: range.label,
        assignmentSource: fixture.meta.assignmentSource,
        sort: normalized.sort,
        query: normalized.query,
        minActions: normalized.minActions
      },
      experts: expertIds.map(id => users.get(id) || fallbackUser(id)),
      columns: fixture.columns,
      rows: pageRows,
      allRows: rows,
      pagination: {
        page,
        pageSize: normalized.pageSize,
        totalRows,
        totalPages,
        from: totalRows === 0 ? 0 : pageStart + 1,
        to: Math.min(totalRows, pageStart + normalized.pageSize)
      },
      summary: {
        experts: expertIds.length,
        pairs: totalRows,
        messages: rows.reduce((sum, row) => sum + row.clientMessages + row.expertReplies, 0),
        actions: rows.reduce((sum, row) => sum + row.total, 0)
      },
      riskSummary: buildRiskSummary(rows),
      qualitySummary: buildQualitySummary(rows, expertIds),
      warnings: fixture.meta.warnings || []
    };
  }

  function buildRiskSummary(rows) {
    return {
      reports: rows.reduce((sum, row) => sum + row.reports, 0),
      blocks: rows.reduce((sum, row) => sum + row.blocks, 0),
      paidConsultations: rows.reduce((sum, row) => sum + row.paidConsultations, 0),
      highActivityPairs: rows.filter(row => row.total >= 10).length
    };
  }

  function buildQualitySummary(rows, expertIds) {
    if (!rows.length || !expertIds.length) {
      return {
        activeClients: 0,
        clientStartedDialogs: 0,
        answeredDialogs: 0,
        unansweredDialogs: 0,
        responseRate: null,
        outboundWithoutClientMessage: 0
      };
    }

    const expertSet = new Set(expertIds);
    const clients = new Set();
    const pairs = new Map();

    rows.forEach(row => {
      const actorIsExpert = expertSet.has(row.actorId);
      const expertId = actorIsExpert ? row.actorId : row.targetId;
      const clientId = actorIsExpert ? row.targetId : row.actorId;
      const key = expertId + ':' + clientId;
      clients.add(clientId);
      if (!pairs.has(key)) {
        pairs.set(key, {
          clientMessages: 0,
          expertMessages: 0
        });
      }
      const pair = pairs.get(key);
      if (actorIsExpert) {
        pair.expertMessages += row.expertReplies;
      } else {
        pair.clientMessages += row.clientMessages;
      }
    });

    let clientStartedDialogs = 0;
    let answeredDialogs = 0;
    let outboundWithoutClientMessage = 0;
    pairs.forEach(pair => {
      if (pair.clientMessages > 0) {
        clientStartedDialogs++;
        if (pair.expertMessages > 0) {
          answeredDialogs++;
        }
      } else if (pair.expertMessages > 0) {
        outboundWithoutClientMessage++;
      }
    });

    const unansweredDialogs = Math.max(0, clientStartedDialogs - answeredDialogs);
    const responseRate = clientStartedDialogs > 0
      ? Math.round(answeredDialogs / clientStartedDialogs * 1000) / 10
      : null;

    return {
      activeClients: clients.size,
      clientStartedDialogs,
      answeredDialogs,
      unansweredDialogs,
      responseRate,
      outboundWithoutClientMessage
    };
  }

  function normalizeFilters(fixture, filters) {
    const pageSize = clamp(Number(filters.pageSize || 50), 50, 500);
    return {
      audience: filters.audience || 'admin',
      partnerId: Number(typeof filters.partnerId === 'undefined' ? fixture.meta.defaultPartnerId : filters.partnerId),
      expertId: Number(filters.expertId || 0),
      period: filters.period || fixture.meta.defaultPeriod || '7d',
      direction: filters.direction || fixture.meta.defaultDirection || 'all',
      query: String(filters.query || '').trim().toLowerCase(),
      minActions: Math.max(0, Number(filters.minActions || 0)),
      sort: filters.sort || 'total_desc',
      page: Math.max(1, Number(filters.page || 1)),
      pageSize
    };
  }

  function getScopedExpertIds(fixture, normalized) {
    if (normalized.audience === 'expert' && normalized.expertId > 0) {
      return [normalized.expertId];
    }

    const assignments = normalized.partnerId > 0
      ? fixture.assignments.filter(assignment => assignment.partnerId === normalized.partnerId)
      : fixture.assignments;

    return unique(assignments.map(assignment => assignment.expertId));
  }

  function filterRows(rows, normalized) {
    let filtered = rows;

    if (normalized.direction !== 'all') {
      filtered = filtered.filter(row => row.directionKey === normalized.direction);
    }

    if (normalized.minActions > 0) {
      filtered = filtered.filter(row => row.total >= normalized.minActions);
    }

    if (normalized.query) {
      filtered = filtered.filter(row => {
        return userMatches(row.actor, normalized.query) ||
          userMatches(row.target, normalized.query) ||
          String(row.actorId).includes(normalized.query) ||
          String(row.targetId).includes(normalized.query);
      });
    }

    return filtered;
  }

  function getRange(nowIso, period) {
    const now = new Date(nowIso);
    let from = null;

    if (period === 'today') {
      from = new Date(now);
      from.setHours(0, 0, 0, 0);
    } else if (period === '7d') {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '30d') {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
      from,
      to: now,
      label: from ? from.toISOString() + ' - ' + now.toISOString() : 'С начала - ' + now.toISOString()
    };
  }

  function filterEvents(events, expertSet, users, range) {
    return events.filter(event => {
      const when = new Date(event.createdAt);
      if (range.from && when < range.from) return false;
      if (range.to && when > range.to) return false;
      return isRelevantPair(expertSet, users, event.actorId, event.targetId);
    });
  }

  function addMetric(pairs, expertSet, users, actorId, targetId, metric, count) {
    if (!metricKeys.includes(metric)) return;
    if (!isRelevantPair(expertSet, users, actorId, targetId)) return;
    const key = actorId + ':' + targetId;
    if (!pairs.has(key)) {
      pairs.set(key, emptyPair(actorId, targetId));
    }
    pairs.get(key)[metric] += Number(count || 0);
  }

  function isRelevantPair(expertSet, users, actorId, targetId) {
    if (actorId === targetId) return false;
    const actor = users.get(actorId);
    const target = users.get(targetId);
    const actorIsAssignedExpert = expertSet.has(actorId);
    const targetIsAssignedExpert = expertSet.has(targetId);
    if (actorIsAssignedExpert === targetIsAssignedExpert) return false;
    const other = actorIsAssignedExpert ? target : actor;
    return other && other.role === 'client';
  }

  function emptyPair(actorId, targetId) {
    const pair = { actorId, targetId };
    metricKeys.forEach(key => {
      pair[key] = 0;
    });
    return pair;
  }

  function total(row) {
    return metricKeys.reduce((sum, key) => sum + Number(row[key] || 0), 0);
  }

  function getSort(sort) {
    if (sortOptions[sort]) {
      return sortOptions[sort];
    }
    if (sort && (sort.endsWith('_desc') || sort.endsWith('_asc'))) {
      const desc = sort.endsWith('_desc');
      const key = sort.slice(0, desc ? -5 : -4);
      return (a, b) => compareSortKey(a, b, key, desc);
    }
    return sortOptions.total_desc;
  }

  function compareSortKey(a, b, key, desc) {
    let result;
    if (metricKeys.includes(key) || key === 'total') {
      result = Number(a[key] || 0) - Number(b[key] || 0);
    } else if (key === 'actor') {
      result = compareText(a.actor?.name, b.actor?.name);
    } else if (key === 'target') {
      result = compareText(a.target?.name, b.target?.name);
    } else if (key === 'direction') {
      result = compareText(a.direction, b.direction);
    } else {
      result = Number(a.total || 0) - Number(b.total || 0);
    }

    if (result === 0) {
      result = Number(a.total || 0) - Number(b.total || 0) || a.actorId - b.actorId || a.targetId - b.targetId;
    }

    return desc ? -result : result;
  }

  function compareText(a, b) {
    return String(a || '').localeCompare(String(b || ''), 'ru', { sensitivity: 'base' });
  }

  function fallbackUser(id) {
    return { id, name: 'User #' + id, username: 'user-' + id, role: 'user' };
  }

  function userMatches(user, query) {
    if (!user) return false;
    return String(user.name || '').toLowerCase().includes(query) ||
      String(user.username || '').toLowerCase().includes(query) ||
      String(user.email || '').toLowerCase().includes(query) ||
      String(user.role || '').toLowerCase().includes(query);
  }

  function unique(items) {
    return Array.from(new Set(items.map(Number)));
  }

  function clamp(value, min, max) {
    if (Number.isNaN(value)) return min;
    return Math.min(max, Math.max(min, value));
  }

  return {
    metricKeys,
    periodLabels,
    sortOptions,
    build
  };
});
