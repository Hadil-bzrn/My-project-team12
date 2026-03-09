/* =====================================================
   MeetSmart – auth.js
   Handles signin.html and signup.html
===================================================== */
'use strict';

const API = 'http://localhost:3000/api';
let toastTimer;

function showToast(msg, ms = 3200) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function setLoading(btn, loading, label) {
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait...' : label;
}

/* ── Password toggle ── */
document.getElementById('pwToggle')?.addEventListener('click', () => {
  const inp = document.querySelector('.pw-wrap input');
  const icon = document.getElementById('eyeIcon');
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
  } else {
    inp.type = 'password';
    icon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  }
});

/* ── Social login simulation ── */
document.getElementById('googleBtn')?.addEventListener('click', () => {
  showToast('Google OAuth — connect your Google workspace to enable this.');
});
document.getElementById('msBtn')?.addEventListener('click', () => {
  showToast('Microsoft OAuth — connect your Microsoft 365 to enable this.');
});

/* ══════════════ SIGN IN ══════════════ */
const signinForm = document.getElementById('signinForm');
if (signinForm) {
  signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('signinError');
    const btn   = document.getElementById('signinBtn');
    errEl.textContent = '';

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!isValidEmail(email)) { errEl.textContent = 'Please enter a valid email address.'; return; }
    if (!password)             { errEl.textContent = 'Password is required.'; return; }

    setLoading(btn, true, 'Sign In →');
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) { errEl.textContent = data.message || 'Login failed.'; return; }
      if (data.token) localStorage.setItem('ms_token', data.token);
      if (data.user)  localStorage.setItem('ms_user',  JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } catch (_) {
      // Demo fallback: go to dashboard even without backend
      localStorage.setItem('ms_user', JSON.stringify({ name: 'Sarah Jenkins', email }));
      window.location.href = 'dashboard.html';
    } finally {
      setLoading(btn, false, 'Sign In →');
    }
  });
}

/* ══════════════ SIGN UP ══════════════ */
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('signupError');
    const btn   = document.getElementById('signupBtn');
    errEl.textContent = '';

    const name     = document.getElementById('fullName').value.trim();
    const email    = document.getElementById('workEmail').value.trim();
    const password = document.getElementById('newPassword').value;

    if (!name)                 { errEl.textContent = 'Full name is required.'; return; }
    if (!isValidEmail(email))  { errEl.textContent = 'Please enter a valid work email.'; return; }
    if (password.length < 6)   { errEl.textContent = 'Password must be at least 6 characters.'; return; }

    setLoading(btn, true, 'Create account');
    try {
      const res  = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) { errEl.textContent = data.message || 'Signup failed.'; return; }
      if (data.token) localStorage.setItem('ms_token', data.token);
      if (data.user)  localStorage.setItem('ms_user',  JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } catch (_) {
      // Demo fallback
      localStorage.setItem('ms_user', JSON.stringify({ name, email }));
      window.location.href = 'dashboard.html';
    } finally {
      setLoading(btn, false, 'Create account');
    }
  });
}