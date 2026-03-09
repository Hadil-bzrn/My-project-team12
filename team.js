/* =====================================================
   MeetSmart – team.js  (full rewrite)
   Handles: search, modal w/ validation, card creation,
   context menu, message buttons, sidebar toggle
===================================================== */
'use strict';

/* ── Toast ── */
let toastTimer;
function showToast(msg, ms = 3200) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ── Refs ── */
const memberGrid  = document.getElementById('memberGrid');
const tmEmpty     = document.getElementById('tmEmpty');
const memberBadge = document.getElementById('memberBadge');
const inviteModal = document.getElementById('inviteModal');
const ctxMenu     = document.getElementById('ctxMenu');

/* ══════════════════════════════════════════════════
   BADGE COUNT
══════════════════════════════════════════════════ */
function updateBadge() {
  const n = memberGrid.querySelectorAll('.tm-card').length;
  if (memberBadge) memberBadge.textContent = `${n} member${n !== 1 ? 's' : ''}`;
}

/* ══════════════════════════════════════════════════
   SEARCH
══════════════════════════════════════════════════ */
document.getElementById('searchInput')?.addEventListener('input', function () {
  const q = this.value.toLowerCase().trim();
  const cards = memberGrid.querySelectorAll('.tm-card');
  let visible = 0;
  cards.forEach(card => {
    const name = (card.dataset.name || '').toLowerCase();
    const team = (card.dataset.team || '').toLowerCase();
    const show = !q || name.includes(q) || team.includes(q);
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  tmEmpty.style.display = visible === 0 ? 'block' : 'none';
});

/* ══════════════════════════════════════════════════
   MODAL — open / close
══════════════════════════════════════════════════ */
function openModal() {
  inviteModal.classList.add('open');
  document.getElementById('inviteName')?.focus();
}

function closeModal() {
  inviteModal.classList.remove('open');
  // Reset form
  ['inviteName', 'inviteEmail', 'inviteRole'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('error'); }
  });
  const sel = document.getElementById('inviteTeam');
  if (sel) { sel.selectedIndex = 0; sel.classList.remove('error'); }
  ['nameErr', 'teamErr', 'emailErr'].forEach(id => {
    document.getElementById(id)?.classList.remove('show');
  });
}

document.getElementById('inviteBtn')?.addEventListener('click', openModal);
document.getElementById('modalClose')?.addEventListener('click', closeModal);
document.getElementById('modalCancel')?.addEventListener('click', closeModal);
inviteModal?.addEventListener('click', e => { if (e.target === inviteModal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ══════════════════════════════════════════════════
   FORM VALIDATION & SUBMIT — adds new card
══════════════════════════════════════════════════ */
document.getElementById('inviteForm')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const name  = document.getElementById('inviteName').value.trim();
  const team  = document.getElementById('inviteTeam').value;
  const email = document.getElementById('inviteEmail').value.trim();
  const role  = document.getElementById('inviteRole').value.trim();

  // Validate
  let valid = true;

  function setErr(inputId, errId, show) {
    const inp = document.getElementById(inputId);
    const err = document.getElementById(errId);
    inp?.classList.toggle('error', show);
    err?.classList.toggle('show', show);
    if (show) valid = false;
  }

  setErr('inviteName',  'nameErr',  !name);
  setErr('inviteTeam',  'teamErr',  !team);
  setErr('inviteEmail', 'emailErr', !email || !email.includes('@') || !email.includes('.'));

  if (!valid) return;

  // Build new card and inject it
  const card = buildCard(name, team, email, role);
  memberGrid.appendChild(card);

  // Wire up the new card's interactions
  wireCard(card);

  updateBadge();
  closeModal();
  showToast(`✅ Invite sent to ${name} at ${email}!`);
});

/* ══════════════════════════════════════════════════
   BUILD CARD DYNAMICALLY
══════════════════════════════════════════════════ */
const AVATAR_COLORS = [
  'linear-gradient(135deg,#2ECFBF,#00B8A9)',
  'linear-gradient(135deg,#667EEA,#764BA2)',
  'linear-gradient(135deg,#F6AD55,#ED8936)',
  'linear-gradient(135deg,#FC8181,#E53E3E)',
  'linear-gradient(135deg,#68D391,#38A169)',
  'linear-gradient(135deg,#63B3ED,#3182CE)',
];

const TEAM_TAG_COLORS = {
  Product:     'teal',
  Engineering: 'purple',
  Marketing:   'orange',
  Design:      'red',
  Sales:       'blue',
  Operations:  'green',
  HR:          'teal',
};

let cardCounter = 10; // start above existing IDs

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function buildCard(name, team, email, role) {
  const id       = ++cardCounter;
  const initials = getInitials(name);
  const color    = AVATAR_COLORS[id % AVATAR_COLORS.length];
  const tagClass = TEAM_TAG_COLORS[team] || 'teal';
  const roleText = role || 'Team Member';

  const div = document.createElement('div');
  div.className = 'tm-card';
  div.dataset.name = name;
  div.dataset.team = team;
  div.style.animationDelay = '0s';

  div.innerHTML = 
    <div class="tm-card-inner">
      <div class="tm-card-header">
        <div class="tm-avatar" style="background:${color}">${initials}</div>
        <div class="tm-card-menu" data-id="${id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="5" r="1.2" fill="currentColor"/>
            <circle cx="12" cy="12" r="1.2" fill="currentColor"/>
            <circle cx="12" cy="19" r="1.2" fill="currentColor"/>
          </svg>
        </div>
      </div>
      <div class="tm-member-name">${name}</div>
      <div class="tm-member-role">${roleText}</div>
      <div class="tm-team-tag ${tagClass}">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        </svg>
        ${team}
      </div>
      <div class="tm-divider"></div>
      <div class="tm-stats">
        <div class="tm-stat-box">
          <div class="tm-stat-val">0</div>
          <div class="tm-stat-key">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            meetings
          </div>
        </div>
        <div class="tm-stat-box">
          <div class="tm-stat-val">0</div>
          <div class="tm-stat-key">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="9 11 12 14 22 4"/>
            </svg>
            tasks
          </div>
        </div>
        <div class="tm-stat-box">
          <div class="tm-stat-val">—</div>
          <div class="tm-stat-key">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            done
          </div>
        </div>
      </div>
      <div class="tm-card-footer">
        <span class="tm-status-pill offline"><span class="tm-dot"></span>Pending</span>
        <button class="tm-msg-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Message
        </button>
      </div>
    </div>;

  return div;
}

/* ══════════════════════════════════════════════════
   WIRE INTERACTIONS ONTO A CARD
══════════════════════════════════════════════════ */
function wireCard(card) {
  // Three-dot menu
  card.querySelector('.tm-card-menu')?.addEventListener('click', e => {
    e.stopPropagation();
    openCtxMenu(e.currentTarget);
  });
  // Message button
  card.querySelector('.tm-msg-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    showToast(`💬 Opening message with ${card.dataset.name}…`);
  });
}

/* Wire all pre-existing cards on load */
document.querySelectorAll('.tm-card').forEach(wireCard);

/* ══════════════════════════════════════════════════
   CONTEXT MENU
══════════════════════════════════════════════════ */
let activeCard = null;

function openCtxMenu(menuBtn) {
  activeCard = menuBtn.closest('.tm-card');
  const rect = menuBtn.getBoundingClientRect();
  ctxMenu.style.top  = `${rect.bottom + 6}px`;
  ctxMenu.style.left = `${Math.min(rect.left, window.innerWidth - 190)}px`;
  ctxMenu.classList.add('open');
}

document.querySelectorAll('.tm-ctx-item').forEach(item => {
  item.addEventListener('click', () => {
    const action = item.dataset.action;
    const name   = activeCard?.dataset.name || 'Member';

    if (action === 'view')     showToast(`👤 Viewing profile: ${name}`);
    if (action === 'message')  showToast(`💬 Opening message with ${name}…`);
    if (action === 'meetings') showToast(`📅 Loading meetings for ${name}…`);
    if (action === 'remove') {
      if (confirm(`Remove ${name} from the team?`)) {
        activeCard?.remove();
        updateBadge();
        showToast(`🗑 ${name} has been removed.`);
      }
    }
    ctxMenu.classList.remove('open');
  });
});

document.addEventListener('click', () => ctxMenu.classList.remove('open'));

/* ══════════════════════════════════════════════════
   SIDEBAR TOGGLE
══════════════════════════════════════════════════ */
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.getElementById('appSidebar')?.classList.toggle('open');
});

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
updateBadge();