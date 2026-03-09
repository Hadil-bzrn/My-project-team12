'use strict';

/* ── Toast ── */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── Stats ── */
function updateStats() {
  const rows  = document.querySelectorAll('.tk-row');
  let total = 0, done = 0, overdue = 0, inprog = 0;
  rows.forEach(r => {
    total++;
    const s = r.dataset.status;
    if (s === 'completed') done++;
    else if (s === 'overdue') overdue++;
    else inprog++;
  });
  document.getElementById('statTotal').textContent    = total;
  document.getElementById('statProgress').textContent = inprog;
  document.getElementById('statDone').textContent     = done;
  document.getElementById('statOverdue').textContent  = overdue;
}

/* ── Checkbox toggle ── */
document.querySelectorAll('.tk-check').forEach(btn => wireCheck(btn));

function wireCheck(btn) {
  btn.addEventListener('click', () => {
    const row = btn.closest('.tk-row');
    const isDone = row.classList.toggle('done');
    btn.dataset.done = isDone;
    if (isDone) {
      row.dataset.status = 'completed';
      // swap badge
      const badge = row.querySelector('.tk-badge');
      badge.className = 'tk-badge completed';
      badge.textContent = 'Completed';
      showToast('✅ Task marked as complete!');
    } else {
      row.dataset.status = 'inprogress';
      const badge = row.querySelector('.tk-badge');
      badge.className = 'tk-badge inprogress';
      badge.textContent = 'In Progress';
      showToast('Task reopened.');
    }
    updateStats();
  });
}

/* ── Filter bar ── */
document.getElementById('filterBtn').addEventListener('click', () => {
  const bar = document.getElementById('filterBar');
  bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
});

document.querySelectorAll('.tk-filter-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.tk-filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const f = pill.dataset.filter;
    document.querySelectorAll('.tk-row').forEach(row => {
      if (f === 'all') {
        row.classList.remove('hidden');
      } else if (f === 'high') {
        row.classList.toggle('hidden', row.dataset.priority !== 'high');
      } else {
        row.classList.toggle('hidden', row.dataset.status !== f);
      }
    });
  });
});

/* ── Add Task Modal ── */
const modal = document.getElementById('taskModal');
document.getElementById('addTaskBtn').addEventListener('click', () => modal.classList.add('open'));
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

function closeModal() {
  modal.classList.remove('open');
  document.getElementById('newTitle').value = '';
  document.getElementById('newAssignee').value = '';
  document.getElementById('newDate').value = '';
  document.getElementById('newMeeting').value = '';
  document.getElementById('titleErr').classList.remove('show');
}

document.getElementById('modalSave').addEventListener('click', () => {
  const title    = document.getElementById('newTitle').value.trim();
  const assignee = document.getElementById('newAssignee').value.trim() || 'Unassigned';
  const date     = document.getElementById('newDate').value;
  const priority = document.getElementById('newPriority').value;
  const meeting  = document.getElementById('newMeeting').value.trim() || 'General';

  if (!title) { document.getElementById('titleErr').classList.add('show'); return; }

  const priorityLabel = { high:'High Priority', medium:'Medium Priority', low:'Low Priority' }[priority];
  const dateLabel = date ? new Date(date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'No due date';

  const row = document.createElement('div');
  row.className = 'tk-row';
  row.dataset.status   = 'inprogress';
  row.dataset.priority = priority;
  row.innerHTML = `
    <button class="tk-check" data-done="false" aria-label="Mark complete">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
    </button>
    <div class="tk-row-body">
      <div class="tk-row-title">${title}</div>
      <div class="tk-row-meta">
        <span><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Due: ${dateLabel}</span>
        <span><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${assignee}</span>
        <span><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> From: ${meeting}</span>
      </div>
    </div>
    <span class="tk-badge ${priority}">${priorityLabel}</span>`;

  document.getElementById('taskList').prepend(row);
  wireCheck(row.querySelector('.tk-check'));
  updateStats();
  closeModal();
  showToast('🎯 Task added successfully!');
});

/* ── Sidebar toggle ── */
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.getElementById('appSidebar')?.classList.toggle('open');
});

updateStats();