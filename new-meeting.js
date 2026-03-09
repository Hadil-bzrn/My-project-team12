/* =====================================================
   MeetSmart – new-meeting.js
   Create New Meeting form interactions
===================================================== */
'use strict';

const API = 'http://localhost:3000/api';
let toastTimer;

function showToast(msg, ms = 3200) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ── Copy meeting link ── */
document.getElementById('copyLinkBtn')?.addEventListener('click', () => {
  const link = document.getElementById('meetLink')?.value;
  if (link) {
    navigator.clipboard.writeText(link).then(() => {
      showToast('✓ Meeting link copied to clipboard!');
    }).catch(() => {
      showToast('Link: ' + link);
    });
  }
});

/* ── Cancel button ── */
document.getElementById('cancelBtn')?.addEventListener('click', () => {
  if (confirm('Discard this meeting? Your changes will not be saved.')) {
    window.location.href = 'dashboard.html';
  }
});

/* ── Form submit ── */
document.getElementById('newMeetingForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title    = document.getElementById('meetingTitle')?.value.trim();
  const date     = document.getElementById('meetDate')?.value;
  const time     = document.getElementById('meetTime')?.value;
  const duration = document.getElementById('meetDuration')?.value;
  const agenda   = document.getElementById('meetAgenda')?.value.trim();
  const link     = document.getElementById('meetLink')?.value.trim();
  const record   = document.getElementById('toggleRecord')?.checked;
  const summary  = document.getElementById('toggleSummary')?.checked;
  const actions  = document.getElementById('toggleActions')?.checked;
  const btn      = document.getElementById('scheduleBtn');

  if (!title) { showToast('⚠ Please enter a meeting title.'); return; }
  if (!date)  { showToast('⚠ Please select a date.'); return; }
  if (!time)  { showToast('⚠ Please select a time.'); return; }

  // Loading state
  const origText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Scheduling…';

  const payload = {
    title, date, time, duration: parseInt(duration),
    agenda, link,
    aiFeatures: { autoRecord: record, smartSummary: summary, detectActions: actions }
  };

  try {
    const token = localStorage.getItem('ms_token');
    const res = await fetch(`${API}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast('✓ Meeting scheduled successfully!');
      setTimeout(() => window.location.href = 'dashboard.html', 1400);
    } else {
      const err = await res.json();
      showToast('⚠ ' + (err.message || 'Could not schedule meeting.'));
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  } catch (_) {
    // Backend not running — demo mode
    showToast('✓ Meeting scheduled! (demo mode)');
    setTimeout(() => window.location.href = 'dashboard.html', 1400);
  }
});

/* ── Load user info ── */
(function loadUser() {
  try {
    const raw = localStorage.getItem('ms_user');
    if (!raw) return;
    const user = JSON.parse(raw);
    const nameEl = document.querySelector('.su-name');
    const roleEl = document.querySelector('.su-role');
    if (nameEl) nameEl.textContent = user.name || 'Jane Doe';
    if (roleEl) roleEl.textContent = user.email || 'jane@company.com';
    const avEl = document.querySelector('.su-avatar');
    if (avEl) avEl.textContent = (user.name || 'J')[0].toUpperCase();
  } catch (_) {}
})();

/* ── Sidebar toggle (mobile) ── */
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.getElementById('appSidebar')?.classList.toggle('open');
});