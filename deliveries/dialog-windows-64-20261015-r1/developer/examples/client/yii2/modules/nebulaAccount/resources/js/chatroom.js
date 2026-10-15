(() => {
  const root = document.querySelector('[data-nebula-chatroom]');
  if (!root) return;
  root.querySelectorAll('.c76-chat-actions[aria-label]').forEach((group) => group.setAttribute('role', 'group'));

  const assetBase = root.dataset.assetBase || '';
  const compact = window.matchMedia('(max-width: 991.98px)');
  const menu = root.querySelector('.c76-menu');
  const frame = root.querySelector('.c76-frame');
  const workspace = root.querySelector('.c76-workspace');
  const threadPanel = root.querySelector('.c76-thread-panel');
  const messagesNode = root.querySelector('[data-thread-messages]');
  const readyCard = root.querySelector('[data-ready-card]');
  const consultationControls = Array.from(root.querySelectorAll('[data-consultation-control]'));
  const input = root.querySelector('[data-composer-input]');
  const inputbar = root.querySelector('.c76-inputbar');
  const iconStrip = root.querySelector('.c76-inputbar__icons');
  const sendButton = root.querySelector('[data-semantic-control="send-message"]');
  const sendStateImage = sendButton?.querySelector('[data-send-state-image]');
  const live = root.querySelector('[data-c76-live-status]');
  const toast = root.querySelector('[data-action-toast]');
  const backButton = root.querySelector('[data-action="back-to-list"]');
  const searchInput = root.querySelector('[data-conversation-search]');
  const searchTrigger = root.querySelector('[data-conversation-search-trigger]');
  const searchShell = searchTrigger?.closest('.c76-search');
  const searchClear = root.querySelector('[data-conversation-search-clear]');
  const searchResults = root.querySelector('[data-conversation-results]');
  const filterToggle = root.querySelector('[data-conversation-filter-toggle]');
  const filterMenu = root.querySelector('[data-conversation-filter-menu]');
  const rows = Array.from(root.querySelectorAll('[data-conversation-row]'));
  const conversationList = root.querySelector('.c76-menu-list');
  const conversationScrollbar = root.querySelector('.c76-scrollbar');
  const conversationThumb = conversationScrollbar?.querySelector('span');
  const threadSearch = root.querySelector('[data-chat-search-input]');
  const threadSearchCount = root.querySelector('[data-chat-search-count]');
  const replyPreview = root.querySelector('[data-reply-preview]');
  const replyCopy = root.querySelector('[data-reply-copy]');
  const editPreview = root.querySelector('[data-edit-preview]');
  const editCopy = root.querySelector('[data-edit-copy]');
  const attachmentTray = root.querySelector('[data-attachment-tray]');
  const attachmentInput = root.querySelector('[data-attachment-input]');
  const pinnedBanner = root.querySelector('[data-pinned-banner]');
  const pinnedTitle = root.querySelector('[data-pinned-title]');
  const pinnedCount = root.querySelector('[data-pinned-count]');
  const pinnedCopy = root.querySelector('[data-pinned-copy]');
  const pinnedOpen = root.querySelector('[data-pinned-open]');
  const pinnedPrevious = root.querySelector('[data-pinned-prev]');
  const pinnedNext = root.querySelector('[data-pinned-next]');
  const voiceRecorder = root.querySelector('[data-voice-recorder]');
  const voiceTime = root.querySelector('[data-voice-time]');
  const voicePause = root.querySelector('[data-voice-pause]');
  const savedView = root.querySelector('[data-saved-view]');
  const savedList = root.querySelector('[data-saved-list]');
  const savedSearch = root.querySelector('[data-saved-search]');
  const savedSearchToggle = root.querySelector('[data-saved-search-toggle]');
  const savedSearchInput = root.querySelector('[data-saved-search-input]');
  const savedSearchClear = root.querySelector('[data-saved-search-clear]');
  const mediaViewer = root.querySelector('[data-media-viewer]');
  const mediaStage = root.querySelector('[data-media-viewer-stage]');
  const mediaTitle = root.querySelector('[data-media-viewer-title]');
  const suggestions = Array.from(root.querySelectorAll('.c76-suggestion-chip'));
  const suggestionRail = root.querySelector('.c76-suggestions [role="listbox"]');
  const suggestionNav = Array.from(root.querySelectorAll('[data-suggestion-nav]'));
  let mediaOpener = null;
  let popoverOpener = null;
  let messageCounter = 100;
  let voiceTimer = null;
  let voiceSeconds = 0;
  let voicePaused = false;

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const announce = (message) => { if (live) live.textContent = message; };
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 2200);
  };

  const rowProfiles = {};
  rows.forEach((row) => {
    const name = row.dataset.conversationName || '';
    rowProfiles[name] = {
      avatar: row.querySelector('.c76-thread__avatar:not(.c76-thread__avatar--saved)')?.src || `${assetBase}/images/chatroom/margo-header.webp`,
      unread: Number(row.dataset.conversationUnread || 0),
      presence: row.dataset.conversationPresence || (row.dataset.conversationOnline === 'true' ? 'Online' : 'Offline'),
      online: row.dataset.conversationOnline === 'true',
      favorite: row.dataset.conversationFavorite === 'true',
      muted: row.dataset.conversationMuted === 'true',
    };
  });

  const photoAstrology = `${assetBase}/images/chat-source/active-thread-rectangle46.png`;
  const photoCouple = `${assetBase}/images/chat-source/active-thread-rectangle47.png`;
  const photoCoupleLaptop = `${assetBase}/images/chat-source/active-thread-rectangle48.png`;
  const videoPoster = `${assetBase}/images/chat-source/active-thread-rectangle49.png`;
  // Exact Figma export for every play affordance; no Unicode or CSS-drawn substitute.
  const playAsset = `${assetBase}/images/chat-source/active-thread-play-sound.svg`;
  const voiceEmojiAsset = `${assetBase}/images/chat-source/active-thread-emoji.svg`;
  const playAssetMarkup = (className = 'c76-play-asset') => `<img class="${className}" src="${escapeHtml(playAsset)}" alt="" aria-hidden="true">`;
  const make = (from, text, options = {}) => ({ id: `m${++messageCounter}`, from, text, time: options.time || 'Now', deliveryState: from === 'me' ? 'read' : null, ...options });

  const conversationSeed = {
    'Margo Lover': {
      presence: 'Offline', rate: '45 credits/min', favorite: true, topic: 'Love & astrology',
      // C76 default state "selected_empty": three static welcome bubbles, no
      // pinned banner, reactions, media, voice notes, or delivery metadata.
      messages: [
        make('expert', 'Hi! 💖 Would you like to know how your inner astrological map can answer the questions that lay dormant within? 🌌 Chat with me today!', { welcome: true }),
        make('expert', "Greetings! If you really want to do something, you'll find a way. If you don't, you'll find an excuse.  Let's talk about it! Courage is the most important of all the virtues because without courage, you can't practice any other virtue consistently.  Would you like a reading ?:)", { welcome: true }),
        make('expert', "Greetings! If you really want to do something, you'll find a way. If you don't, you'll find an excuse.  Let's talk about it! Courage is the most important of all the virtues because without courage, you can't practice any other virtue consistently.  Would you like a reading ?:)", { welcome: true }),
      ],
    },
    'Miss Shaya': {
      presence: 'Online', rate: '38 credits/min', favorite: true, topic: 'Tarot & career',
      messages: [
        make('expert', 'Welcome back. I pulled The Chariot for your career question — momentum is available, but only if you choose one direction.', { time: '12:42 PM', pinned: true }),
        make('me', 'I am choosing between staying in my current role and accepting a new offer.', { time: '12:45 PM' }),
        make('expert', 'The new offer carries growth, while the current role carries familiarity. Here is a short visual reading of the spread.', { time: '12:48 PM', media: { kind: 'video', src: videoPoster, title: 'Three-card career reading', duration: '0:34' } }),
        make('me', 'Hi! 💖 Would you like to know how your inner astrological map can answer the questions that lay dormant within? 🌌 Chat with me today!', { time: '1:12 AM', media: { kind: 'bundle', title: 'Shared reading', items: [{ kind: 'photo', src: photoCouple, title: 'Shared relationship photo' }, { kind: 'photo', src: photoCoupleLaptop, title: 'Relationship reading' }, { kind: 'video', src: videoPoster, title: 'Mountain reading', duration: '0:20' }] }, deliveryState: 'delivered' }),
        make('expert', 'Notice which option gives you energy when you imagine an ordinary Monday, not only the first exciting week.', { time: '12:49 PM', reactions: { '👍': 1 } }),
      ],
    },
    'Celesta Violet': {
      presence: 'Away', rate: '42 credits/min', topic: 'Relationship reading',
      messages: [
        make('expert', 'Your question is not only “will they return?” — it is also “would the same relationship be enough for me now?”', { time: 'Yesterday' }),
        make('me', 'That is exactly what I have been avoiding.', { time: 'Yesterday', reactions: { '💖': 1 } }),
        make('expert', 'Write down three conditions that would make reconnection healthy. This turns waiting into a decision you can own.', { time: 'Yesterday', pinned: true }),
        make('me', 'This photo reminds me of the future I imagined.', { time: 'Yesterday', media: { kind: 'photo', src: photoCouple, title: 'Shared relationship photo' } }),
      ],
    },
    'Medium Mark': {
      presence: 'Online', rate: '40 credits/min', topic: 'Dream interpretation',
      messages: [
        make('me', 'I keep dreaming about the same locked blue door.', { time: '3:21 PM' }),
        make('expert', 'A repeated door often represents a choice that feels unavailable. Blue points to truth and communication. Who do you need to speak honestly with?', { time: '3:24 PM', pinned: true }),
        make('me', 'Probably my brother. We have not spoken in months.', { time: '3:27 PM' }),
        make('expert', 'Then the dream may be rehearsing the moment before contact. Start with a simple message, not the whole history.', { time: '3:28 PM', voice: { duration: '0:26' } }),
      ],
    },
    'Odesa Pomtekyaro': {
      presence: 'Online', rate: '36 credits/min', topic: 'Compatibility',
      messages: [
        make('expert', 'I compared both birth dates. Your strongest point is shared curiosity; the difficult point is timing — one decides quickly, the other needs certainty.', { time: 'Oct 13' }),
        make('me', 'How can we make decisions without one of us feeling pressured?', { time: 'Oct 13' }),
        make('expert', 'Agree on a decision window in advance: first feelings, then facts, then a final check-in. Structure can protect tenderness.', { time: 'Oct 13', reactions: { '✨': 2 } }),
      ],
    },
    'Averi Palmer': {
      presence: 'Online', rate: '47 credits/min', topic: 'Life path',
      messages: [
        make('expert', 'Your life-path cycle is moving from preparation into visibility. The next step should be small enough to do this week and public enough to create momentum.', { time: 'Aug 26', pinned: true }),
        make('me', 'I could publish the first lesson from the course I have been building.', { time: 'Aug 26' }),
        make('expert', 'Perfect. Publish one useful lesson, invite one honest response, and let that response shape the second.', { time: 'Aug 26', reactions: { '💜': 1, '👍': 1 } }),
      ],
    },
  };

  const conversations = rows
    .filter((row) => !row.classList.contains('c76-thread--saved') && row.getAttribute('aria-disabled') !== 'true')
    .map((row) => {
      const name = row.dataset.conversationName;
      const seed = conversationSeed[name] || {
        presence: rowProfiles[name]?.online ? 'Online' : 'Offline', rate: '40 credits/min', topic: 'Personal reading',
        messages: [
          make('expert', `Hi, I’m ${name}. Tell me what feels most important today, and we can look at it together.`, { time: row.querySelector('em')?.textContent || 'Recent' }),
          make('me', 'I would like a clear perspective on the next step.', { time: 'Recent' }),
          make('expert', 'Start with the part you can influence this week. Clarity grows when a question becomes one concrete choice.', { time: 'Recent' }),
        ],
      };
      return {
        id: slug(name), name, row, avatar: rowProfiles[name]?.avatar, unread: rowProfiles[name]?.unread || 0,
        presence: rowProfiles[name]?.presence || seed.presence || 'Offline',
        online: rowProfiles[name] ? rowProfiles[name].presence === 'Online' : seed.presence === 'Online', muted: rowProfiles[name]?.muted || false,
        ...seed,
        presence: rowProfiles[name]?.presence || seed.presence || 'Offline',
        favorite: rowProfiles[name]?.favorite ?? seed.favorite ?? false, draft: '', draftSelection: null, draftInputScrollTop: 0, replyId: null, editId: null, preEditDraft: '', attachment: null, pinnedId: null, messageScroll: null,
      };
    });
  const seedSavedMessages = conversations.slice(0, 2).map((conversation, index) => {
    const message = conversation.messages[index === 0 ? 0 : Math.min(1, conversation.messages.length - 1)];
    return { key: `${conversation.id}:${message.id}`, conversation: conversation.name, conversationId: conversation.id, messageId: message.id, copy: message.text || message.media?.title || 'Media message', time: message.time };
  });
  const state = { activeId: slug('Margo Lover'), filter: 'all', saved: seedSavedMessages, search: '' };
  const activeConversation = () => conversations.find((conversation) => conversation.id === state.activeId) || conversations[0];
  const savedBookmarkAsset = `${assetBase}/images/helper-bot/bookmark-bot.svg`;
  const savedEntry = (conversation, message) => state.saved.find((item) => item.conversationId === conversation.id && item.messageId === message.id);
  const isMessageSaved = (conversation, message) => Boolean(savedEntry(conversation, message));

  const closePopovers = (restoreFocus = false) => {
    root.querySelectorAll('.c76-chat-search,.c76-chat-more-menu,.c76-message-menu,.c76-emoji-picker,.c76-attachment-menu,.c76-filter-menu,.c76-account-menu').forEach((node) => { node.hidden = true; });
    root.querySelectorAll('.c76-reaction-picker').forEach((node) => node.remove());
    root.querySelectorAll('[aria-expanded="true"][data-chat-action],[data-message-action="more"],[data-composer-action],[data-conversation-filter-toggle],[data-account-menu-toggle]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
    if (restoreFocus) popoverOpener?.focus();
    popoverOpener = null;
  };

  const reactionQuick = ['❤️', '👍', '🔥', '🎉', '😍', '😡', '🤯'];
  const reactionAll = ['❤️', '👍', '🔥', '🎉', '😍', '😡', '🤯', '😂', '😮', '👏', '👎', '🥰', '🙏', '🤔', '😢', '😎', '💩', '🤝', '💜', '✨', '💖', '🌟', '🙌', '🎈', '💯', '🥳', '😴', '🤗', '😇', '🤩', '💋', '👋', '🫶', '✅', '❌', '☀️', '🌙', '🍀', '🎁', '🚀', '💡', '❤️‍🔥', '🦄', '🐶', '🐱', '🌈', '☕', '🍕'];
  const reactionGroups = {
    recent: reactionQuick,
    smileys: ['😂', '😮', '👏', '👎', '🥰', '🙏', '🤔', '😢', '😎', '💩', '🤝', '🤗', '😇', '🤩', '💋', '👋', '🫶', '💯', '🥳', '😴'],
    symbols: ['💜', '✨', '💖', '🌟', '🙌', '🎈', '✅', '❌', '☀️', '🌙', '🍀', '🎁', '🚀', '💡', '❤️‍🔥', '🦄', '🐶', '🐱', '🌈', '☕', '🍕'],
  };
  const reactionKeywords = {
    '❤️': 'heart love red', '👍': 'thumb up like', '🔥': 'fire', '🎉': 'party', '😍': 'love eyes', '😡': 'angry', '🤯': 'mind blown',
    '😂': 'laugh joy', '😮': 'surprise wow', '👏': 'clap', '👎': 'thumb down', '🥰': 'love smile', '🙏': 'pray thanks', '🤔': 'think', '😢': 'sad cry',
    '😎': 'cool', '💩': 'poop', '🤝': 'deal', '💜': 'purple heart', '✨': 'sparkles', '💖': 'heart', '🌟': 'star', '🙌': 'celebrate', '🎈': 'balloon',
    '💯': 'hundred perfect', '🥳': 'party', '😴': 'sleep', '🤗': 'hug', '😇': 'angel', '🤩': 'star eyes', '💋': 'kiss', '👋': 'wave', '🫶': 'heart hands',
    '✅': 'check done', '❌': 'cross no', '☀️': 'sun', '🌙': 'moon', '🍀': 'clover luck', '🎁': 'gift', '🚀': 'rocket', '💡': 'idea', '❤️‍🔥': 'heart fire',
    '🦄': 'unicorn', '🐶': 'dog', '🐱': 'cat', '🌈': 'rainbow', '☕': 'coffee', '🍕': 'pizza',
  };

  const changeReaction = (message, emoji) => {
    message.reactions ||= {};
    const previous = message.userReaction || null;
    if (previous === emoji) {
      message.reactions[emoji] = Math.max(0, Number(message.reactions[emoji] || 0) - 1);
      if (!message.reactions[emoji]) delete message.reactions[emoji];
      message.userReaction = null;
      return false;
    }
    if (previous) {
      message.reactions[previous] = Math.max(0, Number(message.reactions[previous] || 0) - 1);
      if (!message.reactions[previous]) delete message.reactions[previous];
    }
    message.reactions[emoji] = Number(message.reactions[emoji] || 0) + 1;
    message.userReaction = emoji;
    return true;
  };

  const openReactionPicker = (article, opener, message) => {
    closePopovers();
    const picker = document.createElement('div');
    picker.className = 'c76-reaction-picker';
    picker.setAttribute('role', 'dialog');
    picker.setAttribute('aria-label', 'Add reaction');
    picker.innerHTML = `<div class="c76-reaction-picker__quick">${reactionQuick.map((emoji) => `<button type="button" data-picker-reaction="${escapeHtml(emoji)}" aria-label="React ${escapeHtml(emoji)}">${emoji}</button>`).join('')}<button type="button" class="c76-reaction-picker__more" data-reaction-more aria-label="More reactions">⌄</button></div><div class="c76-reaction-picker__full" hidden><header><b>Reactions</b><button type="button" data-reaction-close aria-label="Close reactions">×</button></header><div class="c76-reaction-picker__categories"><button type="button" data-reaction-category="all" aria-label="All reactions" aria-pressed="true">◷</button><button type="button" data-reaction-category="recent" aria-label="Recent reactions" aria-pressed="false">↶</button><button type="button" data-reaction-category="smileys" aria-label="Smileys" aria-pressed="false">☺</button><button type="button" data-reaction-category="symbols" aria-label="Symbols" aria-pressed="false">♡</button><input type="search" placeholder="Search" aria-label="Search reactions" data-reaction-search></div><div class="c76-reaction-picker__grid">${reactionAll.map((emoji) => `<button type="button" data-picker-reaction="${escapeHtml(emoji)}" data-reaction-keywords="${escapeHtml(reactionKeywords[emoji] || '')}" aria-label="React ${escapeHtml(emoji)}">${emoji}</button>`).join('')}</div></div>`;
    root.append(picker);
    popoverOpener = opener;
    opener.setAttribute('aria-expanded', 'true');
    const more = picker.querySelector('[data-reaction-more]');
    const full = picker.querySelector('.c76-reaction-picker__full');
    const first = picker.querySelector('[data-picker-reaction]');
    const search = picker.querySelector('[data-reaction-search]');
    const gridButtons = Array.from(picker.querySelectorAll('.c76-reaction-picker__grid [data-picker-reaction]'));
    const applyReactionFilter = () => {
      const category = picker.dataset.reactionCategory || 'all';
      const query = (search?.value || '').trim().toLowerCase();
      const allowed = category === 'all' ? reactionAll : (reactionGroups[category] || reactionAll);
      gridButtons.forEach((button) => {
        const emoji = button.dataset.pickerReaction;
        const haystack = `${emoji} ${button.dataset.reactionKeywords || ''}`.toLowerCase();
        button.hidden = !allowed.includes(emoji) || Boolean(query && !haystack.includes(query));
      });
      picker.querySelectorAll('[data-reaction-category]').forEach((button) => button.setAttribute('aria-pressed', button.dataset.reactionCategory === category ? 'true' : 'false'));
    };
    first?.focus();
    const positionPicker = () => {
      const anchor = article.getBoundingClientRect();
      const bounds = picker.getBoundingClientRect();
      const gap = 8;
      const left = Math.min(Math.max(8, anchor.right - bounds.width), Math.max(8, window.innerWidth - bounds.width - 8));
      const above = anchor.top - bounds.height - gap;
      const below = anchor.bottom + gap;
      const top = above >= 8 ? above : Math.min(Math.max(8, below), Math.max(8, window.innerHeight - bounds.height - 8));
      picker.style.left = `${left}px`;
      picker.style.top = `${top}px`;
      picker.style.right = 'auto';
      picker.style.bottom = 'auto';
    };
    requestAnimationFrame(positionPicker);
    more?.addEventListener('click', () => { full.hidden = !full.hidden; requestAnimationFrame(positionPicker); (full.hidden ? first : full.querySelector('[data-picker-reaction]'))?.focus(); });
    picker.querySelector('[data-reaction-close]')?.addEventListener('click', () => closePopovers(true));
    picker.querySelectorAll('[data-reaction-category]').forEach((button) => button.addEventListener('click', () => {
      picker.dataset.reactionCategory = button.dataset.reactionCategory;
      if (search) search.value = '';
      applyReactionFilter();
      full.querySelector('.c76-reaction-picker__grid [data-picker-reaction]:not([hidden])')?.focus();
    }));
    picker.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { event.preventDefault(); closePopovers(true); return; }
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      if (!event.target.matches('[data-picker-reaction]')) return;
      const buttons = Array.from(picker.querySelectorAll('[data-picker-reaction]:not([hidden])')).filter((button) => !button.closest('.c76-reaction-picker__full[hidden]'));
      if (!buttons.length) return;
      const current = buttons.indexOf(document.activeElement);
      const columns = event.key === 'ArrowUp' || event.key === 'ArrowDown' ? 7 : 1;
      let next = current < 0 ? 0 : current;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (event.key === 'ArrowLeft') next = (next - 1 + buttons.length) % buttons.length;
      if (event.key === 'ArrowRight') next = (next + 1) % buttons.length;
      if (event.key === 'ArrowUp') next = (next - columns + buttons.length) % buttons.length;
      if (event.key === 'ArrowDown') next = (next + columns) % buttons.length;
      event.preventDefault(); buttons[next]?.focus();
    });
    search?.addEventListener('input', applyReactionFilter);
    picker.querySelectorAll('[data-picker-reaction]').forEach((button) => button.addEventListener('click', () => {
      const selected = button.dataset.pickerReaction;
      changeReaction(message, selected);
      renderMessages({ keepScroll: true });
      announce(`${selected} reaction added locally. Not delivered to the host.`);
      const nextArticle = messagesNode?.querySelector(`[data-message-id="${CSS.escape(message.id)}"]`);
      closePopovers();
      nextArticle?.querySelector('[data-reaction]')?.focus();
    }));
  };

  const updateComposer = () => {
    const conversation = activeConversation();
    if (!input || !inputbar || !iconStrip || !sendButton) return;
    conversation.draft = input.value;
    const composerMaxTextHeight = 88;
    input.style.height = 'auto';
    // Chromium keeps an empty textarea's intrinsic scrollHeight at two rows
    // on the narrow composer. Keep the idle Telegram-like single-line state,
    // while preserving the real measured height as soon as the user types.
    const contentHeight = input.value.length === 0
      ? 16
      : Math.min(input.scrollHeight, composerMaxTextHeight);
    input.style.height = `${contentHeight}px`;
    input.style.overflowY = input.scrollHeight > composerMaxTextHeight ? 'auto' : 'hidden';
    if (input.style.overflowY === 'auto') input.scrollTop = input.scrollHeight;
    const ready = input.value.trim().length > 0 || Boolean(conversation.attachment);
    const multiline = input.value.includes('\n') || input.scrollHeight > 43;
    sendButton.disabled = !ready;
    sendButton.setAttribute('aria-disabled', ready ? 'false' : 'true');
    sendButton.setAttribute('aria-label', conversation.editId ? 'Save message changes' : 'Send message');
    const stateName = ready ? (multiline ? 'multiline' : 'text_ready') : 'empty_unactive';
    iconStrip.dataset.composerState = stateName;
    const imageState = stateName === 'multiline' ? 'multiline' : (stateName === 'text_ready' ? 'ready' : 'empty');
    const key = `src${imageState[0].toUpperCase()}${imageState.slice(1)}`;
    if (sendStateImage?.dataset[key]) { sendStateImage.src = sendStateImage.dataset[key]; sendStateImage.dataset.state = imageState; }
    inputbar.classList.toggle('is-multiline', multiline);
    root.dataset.composerState = stateName;
  };

  const renderReply = () => {
    const conversation = activeConversation();
    const message = conversation.messages.find((item) => item.id === conversation.replyId);
    if (!replyPreview || !replyCopy) return;
    replyPreview.hidden = !message;
    replyCopy.textContent = message ? (message.text || message.media?.title || 'Media message').slice(0, 92) : '';
  };

  const renderEdit = () => {
    const conversation = activeConversation();
    const message = conversation.messages.find((item) => item.id === conversation.editId && item.from === 'me');
    if (!editPreview || !editCopy) return;
    editPreview.hidden = !message;
    editCopy.textContent = message ? (message.text || 'Message caption').slice(0, 92) : '';
    inputbar?.classList.toggle('is-editing', Boolean(message));
  };

  const deliveryMarkup = (message) => {
    if (message.from !== 'me') return '';
    const stateName = ['sent', 'delivered', 'read'].includes(message.deliveryState) ? message.deliveryState : 'sent';
    const label = stateName[0].toUpperCase() + stateName.slice(1);
    return `<span class="c76-message__status" data-message-status data-status="${stateName}" data-local-preview="true" aria-label="${label}; local preview, not a server receipt" title="Local preview — not a server receipt"><span>${label}</span><svg aria-hidden="true" focusable="false"><use href="${assetBase}/images/chatroom/message-status-sprite.svg#${stateName}"></use></svg></span>`;
  };

  const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes) || bytes < 1024) return `${bytes || 0} B`;
    const units = ['KB', 'MB', 'GB'];
    let value = bytes / 1024;
    let unit = units[0];
    for (let index = 1; value >= 1024 && index < units.length; index += 1) { value /= 1024; unit = units[index]; }
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
  };
  const disposeAttachmentPreview = (attachment) => {
    if (attachment?.kind === 'bundle') {
      (attachment.items || []).forEach((item) => disposeAttachmentPreview(item));
      return;
    }
    if (attachment?.localObjectUrl && attachment.src?.startsWith('blob:')) URL.revokeObjectURL(attachment.src);
  };
  const renderAttachment = () => {
    const attachment = activeConversation().attachment;
    if (!attachmentTray) return;
    attachmentTray.replaceChildren();
    attachmentTray.hidden = !attachment;
    if (!attachment) return;
    const preview = document.createElement('div');
    preview.className = `c76-attachment-preview${attachment.kind === 'bundle' ? ' c76-attachment-preview--bundle' : ''}`;
    const thumb = document.createElement('span');
    thumb.className = 'c76-attachment-preview__thumb';
    thumb.setAttribute('aria-hidden', 'true');
    if (attachment.kind === 'bundle') {
      (attachment.items || []).slice(0, 3).forEach((item) => { const image = item.kind === 'video' ? document.createElement('video') : document.createElement('img'); image.src = item.src; image.alt = ''; if (item.kind === 'video') { image.muted = true; image.preload = 'metadata'; image.playsInline = true; } thumb.append(image); });
    } else if (attachment.kind === 'photo' && attachment.src) {
      const image = document.createElement('img'); image.src = attachment.src; image.alt = ''; thumb.append(image);
    } else if (attachment.kind === 'video' && attachment.src) {
      const video = document.createElement('video'); video.src = attachment.src; video.muted = true; video.preload = 'metadata'; video.playsInline = true; thumb.append(video);
    } else {
      if (attachment.kind === 'video') thumb.innerHTML = playAssetMarkup('c76-attachment-preview__play');
      else thumb.textContent = attachment.kind === 'voice' ? '🎙' : '📎';
    }
    const info = document.createElement('span'); info.className = 'c76-attachment-preview__info';
    const title = document.createElement('b'); title.textContent = attachment.kind === 'bundle' ? `Media album · ${(attachment.items || []).length} items` : (attachment.title || 'Selected file');
    const meta = document.createElement('small'); meta.textContent = `${attachment.kind === 'bundle' ? 'Photo and video package' : attachment.kind === 'photo' ? 'Photo' : attachment.kind === 'video' ? 'Video' : attachment.kind === 'voice' ? 'Voice preview' : 'Document'} · ${formatBytes(attachment.size)} · local preview`;
    const boundary = document.createElement('em'); boundary.textContent = 'Not uploaded';
    info.append(title, meta, boundary);
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'c76-attachment-preview__remove'; remove.setAttribute('aria-label', `Remove ${attachment.title || 'attachment'}`); remove.textContent = '×';
    remove.addEventListener('click', () => {
      const current = activeConversation().attachment;
      activeConversation().attachment = null;
      disposeAttachmentPreview(current);
      renderAttachment(); updateComposer(); input?.focus(); announce('Attachment removed.');
    });
    preview.append(thumb, info, remove);
    attachmentTray.append(preview);
  };

  const mediaMarkup = (media) => {
    if (!media) return '';
    if (media.kind === 'bundle') {
      const items = Array.isArray(media.items) ? media.items.slice(0, 3) : [];
      return `<div class="c76-media-bundle" role="group" aria-label="Media album">${items.map((item, index) => {
        const isVideo = item.kind === 'video';
        const visual = isVideo && item.localObjectUrl ? `<video src="${escapeHtml(item.src)}" muted preload="metadata" playsinline></video>` : `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title || 'Media item')}">`;
        return `<button class="c76-media-bundle__item${index === 0 ? ' c76-media-bundle__item--hero' : ''}${isVideo ? ' c76-media-bundle__item--video' : ''}" type="button" data-media-open="${isVideo ? 'video' : 'photo'}" data-media-index="${index}" aria-label="${isVideo ? 'Preview' : 'Open'} ${escapeHtml(item.title || 'media item')}">${visual}${isVideo ? playAssetMarkup('c76-media-bundle__play') : ''}</button>`;
      }).join('')}</div>`;
    }
    if (media.kind === 'photo') return `<button class="c76-media-card" type="button" data-media-open="photo" aria-label="Open ${escapeHtml(media.title)}"><img src="${escapeHtml(media.src)}" alt="${escapeHtml(media.title)}"><span>Open photo${media.localObjectUrl ? ' · local' : ''}</span></button>`;
    if (media.kind === 'video') {
      const visual = media.localObjectUrl ? `<video src="${escapeHtml(media.src)}" muted preload="metadata" playsinline></video>` : `<img src="${escapeHtml(media.src)}" alt="">`;
      return `<button class="c76-media-card c76-media-card--video" type="button" data-media-open="video" aria-label="Preview ${escapeHtml(media.title)}">${visual}${playAssetMarkup('c76-media-card__play')}<small>${escapeHtml(media.duration || 'Video')} · ${media.localObjectUrl ? 'local preview' : 'source preview'}</small></button>`;
    }
    return `<div class="c76-file-card"><span>📎</span><div><b>${escapeHtml(media.title)}</b><small>${media.localObjectUrl ? `${escapeHtml(formatBytes(media.size))} · local preview · not uploaded` : 'Local attachment preview'}</small></div></div>`;
  };

  let suppressMessageScrollCapture = false;
  const getMessageScrollSnapshot = () => {
    if (!messagesNode) return null;
    const box = messagesNode.getBoundingClientRect();
    const visible = Array.from(messagesNode.querySelectorAll('[data-message-id]')).find((message) => {
      const rect = message.getBoundingClientRect();
      return rect.bottom > box.top + 1 && rect.top < box.bottom - 1;
    });
    return {
      top: messagesNode.scrollTop,
      bottom: Math.max(0, messagesNode.scrollHeight - messagesNode.clientHeight - messagesNode.scrollTop),
      anchorId: visible?.dataset.messageId || null,
      anchorOffset: visible ? visible.getBoundingClientRect().top - box.top : 0,
    };
  };
  const rememberMessageScroll = () => {
    if (suppressMessageScrollCapture) return;
    const conversation = activeConversation();
    const snapshot = getMessageScrollSnapshot();
    if (conversation && snapshot) conversation.messageScroll = snapshot;
  };
  const rememberComposerState = ({ force = false } = {}) => {
    const conversation = activeConversation();
    if (!conversation || !input || (!force && document.activeElement !== input)) return;
    conversation.draft = input.value;
    conversation.draftSelection = {
      start: input.selectionStart,
      end: input.selectionEnd,
      direction: input.selectionDirection || 'none',
    };
    conversation.draftInputScrollTop = input.scrollTop;
  };
  const restoreComposerState = (conversation) => {
    const selection = conversation?.draftSelection;
    if (!input || !selection || input.value !== conversation.draft) return;
    const start = Math.max(0, Math.min(input.value.length, Number(selection.start)));
    const end = Math.max(start, Math.min(input.value.length, Number(selection.end)));
    const previousFocus = document.activeElement;
    const restoreFocus = previousFocus && previousFocus !== input;
    if (restoreFocus) input.focus({ preventScroll: true });
    try { input.setSelectionRange(start, end, selection.direction || 'none'); } catch (_) { /* textarea may be temporarily inert */ }
    input.scrollTop = Math.max(0, Number(conversation.draftInputScrollTop) || 0);
    if (restoreFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
  };
  const setMessageScrollTop = (top) => {
    if (!messagesNode) return;
    const max = Math.max(0, messagesNode.scrollHeight - messagesNode.clientHeight);
    const previousBehavior = messagesNode.style.scrollBehavior;
    // Switching conversations should restore the exact reading position, not
    // animate from the previous thread's bottom. Keep user scroll animations
    // untouched; this one-frame override is only for deterministic restoration.
    messagesNode.style.scrollBehavior = 'auto';
    messagesNode.scrollTop = Math.min(max, Math.max(0, Number.isFinite(Number(top)) ? Number(top) : 0));
    if (previousBehavior) messagesNode.style.scrollBehavior = previousBehavior;
    else messagesNode.style.removeProperty('scroll-behavior');
  };
  const restoreMessageScroll = (conversation) => {
    const saved = conversation?.messageScroll;
    if (!messagesNode || !saved) return false;
    const box = messagesNode.getBoundingClientRect();
    const anchor = saved.anchorId
      ? Array.from(messagesNode.querySelectorAll('[data-message-id]')).find((message) => message.dataset.messageId === saved.anchorId)
      : null;
    let target = Number(saved.top);
    if (Number(saved.bottom) < 48) {
      target = messagesNode.scrollHeight;
    } else if (anchor) {
      target = messagesNode.scrollTop + (anchor.getBoundingClientRect().top - box.top - Number(saved.anchorOffset || 0));
    } else if (Number.isFinite(Number(saved.bottom))) {
      target = messagesNode.scrollHeight - messagesNode.clientHeight - Number(saved.bottom);
    }
    setMessageScrollTop(target);
    return true;
  };

  const renderMessages = ({ keepScroll = false, restoreScroll = false } = {}) => {
    const conversation = activeConversation();
    if (!messagesNode) return;
    const priorBottom = messagesNode.scrollHeight - messagesNode.scrollTop - messagesNode.clientHeight;
    messagesNode.innerHTML = conversation.messages.map((message) => messageMarkup(conversation, message)).join('');
    // Default "selected_empty" state shows the ready card under the static
    // welcome bubbles; it hides once the thread holds real conversation turns.
    readyCard.hidden = conversation.messages.some((message) => !message.welcome);
    if (keepScroll) messagesNode.scrollTop = Math.max(0, messagesNode.scrollHeight - messagesNode.clientHeight - priorBottom);
    else messagesNode.scrollTop = messagesNode.scrollHeight;
    renderPinned();
    if (!keepScroll) messagesNode.scrollTo({ top: messagesNode.scrollHeight, behavior: 'auto' });
    if (restoreScroll) {
      suppressMessageScrollCapture = true;
      restoreMessageScroll(conversation);
      suppressMessageScrollCapture = false;
      rememberMessageScroll();
    }
    applyThreadSearch();
  };

  const renderPinned = () => {
    const conversation = activeConversation();
    const pinned = conversation.messages.filter((message) => message.pinned);
    if (!pinnedBanner || !pinnedCopy) return;
    const currentIndex = Math.max(0, pinned.findIndex((message) => message.id === conversation.pinnedId));
    const current = pinned[currentIndex] || null;
    conversation.pinnedId = current?.id || null;
    pinnedBanner.hidden = !current;
    pinnedBanner.dataset.pinnedMessageId = current?.id || '';
    if (pinnedTitle) pinnedTitle.textContent = pinned.length > 1 ? 'Pinned messages' : 'Pinned message';
    if (pinnedCount) pinnedCount.textContent = pinned.length > 1 ? `${currentIndex + 1} of ${pinned.length}` : '';
    pinnedCopy.textContent = current ? (current.text || current.media?.title || 'Media message').slice(0, 110) : '';
    [pinnedPrevious, pinnedNext].forEach((button) => {
      if (!button) return;
      button.hidden = pinned.length < 2;
      button.disabled = pinned.length < 2;
    });
    if (pinnedOpen) pinnedOpen.setAttribute('aria-label', current ? `Open pinned message ${currentIndex + 1} of ${pinned.length}` : 'Open pinned message');
  };

  const showPinnedMessage = () => {
    const messageId = pinnedBanner?.dataset.pinnedMessageId;
    if (!messageId || !messagesNode) return;
    const messageNode = Array.from(messagesNode.querySelectorAll('[data-message-id]')).find((node) => node.dataset.messageId === messageId);
    if (!messageNode) return;
    messageNode.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    messageNode.focus({ preventScroll: true });
    messageNode.classList.remove('is-pin-target');
    window.requestAnimationFrame(() => messageNode.classList.add('is-pin-target'));
    window.clearTimeout(showPinnedMessage.timer);
    showPinnedMessage.timer = window.setTimeout(() => messageNode.classList.remove('is-pin-target'), 1500);
    announce('Pinned message shown in the conversation.');
  };

  const movePinned = (step) => {
    const conversation = activeConversation();
    const pinned = conversation.messages.filter((message) => message.pinned);
    if (pinned.length < 2) return;
    const currentIndex = Math.max(0, pinned.findIndex((message) => message.id === conversation.pinnedId));
    conversation.pinnedId = pinned[(currentIndex + step + pinned.length) % pinned.length].id;
    renderPinned();
    showPinnedMessage();
  };

  const openSavedMessage = (saved) => {
    const conversation = conversations.find((item) => item.id === saved.conversationId);
    if (!conversation) return;
    closeSavedView();
    selectConversation(conversation, conversation.row);
    window.setTimeout(() => {
      const messageNode = messagesNode?.querySelector(`[data-message-id="${CSS.escape(saved.messageId)}"]`);
      messageNode?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      messageNode?.classList.add('is-revealed');
      window.setTimeout(() => messageNode?.classList.remove('is-revealed'), 1400);
    }, 0);
  };

  const messageMarkup = (conversation, message, { savedContext = false } = {}) => {
    // C76 default-state welcome bubbles keep the static Figma projection:
    // full-width expert bubble with an always-visible pin, no tools or meta.
    if (message.welcome && !savedContext) {
      return `<article class="c76-message c76-message--welcome" data-message-id="${message.id}" data-conversation-id="${conversation.id}" data-search-copy="${escapeHtml((message.text || '').toLowerCase())}" tabindex="-1"><p>${escapeHtml(message.text)}</p><img class="c76-message__pin" src="${assetBase}/images/chatroom/message-pin.webp" alt="" /></article>`;
    }
    const replyText = message.reply ? `<blockquote>${escapeHtml(message.reply)}</blockquote>` : '';
    const text = message.text ? `<p>${escapeHtml(message.text)}</p>` : '';
    const voice = message.voice ? `<div class="c76-voice-card"><button type="button" data-voice-play aria-label="Play local voice preview" aria-pressed="false">${playAssetMarkup('c76-voice-card__play')}</button><span class="c76-voice-wave" aria-hidden="true"></span><small>${escapeHtml(message.voice.duration)}</small><img class="c76-voice-card__emoji" src="${escapeHtml(voiceEmojiAsset)}" alt="" aria-hidden="true"></div>` : '';
    const reactionEntries = Object.entries(message.reactions || {});
    const reactions = reactionEntries.map(([emoji, count]) => {
      const single = reactionEntries.length === 1 && Number(count) === 1;
      const selected = message.userReaction === emoji;
      return `<button class="${single ? 'c76-reactions__single ' : ''}${selected ? 'is-mine' : ''}" type="button" data-reaction="${escapeHtml(emoji)}" aria-pressed="${selected ? 'true' : 'false'}" aria-label="${escapeHtml(emoji)} reaction, ${count}${selected ? ', selected' : ''}">${escapeHtml(emoji)}${single ? '' : ` <b>${count}</b>`}</button>`;
    }).join('');
    const edited = message.edited ? '<i class="c76-message__meta-dot" aria-hidden="true"></i><span class="c76-message__edited" data-message-edited>Edited</span>' : '';
    const delivery = deliveryMarkup(message);
    const deliverySeparator = delivery ? '<i class="c76-message__meta-dot" aria-hidden="true"></i>' : '';
    const variant = message.voice ? ' c76-message--voice' : (message.media ? ' c76-message--media' : '');
    const savedIndicator = isMessageSaved(conversation, message)
      ? (savedContext
        ? `<button class="c76-message__saved-indicator c76-message__saved-indicator--action" type="button" data-saved-remove="${escapeHtml(`${conversation.id}:${message.id}`)}" aria-label="Remove from Saved messages"><img src="${savedBookmarkAsset}" alt=""></button>`
        : `<span class="c76-message__saved-indicator" role="img" aria-label="Saved message"><img src="${savedBookmarkAsset}" alt=""></span>`)
      : '';
    const menuId = `c76-menu-${conversation.id}-${message.id}`;
    const tools = savedContext ? '' : `<div class="c76-message__tools"><button class="c76-message__pin" type="button" aria-label="${message.pinned ? 'Unpin' : 'Pin'} message" aria-pressed="${message.pinned ? 'true' : 'false'}" data-message-action="pin"><img src="${assetBase}/images/chatroom/message-pin.svg" alt=""></button><button class="c76-message__more" type="button" aria-label="Message actions" aria-haspopup="menu" aria-expanded="false" aria-controls="${menuId}" data-message-action="more"><span class="c76-more-dots c76-more-dots--message" aria-hidden="true"><i></i><i></i><i></i></span></button><div class="c76-message-menu" id="${menuId}" hidden role="menu"><button type="button" role="menuitem" data-message-menu="reply"><span aria-hidden="true">↩</span>Reply</button>${message.from === 'me' && message.text ? '<button type="button" role="menuitem" data-message-menu="edit"><span aria-hidden="true">✎</span>Edit message</button>' : ''}<button type="button" role="menuitem" data-message-menu="react"><span aria-hidden="true">♡</span>Add reaction</button><button type="button" role="menuitem" data-message-menu="save"><span aria-hidden="true">☆</span>${isMessageSaved(conversation, message) ? 'Remove from Saved messages' : 'Save message'}</button><button type="button" role="menuitem" data-message-menu="copy"><span aria-hidden="true">▢</span>Copy text</button><button type="button" role="menuitem" data-message-menu="pin"><span aria-hidden="true">⌖</span>${message.pinned ? 'Unpin' : 'Pin'} message</button>${message.local ? '<button class="is-danger" type="button" role="menuitem" data-message-menu="delete"><span aria-hidden="true">⌫</span>Delete local message</button>' : ''}</div></div>`;
    return `<article class="c76-message c76-message--${message.from === 'me' ? 'outgoing' : 'incoming'}${variant}${message.pinned ? ' is-pinned' : ''}${savedContext ? ' c76-message--saved-context' : ''}" data-message-id="${message.id}" data-conversation-id="${conversation.id}" data-search-copy="${escapeHtml(`${message.text || ''} ${message.media?.title || ''}`.toLowerCase())}" tabindex="-1">${savedIndicator}<div class="c76-message__body">${replyText}${text}${mediaMarkup(message.media)}${voice}<footer><time>${escapeHtml(message.time)}</time>${edited}${deliverySeparator}${delivery}</footer>${reactions ? `<div class="c76-reactions">${reactions}</div>` : ''}</div>${tools}</article>`;
  };

  const renderSaved = () => {
    if (!savedList) return;
    savedList.replaceChildren();
    const query = (savedSearchInput?.value || '').trim().toLowerCase();
    const entries = state.saved.filter((saved) => {
      const conversation = conversations.find((item) => item.id === saved.conversationId);
      const message = conversation?.messages.find((item) => item.id === saved.messageId);
      return !query || `${saved.conversation} ${message?.text || saved.copy || ''}`.toLowerCase().includes(query);
    });
    if (!entries.length) {
      const empty = document.createElement('p'); empty.className = 'c76-saved-empty'; empty.dataset.savedEmpty = ''; empty.textContent = query ? 'No saved messages match this search.' : 'No saved messages yet.'; savedList.append(empty); return;
    }
    let previousDate = '';
    entries.forEach((saved) => {
      const conversation = conversations.find((item) => item.id === saved.conversationId);
      const message = conversation?.messages.find((item) => item.id === saved.messageId);
      if (!conversation || !message) return;
      const date = message.date || saved.date || '';
      if (date && date !== previousDate) {
        const separator = document.createElement('h3'); separator.className = 'c76-saved-date'; separator.textContent = date; savedList.append(separator); previousDate = date;
      }
      const item = document.createElement('div'); item.className = 'c76-saved-item'; item.dataset.savedKey = saved.key; item.dataset.savedOpen = saved.key;
      item.setAttribute('role', 'group'); item.setAttribute('tabindex', '0'); item.setAttribute('aria-label', `Saved message from ${conversation.name}`);
      const template = document.createElement('template'); template.innerHTML = messageMarkup(conversation, message, { savedContext: true });
      const article = template.content.firstElementChild;
      const source = document.createElement('small'); source.className = 'c76-saved-source'; source.textContent = `${conversation.name} · ${message.time || 'Saved'}`;
      item.append(source, article); savedList.append(item);
    });
  };

  const renderList = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    let visible = 0;
    rows.forEach((row) => {
      if (row.classList.contains('c76-thread--saved')) { row.hidden = Boolean(query) || state.filter !== 'all'; return; }
      const conversation = conversations.find((item) => item.name === row.dataset.conversationName);
      // Deactivated rows (Milana Ocean) stay visible in the default list.
      if (!conversation) { const deactivatedName = (row.dataset.conversationName || '').toLowerCase(); row.hidden = Boolean(query) && !deactivatedName.includes(query); return; }
      const filterMatch = state.filter === 'all' || (state.filter === 'unread' && conversation.unread > 0) || (state.filter === 'online' && conversation.online) || (state.filter === 'favorites' && conversation.favorite) || (state.filter === 'muted' && conversation.muted);
      const queryMatch = !query || `${conversation.name} ${conversation.topic}`.toLowerCase().includes(query);
      row.hidden = !(filterMatch && queryMatch);
      if (!row.hidden) visible += 1;
      const selected = conversation.id === state.activeId;
      row.classList.toggle('is-active', selected);
      // Conversation rows are buttons/links, not listbox options. Use the
      // shared current-item contract instead of aria-selected, which is only
      // valid for composite widgets such as listbox/tablist/menu.
      row.setAttribute('aria-current', selected ? 'true' : 'false');
      row.dataset.conversationUnread = String(conversation.unread);
      const unread = row.querySelector('.c76-unread');
      if (unread) { unread.hidden = conversation.unread === 0; unread.textContent = String(conversation.unread); }
    });
    if (searchResults) searchResults.textContent = `${visible} conversations shown`;
    syncConversationScrollbar();
  };

  const syncConversationScrollbar = () => {
    if (!conversationList || !conversationScrollbar) return;
    const viewportHeight = conversationList.clientHeight;
    const maxScroll = Math.max(0, conversationList.scrollHeight - viewportHeight);
    const overflowing = maxScroll > 1;
    // The C76 source always paints the scrollbar track, even when the list fits.
    conversationScrollbar.hidden = false;
    conversationScrollbar.dataset.overflow = overflowing ? 'true' : 'false';
    if (!conversationThumb) return;
    if (!overflowing) {
      conversationThumb.style.removeProperty('top');
      conversationThumb.removeAttribute('data-scroll-progress');
      return;
    }
    const trackHeight = conversationScrollbar.clientHeight;
    const thumbHeight = conversationThumb.getBoundingClientRect().height;
    const inset = 20;
    const travel = Math.max(0, trackHeight - thumbHeight - (inset * 2));
    const progress = Math.min(1, Math.max(0, conversationList.scrollTop / maxScroll));
    conversationThumb.style.top = `${inset + (progress * travel)}px`;
    conversationThumb.dataset.scrollProgress = progress.toFixed(4);
  };

  const syncChatFavoriteVisual = (favorite) => {
    root.querySelectorAll('[data-chat-favorite-state]').forEach((icon) => {
      icon.hidden = icon.dataset.chatFavoriteState === 'active' ? !favorite : favorite;
    });
  };
  const syncConversationRowVisual = (conversation) => {
    if (!conversation?.row) return;
    conversation.row.dataset.conversationFavorite = conversation.favorite ? 'true' : 'false';
    conversation.row.querySelectorAll('.c76-avatar-adornment--favorite').forEach((icon) => { icon.hidden = !conversation.favorite; });
  };

  const renderConversation = ({ focus = true, restoreScroll = false } = {}) => {
    const conversation = activeConversation();
    const name = root.querySelector('[data-chat-name]');
    const avatar = root.querySelector('[data-chat-avatar]');
    if (name) name.textContent = conversation.name;
    if (avatar) { avatar.src = conversation.avatar; avatar.alt = ''; }
    const presence = root.querySelector('[data-chat-presence]');
    const rate = root.querySelector('[data-chat-rate]');
    if (presence) {
      presence.textContent = conversation.presence;
      presence.dataset.presenceState = String(conversation.presence || 'Offline').toLowerCase();
    }
    if (rate) rate.innerHTML = `<em>Chat for</em> ${escapeHtml(conversation.rate)}`;
    const identity = root.querySelector('.c76-chat-identity');
    identity?.setAttribute('aria-label', `View details for ${conversation.name}`);
    root.querySelectorAll('[data-expert-profile-link]').forEach((link) => { link.setAttribute('aria-label', `Open ${conversation.name} in Psychics`); });
    root.querySelectorAll('[data-expert-details-modal] h2').forEach((heading) => { heading.textContent = conversation.name; });
    root.querySelectorAll('[data-expert-details-modal] .expert-card__portrait,[data-expert-details-modal] .mobile-card__portrait').forEach((image) => { image.src = conversation.avatar; image.alt = conversation.name; });
    root.querySelectorAll('[data-expert-details-modal] .expert-card__status,[data-expert-details-modal] .mobile-card__status').forEach((status) => { status.textContent = conversation.presence; });
    threadPanel?.setAttribute('aria-label', `Selected chat with ${conversation.name}`);
    root.querySelectorAll('[data-chat-action="favorite"],[data-expert-profile-action="favorite"]').forEach((button) => {
      button.setAttribute('aria-pressed', conversation.favorite ? 'true' : 'false');
      button.setAttribute('aria-label', conversation.favorite ? `Remove ${conversation.name} from favorites` : `Add ${conversation.name} to favorites`);
    });
    syncChatFavoriteVisual(conversation.favorite);
    syncConversationRowVisual(conversation);
    // Keep the unread badge visible like the C76 reference (static list state).
    const editMessage = conversation.messages.find((message) => message.id === conversation.editId && message.from === 'me');
    input.value = editMessage?.text || conversation.draft;
    if (threadSearch) threadSearch.value = '';
    if (threadSearchCount) threadSearchCount.textContent = '';
    renderMessages({ restoreScroll }); renderReply(); renderEdit(); renderAttachment(); renderList(); updateComposer(); restoreComposerState(conversation);
    searchShell?.classList.remove('is-search-open');
    if (compact.matches) menu?.classList.remove('is-expanded');
    syncConversationSearch();
    if (focus) { name?.setAttribute('tabindex', '-1'); name?.focus(); restoreComposerState(conversation); }
    announce(`${conversation.name} conversation shown. ${conversation.messages.length} messages.`);
  };

  const applyThreadSearch = () => {
    const query = (threadSearch?.value || '').trim().toLowerCase();
    let visible = 0;
    messagesNode?.querySelectorAll('.c76-message').forEach((message) => {
      const match = !query || (message.dataset.searchCopy || '').includes(query);
      message.hidden = !match;
      if (match) visible += 1;
    });
    if (threadSearchCount) threadSearchCount.textContent = query ? `${visible} found` : '';
  };

  // Telegram-like conversation search: the loupe is the passive anchor;
  // activation reveals the real input and keeps the close control inside it.
  const syncConversationSearch = () => {
    if (!searchTrigger || !searchShell) return;
    const open = searchShell.classList.contains('is-search-open');
    searchShell.classList.toggle('is-search-open', open);
    if (!open) {
      searchTrigger.setAttribute('role', 'button');
      searchTrigger.setAttribute('tabindex', '0');
      searchTrigger.setAttribute('aria-label', 'Open conversation search');
      searchTrigger.setAttribute('aria-expanded', 'false');
      if (searchClear) searchClear.hidden = true;
    } else {
      searchTrigger.removeAttribute('role');
      searchTrigger.removeAttribute('tabindex');
      searchTrigger.setAttribute('aria-label', 'Search conversations');
      searchTrigger.removeAttribute('aria-expanded');
      if (searchClear) searchClear.hidden = false;
    }
  };
  const openConversationSearch = () => {
    searchShell?.classList.add('is-search-open');
    if (compact.matches) menu?.classList.add('is-expanded');
    syncConversationSearch();
    searchInput?.focus();
  };
  const closeConversationSearch = ({ restoreFocus = true } = {}) => {
    if (searchInput) searchInput.value = '';
    renderList();
    searchShell?.classList.remove('is-search-open');
    if (compact.matches) menu?.classList.remove('is-expanded');
    syncConversationSearch();
    if (restoreFocus) searchTrigger?.focus();
  };

  const closeSavedView = ({ restoreFocus = false } = {}) => {
    if (savedView) savedView.hidden = true;
    if (threadPanel) {
      threadPanel.inert = false;
      threadPanel.removeAttribute('inert');
      threadPanel.removeAttribute('aria-hidden');
    }
    if (restoreFocus) activeConversation()?.row?.focus();
  };

  const selectConversation = (conversation, row, focus = true) => {
    if (!conversation) return;
    if (voiceRecorder && !voiceRecorder.hidden) cancelVoiceRecording({ restoreFocus: false });
    closeSavedView();
    workspace?.classList.remove('is-list-view');
    rememberMessageScroll();
    rememberComposerState();
    state.activeId = conversation.id;
    closePopovers();
    renderConversation({ focus, restoreScroll: true });
    root.dispatchEvent(new CustomEvent('nebula:chat-conversation-selected-local', { bubbles: true, detail: { conversationId: conversation.id, localOnly: true, persisted: false } }));
    row?.scrollIntoView({ block: 'nearest' });
  };

  rows.forEach((row) => {
    // Native buttons/links already dispatch keyboard clicks. Keep the
    // fallback key handler only for legacy non-native projections so Enter
    // and Space cannot select a conversation twice.
    const isNativeInteractive = row instanceof HTMLButtonElement || row instanceof HTMLAnchorElement;
    const addKeyboardFallback = (open) => {
      if (isNativeInteractive) return;
      row.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
      });
    };
    if (row.classList.contains('c76-thread--saved')) {
    const open = () => { rememberMessageScroll(); rememberComposerState(); renderSaved(); savedView.hidden = false; threadPanel.inert = true; threadPanel.setAttribute('inert', ''); threadPanel.setAttribute('aria-hidden', 'true'); savedView.querySelector('[data-saved-back]')?.focus(); };
      row.addEventListener('click', open); addKeyboardFallback(open); return;
    }
    const conversation = conversations.find((item) => item.name === row.dataset.conversationName);
    if (!conversation) return;
    const open = () => selectConversation(conversation, row);
    row.addEventListener('click', open);
    addKeyboardFallback(open);
  });

  root.querySelector('[data-saved-back]')?.addEventListener('click', () => { closeSavedView({ restoreFocus: true }); });
  savedSearchToggle?.addEventListener('click', () => {
    const opening = savedSearch?.hidden !== false;
    if (savedSearch) savedSearch.hidden = !opening;
    if (opening) savedSearchInput?.focus(); else { if (savedSearchInput) savedSearchInput.value = ''; renderSaved(); savedSearchToggle.focus(); }
  });
  savedSearchInput?.addEventListener('input', renderSaved);
  savedSearchClear?.addEventListener('click', () => { savedSearchInput.value = ''; renderSaved(); savedSearchInput.focus(); });
  savedList?.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-saved-remove]');
    if (remove) {
      const key = remove.dataset.savedRemove;
      state.saved = state.saved.filter((item) => item.key !== key);
      renderSaved(); renderMessages({ keepScroll: true });
      showToast('Removed from Saved Messages');
      return;
    }
    if (event.target.closest('[data-media-open],[data-voice-play]')) return;
    const item = event.target.closest('[data-saved-open]');
    if (item) { const saved = state.saved.find((entry) => entry.key === item.dataset.savedOpen); if (saved) openSavedMessage(saved); }
  });
  savedList?.addEventListener('keydown', (event) => {
    const item = event.target.closest('[data-saved-open]');
    if (item && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); const saved = state.saved.find((entry) => entry.key === item.dataset.savedOpen); if (saved) openSavedMessage(saved); }
  });
  // Compact breakpoints follow the C76 source: no avatar rail — the back
  // button swaps the thread for a full-width conversation list instead.
  const syncBackButton = () => { if (backButton) backButton.hidden = !compact.matches; };
  backButton?.addEventListener('click', () => { rememberMessageScroll(); rememberComposerState(); workspace?.classList.add('is-list-view'); openConversationSearch(); });
  root.querySelector('[data-menu-collapse]')?.addEventListener('click', () => { workspace?.classList.remove('is-list-view'); closeConversationSearch({ restoreFocus: false }); activeConversation().row.focus(); });
  searchInput?.addEventListener('focus', () => { searchShell?.classList.add('is-search-open'); if (compact.matches) menu?.classList.add('is-expanded'); syncConversationSearch(); });
  searchInput?.addEventListener('input', renderList);
  searchClear?.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); closeConversationSearch(); });
  searchTrigger?.addEventListener('click', (event) => {
    if (compact.matches && !menu?.classList.contains('is-expanded')) {
      event.preventDefault();
      openConversationSearch();
    }
  });
  searchTrigger?.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && compact.matches && !menu?.classList.contains('is-expanded')) {
      event.preventDefault();
      openConversationSearch();
    }
  });
  compact.addEventListener?.('change', () => { if (!compact.matches) { menu?.classList.remove('is-expanded'); workspace?.classList.remove('is-list-view'); } syncBackButton(); syncConversationSearch(); });
  filterToggle?.addEventListener('click', () => { const opening = filterMenu.hidden; closePopovers(); if (compact.matches) menu?.classList.add('is-expanded'); filterMenu.hidden = !opening; filterToggle.setAttribute('aria-expanded', opening ? 'true' : 'false'); if (opening) { popoverOpener = filterToggle; filterMenu.querySelector('button')?.focus(); } });
  root.querySelectorAll('[data-conversation-filter]').forEach((button) => button.addEventListener('click', () => {
    state.filter = button.dataset.conversationFilter;
    root.querySelectorAll('[data-conversation-filter]').forEach((item) => item.setAttribute('aria-checked', item === button ? 'true' : 'false'));
    filterToggle.setAttribute('aria-label', `Filter conversations: ${button.textContent.trim()}`);
    closePopovers(); renderList(); openConversationSearch();
  }));

  root.querySelectorAll('[data-header-nav-filter]').forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.headerNavFilter;
    state.filter = filter;
    root.querySelectorAll('[data-conversation-filter]').forEach((item) => item.setAttribute('aria-checked', item.dataset.conversationFilter === filter ? 'true' : 'false'));
    root.querySelectorAll('[data-header-nav-filter]').forEach((item) => item.setAttribute('aria-pressed', item === button ? 'true' : 'false'));
    renderList();
    if (compact.matches) menu?.classList.add('is-expanded');
    searchInput?.focus();
    showToast(filter === 'favorites' ? 'Favorite conversations' : 'Online psychics');
  }));
  const accountMenuToggle = root.querySelector('[data-account-menu-toggle]');
  const accountMenu = root.querySelector('.c76-account-menu');
  accountMenuToggle?.addEventListener('click', () => { const opening = accountMenu.hidden; closePopovers(); accountMenu.hidden = !opening; accountMenuToggle.setAttribute('aria-expanded', opening ? 'true' : 'false'); if (opening) { popoverOpener = accountMenuToggle; accountMenu.querySelector('[role="menuitem"]')?.focus(); } });

  const actionButton = (name) => root.querySelector(`[data-chat-action="${name}"]`);
  root.querySelectorAll('[data-chat-action="favorite"],[data-expert-profile-action="favorite"]').forEach((button) => button.addEventListener('click', () => {
    const conversation = activeConversation();
    conversation.favorite = !conversation.favorite;
    root.querySelectorAll('[data-chat-action="favorite"],[data-expert-profile-action="favorite"]').forEach((favoriteButton) => {
      favoriteButton.setAttribute('aria-pressed', conversation.favorite ? 'true' : 'false');
      favoriteButton.setAttribute('aria-label', conversation.favorite ? `Remove ${conversation.name} from favorites` : `Add ${conversation.name} to favorites`);
    });
    syncChatFavoriteVisual(conversation.favorite);
    syncConversationRowVisual(conversation);
    root.dispatchEvent(new CustomEvent('nebula:chat-favorite-intent-required', { bubbles: true, detail: { conversationId: conversation.id, expertName: conversation.name, favorite: conversation.favorite, backendRequired: true, persisted: false, localProjection: true } }));
    renderList();
    showToast(conversation.favorite ? 'Added to favorites' : 'Removed from favorites');
  }));
  const searchPanel = root.querySelector('.c76-chat-search');
  const closeThreadSearch = ({ restoreFocus = true } = {}) => {
    if (!searchPanel || !threadSearch) return;
    searchPanel.hidden = true;
    threadSearch.value = '';
    applyThreadSearch();
    actionButton('search')?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) actionButton('search')?.focus();
  };
  actionButton('search')?.addEventListener('click', () => { closePopovers(); popoverOpener = actionButton('search'); searchPanel.hidden = false; actionButton('search').setAttribute('aria-expanded', 'true'); threadSearch.focus(); });
  root.querySelector('[data-chat-search-close]')?.addEventListener('click', () => closeThreadSearch());
  threadSearch?.addEventListener('input', applyThreadSearch);
  const chatMenu = root.querySelector('.c76-chat-more-menu');
  if (chatMenu && !chatMenu.querySelector('[data-chat-menu="profile"]')) {
    chatMenu.innerHTML = [
      '<button type="button" role="menuitem" data-chat-menu="profile"><svg class="c76-chat-menu__icon" viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="6" r="3.25"/><path d="M3.5 19c.55-3.35 2.75-5 6.5-5s5.95 1.65 6.5 5"/></g></svg><span>View profile</span></button>',
      '<button type="button" role="menuitem" data-chat-menu="clear"><svg class="c76-chat-menu__icon" viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15.5 14.5 5"/><path d="m11.5 4 4.5 4.5"/><path d="M3 18h9"/><path d="m5 15 5-5"/></g></svg><span>Clear history</span></button>',
      '<button type="button" role="menuitem" data-chat-menu="delete"><svg class="c76-chat-menu__icon" viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5h12"/><path d="M7 6.5V4h6v2.5"/><path d="M5.5 8v9h9V8"/><path d="M8.5 10.5v4M11.5 10.5v4"/></g></svg><span>Delete chat</span></button>',
      '<button type="button" role="menuitemcheckbox" aria-checked="false" data-chat-menu="mute"><svg class="c76-chat-menu__icon" viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h3l4-3v10l-4-3H3z"/><path d="m13 8 4 4M17 8l-4 4"/></g></svg><span data-chat-menu-label>Muted</span></button>',
      '<button type="button" role="menuitem" data-chat-menu="review"><svg class="c76-chat-menu__icon" viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5h14v10H8l-4 3v-3H3z"/><path d="M6 8h8M6 11h5"/></g></svg><span>Write a review</span></button>',
      '<button type="button" role="menuitem" data-chat-menu="block"><svg class="c76-chat-menu__icon" viewBox="0 0 20 20" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="m6 6 8 8"/></g></svg><span>Block</span></button>'
    ].join('');
  }
  actionButton('more')?.addEventListener('click', () => { closePopovers(); popoverOpener = actionButton('more'); const panel = root.querySelector('.c76-chat-more-menu'); panel.hidden = false; actionButton('more').setAttribute('aria-expanded', 'true'); panel.querySelector('button')?.focus(); });
  root.querySelectorAll('[data-chat-menu]').forEach((button) => button.addEventListener('click', () => {
    const conversation = activeConversation(); const action = button.dataset.chatMenu;
    if (['profile', 'clear', 'delete', 'review', 'block'].includes(action)) {
      const returnTarget = actionButton('more');
      if (action === 'profile') {
        closePopovers(false);
        root.querySelector('[data-action="open-expert-details"]')?.click();
        return;
      }
      const eventMap = {
        clear: ['nebula:chat-clear-history-intent-required', { historyCleared: false }],
        delete: ['nebula:chat-delete-intent-required', { chatDeleted: false }],
        review: ['nebula:chat-review-intent-required', { reviewSubmitted: false }],
        block: ['nebula:chat-block-intent-required', { blocked: false }],
      };
      const mapped = eventMap[action];
      root.dispatchEvent(new CustomEvent(mapped[0], { bubbles: true, detail: { conversationId: conversation.id, ...mapped[1], backendRequired: true, persisted: false, staticProjection: true } }));
      closePopovers();
      showToast('Host confirmation required');
      returnTarget?.focus();
      return;
    }
    if (action === 'mute') {
      conversation.muted = !conversation.muted;
      button.setAttribute('aria-checked', conversation.muted ? 'true' : 'false');
      const label = button.querySelector('[data-chat-menu-label]');
      if (label) label.textContent = conversation.muted ? 'Muted' : 'Mute';
      const returnTarget = actionButton('more');
      closePopovers();
      renderList();
      showToast(conversation.muted ? 'Muted locally' : 'Unmuted locally');
      returnTarget?.focus();
      return;
    }
    if (action === 'read') conversation.unread = 0;
    if (action === 'report') root.dispatchEvent(new CustomEvent('nebula:chat-report-intent-required', { bubbles: true, detail: { conversationId: conversation.id, reportCreated: false, backendRequired: true } }));
    const returnTarget = actionButton('more'); closePopovers(); renderList(); showToast(action === 'report' ? 'Report requires support host' : `${button.textContent.trim()} · local state`); returnTarget?.focus();
  }));

  messagesNode?.addEventListener('click', async (event) => {
    const control = event.target.closest('button');
    if (!control) return;
    const article = control.closest('[data-message-id]');
    const conversation = activeConversation();
    const message = conversation.messages.find((item) => item.id === article?.dataset.messageId);
    if (control.matches('[data-message-action="pin"]') && message) {
      const next = !message.pinned;
      message.pinned = next;
      conversation.pinnedId = next ? message.id : conversation.pinnedId === message.id ? null : conversation.pinnedId;
      renderMessages({ keepScroll: true });
      const count = conversation.messages.filter((item) => item.pinned).length;
      showToast(next ? `${count} ${count === 1 ? 'message' : 'messages'} pinned` : 'Message unpinned');
      return;
    }
    if (control.matches('[data-message-action="more"]')) { closePopovers(); popoverOpener = control; const panel = article.querySelector('.c76-message-menu'); panel.hidden = false; control.setAttribute('aria-expanded', 'true'); panel.querySelector('button')?.focus(); return; }
    if (control.dataset.messageMenu && message) {
      const action = control.dataset.messageMenu;
      if (action === 'reply') { conversation.editId = null; conversation.replyId = message.id; renderEdit(); renderReply(); input?.focus(); }
      if (action === 'edit' && message.from === 'me' && message.text) {
        conversation.preEditDraft = conversation.draft;
        conversation.editId = message.id;
        conversation.replyId = null;
        conversation.attachment = null;
        input.value = message.text;
        renderReply(); renderEdit(); renderAttachment(); updateComposer();
        input.focus(); input.setSelectionRange(input.value.length, input.value.length);
        announce('Editing message. Delivery state will not change.');
      }
      if (action === 'react') { openReactionPicker(article, control, message); return; }
      if (action === 'save') {
        const key = `${conversation.id}:${message.id}`;
        if (isMessageSaved(conversation, message)) {
          state.saved = state.saved.filter((item) => item.key !== key);
          showToast('Removed from Saved Messages');
        } else {
          state.saved.push({ key, conversation: conversation.name, conversationId: conversation.id, messageId: message.id, copy: message.text || message.media?.title || 'Media message', time: message.time, date: message.date || '' });
          showToast('Saved to Saved Messages');
        }
        renderMessages({ keepScroll: true });
        renderSaved();
      }
      if (action === 'copy') { try { await navigator.clipboard?.writeText(message.text || message.media?.title || ''); showToast('Copied'); } catch (_) { showToast('Copy unavailable'); } }
      if (action === 'pin') {
        const next = !message.pinned;
        message.pinned = next;
        conversation.pinnedId = next ? message.id : conversation.pinnedId === message.id ? null : conversation.pinnedId;
        renderMessages({ keepScroll: true });
        const count = conversation.messages.filter((item) => item.pinned).length;
        showToast(next ? `${count} ${count === 1 ? 'message' : 'messages'} pinned` : 'Message unpinned');
      }
      if (action === 'delete' && message.local) { if (conversation.editId === message.id) conversation.editId = null; conversation.messages = conversation.messages.filter((item) => item.id !== message.id); renderEdit(); renderMessages(); showToast('Local message deleted'); }
      closePopovers(); return;
    }
    if (control.dataset.reaction && message) {
      const selected = changeReaction(message, control.dataset.reaction);
      renderMessages({ keepScroll: true });
      announce(`${control.dataset.reaction} reaction ${selected ? 'added' : 'removed'} locally. Not delivered to the host.`);
      return;
    }
    if (control.dataset.mediaOpen && message?.media) {
      const media = message.media.kind === 'bundle' ? message.media.items?.[Number(control.dataset.mediaIndex) || 0] : message.media;
      if (media) openMedia(media, control);
      return;
    }
    if (control.hasAttribute('data-voice-play')) { const playing = control.getAttribute('aria-pressed') === 'true'; messagesNode.querySelectorAll('[data-voice-play]').forEach((item) => { item.setAttribute('aria-pressed', 'false'); item.innerHTML = playAssetMarkup('c76-voice-card__play'); item.setAttribute('aria-label', 'Play local voice preview'); }); control.setAttribute('aria-pressed', playing ? 'false' : 'true'); control.innerHTML = playAssetMarkup('c76-voice-card__play'); control.setAttribute('aria-label', playing ? 'Play local voice preview' : 'Pause local voice preview'); announce(playing ? 'Voice preview paused.' : 'Voice preview playing locally.'); }
  });

  pinnedOpen?.addEventListener('click', showPinnedMessage);
  pinnedPrevious?.addEventListener('click', () => movePinned(-1));
  pinnedNext?.addEventListener('click', () => movePinned(1));
  root.querySelector('[data-pinned-close]')?.addEventListener('click', () => {
    const conversation = activeConversation();
    const current = conversation.messages.find((message) => message.id === conversation.pinnedId && message.pinned);
    if (current) current.pinned = false;
    conversation.pinnedId = null;
    renderMessages({ keepScroll: true });
    const count = conversation.messages.filter((message) => message.pinned).length;
    showToast(count ? `${count} ${count === 1 ? 'message remains' : 'messages remain'} pinned` : 'No pinned messages');
  });
  root.querySelector('[data-reply-cancel]')?.addEventListener('click', () => { activeConversation().replyId = null; renderReply(); input?.focus(); });
  root.querySelector('[data-edit-cancel]')?.addEventListener('click', () => {
    const conversation = activeConversation();
    conversation.editId = null;
    input.value = conversation.preEditDraft || '';
    conversation.draft = input.value;
    conversation.preEditDraft = '';
    renderEdit(); updateComposer(); input.focus();
    announce('Message editing cancelled.');
  });

  const sendLocal = () => {
    const conversation = activeConversation();
    const text = input.value.trim();
    const editedMessage = conversation.messages.find((message) => message.id === conversation.editId && message.from === 'me');
    if (editedMessage) {
      if (!text) return;
      editedMessage.text = text;
      editedMessage.edited = true;
      conversation.editId = null;
      conversation.draft = conversation.preEditDraft || '';
      conversation.preEditDraft = '';
      input.value = conversation.draft;
      root.dispatchEvent(new CustomEvent('nebula:chat-message-edited-local', { bubbles: true, detail: { conversationId: conversation.id, messageId: editedMessage.id, deliveryState: editedMessage.deliveryState, localOnly: true, persisted: false, serverReceipt: false } }));
      renderEdit(); renderMessages({ keepScroll: true }); updateComposer(); input.focus();
      showToast('Message edited locally');
      return;
    }
    if (!text && !conversation.attachment) return;
    const reply = conversation.messages.find((message) => message.id === conversation.replyId);
    const options = { time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), deliveryState: 'sent', local: true, reply: reply?.text?.slice(0, 120) };
    if (conversation.attachment?.kind === 'voice') options.voice = { duration: conversation.attachment.duration };
    else if (conversation.attachment) options.media = { ...conversation.attachment };
    const message = make('me', text, options);
    conversation.messages.push(message);
    root.dispatchEvent(new CustomEvent('nebula:chat-message-created-local', { bubbles: true, detail: { conversationId: conversation.id, messageId: message.id, deliveryState: 'sent', localOnly: true, persisted: false, delivered: false, serverReceipt: false } }));
    input.value = ''; conversation.draft = ''; conversation.replyId = null; conversation.attachment = null;
    renderReply(); renderEdit(); renderAttachment(); renderMessages(); updateComposer(); input.focus();
    const advanceDeliveryPreview = (deliveryState, delay) => window.setTimeout(() => {
      if (!conversation.messages.includes(message)) return;
      message.deliveryState = deliveryState;
      if (activeConversation().id === conversation.id) renderMessages({ keepScroll: true });
      root.dispatchEvent(new CustomEvent('nebula:chat-delivery-preview-changed', { bubbles: true, detail: { conversationId: conversation.id, messageId: message.id, deliveryState, localOnly: true, persisted: false, serverReceipt: false } }));
    }, delay);
    advanceDeliveryPreview('delivered', 700);
    advanceDeliveryPreview('read', 1500);
  };
  // Capture before a desktop pointer click blurs the textarea and collapses its
  // selection. The explicit switch/back hooks remain the authoritative restore
  // boundary; this capture only records the last user-owned caret state.
  root.addEventListener('pointerdown', (event) => {
    if (input && event.target !== input && !input.contains(event.target)) rememberComposerState();
  }, true);
  input?.addEventListener('input', () => { updateComposer(); rememberComposerState(); });
  input?.addEventListener('select', rememberComposerState);
  input?.addEventListener('blur', () => rememberComposerState({ force: true }));
  input?.addEventListener('keydown', (event) => { if (event.isComposing || event.keyCode === 229 || event.key !== 'Enter' || event.shiftKey) return; event.preventDefault(); sendLocal(); });
  sendButton?.addEventListener('click', sendLocal);

  const emojiPicker = root.querySelector('.c76-emoji-picker');
  root.querySelector('[data-composer-action="emoji"]')?.addEventListener('click', (event) => { closePopovers(); popoverOpener = event.currentTarget; emojiPicker.hidden = false; event.currentTarget.setAttribute('aria-expanded', 'true'); emojiPicker.querySelector('[data-emoji]')?.focus(); });
  root.querySelectorAll('[data-emoji]').forEach((button) => button.addEventListener('click', () => { const start = input.selectionStart ?? input.value.length; input.value = `${input.value.slice(0, start)}${button.dataset.emoji}${input.value.slice(input.selectionEnd ?? start)}`; input.selectionStart = input.selectionEnd = start + button.dataset.emoji.length; updateComposer(); closePopovers(); input.focus(); }));
  root.querySelector('[data-emoji-close]')?.addEventListener('click', () => { closePopovers(); input.focus(); });
  const attachmentMenu = root.querySelector('.c76-attachment-menu');
  const attachmentTrigger = root.querySelector('[data-composer-action="attachment"]');
  const attachmentConfig = {
    photo: { kind: 'photo', accept: 'image/*', maxBytes: 12 * 1024 * 1024, label: 'photo' },
    video: { kind: 'video', accept: 'video/*', maxBytes: 80 * 1024 * 1024, label: 'video' },
    file: { kind: 'file', accept: '.pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.csv,application/pdf,text/plain', maxBytes: 25 * 1024 * 1024, label: 'document' },
    camera: { kind: 'photo', accept: 'image/*', capture: 'environment', maxBytes: 12 * 1024 * 1024, label: 'camera photo' },
    gallery: { kind: 'bundle', accept: 'image/*,video/*', maxBytes: 12 * 1024 * 1024, label: 'gallery media' },
  };
  let requestedAttachment = null;
  let attachmentPickerPending = false;
  const restoreAttachmentTrigger = () => {
    if (!attachmentPickerPending || attachmentInput?.files?.length) return;
    attachmentPickerPending = false;
    attachmentTrigger?.focus();
  };
  window.addEventListener('focus', restoreAttachmentTrigger);
  attachmentTrigger?.addEventListener('click', (event) => {
    if (attachmentMenu && !attachmentMenu.hidden && popoverOpener === event.currentTarget) {
      closePopovers(true);
      return;
    }
    closePopovers();
    popoverOpener = event.currentTarget;
    attachmentMenu.hidden = false;
    event.currentTarget.setAttribute('aria-expanded', 'true');
    attachmentMenu.querySelector('button')?.focus();
  });
  root.querySelectorAll('[data-attachment-kind]').forEach((button) => button.addEventListener('click', () => {
    const config = attachmentConfig[button.dataset.attachmentKind];
    if (!config || !attachmentInput) return;
    requestedAttachment = config;
    attachmentInput.value = '';
    attachmentInput.accept = config.accept;
    attachmentInput.removeAttribute('capture');
    if (config.capture) attachmentInput.setAttribute('capture', config.capture);
    attachmentInput.multiple = button.dataset.attachmentKind === 'gallery';
    closePopovers();
    attachmentPickerPending = true;
    attachmentInput.click();
  }));
  attachmentInput?.addEventListener('change', () => {
    const config = requestedAttachment;
    const files = Array.from(attachmentInput.files || []);
    const file = files[0];
    requestedAttachment = null;
    attachmentPickerPending = false;
    if (!config || !file) { attachmentTrigger?.focus(); return; }
    const documentMimes = ['application/pdf', 'application/msword', 'application/rtf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'text/csv'];
    const validFile = (candidate) => {
      const extension = candidate.name.includes('.') ? `.${candidate.name.split('.').pop().toLowerCase()}` : '';
      const isImage = candidate.type.startsWith('image/');
      const isVideo = candidate.type.startsWith('video/');
      const isDocument = Boolean(documentMimes.includes(candidate.type) || ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.xls', '.xlsx', '.csv'].includes(extension));
      const validType = config.kind === 'bundle' ? (isImage || isVideo) : config.kind === 'photo' ? isImage : config.kind === 'video' ? isVideo : isDocument;
      return { validType, isImage, isVideo };
    };
    if (files.some((candidate) => !validFile(candidate).validType)) { showToast(`Choose valid ${config.label} files.`); announce(`The selected files are not valid ${config.label} files.`); attachmentTrigger?.focus(); return; }
    if (files.some((candidate) => candidate.size > config.maxBytes)) { showToast(`A selected file is larger than ${formatBytes(config.maxBytes)}.`); announce('A selected file is too large.'); attachmentTrigger?.focus(); return; }
    const previous = activeConversation().attachment;
    disposeAttachmentPreview(previous);
    const localItems = files.map((candidate) => { const localObjectUrl = URL.createObjectURL(candidate); const type = validFile(candidate); return { kind: type.isVideo ? 'video' : 'photo', src: localObjectUrl, title: candidate.name, size: candidate.size, mime: candidate.type || 'application/octet-stream', localObjectUrl: true }; });
    const attachment = config.kind === 'bundle' && localItems.length > 1
      ? { kind: 'bundle', items: localItems, title: 'Media album', size: localItems.reduce((sum, item) => sum + item.size, 0), localObjectUrl: true }
      : localItems[0];
    activeConversation().attachment = attachment;
    if (attachment.kind === 'video') {
      const probe = document.createElement('video');
      // The object URL is owned by the selected attachment item. The map-local
      // variable is not available here, especially for a single video file.
      probe.preload = 'metadata'; probe.src = attachment.src;
      probe.addEventListener('loadedmetadata', () => { if (activeConversation().attachment === attachment && Number.isFinite(probe.duration)) attachment.duration = `${Math.floor(probe.duration / 60)}:${String(Math.round(probe.duration % 60)).padStart(2, '0')}`; renderAttachment(); });
    }
    renderAttachment(); updateComposer(); input?.focus();
    root.dispatchEvent(new CustomEvent('nebula:chat-attachment-selected-local', { bubbles: true, detail: { kind: attachment.kind, name: attachment.title, size: attachment.size, mime: attachment.mime, localPreview: true, uploaded: false, persisted: false, backendRequired: true } }));
    announce(`${file.name} selected as a local preview. It has not been uploaded.`);
  });

  const voiceButton = root.querySelector('[data-composer-action="voice"]');
  const formatVoiceTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const updateVoiceRecorder = () => {
    if (voiceTime) {
      voiceTime.textContent = formatVoiceTime(voiceSeconds);
      voiceTime.dateTime = `PT${voiceSeconds}S`;
    }
    if (voiceRecorder) voiceRecorder.dataset.state = voicePaused ? 'paused' : 'recording';
    if (voicePause) {
      voicePause.setAttribute('aria-pressed', voicePaused ? 'true' : 'false');
      voicePause.setAttribute('aria-label', voicePaused ? 'Resume voice preview recording' : 'Pause voice preview recording');
      const icon = voicePause.querySelector('span');
      if (icon) icon.innerHTML = voicePaused ? playAssetMarkup('c76-voice-recorder__play') : 'Ⅱ';
    }
  };
  const clearVoiceTimer = () => {
    if (!voiceTimer) return;
    window.clearInterval(voiceTimer);
    voiceTimer = null;
  };
  const runVoiceTimer = () => {
    clearVoiceTimer();
    voiceTimer = window.setInterval(() => {
      voiceSeconds += 1;
      updateVoiceRecorder();
      if (voiceSeconds >= 60) {
        voicePaused = true;
        clearVoiceTimer();
        updateVoiceRecorder();
        announce('Local voice preview reached one minute and paused.');
      }
    }, 1000);
  };
  const closeVoiceRecorder = () => {
    clearVoiceTimer();
    voicePaused = false;
    voiceRecorder.hidden = true;
    inputbar.classList.remove('is-voice-recording');
    voiceButton.setAttribute('aria-pressed', 'false');
    voiceButton.setAttribute('aria-label', 'Start local voice message preview');
  };
  const cancelVoiceRecording = ({ restoreFocus = true } = {}) => {
    closeVoiceRecorder();
    voiceSeconds = 0;
    updateVoiceRecorder();
    announce('Voice preview cancelled. No microphone or message was created.');
    if (restoreFocus) voiceButton.focus();
  };
  const startVoiceRecording = () => {
    if (activeConversation().attachment) {
      showToast('Remove the current attachment first');
      return;
    }
    closePopovers();
    voiceSeconds = 0;
    voicePaused = false;
    voiceRecorder.hidden = false;
    inputbar.classList.add('is-voice-recording');
    voiceButton.setAttribute('aria-pressed', 'true');
    voiceButton.setAttribute('aria-label', 'Voice preview recording in progress');
    updateVoiceRecorder();
    runVoiceTimer();
    voicePause?.focus();
    announce('Local voice preview started. A waveform is shown; no microphone is used.');
  };
  const sendVoiceRecording = () => {
    const conversation = activeConversation();
    const draft = input.value;
    const duration = formatVoiceTime(Math.max(1, voiceSeconds));
    closeVoiceRecorder();
    input.value = '';
    conversation.attachment = { kind: 'voice', title: 'Voice message preview', duration };
    sendLocal();
    input.value = draft;
    conversation.draft = draft;
    voiceSeconds = 0;
    updateVoiceRecorder();
    updateComposer();
    input.focus();
    announce('Local voice preview added to the conversation. It was not recorded or delivered.');
  };
  voiceButton?.addEventListener('click', startVoiceRecording);
  root.querySelector('[data-voice-cancel]')?.addEventListener('click', () => cancelVoiceRecording());
  voicePause?.addEventListener('click', () => {
    voicePaused = !voicePaused;
    if (voicePaused) clearVoiceTimer(); else runVoiceTimer();
    updateVoiceRecorder();
    announce(voicePaused ? 'Voice preview paused.' : 'Voice preview resumed.');
  });
  root.querySelector('[data-voice-send]')?.addEventListener('click', sendVoiceRecording);
  window.addEventListener('pagehide', () => {
    clearVoiceTimer();
    conversations.forEach((conversation) => {
      disposeAttachmentPreview(conversation.attachment);
      conversation.messages.forEach((message) => disposeAttachmentPreview(message.media));
    });
  });

  const selectSuggestion = (index, { focus = false } = {}) => {
    const chip = suggestions[index];
    if (!chip) return;
    suggestions.forEach((item, itemIndex) => {
      const selected = itemIndex === index;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
      item.tabIndex = selected ? 0 : -1;
    });
    input.value = chip.textContent.trim();
    updateComposer();
    chip.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    if (focus) { chip.focus(); input.focus(); }
    syncSuggestionNav();
  };
  suggestions.forEach((chip, index) => {
    chip.tabIndex = index === 0 ? 0 : -1;
    chip.addEventListener('keydown', (event) => { const current = suggestions.indexOf(chip); let next = current; if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % suggestions.length; else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current - 1 + suggestions.length) % suggestions.length; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = suggestions.length - 1; else return; event.preventDefault(); selectSuggestion(next, { focus: true }); });
    chip.addEventListener('click', () => selectSuggestion(index, { focus: true }));
  });
  const syncSuggestionNav = () => {
    if (!suggestionRail) return;
    const current = Math.max(0, suggestions.findIndex((item) => item.getAttribute('aria-selected') === 'true'));
    suggestionNav.forEach((button) => {
      const disabled = button.dataset.suggestionNav === 'prev' ? current <= 0 : current >= suggestions.length - 1;
      button.disabled = disabled;
      button.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    });
  };
  suggestionNav.forEach((button) => button.addEventListener('click', () => {
    if (button.disabled || !suggestions.length) return;
    const current = Math.max(0, suggestions.findIndex((item) => item.getAttribute('aria-selected') === 'true'));
    const next = button.dataset.suggestionNav === 'next' ? Math.min(suggestions.length - 1, current + 1) : Math.max(0, current - 1);
    selectSuggestion(next, { focus: true });
  }));
  suggestionRail?.addEventListener('scroll', syncSuggestionNav, { passive: true });

  root.querySelectorAll('[data-intention]').forEach((button) => { button.setAttribute('aria-pressed', 'false'); button.addEventListener('click', () => { root.querySelectorAll('[data-intention]').forEach((item) => { const selected = item === button; item.classList.toggle('is-selected', selected); item.setAttribute('aria-pressed', selected ? 'true' : 'false'); }); input.value = `I would like to ask about ${button.textContent.trim().toLowerCase()}. `; updateComposer(); input.focus(); }); });

  const renderConsultationControl = (state) => {
    if (!consultationControls.length) return;
    const running = state === 'running';
    threadPanel?.setAttribute('data-consultation-visual-state', state === 'running' ? 'active' : state);
    consultationControls.forEach((control) => {
      control.dataset.consultationState = state;
      control.closest('[data-consultation-cluster]')?.setAttribute('data-consultation-state', state);
      if (control.getAttribute('role') === 'switch') {
        control.setAttribute('aria-checked', running ? 'true' : 'false');
        control.removeAttribute('aria-pressed');
      } else {
        control.setAttribute('aria-pressed', running ? 'true' : 'false');
      }
      const label = control.querySelector('[data-consultation-label]');
      if (label) label.textContent = control.classList.contains('c76-consultation-action') ? (state === 'idle' ? 'Start' : (running ? 'Pause' : 'Resume')) : (state === 'idle' ? 'Start consultation' : (running ? 'Pause consultation' : 'Resume consultation'));
      control.setAttribute('aria-label', state === 'idle' ? 'Start consultation' : (running ? 'Pause consultation' : 'Resume consultation'));
    });
  };
  consultationControls.forEach((control) => control.addEventListener('click', () => {
    const current = control.dataset.consultationState || 'idle';
    const next = current === 'running' ? 'paused' : 'running';
    const eventName = next === 'running' ? 'nebula:consultation-start-intent-required' : 'nebula:consultation-pause-intent-required';
    renderConsultationControl(next);
    root.dispatchEvent(new CustomEvent(eventName, { bubbles: true, detail: { backendRequired: true, sessionMutated: false, timerStarted: false, timerMutated: false, billingMutated: false, persisted: false, staticProjection: true, liveMount: false } }));
    announce(next === 'running' ? 'Consultation start requested. Host confirmation is required.' : 'Consultation pause requested. Host confirmation is required.');
  }));
  renderConsultationControl(consultationControls[0]?.dataset.consultationState || 'idle');

  function openMedia(media, opener) {
    mediaOpener = opener; closePopovers(); mediaViewer.hidden = false; frame.inert = true; frame.setAttribute('inert', ''); frame.setAttribute('aria-hidden', 'true'); mediaTitle.textContent = media.title;
    if (media.kind === 'video' && media.localObjectUrl) mediaStage.innerHTML = `<div class="c76-video-demo c76-video-demo--native"><video src="${escapeHtml(media.src)}" controls preload="metadata" playsinline aria-label="${escapeHtml(media.title)}"></video><small>Local preview · not uploaded</small></div>`;
    else mediaStage.innerHTML = media.kind === 'video' ? `<div class="c76-video-demo" data-video-demo><img src="${escapeHtml(media.src)}" alt="${escapeHtml(media.title)}"><button type="button" data-video-toggle aria-label="Play local preview" aria-pressed="false">${playAssetMarkup('c76-video-demo__play')}<span>Play local preview</span></button><div><i data-video-progress></i></div><small>No media is uploaded or streamed</small></div>` : `<img src="${escapeHtml(media.src)}" alt="${escapeHtml(media.title)}">`;
    mediaViewer.querySelector('.c76-media-viewer__dialog [data-media-viewer-close]')?.focus();
  }
  const closeMedia = () => { if (mediaViewer.hidden) return; mediaViewer.hidden = true; frame.inert = false; frame.removeAttribute('inert'); frame.removeAttribute('aria-hidden'); mediaStage.replaceChildren(); mediaOpener?.focus(); mediaOpener = null; };
  root.querySelectorAll('[data-media-viewer-close]').forEach((button) => button.addEventListener('click', closeMedia));
  mediaStage?.addEventListener('click', (event) => { const button = event.target.closest('[data-video-toggle]'); if (!button) return; const active = button.getAttribute('aria-pressed') === 'true'; button.setAttribute('aria-pressed', active ? 'false' : 'true'); button.innerHTML = `${playAssetMarkup('c76-video-demo__play')}<span>${active ? 'Play local preview' : 'Pause local preview'}</span>`; button.setAttribute('aria-label', active ? 'Play local preview' : 'Pause local preview'); button.closest('[data-video-demo]')?.classList.toggle('is-playing', !active); });

  document.addEventListener('keydown', (event) => {
    if (mediaViewer && !mediaViewer.hidden && event.key === 'Tab') {
      const focusables = Array.from(mediaViewer.querySelectorAll('.c76-media-viewer__dialog button:not([disabled])')).filter((item) => !item.hidden);
      const first = focusables[0]; const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      return;
    }
    if (event.key !== 'Escape') return;
    if (mediaViewer && !mediaViewer.hidden) { closeMedia(); return; }
    if (searchPanel && !searchPanel.hidden) { event.preventDefault(); closeThreadSearch(); return; }
    if (savedView && !savedView.hidden) { event.preventDefault(); closeSavedView({ restoreFocus: true }); return; }
    closePopovers(true);
    if (searchShell?.classList.contains('is-search-open')) { closeConversationSearch(); }
  }, { capture: true });
  root.addEventListener('keydown', (event) => {
    const emojiButton = event.target.closest('[data-emoji]');
    if (emojiButton) {
      const emojiButtons = Array.from(root.querySelectorAll('[data-emoji]'));
      const currentEmoji = emojiButtons.indexOf(emojiButton);
      let nextEmoji = currentEmoji;
      if (event.key === 'ArrowRight') nextEmoji = (currentEmoji + 1) % emojiButtons.length;
      else if (event.key === 'ArrowLeft') nextEmoji = (currentEmoji - 1 + emojiButtons.length) % emojiButtons.length;
      else if (event.key === 'ArrowDown') nextEmoji = (currentEmoji + 6) % emojiButtons.length;
      else if (event.key === 'ArrowUp') nextEmoji = (currentEmoji - 6 + emojiButtons.length) % emojiButtons.length;
      else if (event.key === 'Home') nextEmoji = 0;
      else if (event.key === 'End') nextEmoji = emojiButtons.length - 1;
      else nextEmoji = -1;
      if (nextEmoji >= 0) { event.preventDefault(); emojiButtons[nextEmoji]?.focus(); return; }
    }
    const menuNode = event.target.closest('[role="menu"]');
    if (!menuNode) return;
    const items = Array.from(menuNode.querySelectorAll('button:not([disabled]),a[href]'));
    const current = items.indexOf(event.target.closest('button,a'));
    let next = current;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.target.closest('button,a')?.click(); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (current + 1) % items.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (current - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else return;
    event.preventDefault(); items[next]?.focus();
  });
  document.addEventListener('click', (event) => {
    if (searchShell?.classList.contains('is-search-open') && !searchShell.contains(event.target)) closeConversationSearch();
    const openPopover = root.querySelector('.c76-chat-search:not([hidden]),.c76-chat-more-menu:not([hidden]),.c76-message-menu:not([hidden]),.c76-reaction-picker,.c76-emoji-picker:not([hidden]),.c76-attachment-menu:not([hidden]),.c76-filter-menu:not([hidden]),.c76-account-menu:not([hidden])');
    if (openPopover && !openPopover.contains(event.target) && !popoverOpener?.contains(event.target)) closePopovers();
    if (accountMenu && !accountMenu.hidden && !accountMenu.contains(event.target) && !accountMenuToggle?.contains(event.target)) closePopovers();
  });
  compact.addEventListener?.('change', () => { menu?.classList.remove('is-expanded'); syncConversationSearch(); syncConversationScrollbar(); });
  conversationList?.addEventListener('scroll', syncConversationScrollbar, { passive: true });
  window.addEventListener('resize', syncConversationScrollbar, { passive: true });

  const scrollBottom = root.querySelector('[data-scroll-bottom]');
  const syncScrollBottom = () => { if (!messagesNode || !scrollBottom) return; scrollBottom.hidden = messagesNode.scrollHeight - messagesNode.scrollTop - messagesNode.clientHeight < 48; };
  messagesNode?.addEventListener('scroll', () => { rememberMessageScroll(); syncScrollBottom(); }, { passive: true });
  scrollBottom?.addEventListener('click', () => { messagesNode?.scrollTo({ top: messagesNode.scrollHeight, behavior: 'smooth' }); });

  renderSaved(); renderList(); renderConversation({ focus: false }); syncBackButton(); syncConversationSearch(); syncSuggestionNav(); syncScrollBottom();
})();
