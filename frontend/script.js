/* ==========================================================================
   Luna Morvaine — Shared site behavior
   Mobile nav, ambient starfield, drifting particles
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Mobile nav toggle ---------- */
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Ambient starfield ---------- */
  function initStars() {
    const field = document.querySelector('.haven-stars');
    if (!field) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = window.innerWidth < 640 ? 40 : 80;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      const size = Math.random() * 2 + 0.6;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      if (!reduced) {
        star.style.animationDuration = `${3 + Math.random() * 4}s`;
        star.style.animationDelay = `${Math.random() * 4}s`;
      } else {
        star.style.animation = 'none';
        star.style.opacity = '0.4';
      }
      frag.appendChild(star);
    }
    field.appendChild(frag);
  }

  /* ---------- Drifting magical particles (used near hero areas) ---------- */
  function initDriftParticles() {
    const containers = document.querySelectorAll('[data-drift-particles]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    containers.forEach((container) => {
      const density = parseInt(container.dataset.driftParticles, 10) || 14;
      for (let i = 0; i < density; i++) {
        const p = document.createElement('span');
        p.className = 'drift-particle';
        const size = Math.random() * 4 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.bottom = `${Math.random() * 30}%`;
        p.style.animationDuration = `${6 + Math.random() * 6}s`;
        p.style.animationDelay = `${Math.random() * 6}s`;
        container.appendChild(p);
      }
    });
  }

  /* ---------- Footer year ---------- */
  function initFooterYear() {
    const el = document.querySelector('[data-year]');
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initStars();
    initDriftParticles();
    initFooterYear();
  });
})();
