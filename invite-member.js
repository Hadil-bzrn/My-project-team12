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

function validate() {
  let ok = true;

  const name  = document.getElementById('invName');
  const email = document.getElementById('invEmail');
  const team  = document.getElementById('invTeam');

  // reset
  document.querySelectorAll('.inv-err').forEach(e => e.classList.remove('show'));
  document.querySelectorAll('.inv-field input, .inv-select-wrap select')
    .forEach(el => el.classList.remove('error'));

  if (!name.value.trim()) {
    document.getElementById('nameErr').classList.add('show');
    name.classList.add('error'); ok = false;
  }
  if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    document.getElementById('emailErr').classList.add('show');
    email.classList.add('error'); ok = false;
  }
  if (!team.value) {
    document.getElementById('teamErr').classList.add('show');
    team.classList.add('error'); ok = false;
  }

  return ok;
}

document.getElementById('inviteForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate()) return;

  const name  = document.getElementById('invName').value.trim();
  const email = document.getElementById('invEmail').value.trim();

  // show success overlay
  document.getElementById('successMsg').textContent =
    `An invitation has been sent to ${name} at ${email}.`;
  document.getElementById('successOverlay').classList.add('open');
});

// sidebar toggle
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.getElementById('appSidebar')?.classList.toggle('open');
});