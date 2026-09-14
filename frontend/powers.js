/* ==========================================================================
   Luna Morvaine — Powers Page Interactivity
   Moonweaving, Echo Listening, Memory Ink, Hearthlight, Veilwalking
   ========================================================================== */

(function () {
  'use strict';

  const IMAGES = {
    idle: 'assets/hero/idle.png',
    raisedhand: 'assets/hero/raisedhand.png',
    hearthlight: 'assets/hero/hearthlight.png',
  };

  const POWERS = {
    moonweaving: {
      label: 'Moonweaving',
      image: 'raisedhand',
      description:
        "Luna draws moonlight into fine silver-violet threads, weaving them through the air to reveal paths hidden from ordinary sight. She doesn't force a way forward — she simply makes the way visible.",
    },
    echo: {
      label: 'Echo Listening',
      image: 'idle',
      description:
        'Beneath every sentence lies a second, quieter one. Luna hears the fear behind confidence and the loneliness behind a smile — not to intrude, but to understand what words alone cannot say.',
    },
    memoryink: {
      label: 'Memory Ink',
      image: 'raisedhand',
      description:
        'Every story entrusted to Luna is preserved in enchanted ink, traced rune by rune so that no grievance is forgotten or lost. What is written here is kept, not judged.',
    },
    hearthlight: {
      label: 'Hearthlight',
      image: 'hearthlight',
      description:
        'When darkness feels total, Luna summons a small, steady flame — not to blind or overwhelm, but to mark a point of safety a traveler can walk toward.',
    },
    veilwalking: {
      label: 'Veilwalking',
      image: 'idle',
      description:
        'The Haven exists between worlds, and Luna moves easily across that threshold. She arrives the same way she always has: out of shadow, into the light of someone who needed her.',
    },
  };

  let els = {};
  let current = null;

  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

  function initElements() {
    els = {
      stage: qs('#power-stage'),
      figureImg: qs('#power-figure-img'),
      fxLayer: qs('#power-fx-layer'),
      title: qs('#power-title'),
      desc: qs('#power-desc'),
      buttons: qsa('.power-btn'),
    };
  }

  function clearStage() {
    els.stage.classList.remove('echo', 'hearth');
    els.fxLayer.innerHTML = '';
  }

  function setActivePower(key) {
    if (!POWERS[key] || key === current) return;
    current = key;
    const power = POWERS[key];

    clearStage();

    els.buttons.forEach((btn) => {
      const isActive = btn.dataset.power === key;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    els.figureImg.src = IMAGES[power.image];
    els.figureImg.alt = `Luna Morvaine using ${power.label}`;
    els.title.textContent = power.label;
    els.desc.textContent = power.description;

    // small re-trigger of entrance so effect feels fresh
    els.stage.classList.add('power-transition');
    requestAnimationFrame(() => els.stage.classList.remove('power-transition'));

    switch (key) {
      case 'moonweaving':
        renderMoonweaving();
        break;
      case 'echo':
        renderEcho();
        break;
      case 'memoryink':
        renderMemoryInk();
        break;
      case 'hearthlight':
        renderHearthlight();
        break;
      case 'veilwalking':
        renderVeilwalking();
        break;
    }
  }

  /* ---------- Moonweaving: SVG glowing threads ---------- */
  function renderMoonweaving() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 400 500');
    svg.classList.add('moonweave-svg');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.left = '0';
    svg.style.top = '0';

    const defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = `
      <linearGradient id="threadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#c7c6d6" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#8a6fd6" stop-opacity="0.2" />
      </linearGradient>`;
    svg.appendChild(defs);

    const paths = [
      'M 260 150 C 300 130, 330 160, 320 200 C 310 240, 350 250, 360 290',
      'M 255 160 C 290 190, 270 230, 300 260 C 320 280, 300 320, 330 340',
      'M 265 140 C 310 145, 320 190, 290 220 C 270 240, 300 270, 280 310',
    ];

    paths.forEach((d, i) => {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      path.classList.add('moonweave-thread');
      path.style.animationDelay = `${i * 0.4}s`;
      svg.appendChild(path);
    });

    els.fxLayer.appendChild(svg);

    // floating motes
    for (let i = 0; i < 10; i++) {
      const mote = document.createElement('span');
      mote.className = 'moonweave-mote';
      mote.style.left = `${58 + Math.random() * 30}%`;
      mote.style.top = `${28 + Math.random() * 40}%`;
      mote.style.animationDelay = `${Math.random() * 3}s`;
      els.fxLayer.appendChild(mote);
    }
  }

  /* ---------- Echo Listening: pulse + ripples ---------- */
  function renderEcho() {
    els.stage.classList.add('echo');
    for (let i = 1; i <= 3; i++) {
      const ripple = document.createElement('span');
      ripple.className = `echo-ripple r${i}`;
      els.fxLayer.appendChild(ripple);
    }
  }

  /* ---------- Memory Ink: Fehu rune traced ---------- */
  function renderMemoryInk() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 400 500');
    svg.classList.add('rune-svg');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.left = '0';
    svg.style.top = '0';

    // Fehu ᚠ: a vertical stem with two diagonal branches (drawn as 2 strokes)
    const stem = document.createElementNS(ns, 'path');
    stem.setAttribute('d', 'M 300 150 L 300 320');
    stem.classList.add('rune-stroke', 'trace', 'stroke-1', 'rune-glow-pulse');
    stem.style.setProperty('--len', '170');

    const branches = document.createElementNS(ns, 'path');
    branches.setAttribute('d', 'M 300 165 L 345 190 M 300 210 L 345 235');
    branches.classList.add('rune-stroke', 'trace', 'stroke-2', 'rune-glow-pulse');
    branches.style.setProperty('--len', '110');

    svg.appendChild(stem);
    svg.appendChild(branches);
    els.fxLayer.appendChild(svg);

    // ink sparks along the stem
    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('span');
      spark.className = 'ink-spark';
      spark.style.left = `${72 + Math.random() * 8}%`;
      spark.style.top = `${30 + Math.random() * 35}%`;
      spark.style.animationDelay = `${1.6 + Math.random() * 1.5}s`;
      els.fxLayer.appendChild(spark);
    }
  }

  /* ---------- Hearthlight: flicker + embers ---------- */
  function renderHearthlight() {
    els.stage.classList.add('hearth');
    for (let i = 0; i < 12; i++) {
      const ember = document.createElement('span');
      ember.className = 'hearth-ember';
      ember.style.left = `${40 + Math.random() * 20}%`;
      ember.style.bottom = `${30 + Math.random() * 15}%`;
      ember.style.setProperty('--drift', `${(Math.random() - 0.5) * 40}px`);
      ember.style.animationDelay = `${Math.random() * 3.4}s`;
      els.fxLayer.appendChild(ember);
    }
  }

  /* ---------- Veilwalking: reuse apparition effect ---------- */
  function renderVeilwalking() {
    els.stage.classList.add('veil-replay');
    const wrap = els.stage.querySelector('.luna-figure');
    wrap.classList.remove('veil-stage');
    void wrap.offsetWidth; // reflow to restart animation
    wrap.classList.add('veil-stage');

    for (let i = 0; i < 8; i++) {
      const wisp = document.createElement('span');
      wisp.className = 'veil-shadow-wisp';
      wisp.style.left = `${35 + Math.random() * 30}%`;
      wisp.style.top = `${50 + Math.random() * 30}%`;
      wisp.style.animationDelay = `${Math.random() * 1.5}s`;
      els.fxLayer.appendChild(wisp);
    }
  }

  function initButtons() {
    els.buttons.forEach((btn) => {
      btn.addEventListener('click', () => setActivePower(btn.dataset.power));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActivePower(btn.dataset.power);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initElements();
    if (!els.stage) return;
    initButtons();
    setActivePower('moonweaving');
  });
})();
