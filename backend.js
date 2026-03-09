/* =====================================================
   MeetSmart – backend.js
   Node.js + Express REST API
   
   Install: npm install
   Run:     node backend.js
   Open:    http://localhost:3000
===================================================== */
'use strict';

const express    = require('express');
const cors       = require('cors');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const path       = require('path');
const { body, validationResult } = require('express-validator');

/* ── Config ── */
const PORT       = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'meetsmart_jwt_secret_change_me_in_prod';
const SALT       = 10;

/* ── In-memory store (replace with real DB) ── */
const store = {
  users:    [],  // { id, name, email, hash, createdAt }
  demos:    [],  // { email, name, company, at }
  contacts: [],  // { name, email, message, at }
  meetings: [    // Demo meeting data
    { id: 'm1', title: 'Q3 Product Roadmap Planning', date: new Date(), duration: 45, participants: ['Sarah','James','Maya'], status: 'ready' },
    { id: 'm2', title: 'Engineering Weekly Sync',     date: new Date(Date.now()-86400000), duration: 30, participants: ['Alex','Jamie'], status: 'ready' },
    { id: 'm3', title: 'Client Discovery: Acme Corp', date: new Date(Date.now()-172800000), duration: 60, participants: ['Kyle','Lisa'], status: 'processing' },
  ],
  tasks: [
    { id: 't1', title: 'Update Figma prototypes for Dashboard', meeting: 'Q3 Product Roadmap Planning', due: 'Today', done: false },
    { id: 't2', title: 'Revise API documentation changes',       meeting: 'Engineering Weekly Sync',     due: 'Tomorrow', done: false },
    { id: 't3', title: 'Schedule follow-up with Design team',    meeting: 'Client Discovery: Acme Corp', due: 'Today', done: true  },
  ]
};

function uid() { return Math.random().toString(36).slice(2,10) + Date.now().toString(36); }
function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}
function auth(req, res, next) {
  const tok = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!tok) return res.status(401).json({ message: 'Unauthorized' });
  try { req.user = jwt.verify(tok, JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
}
function validate(req, res) {
  const errs = validationResult(req);
  if (!errs.isEmpty()) { res.status(400).json({ message: errs.array()[0].msg }); return true; }
  return false;
}

/* ── App ── */
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Serve all static files (HTML, CSS, JS) */
app.use(express.static(path.join(__dirname)));

/* ════════════════════════════════════════
   HEALTH CHECK
════════════════════════════════════════ */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', users: store.users.length, ts: new Date() });
});

/* ════════════════════════════════════════
   AUTH — SIGN UP
   POST /api/auth/signup
════════════════════════════════════════ */
app.post('/api/auth/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required.').isLength({ min:2, max:80 }),
    body('email').trim().normalizeEmail().isEmail().withMessage('Valid email required.'),
    body('password').isLength({ min:6 }).withMessage('Password must be at least 6 characters.'),
  ],
  async (req, res) => {
    if (validate(req, res)) return;
    const { name, email, password } = req.body;
    if (store.users.find(u => u.email === email))
      return res.status(409).json({ message: 'An account with this email already exists.' });
    try {
      const hash = await bcrypt.hash(password, SALT);
      const user = { id: uid(), name, email, hash, createdAt: new Date().toISOString() };
      store.users.push(user);
      console.log(`[SIGNUP] ${name} <${email}>`);
      res.status(201).json({ message: 'Account created!', token: signToken(user), user: { id:user.id, name, email } });
    } catch { res.status(500).json({ message: 'Server error.' }); }
  }
);

/* ════════════════════════════════════════
   AUTH — LOGIN
   POST /api/auth/login
════════════════════════════════════════ */
app.post('/api/auth/login',
  [
    body('email').trim().normalizeEmail().isEmail().withMessage('Valid email required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  async (req, res) => {
    if (validate(req, res)) return;
    const { email, password } = req.body;
    const user = store.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: 'No account found with that email.' });
    try {
      const ok = await bcrypt.compare(password, user.hash);
      if (!ok) return res.status(401).json({ message: 'Incorrect password.' });
      console.log(`[LOGIN] ${user.name} <${email}>`);
      res.json({ message: 'Logged in!', token: signToken(user), user: { id:user.id, name:user.name, email } });
    } catch { res.status(500).json({ message: 'Server error.' }); }
  }
);

/* ════════════════════════════════════════
   AUTH — GET ME (protected)
   GET /api/auth/me
════════════════════════════════════════ */
app.get('/api/auth/me', auth, (req, res) => {
  const u = store.users.find(u => u.id === req.user.id);
  if (!u) return res.status(404).json({ message: 'User not found.' });
  res.json({ id:u.id, name:u.name, email:u.email, createdAt:u.createdAt });
});

/* ════════════════════════════════════════
   DASHBOARD DATA (protected)
   GET /api/dashboard
════════════════════════════════════════ */
app.get('/api/dashboard', auth, (req, res) => {
  res.json({
    stats: {
      avgDuration: '34m',
      efficiencyScore: '92%',
      timeSaved: '8.5h',
      actionItemsDone: 24,
      actionItemsTotal: 32
    },
    recentMeetings: store.meetings,
    myTasks: store.tasks
  });
});

/* ════════════════════════════════════════
   MEETINGS (protected)
   GET  /api/meetings
   POST /api/meetings
════════════════════════════════════════ */
app.get('/api/meetings', auth, (req, res) => {
  res.json({ meetings: store.meetings });
});

app.post('/api/meetings', auth,
  [body('title').trim().notEmpty().withMessage('Meeting title required.')],
  (req, res) => {
    if (validate(req, res)) return;
    const m = { id: uid(), title: req.body.title, date: new Date(), duration: 0, participants: [req.user.name], status: 'live' };
    store.meetings.unshift(m);
    console.log(`[NEW MEETING] ${m.title}`);
    res.status(201).json({ message: 'Meeting started!', meeting: m });
  }
);

/* ════════════════════════════════════════
   TASKS (protected)
   GET   /api/tasks
   PATCH /api/tasks/:id
════════════════════════════════════════ */
app.get('/api/tasks', auth, (req, res) => {
  res.json({ tasks: store.tasks });
});

app.patch('/api/tasks/:id', auth, (req, res) => {
  const task = store.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  task.done = req.body.done ?? task.done;
  res.json({ message: 'Task updated.', task });
});

/* ════════════════════════════════════════
   DEMO REQUEST
   POST /api/demo/request
════════════════════════════════════════ */
app.post('/api/demo/request', (req, res) => {
  const { name='Anonymous', email='', company='' } = req.body;
  store.demos.push({ name, email, company, at: new Date().toISOString() });
  console.log(`[DEMO REQUEST] ${name} <${email}>`);
  res.json({ message: "Demo request received! We'll be in touch within 24 hours." });
});

/* ════════════════════════════════════════
   CONTACT
   POST /api/contact
════════════════════════════════════════ */
app.post('/api/contact',
  [
    body('name').trim().notEmpty().withMessage('Name required.'),
    body('email').isEmail().withMessage('Valid email required.'),
    body('message').isLength({ min:10 }).withMessage('Message too short.'),
  ],
  (req, res) => {
    if (validate(req, res)) return;
    const { name, email, message } = req.body;
    store.contacts.push({ name, email, message, at: new Date().toISOString() });
    console.log(`[CONTACT] ${name} <${email}>`);
    res.json({ message: "Message received! We'll respond within 1 business day." });
  }
);

/* ════════════════════════════════════════
   STATS (admin)
   GET /api/stats
════════════════════════════════════════ */
app.get('/api/stats', (req, res) => {
  res.json({
    users: store.users.length,
    demos: store.demos.length,
    contacts: store.contacts.length,
    meetings: store.meetings.length
  });
});

/* SPA fallback */
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.status(404).json({ message: 'Route not found.' });
  }
});

/* Global error handler */
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ message: 'Internal server error.' });
});

/* ── Start ── */
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log(`║   🚀  MeetSmart running                ║`);
  console.log(`║       http://localhost:${PORT}            ║`);
  console.log(`║       /api/health  /api/stats          ║`);
  console.log('╚══════════════════════════════════════╝\n');
});