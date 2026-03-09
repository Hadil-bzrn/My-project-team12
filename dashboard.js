'use strict';

const API = 'http://localhost:3000/api';
let toastTimer;

function showToast(msg, ms = 3000) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ── Load user from localStorage ── */
function loadUser() {
  try {
    const raw = localStorage.getItem('ms_user');
    if (!raw) return;
    const user = JSON.parse(raw);
    const initial = (user.name || 'S')[0].toUpperCase();
    const nameEl = document.querySelector('.su-name');
    const roleEl = document.querySelector('.su-role');
    if (nameEl) nameEl.textContent = user.name || 'Sarah Jenkins';
    document.querySelectorAll('.topbar-avatar, .su-avatar').forEach(el => el.textContent = initial);
    // Greeting
    const greetEl = document.querySelector('.db2-greeting h2');
    if (greetEl) {
      const first = (user.name || 'Sarah').split(' ')[0];
      greetEl.textContent = `Good morning, ${first}. Your meetings are getting sharper.`;
    }
  } catch (_) {}
}
loadUser();

/* ── Sidebar toggle (mobile) ── */
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.getElementById('appSidebar')?.classList.toggle('open');
});

/* ── Topbar actions ── */
document.getElementById('alertBtn')?.addEventListener('click', () => {
  showToast('📣 1 new alert: Product roadmap sync is live now!');
});
document.getElementById('newMeetBtn')?.addEventListener('click', () => {
  window.location.href = 'new-meeting.html';
});
document.getElementById('uploadBtn')?.addEventListener('click', () => {
  showToast('📂 Upload Recording — connect storage to enable this.');
});
document.getElementById('startMeetBtn')?.addEventListener('click', () => {
  window.location.href = 'new-meeting.html';
});
document.getElementById('viewAllTasks')?.addEventListener('click', () => {
  showToast('Tasks page coming soon!');
});

/* ── Search bar ── */
document.querySelector('.topbar-search input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') showToast(`🔍 Searching for "${e.target.value}"…`);
});

/* ── Action item checkboxes ── */
document.querySelectorAll('.action-item').forEach(item => {
  const check = item.querySelector('.ai-check');
  check?.addEventListener('click', () => {
    item.classList.toggle('completed');
    check.classList.toggle('done-check');
    check.classList.toggle('empty-check');
    check.textContent = item.classList.contains('completed') ? '✓' : '';
    showToast(item.classList.contains('completed') ? '✓ Task marked complete!' : 'Task marked incomplete');
  });
});

/* ── Live bar animation ── */
const bars = document.querySelectorAll('.db2-bar');
setInterval(() => {
  bars.forEach(b => {
    const cur = parseInt(b.style.height) || 60;
    const next = Math.min(95, Math.max(30, cur + (Math.random() - .5) * 8));
    b.style.transition = 'height 1.2s ease';
    b.style.height = next.toFixed(0) + '%';
  });
}, 3000);

/* ── Team activity buttons ── */
document.querySelectorAll('.ta-btn').forEach(btn => {
  btn.addEventListener('click', () => showToast('Opening team member profile…'));
});

/* ── Logout ── */
document.querySelector('.sidebar-user')?.addEventListener('click', () => {
  if (confirm('Log out of MeetSmart?')) {
    localStorage.removeItem('ms_token');
    localStorage.removeItem('ms_user');
    window.location.href = 'signin.html';
  }
});

/* ── Fetch live data (if backend running) ── */
async function fetchDashboardData() {
  const token = localStorage.getItem('ms_token');
  if (!token) return;
  try {
    const res = await fetch(`${API}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      console.log('[Dashboard data]', data);
      // Update UI with real data here
    }
  } catch (_) {
    // Backend not running — use demo data (already in HTML)
  }
}
fetchDashboardData();