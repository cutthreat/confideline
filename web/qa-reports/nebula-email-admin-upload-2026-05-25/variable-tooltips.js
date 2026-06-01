(function () {
  "use strict";

  var VARIABLE_HINTS = {
    accountSecurityUrl: "Ссылка на раздел безопасности аккаунта пользователя.",
    advisorName: "Имя эксперта, назначенного на чат-консультацию.",
    amount: "Сумма платежа или заказа в человекочитаемом виде.",
    answerDueAt: "Плановое время ответа эксперта по SLA.",
    chatUrl: "Ссылка на конкретный чат-консультацию в кабинете.",
    checkoutUrl: "Ссылка для возврата к оплате или повторной попытки оплаты.",
    confirmationExpiresAt: "Дата и время, до которого действует ссылка подтверждения email.",
    confirmUrl: "Ссылка подтверждения email.",
    consultationId: "Внутренний ID консультации или чата.",
    currency: "Валюта платежа или возврата.",
    email: "Новый email пользователя при переподтверждении адреса.",
    emailPreferencesUrl: "Ссылка на настройки email-уведомлений пользователя.",
    errorMessage: "Текст ошибки платежа, подготовленный для пользователя.",
    expiresAt: "Дата и время окончания доступа или подписки.",
    expiresIn: "Сколько времени действует код или ссылка.",
    firstResponseSla: "Обещанный срок первого ответа эксперта.",
    followupOfferUrl: "Ссылка на предложение продолжить консультацию.",
    groupName: "Название группы.",
    legalMerchantName: "Юридическое имя сервиса или продавца для футера и платежных писем.",
    loginUrl: "Ссылка на вход в кабинет пользователя.",
    merchantDescriptor: "Описание списания, которое пользователь увидит в платежной выписке.",
    orderId: "Номер заказа или платежной попытки.",
    paidAt: "Дата и время успешной оплаты.",
    paidGroupLink: "Ссылка на платный доступ к группе.",
    password: "Временный пароль, если он действительно выдается backend-логикой.",
    paymentMethod: "Способ оплаты, отображаемый пользователю.",
    photoAccess: "Признак, что доступ к приватным фото предоставлен.",
    noPhotoAccess: "Признак, что доступ к приватным фото не предоставлен.",
    postUrl: "Ссылка на опубликованный пост.",
    privacyUrl: "Ссылка на страницу Privacy Policy / политики конфиденциальности на сайте.",
    privateGroupRequestLink: "Ссылка на запрос доступа к приватной группе.",
    privatePhotosLink: "Ссылка на приватные фото или запрос доступа к ним.",
    processorRefundId: "ID возврата в платежном провайдере.",
    rating: "Оценка, оставленная пользователем.",
    reason: "Причина списания кредитов или служебного действия.",
    receiptUrl: "Ссылка на чек или квитанцию об оплате.",
    refundAmount: "Сумма возврата.",
    refundEta: "Ожидаемый срок поступления возврата.",
    refundPolicyUrl: "Ссылка на правила возвратов на сайте.",
    renewUrl: "Ссылка для продления доступа или подписки.",
    resetExpiresAt: "Дата и время, до которого действует ссылка сброса пароля.",
    resetUrl: "Ссылка для сброса пароля.",
    reviewText: "Текст отзыва пользователя.",
    reviewUrl: "Ссылка, где пользователь может оставить отзыв.",
    securityChangedAt: "Дата и время изменения настроек безопасности.",
    senderAvatarUrl: "Ссылка на аватар отправителя события.",
    senderName: "Имя отправителя события.",
    senderProfileUrl: "Ссылка на профиль отправителя события.",
    showPassword: "Флаг, показывать ли пароль в письме.",
    siteName: "Название сайта.",
    siteUrl: "Главная ссылка на сайт.",
    subject: "Тема или краткое название события для письма.",
    supportCaseId: "Номер обращения в поддержку.",
    supportCaseStatus: "Текущий статус обращения в поддержку.",
    supportCaseUrl: "Ссылка на конкретное обращение в поддержку.",
    supportEmail: "Email службы поддержки.",
    supportUpdatedAt: "Дата и время последнего обновления обращения в поддержку.",
    supportUrl: "Ссылка на раздел поддержки.",
    termsUrl: "Ссылка на Terms / пользовательское соглашение на сайте.",
    transactionId: "ID платежной транзакции.",
    unsubscribeUrl: "Ссылка для управления подпиской или отписки от необязательных писем.",
    updatedAnswerEta: "Обновленный ожидаемый срок ответа эксперта.",
    userName: "Имя пользователя или безопасное обращение к пользователю."
  };

  var TOKEN_RE = /\{\{([A-Za-z0-9_]+)\}\}/g;
  var tooltipNode = null;

  function getHint(name) {
    return VARIABLE_HINTS[name] || ("Переменная " + name + ". Нужно сверить значение в backend payload для конкретного события.");
  }

  function shouldSkip(node) {
    var parent = node.parentElement;
    if (!parent) return true;
    if (parent.closest("script,style,textarea,input,select,option,noscript")) return true;
    if (parent.closest(".variable-token,.comment-inline,.comment-modal,.comment-toolbar")) return true;
    return !TOKEN_RE.test(node.nodeValue || "");
  }

  function buildToken(name, text) {
    var span = document.createElement("span");
    var hint = getHint(name);
    span.className = "variable-token";
    span.tabIndex = 0;
    span.textContent = text;
    span.setAttribute("title", hint);
    span.setAttribute("data-variable", name);
    span.setAttribute("data-variable-hint", hint);
    span.addEventListener("mouseenter", showTooltip);
    span.addEventListener("mousemove", moveTooltip);
    span.addEventListener("mouseleave", hideTooltip);
    span.addEventListener("focus", showTooltip);
    span.addEventListener("blur", hideTooltip);
    return span;
  }

  function wrapTextNode(node) {
    var text = node.nodeValue || "";
    var fragment = document.createDocumentFragment();
    var lastIndex = 0;
    var match;
    TOKEN_RE.lastIndex = 0;

    while ((match = TOKEN_RE.exec(text)) !== null) {
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }
      fragment.appendChild(buildToken(match[1], match[0]));
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    node.parentNode.replaceChild(fragment, node);
  }

  function wrapVariables() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        TOKEN_RE.lastIndex = 0;
        return shouldSkip(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(wrapTextNode);
  }

  function ensureTooltipNode() {
    if (tooltipNode) return tooltipNode;
    tooltipNode = document.createElement("div");
    tooltipNode.className = "variable-tooltip-popover";
    tooltipNode.setAttribute("role", "tooltip");
    document.body.appendChild(tooltipNode);
    return tooltipNode;
  }

  function showTooltip(event) {
    var target = event.currentTarget;
    var box = ensureTooltipNode();
    box.innerHTML = '<strong>{{' + escapeHtml(target.getAttribute("data-variable") || "") + '}}</strong><span>' + escapeHtml(target.getAttribute("data-variable-hint") || "") + '</span>';
    box.classList.add("is-visible");
    positionTooltip(target, event);
  }

  function moveTooltip(event) {
    if (!tooltipNode || !tooltipNode.classList.contains("is-visible")) return;
    positionTooltip(event.currentTarget, event);
  }

  function hideTooltip() {
    if (tooltipNode) tooltipNode.classList.remove("is-visible");
  }

  function positionTooltip(target, event) {
    var box = ensureTooltipNode();
    var x = event && typeof event.clientX === "number" ? event.clientX : target.getBoundingClientRect().left;
    var y = event && typeof event.clientY === "number" ? event.clientY : target.getBoundingClientRect().bottom;
    var left = Math.min(window.innerWidth - 24, Math.max(12, x + 14));
    var top = Math.min(window.innerHeight - 24, Math.max(12, y + 14));
    box.style.left = left + "px";
    box.style.top = top + "px";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function injectStyle() {
    var style = document.createElement("style");
    style.textContent = [
      ".variable-token{display:inline-flex;align-items:center;border-radius:5px;padding:1px 4px;margin:0 1px;background:#eef7ff;border:1px solid #b8dcff;color:#164b7a;font:700 12px/1.25 Consolas,'Courier New',monospace;cursor:help;white-space:nowrap}",
      ".variable-token:hover,.variable-token:focus{outline:none;background:#e9f0ff;border-color:#6338d8;color:#4220a8}",
      ".variable-tooltip-popover{position:fixed;z-index:7000;max-width:320px;padding:10px 12px;border-radius:8px;border:1px solid #d9e2ef;background:#172033;color:#fff;box-shadow:0 16px 44px rgba(15,23,42,.28);font-family:Arial,Helvetica,sans-serif;pointer-events:none;opacity:0;transform:translateY(4px);transition:opacity .12s ease,transform .12s ease}",
      ".variable-tooltip-popover.is-visible{opacity:1;transform:translateY(0)}",
      ".variable-tooltip-popover strong{display:block;margin-bottom:4px;color:#bfe7ff;font:700 12px/1.25 Consolas,'Courier New',monospace}",
      ".variable-tooltip-popover span{display:block;color:#fff;font:400 13px/1.35 Arial,Helvetica,sans-serif}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function init() {
    if (!document.body) return;
    injectStyle();
    wrapVariables();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
