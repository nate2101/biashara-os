import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { brain, getDashboard, SHOP } from './brain.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors()); app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Simulate WhatsApp webhook: POST /api/chat {from, text}
app.post('/api/chat', (req, res) => {
  const { from = 'guest', text = '' } = req.body || {};
  try {
    const out = brain(String(text), String(from));
    // log like a real inbox
    console.log(`[IN ${from}] ${text}\n[OUT] ${out.reply.slice(0, 120)}...`);
    res.json({ ok: true, ...out });
  } catch (e) { res.status(500).json({ ok: false, error: String(e) }); }
});

app.get('/api/dashboard', (req, res) => res.json({ ok: true, ...getDashboard() }));
app.get('/api/shop', (req, res) => res.json({ ok: true, shop: SHOP }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`💈 Biashara-OS (${SHOP.name}) live on http://localhost:${PORT}`);
  console.log(`Demo dashboard: http://localhost:${PORT}/`);
  console.log(`POST /api/chat {from, text} to simulate WhatsApp`);
});
