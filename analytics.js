/* =====================================================
   MeetSmart – analytics.js
   Analytics page interactivity
===================================================== */
'use strict';

let toastTimer;
function showToast(msg, ms = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ── Animate bars on load ── */
function animateBars() {
  const fills = document.querySelectorAll('.an-wbar-fill');
  fills.forEach((el, i) => {
    const target = el.style.height;
    el.style.height = '0%';
    setTimeout(() => {
      el.style.transition = 'height 0.7s cubic-bezier(.22,1,.36,1)';
      el.style.height = target;
    }, 100 + i * 120);
  });

  // Animate progress bars
  const progBars = document.querySelectorAll(
    '.an-top-bar-fill, .an-team-bar-fill'
  );
  progBars.forEach((el, i) => {
    const w = el.style.width;
    el.style.width = '0%';
    setTimeout(() => { el.style.width = w; }, 300 + i * 80);
  });
}

/* ── Animate donut segments ── */
function animateDonut() {
  const segs = document.querySelectorAll('.donut-seg');
  segs.forEach((seg, i) => {
    const da = seg.getAttribute('stroke-dasharray');
    seg.setAttribute('stroke-dasharray', `0 339`);
    setTimeout(() => {
      seg.style.transition = 'stroke-dasharray 0.8s ease';
      seg.setAttribute('stroke-dasharray', da);
    }, 200 + i * 150);
  });
}

/* ── Period dropdown ── */
const periodSelect   = document.getElementById('periodSelect');
const periodDropdown = document.getElementById('periodDropdown');
const periodLabel    = document.getElementById('periodLabel');
const periodOptions  = document.querySelectorAll('.an-period-option');

function closeDropdown() {
  periodSelect?.classList.remove('open');
  periodDropdown?.classList.remove('open');
}

periodSelect?.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = periodDropdown?.classList.contains('open');
  if (isOpen) {
    closeDropdown();
  } else {
    periodSelect.classList.add('open');
    periodDropdown?.classList.add('open');
  }
});

periodOptions.forEach(opt => {
  opt.addEventListener('click', (e) => {
    e.stopPropagation();
    const value = opt.dataset.value;
    // Update label
    if (periodLabel) periodLabel.textContent = value;
    // Update active state
    periodOptions.forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    closeDropdown();
    showToast(`Showing data for: ${value}`);
  });
});

// Close on outside click
document.addEventListener('click', () => closeDropdown());

/* ── Export button ── */
document.getElementById('exportBtn')?.addEventListener('click', () => {
  showToast('📊 Exporting analytics report…');
});

/* ── Sidebar toggle (mobile) ── */
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.getElementById('appSidebar')?.classList.toggle('open');
});

/* ── Load user from localStorage ── */
(function loadUser() {
  try {
    const raw = localStorage.getItem('ms_user');
    if (!raw) return;
    const user = JSON.parse(raw);
    const nameEl = document.querySelector('.su-name');
    const roleEl = document.querySelector('.su-role');
    const avEl   = document.querySelector('.su-avatar');
    if (nameEl) nameEl.textContent = user.name  || 'Sarah Chen';
    if (roleEl) roleEl.textContent = user.email || 'sarah@company.com';
    if (avEl)   avEl.textContent   = (user.name || 'S')[0].toUpperCase();
  } catch (_) {}
})();

/* ── Run animations on load ── */
window.addEventListener('DOMContentLoaded', () => {
  animateBars();
  animateDonut();
});