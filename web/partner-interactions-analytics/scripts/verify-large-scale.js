const analytics = require('../assets/partner-interactions-analytics');

const fixture = buildLargeFixture();
const checks = [];

checks.push(runCase('admin_all_50_partners', {
  partnerId: 0,
  period: 'all',
  direction: 'all',
  pageSize: 50
}, result => result.summary.experts === 1500 && result.rows.length === 50));

checks.push(runCase('partner_1_30_experts', {
  partnerId: 1,
  period: 'all',
  direction: 'all',
  pageSize: 50
}, result => result.summary.experts === 30 && result.rows.length === 50));

checks.push(runCase('expert_10000_1000_dialogs', {
  audience: 'expert',
  expertId: 10000,
  period: 'all',
  direction: 'all',
  pageSize: 50
}, result => result.summary.experts === 1 && result.summary.pairs === 2000 && result.rows.length === 50));

checks.push(runCase('search_and_min_actions', {
  partnerId: 1,
  period: 'all',
  direction: 'all',
  query: 'Client 0',
  minActions: 1,
  pageSize: 50
}, result => result.summary.pairs > 0 && result.rows.length <= 50));

const failures = checks.filter(check => !check.pass);
console.log(JSON.stringify({
  status: failures.length ? 'FAIL' : 'PASS',
  checkedAt: new Date().toISOString(),
  scale: {
    partners: 50,
    expertUsers: 5000,
    assignedExperts: 1500,
    clients: 3000,
    events: fixture.events.length
  },
  checks,
  failures
}, null, 2));

process.exit(failures.length ? 1 : 0);

function runCase(name, filters, predicate) {
  const started = Date.now();
  const result = analytics.build(fixture, filters);
  const elapsedMs = Date.now() - started;
  return {
    name,
    pass: Boolean(predicate(result) && elapsedMs < 2500),
    elapsedMs,
    summary: result.summary,
    renderedRows: result.rows.length,
    pagination: result.pagination
  };
}

function buildLargeFixture() {
  const users = [];
  const assignments = [];
  const events = [];

  for (let partner = 1; partner <= 50; partner++) {
    users.push({
      id: partner,
      name: 'Partner ' + partner,
      username: 'partner' + partner,
      role: 'partner'
    });
  }

  for (let index = 0; index < 5000; index++) {
    users.push({
      id: 10000 + index,
      name: 'Expert ' + index,
      username: 'expert' + index,
      role: 'expert'
    });
  }

  for (let index = 0; index < 3000; index++) {
    users.push({
      id: 25000 + index,
      name: 'Client ' + index,
      username: 'client' + index,
      role: 'client'
    });
  }

  for (let partner = 1; partner <= 50; partner++) {
    for (let slot = 0; slot < 30; slot++) {
      assignments.push({
        partnerId: partner,
        expertId: 10000 + (partner - 1) * 30 + slot
      });
    }
  }

  // One expert with 1000 dialog pairs, represented by two directed rows per client.
  for (let clientOffset = 0; clientOffset < 1000; clientOffset++) {
    const clientId = 25000 + clientOffset;
    events.push(event('messages', clientId, 10000, 1 + clientOffset % 9));
    events.push(event('messages', 10000, clientId, 1 + clientOffset % 7));
    events.push(event('profileViews', clientId, 10000, 1));
  }

  // Remaining assigned experts receive a moderate stream so partner/admin modes are realistic.
  assignments.forEach((assignment, index) => {
    for (let turn = 0; turn < 12; turn++) {
      const clientId = 25000 + ((index * 13 + turn) % 3000);
      events.push(event('messages', clientId, assignment.expertId, 1 + turn % 5));
      events.push(event('messages', assignment.expertId, clientId, 1 + turn % 4));
      if (turn % 3 === 0) {
        events.push(event('favorites', clientId, assignment.expertId, 1));
      }
      if (turn % 7 === 0) {
        events.push(event('reports', clientId, assignment.expertId, 1));
      }
    }
  });

  return {
    meta: {
      now: '2026-05-20T12:00:00+03:00',
      defaultPartnerId: 1,
      defaultPeriod: '7d',
      defaultDirection: 'all',
      assignmentSource: 'large-scale synthetic consultation fixture',
      warnings: []
    },
    users,
    assignments,
    columns: [
      { key: 'profileViews', label: 'Просм.', title: 'Просмотры анкеты эксперта' },
      { key: 'favorites', label: 'Избр.', title: 'Добавил анкету в избранное' },
      { key: 'chatStarts', label: 'Старт', title: 'Начал диалог с экспертом' },
      { key: 'clientMessages', label: 'Клиент', title: 'Сообщения клиента' },
      { key: 'expertReplies', label: 'Ответ', title: 'Ответы эксперта' },
      { key: 'paidConsultations', label: 'Оплата', title: 'Оплаты консультаций' },
      { key: 'repeatRequests', label: 'Повтор', title: 'Повторные обращения клиента' },
      { key: 'blocks', label: 'Блок', title: 'Блокировки' },
      { key: 'reports', label: 'Жал.', title: 'Жалобы' }
    ],
    events
  };
}

function event(type, actorId, targetId, count) {
  return {
    type,
    actorId,
    targetId,
    createdAt: '2026-05-20T09:00:00+03:00',
    count
  };
}
