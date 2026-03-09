// server.js (Demo Mode - does not send real emails)
// Run commands:
// npm init -y
// npm install express cors body-parser
// node server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Admin token (change this to anything you like)
const ADMIN_TOKEN = 'demo_admin_token_123';

// Data file for storage
const DATA_FILE = path.join(__dirname, 'data.json');

// Ensure the data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ logins: [], actions: [] }, null, 2));
}

// Helpers
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function logDemoEmail(subject, text) {
  console.log('\n===== DEMO EMAIL LOG =====');
  console.log('Subject:', subject);
  console.log('Message:', text);
  console.log('===========================\n');
}

// Record login
app.post('/api/login', (req, res) => {
  const { username, role, email } = req.body;
  const timestamp = new Date().toISOString();

  const data = readData();
  data.logins.push({ username, role, email, timestamp });
  writeData(data);

  logDemoEmail(`Login: ${username} (${role})`, `${username} logged in at ${timestamp}`);

  res.json({ ok: true });
});

// Record volunteer/donation
app.post('/api/action', (req, res) => {
  const payload = req.body;
  const timestamp = new Date().toISOString();

  const data = readData();
  data.actions.push({ ...payload, timestamp });
  writeData(data);

  logDemoEmail(
    `Action: ${payload.option || 'unknown'} by ${payload.name}`,
    `${payload.name} performed ${payload.option} at ${timestamp}`
  );

  res.json({ ok: true });
});

// Admin data endpoint
app.get('/api/data', (req, res) => {
  const token = req.header('x-admin-token');
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });

  const data = readData();
  res.json(data);
});

// Serve static files (optional)
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Demo server running on http://localhost:${PORT}`));
