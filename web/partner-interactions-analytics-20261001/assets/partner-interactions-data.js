window.PartnerInteractionExampleData = {
  "meta": {
    "now": "2026-10-01T12:00:00+03:00",
    "unit": "credits",
    "timezone": "Europe/Minsk",
    "updatedAt": "2026-10-01T12:00:00+03:00"
  },
  "sources": {
    "activity": true,
    "history": true,
    "finance": true
  },
  "users": [
    {
      "id": 15,
      "role": "partner",
      "name": "Gin001",
      "username": "gin001"
    },
    {
      "id": 16,
      "role": "partner",
      "name": "Partner B",
      "username": "partner-b"
    },
    {
      "id": 184,
      "role": "expert",
      "name": "Эксперт A",
      "username": "expert-a"
    },
    {
      "id": 185,
      "role": "expert",
      "name": "Эксперт B",
      "username": "expert-b"
    },
    {
      "id": 186,
      "role": "expert",
      "name": "Эксперт D",
      "username": "expert-d"
    },
    {
      "id": 1001,
      "role": "client",
      "name": "Клиент C",
      "username": "client-c"
    }
  ],
  "assignments": [
    {
      "partnerId": 15,
      "expertId": 184
    },
    {
      "partnerId": 16,
      "expertId": 185
    },
    {
      "partnerId": 15,
      "expertId": 186
    }
  ],
  "consultations": [
    {
      "id": "A1",
      "clientId": 1001,
      "expertId": 184,
      "serviceStartedAt": "2026-09-01T10:00:00+03:00",
      "completedAt": "2026-09-01T10:30:00+03:00",
      "status": "completed"
    },
    {
      "id": "A2",
      "clientId": 1001,
      "expertId": 184,
      "serviceStartedAt": "2026-09-10T10:00:00+03:00",
      "completedAt": "2026-09-10T10:30:00+03:00",
      "status": "completed"
    },
    {
      "id": "B1",
      "clientId": 1001,
      "expertId": 185,
      "serviceStartedAt": "2026-09-12T10:00:00+03:00",
      "completedAt": "2026-09-12T10:30:00+03:00",
      "status": "completed"
    },
    {
      "id": "cancelled",
      "clientId": 1001,
      "expertId": 184,
      "status": "cancelled",
      "connectedAt": "2026-09-13T10:00:00+03:00"
    },
    {
      "id": "A2",
      "clientId": 1001,
      "expertId": 184,
      "serviceStartedAt": "2026-09-10T10:00:00+03:00",
      "completedAt": "2026-09-10T10:30:00+03:00",
      "status": "completed",
      "confirmationId": "duplicate"
    }
  ],
  "transactions": [
    {
      "transactionId": "charge-a1",
      "consultationId": "A1",
      "clientId": 1001,
      "expertId": 184,
      "type": "charge",
      "status": "confirmed",
      "amount": 40,
      "createdAt": "2026-09-01T10:00:00+03:00"
    },
    {
      "transactionId": "charge-a2",
      "consultationId": "A2",
      "clientId": 1001,
      "expertId": 184,
      "type": "charge",
      "status": "confirmed",
      "amount": 60,
      "createdAt": "2026-09-10T10:00:00+03:00"
    },
    {
      "transactionId": "charge-a2-next",
      "consultationId": "A2",
      "clientId": 1001,
      "expertId": 184,
      "type": "charge",
      "status": "confirmed",
      "amount": 40,
      "createdAt": "2026-09-10T10:10:00+03:00"
    },
    {
      "transactionId": "charge-b1",
      "consultationId": "B1",
      "clientId": 1001,
      "expertId": 185,
      "type": "charge",
      "status": "confirmed",
      "amount": 80,
      "createdAt": "2026-09-12T10:00:00+03:00"
    },
    {
      "transactionId": "refund-a2",
      "consultationId": "A2",
      "chargeId": "charge-a2",
      "clientId": 1001,
      "expertId": 184,
      "type": "refund",
      "status": "confirmed",
      "amount": 20,
      "createdAt": "2026-09-15T10:00:00+03:00"
    },
    {
      "transactionId": "wallet",
      "clientId": 1001,
      "type": "walletTopup",
      "status": "confirmed",
      "amount": 500,
      "createdAt": "2026-09-09T10:00:00+03:00"
    },
    {
      "transactionId": "payout",
      "expertId": 184,
      "type": "expertPayout",
      "status": "confirmed",
      "amount": 30,
      "createdAt": "2026-09-14T10:00:00+03:00"
    },
    {
      "transactionId": "charge-a2",
      "consultationId": "A2",
      "clientId": 1001,
      "expertId": 184,
      "type": "charge",
      "status": "confirmed",
      "amount": 60,
      "createdAt": "2026-09-10T10:00:00+03:00",
      "confirmationId": "duplicate"
    }
  ],
  "events": [
    {
      "id": "first-a",
      "actorId": 1001,
      "targetId": 184,
      "type": "messages",
      "count": 1,
      "createdAt": "2026-09-01T10:00:00+03:00"
    },
    {
      "id": "view-a",
      "actorId": 1001,
      "targetId": 184,
      "type": "profileViews",
      "count": 5,
      "createdAt": "2026-09-09T10:00:00+03:00"
    },
    {
      "id": "fav-a",
      "actorId": 1001,
      "targetId": 184,
      "type": "favorites",
      "count": 1,
      "createdAt": "2026-09-09T10:00:00+03:00"
    },
    {
      "id": "before-a",
      "actorId": 184,
      "targetId": 1001,
      "type": "messages",
      "count": 1,
      "createdAt": "2026-09-08T10:00:00+03:00"
    },
    {
      "id": "client-a",
      "actorId": 1001,
      "targetId": 184,
      "type": "messages",
      "count": 3,
      "createdAt": "2026-09-10T10:01:00+03:00"
    },
    {
      "id": "reply-a",
      "actorId": 184,
      "targetId": 1001,
      "type": "messages",
      "count": 2,
      "createdAt": "2026-09-10T10:02:00+03:00"
    },
    {
      "id": "first-b",
      "actorId": 1001,
      "targetId": 185,
      "type": "messages",
      "count": 2,
      "createdAt": "2026-09-12T10:01:00+03:00"
    },
    {
      "id": "early-b",
      "actorId": 185,
      "targetId": 1001,
      "type": "messages",
      "count": 1,
      "createdAt": "2026-09-12T09:00:00+03:00"
    },
    {
      "id": "report-b",
      "actorId": 1001,
      "targetId": 185,
      "type": "reports",
      "count": 1,
      "createdAt": "2026-09-12T11:00:00+03:00"
    },
    {
      "id": "block-b",
      "actorId": 185,
      "targetId": 1001,
      "type": "blocks",
      "count": 1,
      "createdAt": "2026-09-12T12:00:00+03:00"
    },
    {
      "id": "pause-a",
      "consultationId": "A2",
      "actorId": 1001,
      "targetId": 184,
      "type": "pause",
      "createdAt": "2026-09-10T10:15:00+03:00"
    },
    {
      "id": "continue-a",
      "consultationId": "A2",
      "actorId": 1001,
      "targetId": 184,
      "type": "continuation",
      "createdAt": "2026-09-10T10:16:00+03:00"
    }
  ]
};
