'use strict';

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

document.getElementById('saveBtn')?.addEventListener('click', () => {
  showToast('✅ Settings saved successfully!');
});

document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.getElementById('appSidebar')?.classList.toggle('open');
});

// ── Dark mode ──
const darkCheck = document.getElementById('darkModeCheck');
// restore saved preference
if (localStorage.getItem('meetsmart-dark') === 'true') {
  document.body.classList.add('dark-mode');
  if (darkCheck) darkCheck.checked = true;
}
darkCheck?.addEventListener('change', function () {
  document.body.classList.toggle('dark-mode', this.checked);
  localStorage.setItem('meetsmart-dark', this.checked);
  showToast(this.checked ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
});