'use strict';
const bar = document.getElementById('spBar');
const DURATION = 2000; // 2 seconds
const INTERVAL = 40;
let elapsed = 0;

const iv = setInterval(() => {
  elapsed += INTERVAL;
  const pct = Math.min((elapsed / DURATION) * 100, 100);
  if (bar) bar.style.width = pct + '%';

  if (elapsed >= DURATION) {
    clearInterval(iv);
    document.body.classList.add('fade-out');
    setTimeout(() => { window.location.href = 'index.html'; }, 450);
  }
}, INTERVAL);