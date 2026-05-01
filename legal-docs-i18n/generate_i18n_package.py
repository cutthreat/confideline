# -*- coding: utf-8 -*-
from __future__ import annotations

import csv
import html
import json
from pathlib import Path

ROOT = Path(r"H:\GPT-Codex\Confideline\legal-docs-i18n")

LOCALES = [
    {"code": "original", "label": "Оригинал", "lang": "ru", "dir": "ltr"},
    {"code": "ar-AR", "label": "العربية", "lang": "ar", "dir": "rtl"},
    {"code": "ca-ES", "label": "Català", "lang": "ca", "dir": "ltr"},
    {"code": "cs-CZ", "label": "Čeština", "lang": "cs", "dir": "ltr"},
    {"code": "de-DE", "label": "Deutsch", "lang": "de", "dir": "ltr"},
    {"code": "en-US", "label": "English (US)", "lang": "en", "dir": "ltr"},
    {"code": "es-ES", "label": "Español (España)", "lang": "es", "dir": "ltr"},
    {"code": "fr-FR", "label": "Français (France)", "lang": "fr", "dir": "ltr"},
    {"code": "it-IT", "label": "Italiano", "lang": "it", "dir": "ltr"},
    {"code": "ru-RU", "label": "Русский", "lang": "ru", "dir": "ltr"},
    {"code": "uk-UA", "label": "Українська", "lang": "uk", "dir": "ltr"},
]

DOCS = [
    ("legal", "legalHub"),
    ("about", "about"),
    ("terms-and-conditions", "terms"),
    ("privacy-policy", "privacy"),
    ("cookie-policy", "cookies"),
    ("payment-subscription-terms", "payment"),
    ("refund-policy", "refund"),
    ("community-guidelines", "community"),
    ("disclaimer", "disclaimer"),
    ("safety", "safety"),
    ("anti-scam", "antiScam"),
    ("notice-action-appeals", "notice"),
    ("ip-complaints", "ip"),
    ("legal-notice-contact", "contact"),
    ("consultant-terms", "consultant"),
    ("code-of-ethics", "ethics"),
    ("aml-kyc-policy", "kyc"),
    ("earnings-disclaimer", "earnings"),
]

TITLES = {
    "ru": {
        "legalHub": "Юридический раздел",
        "about": "О Confideline.com",
        "terms": "Условия сервиса",
        "privacy": "Политика конфиденциальности",
        "cookies": "Cookie Policy",
        "payment": "Условия оплаты и подписок",
        "refund": "Политика возвратов",
        "community": "Правила сообщества",
        "disclaimer": "Дисклеймер",
        "safety": "Безопасность",
        "antiScam": "Anti-Scam Tips",
        "notice": "Notice & Action / Апелляции",
        "ip": "Жалобы на интеллектуальную собственность",
        "contact": "Legal Notice / Контакты",
        "consultant": "Условия для консультантов",
        "ethics": "Кодекс этики консультантов",
        "kyc": "AML / KYC Policy",
        "earnings": "Earnings Disclaimer",
    },
    "en": {
        "legalHub": "Legal Hub",
        "about": "About Confideline.com",
        "terms": "Terms of Service",
        "privacy": "Privacy Policy",
        "cookies": "Cookie Policy",
        "payment": "Payment and Subscription Terms",
        "refund": "Refund Policy",
        "community": "Community Guidelines",
        "disclaimer": "Disclaimer",
        "safety": "Safety Tips",
        "antiScam": "Anti-Scam Tips",
        "notice": "Notice & Action / Appeals",
        "ip": "IP / Copyright Complaints",
        "contact": "Legal Notice / Contact",
        "consultant": "Consultant Terms",
        "ethics": "Consultant Code of Ethics",
        "kyc": "AML / KYC Policy",
        "earnings": "Earnings Disclaimer",
    },
    "uk": {
        "legalHub": "Юридичний розділ",
        "about": "Про Confideline.com",
        "terms": "Умови сервісу",
        "privacy": "Політика конфіденційності",
        "cookies": "Cookie Policy",
        "payment": "Умови оплати та підписок",
        "refund": "Політика повернень",
        "community": "Правила спільноти",
        "disclaimer": "Дисклеймер",
        "safety": "Безпека",
        "antiScam": "Anti-Scam поради",
        "notice": "Notice & Action / Апеляції",
        "ip": "Скарги щодо інтелектуальної власності",
        "contact": "Legal Notice / Контакти",
        "consultant": "Умови для консультантів",
        "ethics": "Кодекс етики консультантів",
        "kyc": "AML / KYC Policy",
        "earnings": "Дисклеймер щодо доходу",
    },
    "de": {
        "legalHub": "Rechtlicher Bereich",
        "about": "Über Confideline.com",
        "terms": "Nutzungsbedingungen",
        "privacy": "Datenschutzerklärung",
        "cookies": "Cookie-Richtlinie",
        "payment": "Zahlungs- und Abonnementbedingungen",
        "refund": "Rückerstattungsrichtlinie",
        "community": "Community-Richtlinien",
        "disclaimer": "Haftungsausschluss",
        "safety": "Sicherheitshinweise",
        "antiScam": "Anti-Scam-Hinweise",
        "notice": "Notice & Action / Beschwerden",
        "ip": "IP- und Urheberrechtsbeschwerden",
        "contact": "Impressum / Kontakt",
        "consultant": "Bedingungen für Berater",
        "ethics": "Ethikkodex für Berater",
        "kyc": "AML / KYC-Richtlinie",
        "earnings": "Einkommens-Haftungsausschluss",
    },
    "fr": {
        "legalHub": "Espace juridique",
        "about": "À propos de Confideline.com",
        "terms": "Conditions d’utilisation",
        "privacy": "Politique de confidentialité",
        "cookies": "Politique relative aux cookies",
        "payment": "Conditions de paiement et d’abonnement",
        "refund": "Politique de remboursement",
        "community": "Règles de la communauté",
        "disclaimer": "Avertissement",
        "safety": "Conseils de sécurité",
        "antiScam": "Conseils anti-arnaque",
        "notice": "Notice & Action / Recours",
        "ip": "Réclamations de propriété intellectuelle",
        "contact": "Mentions légales / Contact",
        "consultant": "Conditions des consultants",
        "ethics": "Code d’éthique des consultants",
        "kyc": "Politique AML / KYC",
        "earnings": "Avertissement sur les revenus",
    },
    "es": {
        "legalHub": "Sección legal",
        "about": "Acerca de Confideline.com",
        "terms": "Términos del servicio",
        "privacy": "Política de privacidad",
        "cookies": "Política de cookies",
        "payment": "Términos de pago y suscripción",
        "refund": "Política de reembolsos",
        "community": "Normas de la comunidad",
        "disclaimer": "Aviso legal",
        "safety": "Consejos de seguridad",
        "antiScam": "Consejos antiestafa",
        "notice": "Notice & Action / Apelaciones",
        "ip": "Reclamaciones de propiedad intelectual",
        "contact": "Aviso legal / Contacto",
        "consultant": "Términos para consultores",
        "ethics": "Código ético de consultores",
        "kyc": "Política AML / KYC",
        "earnings": "Aviso sobre ingresos",
    },
    "it": {
        "legalHub": "Area legale",
        "about": "Informazioni su Confideline.com",
        "terms": "Termini di servizio",
        "privacy": "Informativa sulla privacy",
        "cookies": "Cookie Policy",
        "payment": "Termini di pagamento e abbonamento",
        "refund": "Politica di rimborso",
        "community": "Linee guida della community",
        "disclaimer": "Avvertenza",
        "safety": "Consigli di sicurezza",
        "antiScam": "Consigli anti-truffa",
        "notice": "Notice & Action / Ricorsi",
        "ip": "Reclami IP / copyright",
        "contact": "Note legali / Contatti",
        "consultant": "Termini per consulenti",
        "ethics": "Codice etico dei consulenti",
        "kyc": "Policy AML / KYC",
        "earnings": "Avvertenza sui guadagni",
    },
    "ca": {
        "legalHub": "Àrea legal",
        "about": "Sobre Confideline.com",
        "terms": "Condicions del servei",
        "privacy": "Política de privacitat",
        "cookies": "Política de cookies",
        "payment": "Condicions de pagament i subscripció",
        "refund": "Política de reemborsaments",
        "community": "Normes de la comunitat",
        "disclaimer": "Avís legal",
        "safety": "Consells de seguretat",
        "antiScam": "Consells contra estafes",
        "notice": "Notice & Action / Apel·lacions",
        "ip": "Reclamacions de propietat intel·lectual",
        "contact": "Avís legal / Contacte",
        "consultant": "Condicions per a consultors",
        "ethics": "Codi ètic dels consultors",
        "kyc": "Política AML / KYC",
        "earnings": "Avís sobre ingressos",
    },
    "cs": {
        "legalHub": "Právní sekce",
        "about": "O Confideline.com",
        "terms": "Podmínky služby",
        "privacy": "Zásady ochrany osobních údajů",
        "cookies": "Zásady cookies",
        "payment": "Platební a předplatné podmínky",
        "refund": "Zásady vrácení peněz",
        "community": "Pravidla komunity",
        "disclaimer": "Upozornění",
        "safety": "Bezpečnostní tipy",
        "antiScam": "Tipy proti podvodům",
        "notice": "Notice & Action / Odvolání",
        "ip": "Stížnosti k duševnímu vlastnictví",
        "contact": "Právní oznámení / Kontakt",
        "consultant": "Podmínky pro konzultanty",
        "ethics": "Etický kodex konzultantů",
        "kyc": "Zásady AML / KYC",
        "earnings": "Upozornění k výdělkům",
    },
    "ar": {
        "legalHub": "المركز القانوني",
        "about": "حول Confideline.com",
        "terms": "شروط الخدمة",
        "privacy": "سياسة الخصوصية",
        "cookies": "سياسة ملفات تعريف الارتباط",
        "payment": "شروط الدفع والاشتراك",
        "refund": "سياسة الاسترداد",
        "community": "إرشادات المجتمع",
        "disclaimer": "إخلاء المسؤولية",
        "safety": "نصائح السلامة",
        "antiScam": "نصائح مكافحة الاحتيال",
        "notice": "الإشعار والإجراء / الاستئناف",
        "ip": "شكاوى الملكية الفكرية وحقوق النشر",
        "contact": "الإشعار القانوني / الاتصال",
        "consultant": "شروط المستشارين",
        "ethics": "مدونة أخلاقيات المستشارين",
        "kyc": "سياسة AML / KYC",
        "earnings": "إخلاء مسؤولية الأرباح",
    },
}

LOCALE_TEXT = {
    "ru": {
        "status": "Рабочий перевод для юридической проверки. Не публиковать без проверки юристом и носителем языка.",
        "operator": "Оператор: [EU_COMPANY_LEGAL_NAME], [EU_COMPANY_ADDRESS], [EU_COMPANY_REG_NO], [EU_VAT_ID].",
        "age": "Возрастной порог: [LEGAL_AGE_REQUIREMENT]. Заполняется после юридического решения.",
        "contact": "Контакты: support [SUPPORT_EMAIL], privacy [PRIVACY_EMAIL], legal [LEGAL_EMAIL].",
        "review": "Все плейсхолдеры в квадратных скобках нужно заменить перед публикацией.",
    },
    "en": {
        "status": "Working translation for legal review. Do not publish without review by counsel and a native speaker.",
        "operator": "Operator: [EU_COMPANY_LEGAL_NAME], [EU_COMPANY_ADDRESS], [EU_COMPANY_REG_NO], [EU_VAT_ID].",
        "age": "Age threshold: [LEGAL_AGE_REQUIREMENT]. To be completed after legal decision.",
        "contact": "Contacts: support [SUPPORT_EMAIL], privacy [PRIVACY_EMAIL], legal [LEGAL_EMAIL].",
        "review": "Replace all placeholders in square brackets before publication.",
    },
}

LOCALE_TEXT.update({
    "uk": {"status":"Робочий переклад для юридичної перевірки. Не публікувати без перевірки юристом і носієм мови.","operator":"Оператор: [EU_COMPANY_LEGAL_NAME], [EU_COMPANY_ADDRESS], [EU_COMPANY_REG_NO], [EU_VAT_ID].","age":"Віковий поріг: [LEGAL_AGE_REQUIREMENT]. Заповнюється після юридичного рішення.","contact":"Контакти: support [SUPPORT_EMAIL], privacy [PRIVACY_EMAIL], legal [LEGAL_EMAIL].","review":"Усі плейсхолдери у квадратних дужках потрібно замінити перед публікацією."},
    "de": {"status":"Arbeitsübersetzung zur rechtlichen Prüfung. Nicht ohne Prüfung durch Rechtsberatung und Muttersprachler veröffentlichen.","operator":"Betreiber: [EU_COMPANY_LEGAL_NAME], [EU_COMPANY_ADDRESS], [EU_COMPANY_REG_NO], [EU_VAT_ID].","age":"Altersgrenze: [LEGAL_AGE_REQUIREMENT]. Nach rechtlicher Entscheidung auszufüllen.","contact":"Kontakt: Support [SUPPORT_EMAIL], Datenschutz [PRIVACY_EMAIL], Legal [LEGAL_EMAIL].","review":"Alle Platzhalter in eckigen Klammern vor Veröffentlichung ersetzen."},
    "fr": {"status":"Traduction de travail pour validation juridique. Ne pas publier sans validation par un juriste et un locuteur natif.","operator":"Opérateur : [EU_COMPANY_LEGAL_NAME], [EU_COMPANY_ADDRESS], [EU_COMPANY_REG_NO], [EU_VAT_ID].","age":"Seuil d’âge : [LEGAL_AGE_REQUIREMENT]. À compléter après décision juridique.","contact":"Contacts : support [SUPPORT_EMAIL], privacy [PRIVACY_EMAIL], legal [LEGAL_EMAIL].","review":"Remplacer tous les espaces réservés entre crochets avant publication."},
    "es": {"status":"Traducción de trabajo para revisión legal. No publicar sin revisión de un abogado y un hablante nativo.","operator":"Operador: [EU_COMPANY_LEGAL_NAME], [EU_COMPANY_ADDRESS], [EU_COMPANY_REG_NO], [EU_VAT_ID].","age":"Edad mínima: [LEGAL_AGE_REQUIREMENT]. Se completará tras decisión legal.","contact":"Contactos: soporte [SUPPORT_EMAIL], privacidad [PRIVACY_EMAIL], legal [LEGAL_EMAIL].","review":"Sustituir todos los marcadores entre corchetes antes de publicar."},
    "it": {"status":"Traduzione di lavoro per revisione legale. Non pubblicare senza revisione di un legale e di un madrelingua.","operator":"Operatore: [EU_COMPANY_LEGAL_NAME], [EU_COMPANY_ADDRESS], [EU_COMPANY_REG_NO], [EU_VAT_ID].","age":"Soglia di età: [LEGAL_AGE_REQUIREMENT]. Da completare dopo decisione legale.","contact":"Contatti: supporto [SUPPORT_EMAIL], privacy [PRIVACY_EMAIL], legale [LEGAL_EMAIL].","review":"Sostituire tutti i segnaposto tra parentesi quadre prima della pubblicazione."},
    "ca": {"status":"Traducció de treball per a revisió legal. No publicar sense revisió jurídica i d’un parlant nadiu.","operator":"Operador: [EU_COMPANY_LEGAL_NAME], [EU_COMPANY_ADDRESS], [EU_COMPANY_REG_NO], [EU_VAT_ID].","age":"Llindar d’edat: [LEGAL_AGE_REQUIREMENT]. S’ha de completar després de la decisió legal.","contact":"Contactes: suport [SUPPORT_EMAIL], privacitat [PRIVACY_EMAIL], legal [LEGAL_EMAIL].","review":"Substituir tots els marcadors entre claudàtors abans de publicar."},
    "cs": {"status":"Pracovní překlad pro právní kontrolu. Nezveřejňovat bez kontroly právníkem a rodilým mluvčím.","operator":"Provozovatel: [EU_COMPANY_LEGAL_NAME], [EU_COMPANY_ADDRESS], [EU_COMPANY_REG_NO], [EU_VAT_ID].","age":"Věková hranice: [LEGAL_AGE_REQUIREMENT]. Doplnit po právním rozhodnutí.","contact":"Kontakty: podpora [SUPPORT_EMAIL], soukromí [PRIVACY_EMAIL], právní [LEGAL_EMAIL].","review":"Před zveřejněním nahradit všechny zástupné hodnoty v hranatých závorkách."},
    "ar": {"status":"ترجمة عمل للمراجعة القانونية. لا تنشر قبل مراجعة محام ومتحدث أصلي.","operator":"المشغل: [EU_COMPANY_LEGAL_NAME]، [EU_COMPANY_ADDRESS]، [EU_COMPANY_REG_NO]، [EU_VAT_ID].","age":"الحد العمري: [LEGAL_AGE_REQUIREMENT]. يملأ بعد القرار القانوني.","contact":"جهات الاتصال: الدعم [SUPPORT_EMAIL]، الخصوصية [PRIVACY_EMAIL]، القانوني [LEGAL_EMAIL].","review":"يجب استبدال جميع العناصر النائبة بين الأقواس قبل النشر."},
})


GENERIC_BODY = {
    "uk": [
        "Цей локалізований документ описує правила для розділу «{title}» на Confideline.com.",
        "Він має відповідати російському master-документу, вимогам обраної юрисдикції ЄС, GDPR, правилам оплати, модерації та захисту користувачів.",
        "Перед публікацією юрист і носій мови повинні перевірити терміни, споживчі права, privacy формулювання, віковий поріг і всі placeholders."
    ],
    "de": [
        "Dieses lokalisierte Dokument beschreibt die Regeln für den Bereich „{title}“ auf Confideline.com.",
        "Es muss dem russischen Masterdokument, der gewählten EU-Rechtsordnung, der DSGVO, Zahlungsregeln, Moderation und Nutzerschutz entsprechen.",
        "Vor Veröffentlichung müssen Rechtsberatung und ein Muttersprachler Begriffe, Verbraucherrechte, Datenschutzformulierungen, Altersgrenze und alle Platzhalter prüfen."
    ],
    "fr": [
        "Ce document localisé décrit les règles applicables à la section « {title} » de Confideline.com.",
        "Il doit rester cohérent avec le document maître russe, la juridiction européenne choisie, le RGPD, les règles de paiement, la modération et la protection des utilisateurs.",
        "Avant publication, un juriste et un locuteur natif doivent vérifier la terminologie, les droits des consommateurs, les clauses de confidentialité, le seuil d’âge et tous les espaces réservés."
    ],
    "es": [
        "Este documento localizado describe las reglas para la sección «{title}» de Confideline.com.",
        "Debe mantenerse coherente con el documento maestro ruso, la jurisdicción de la UE elegida, el RGPD, las reglas de pago, la moderación y la protección de usuarios.",
        "Antes de publicarlo, un abogado y un hablante nativo deben revisar la terminología, los derechos de consumidores, privacidad, edad mínima y todos los marcadores."
    ],
    "it": [
        "Questo documento localizzato descrive le regole per la sezione «{title}» di Confideline.com.",
        "Deve restare coerente con il documento master russo, la giurisdizione UE scelta, il GDPR, le regole di pagamento, la moderazione e la tutela degli utenti.",
        "Prima della pubblicazione, un legale e un madrelingua devono verificare terminologia, diritti dei consumatori, privacy, soglia di età e tutti i segnaposto."
    ],
    "ca": [
        "Aquest document localitzat descriu les normes de la secció «{title}» de Confideline.com.",
        "Ha de ser coherent amb el document mestre en rus, la jurisdicció de la UE triada, el GDPR, les normes de pagament, la moderació i la protecció dels usuaris.",
        "Abans de publicar-lo, un advocat i un parlant nadiu han de revisar terminologia, drets dels consumidors, privacitat, llindar d’edat i tots els marcadors."
    ],
    "cs": [
        "Tento lokalizovaný dokument popisuje pravidla pro část „{title}“ na Confideline.com.",
        "Musí být v souladu s ruským master dokumentem, zvolenou jurisdikcí EU, GDPR, platebními pravidly, moderací a ochranou uživatelů.",
        "Před zveřejněním musí právník a rodilý mluvčí zkontrolovat terminologii, spotřebitelská práva, soukromí, věkovou hranici a všechny zástupné údaje."
    ],
    "ar": [
        "تصف هذه الوثيقة المترجمة القواعد الخاصة بقسم «{title}» على Confideline.com.",
        "يجب أن تكون متسقة مع الوثيقة الروسية الرئيسية، والولاية القضائية المختارة في الاتحاد الأوروبي، وGDPR، وقواعد الدفع، والإشراف، وحماية المستخدمين.",
        "قبل النشر يجب أن يراجعها محام ومتحدث أصلي، بما في ذلك المصطلحات وحقوق المستهلك والخصوصية والحد العمري وجميع العناصر النائبة."
    ],
}

BODY_RU = {
    "legalHub": ["Эта страница объединяет все юридические документы Confideline.com.", "Пользователь должен иметь доступ к условиям сервиса, конфиденциальности, cookies, оплате, возвратам, правилам сообщества, дисклеймеру, безопасности, жалобам, апелляциям и контактам оператора."],
    "about": ["Confideline.com — международная онлайн-платформа для знакомств, общения и цифровых платных функций.", "На странице указываются официальный домен, оператор, контакты support/privacy/legal и краткое описание платных функций."],
    "terms": ["Документ регулирует аккаунт, использование сервиса, пользовательский контент, платные функции, модерацию, ограничения ответственности и применимое право.", "Пользователь должен соблюдать Правила сообщества, не создавать фейковые профили, не использовать сервис для мошенничества и не обходить блокировки."],
    "privacy": ["Документ описывает категории данных, цели обработки, правовые основания, получателей, сроки хранения, международные передачи и права пользователя.", "Нужно указать контролера данных, DPO если применимо, надзорный орган, порядок доступа, удаления, исправления, portability, objection и withdrawal of consent."],
    "cookies": ["Cookies делятся на необходимые, функциональные, analytics и marketing.", "Analytics и marketing cookies должны быть отключены до согласия пользователя; пользователь должен иметь возможность принять, отклонить и изменить настройки."],
    "payment": ["Документ описывает кредиты, premium, подписки, auto-renewal, платежных провайдеров, налоги, ошибки платежа и fraud checks.", "Перед оплатой пользователь видит продукт, цену, валюту, срок действия, правила отмены и ссылку на возвраты."],
    "refund": ["Документ описывает возвраты за цифровые функции, кредиты, premium и консультации.", "Финальная формулировка withdrawal rights и немедленного исполнения цифровой услуги должна быть проверена юристом по выбранной юрисдикции ЕС."],
    "community": ["Правила запрещают фейковые профили, мошенничество, harassment, угрозы, hate speech, phishing, spam, незаконный контент и нарушение IP rights.", "Нарушения можно отправлять через Report; решения модерации могут быть обжалованы."],
    "disclaimer": ["Экспертные и развлекательные функции предназначены только для развлечения и личной рефлексии.", "Они не являются медицинской, юридической, финансовой, психологической, налоговой или emergency консультацией и не гарантируют результат."],
    "safety": ["Пользователь не должен передавать незнакомым людям адрес, телефон, банковские данные, документы, пароли и одноразовые коды.", "При угрозах, вымогательстве, phishing, подозрительных ссылках или просьбах о деньгах нужно использовать Report и support."],
    "antiScam": ["Распространенные схемы: просьбы о деньгах, подарочных картах, crypto, инвестициях, срочных переводах, внешних ссылках и внешней оплате.", "Не переводите деньги, не отправляйте документы и фиксируйте доказательства перед отправкой жалобы."],
    "notice": ["Политика описывает жалобы на illegal content, scam, harassment, IP infringement и другие нарушения.", "Уведомление о решении должно объяснять меру, причину, правило и способ апелляции."],
    "ip": ["Правообладатель может направить жалобу на нарушение авторских прав, товарных знаков или иных IP rights.", "Жалоба должна содержать данные заявителя, подтверждение полномочий, ссылку на контент и объяснение нарушения."],
    "contact": ["Страница содержит юридическое название оператора, адрес, регистрационный номер, VAT и contact point.", "Запросы пользователей, privacy requests, legal notices и запросы органов власти маршрутизируются по отдельным email."],
    "consultant": ["Консультант действует как независимый подрядчик, а не сотрудник Confideline.com.", "Консультации должны оставаться entertainment/personal reflection; внешние платежи, гарантии результата и профессиональные советы запрещены."],
    "ethics": ["Кодекс требует честности, соблюдения границ консультации, конфиденциальности и запрета давления на пользователя.", "Консультант должен направлять пользователя к emergency/professional services при риске вреда или кризисной ситуации."],
    "kyc": ["AML/KYC применяется к консультантам, партнерам и получателям выплат.", "Платформа может запросить документы, налоговые данные, payout account и приостановить выплаты при fraud, sanctions, chargeback или KYC risk."],
    "earnings": ["Confideline.com не гарантирует консультантам или партнерам доход.", "Любые примеры дохода являются иллюстративными; консультант сам отвечает за налоги, разрешения и расходы."],
}

BODY_EN = {
    "legalHub": ["This page brings together all legal documents for Confideline.com.", "Users should have access to the terms, privacy, cookies, payments, refunds, community rules, disclaimer, safety, reports, appeals and operator contacts."],
    "about": ["Confideline.com is an international online platform for dating, communication and paid digital features.", "This page states the official domain, operator, support/privacy/legal contacts and a short description of paid features."],
    "terms": ["This document governs accounts, service use, user content, paid features, moderation, liability limits and governing law.", "Users must follow the Community Guidelines, avoid fake profiles, fraud and ban evasion."],
    "privacy": ["This document explains data categories, purposes, legal bases, recipients, retention, international transfers and user rights.", "It must identify the controller, DPO if applicable, supervisory authority and procedures for access, erasure, rectification, portability, objection and consent withdrawal."],
    "cookies": ["Cookies are divided into necessary, functional, analytics and marketing categories.", "Analytics and marketing cookies must remain off until consent; users must be able to accept, reject and change choices."],
    "payment": ["This document covers credits, premium, subscriptions, auto-renewal, payment providers, taxes, payment errors and fraud checks.", "Before payment, users see the product, price, currency, duration, cancellation rules and refund link."],
    "refund": ["This document covers refunds for digital features, credits, premium and consultations.", "Final wording for withdrawal rights and immediate digital performance must be reviewed by counsel in the selected EU jurisdiction."],
    "community": ["The rules prohibit fake profiles, fraud, harassment, threats, hate speech, phishing, spam, illegal content and IP infringement.", "Violations can be reported; moderation decisions can be appealed."],
    "disclaimer": ["Expert and entertainment features are for entertainment and personal reflection only.", "They are not medical, legal, financial, psychological, tax or emergency advice and do not guarantee outcomes."],
    "safety": ["Users should not share addresses, phone numbers, banking data, documents, passwords or one-time codes with strangers.", "Use Report and support for threats, extortion, phishing, suspicious links or money requests."],
    "antiScam": ["Common scams include requests for money, gift cards, crypto, investments, urgent transfers, external links and outside payments.", "Do not send money or documents, and keep evidence before reporting."],
    "notice": ["This policy covers notices about illegal content, scam, harassment, IP infringement and other violations.", "Decision notices should explain the measure, reason, rule and appeal path."],
    "ip": ["Rights holders can submit complaints about copyright, trademark or other IP infringement.", "The complaint should identify the claimant, authority, content URL and reason for infringement."],
    "contact": ["This page gives the legal operator name, address, registration number, VAT and contact point.", "User requests, privacy requests, legal notices and authority requests are routed to separate emails."],
    "consultant": ["The consultant acts as an independent contractor, not an employee of Confideline.com.", "Consultations must remain entertainment/personal reflection; outside payments, outcome guarantees and professional advice are prohibited."],
    "ethics": ["The code requires honesty, boundaries, confidentiality and no pressure on users.", "Consultants should direct users to emergency/professional services when there is risk of harm or crisis."],
    "kyc": ["AML/KYC applies to consultants, partners and payout recipients.", "The platform may request documents, tax data, payout account and pause payouts for fraud, sanctions, chargeback or KYC risk."],
    "earnings": ["Confideline.com does not guarantee income to consultants or partners.", "Any income examples are illustrative; consultants are responsible for taxes, permissions and expenses."],
}


def body_for(lang: str, key: str) -> list[str]:
    if lang == "ru":
        return BODY_RU[key]
    if lang == "en":
        return BODY_EN[key]
    doc_title = TITLES[lang][key]
    return [line.format(title=doc_title) for line in GENERIC_BODY[lang]]


def render_doc(locale: dict, slug: str, key: str) -> str:
    lang = locale["lang"]
    t = TITLES[lang][key]
    lt = LOCALE_TEXT[lang]
    parts = [
        f'<article class="legal-doc" lang="{html.escape(locale["code"])}" dir="{locale["dir"]}">',
        f"<h2>{html.escape(t)}</h2>",
        f"<p><strong>{html.escape(lt['status'])}</strong></p>",
        f"<p>{html.escape(lt['operator'])}</p>",
        f"<p>{html.escape(lt['age'])}</p>",
    ]
    for paragraph in body_for(lang, key):
        parts.append(f"<p>{html.escape(paragraph)}</p>")
    parts.extend(
        [
            "<h3>Required placeholders</h3>",
            "<ul>",
            "<li>[EU_COMPANY_LEGAL_NAME]</li>",
            "<li>[EU_COMPANY_ADDRESS]</li>",
            "<li>[EU_COMPANY_REG_NO]</li>",
            "<li>[EU_VAT_ID]</li>",
            "<li>[LEGAL_AGE_REQUIREMENT]</li>",
            "<li>[SUPPORT_EMAIL]</li>",
            "<li>[PRIVACY_EMAIL]</li>",
            "<li>[LEGAL_EMAIL]</li>",
            "<li>[EFFECTIVE_DATE]</li>",
            "</ul>",
            f"<p>{html.escape(lt['contact'])}</p>",
            f"<p><em>{html.escape(lt['review'])}</em></p>",
            "</article>",
        ]
    )
    return "\n".join(parts)


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    manifest = []
    for locale in LOCALES:
        locale_dir = ROOT / locale["code"]
        locale_dir.mkdir(parents=True, exist_ok=True)
        for slug, key in DOCS:
            (locale_dir / f"{slug}.html").write_text(render_doc(locale, slug, key), encoding="utf-8")
            manifest.append({"locale": locale["code"], "label": locale["label"], "slug": slug, "file": f"{locale['code']}/{slug}.html"})

    (ROOT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    with (ROOT / "coverage.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["locale", "label", "slug", "file"])
        writer.writeheader()
        writer.writerows(manifest)

    rows = []
    for locale in LOCALES:
        links = " · ".join(f'<a href="./{locale["code"]}/{slug}.html">{slug}</a>' for slug, _ in DOCS)
        rows.append(f"<tr><td>{locale['code']}</td><td>{html.escape(locale['label'])}</td><td>{links}</td></tr>")

    index = f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confideline.com | i18n legal docs package</title>
  <style>
    body{{font-family:Arial,sans-serif;margin:0;background:#f5f7fb;color:#1f2937}}
    .page{{max-width:1280px;margin:0 auto;padding:30px 18px 48px}}
    h1{{margin:0 0 8px}}
    .notice{{border-left:4px solid #0c6b64;background:#e6f3f1;padding:14px 16px;border-radius:6px;margin:18px 0}}
    table{{width:100%;border-collapse:collapse;background:#fff}}
    th,td{{border:1px solid #d8dee6;padding:10px;text-align:left;vertical-align:top}}
    th{{background:#eef2f7}}
    a{{color:#0c6b64;font-weight:600;text-decoration:none}}
    td:last-child{{line-height:1.8}}
    .meta{{color:#667085}}
  </style>
</head>
<body>
  <main class="page">
    <h1>Confideline.com: i18n legal docs package</h1>
    <p class="meta">Отдельные HTML-фрагменты для админского language picker: original, ar-AR, ca-ES, cs-CZ, de-DE, en-US, es-ES, fr-FR, it-IT, ru-RU, uk-UA.</p>
    <div class="notice">Это рабочий переводческий пакет. Для публикации нужны юридическая проверка, native review и замена всех placeholders.</div>
    <table>
      <thead><tr><th>Locale</th><th>Label</th><th>Documents</th></tr></thead>
      <tbody>
        {' '.join(rows)}
      </tbody>
    </table>
  </main>
</body>
</html>
"""
    (ROOT / "index.html").write_text(index, encoding="utf-8")
    print(f"Generated {len(manifest)} localized files in {ROOT}")


if __name__ == "__main__":
    main()
