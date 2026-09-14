/* ==========================================================================
   Luna Morvaine — Conversational Chatbot
   Handles the apparition opening, conversational data collection,
   backend submission, and reopen-on-demand behaviour.
   ========================================================================== */

(function () {
  'use strict';

  const API_BASE = window.LUNA_API_BASE || 'http://localhost:5000';

  const STAGES = ['name', 'age', 'location', 'email', 'grievance', 'done'];

  const PROMPTS = {
    greetingA: 'Ah... another traveler finds their way to my door.',
    greetingB: "Welcome to the Moonlit Haven, a sanctuary where your voice is heard. I'm Luna. What shall I call you?",
    age: (name) => `A pleasure to meet you, ${name}. How many years have you walked beneath this moon?`,
    location: 'And where does the moon find you tonight?',
    email: 'If I need to send word back to you, where may I reach you?',
    grievance: "You've made it this far. Take your time. Tell me what brought you here.",
    heard: 'Your words have been heard.',
    recorded: "I've recorded your message in Memory Ink. I'll take it from here.",
    error: "The threads faltered on their way to me... would you tell me once more, or try again shortly?",
  };

  const state = {
    stage: 'greeting',
    data: { name: '', age: '', location: '', email: '', grievance: '' },
    hasGreeted: false,
  };

  let elements = {};

  function qs(sel) { return document.querySelector(sel); }

  function initElements() {
    elements = {
      overlay: qs('#luna-chat-overlay'),
      panel: qs('#luna-chat-panel'),
      messages: qs('#luna-chat-messages'),
      form: qs('#luna-chat-form'),
      input: qs('#luna-chat-input'),
      sendBtn: qs('#luna-chat-send'),
      closeBtn: qs('#luna-chat-close'),
      reopenBtn: qs('#speak-with-luna'),
      typing: qs('#luna-typing-indicator'),
    };
  }

  /* ---------- Message rendering ---------- */
  function addMessage(text, from) {
    if (!elements.messages) return;
    const wrap = document.createElement('div');
    wrap.className = `msg-row ${from}`;
    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${from}`;
    bubble.textContent = text;
    wrap.appendChild(bubble);
    elements.messages.appendChild(wrap);
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }

  function showTyping() {
    if (elements.typing) elements.typing.hidden = false;
    if (elements.messages) elements.messages.scrollTop = elements.messages.scrollHeight;
  }
  function hideTyping() {
    if (elements.typing) elements.typing.hidden = true;
  }

  function lunaSay(text, delay = 700) {
    return new Promise((resolve) => {
      showTyping();
      setTimeout(() => {
        hideTyping();
        addMessage(text, 'luna');
        resolve();
      }, delay);
    });
  }

  /* ---------- Flow control ---------- */
  async function beginConversation() {
    if (state.hasGreeted) return;
    state.hasGreeted = true;
    await lunaSay(PROMPTS.greetingA, 900);
    await lunaSay(PROMPTS.greetingB, 1100);
    state.stage = 'name';
    focusInput();
  }

  function focusInput() {
    if (elements.input) elements.input.focus();
  }

  async function handleUserReply(text) {
    addMessage(text, 'visitor');
    elements.input.value = '';

    switch (state.stage) {
      case 'name':
        state.data.name = text;
        state.stage = 'age';
        await lunaSay(PROMPTS.age(state.data.name));
        break;
      case 'age':
        state.data.age = text;
        state.stage = 'location';
        await lunaSay(PROMPTS.location);
        break;
      case 'location':
        state.data.location = text;
        state.stage = 'email';
        await lunaSay(PROMPTS.email);
        break;
      case 'email':
        state.data.email = text;
        state.stage = 'grievance';
        await lunaSay(PROMPTS.grievance);
        break;
      case 'grievance':
        state.data.grievance = text;
        await submitGrievance();
        break;
      default:
        break;
    }
    focusInput();
  }

  async function submitGrievance() {
    setInputDisabled(true);
    showTyping();
    try {
      const res = await fetch(`${API_BASE}/api/grievance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.data),
      });
      hideTyping();
      if (!res.ok) throw new Error('Submission failed');

      await lunaSay(PROMPTS.heard, 800);
      triggerMemoryInkBurst();
      await lunaSay(PROMPTS.recorded, 1000);
      state.stage = 'done';
      setTimeout(minimizeChat, 1800);
    } catch (err) {
      hideTyping();
      await lunaSay(PROMPTS.error, 600);
      state.stage = 'grievance';
      setInputDisabled(false);
    }
  }

  function setInputDisabled(disabled) {
    if (elements.input) elements.input.disabled = disabled;
    if (elements.sendBtn) elements.sendBtn.disabled = disabled;
  }

  function triggerMemoryInkBurst() {
    document.dispatchEvent(new CustomEvent('luna:memory-ink-burst'));
  }

  /* ---------- Open / minimize / reopen ---------- */
  function openChat() {
    if (!elements.overlay) return;
    elements.overlay.hidden = false;
    elements.overlay.classList.add('is-open');
    if (elements.reopenBtn) elements.reopenBtn.setAttribute('aria-expanded', 'true');
    if (!state.hasGreeted) beginConversation();
    else focusInput();
  }

  function minimizeChat() {
    if (!elements.overlay) return;
    elements.overlay.classList.remove('is-open');
    if (elements.reopenBtn) elements.reopenBtn.setAttribute('aria-expanded', 'false');
    setTimeout(() => { elements.overlay.hidden = true; }, 350);
    setInputDisabled(false);
  }

  /* ---------- Wire up ---------- */
  function initEvents() {
    if (elements.form) {
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = elements.input.value.trim();
        if (!val || state.stage === 'done') return;
        handleUserReply(val);
      });
    }
    if (elements.closeBtn) {
      elements.closeBtn.addEventListener('click', minimizeChat);
    }
    if (elements.reopenBtn) {
      elements.reopenBtn.addEventListener('click', () => {
        const isOpen = elements.overlay && elements.overlay.classList.contains('is-open');
        if (isOpen) minimizeChat();
        else openChat();
      });
    }
  }

  function autoOpenOnHome() {
    if (document.body.dataset.autoOpenChat === 'true') {
      // Let the veilwalking apparition play first
      setTimeout(openChat, 1600);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initEvents();
    autoOpenOnHome();
  });

  // Expose a minimal API for other scripts (e.g. mission page CTA)
  window.LunaChat = { open: () => openChat() };
})();
