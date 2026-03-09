/* =====================================================
   MeetSmart – landing.js
   Landing page interactions
===================================================== */
'use strict';

/* ── Navbar scroll ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── Mobile hamburger ── */
const ham = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
ham.addEventListener('click', () => {
  ham.classList.toggle('open');
  mobileNav.classList.toggle('open');
});
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => { ham.classList.remove('open'); mobileNav.classList.remove('open'); });
});

/* ── Scroll reveal ── */
const revEls = document.querySelectorAll('.reveal');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); } });
}, { threshold: 0.12 });
revEls.forEach(el => revObs.observe(el));

/* ── Demo button ── */
document.getElementById('demoBtn')?.addEventListener('click', async () => {
  openDemoModal();
  try { await fetch('http://localhost:3000/api/demo/request', { method: 'POST' }); } catch (_) {}
  showToast('✓ Demo request received! We\'ll be in touch shortly.');
});

/* ── Video demo modal ── */
function openDemoModal() {
  const overlay = document.getElementById('demoOverlay');
  const video   = document.getElementById('demoVideo');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (video) video.play();
}

function closeDemoModal() {
  const overlay = document.getElementById('demoOverlay');
  const video   = document.getElementById('demoVideo');
  overlay.classList.remove('open');
  if (video) { video.pause(); video.currentTime = 0; }
  document.body.style.overflow = '';
}

document.getElementById('demoClose')?.addEventListener('click', closeDemoModal);
document.getElementById('demoOverlay')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('demoOverlay')) closeDemoModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDemoModal();
});

/* ── Play demo ── */
document.getElementById('playBtn')?.addEventListener('click', () => {
  openDemoModal();
});

/* ── Active nav on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navAs = document.querySelectorAll('.nav-links a');
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { threshold: 0.45 });
sections.forEach(s => secObs.observe(s));

/* ── Toast ── */
let toastTimer;
function showToast(msg, ms = 3200) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ── Analytics bars animation ── */
const fills = document.querySelectorAll('.an-fill');
setInterval(() => {
  fills.forEach(f => {
    const cur = parseFloat(f.style.width) || 80;
    const next = Math.min(98, Math.max(55, cur + (Math.random() - .5) * 5));
    f.style.transition = 'width 1.5s ease';
    f.style.width = next.toFixed(1) + '%';
  });
}, 3500);