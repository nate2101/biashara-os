import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB = path.join(__dirname, 'db.json');

export const SHOP = {
  name: process.env.SHOP_NAME || 'Glow Studio Nairobi',
  hours: 'Mon–Sat 8am–8pm, Sun 10am–5pm',
  mpesa: process.env.MPESA_TILL || 'Till 567890',
  services: [
    { id: 'fade', name: 'Skin Fade', price: 500, mins: 30 },
    { id: 'braids', name: 'Knotless Braids', price: 2500, mins: 180 },
    { id: 'manicure', name: 'Manicure + Gel', price: 1200, mins: 60 },
    { id: 'makeup', name: 'Soft Glam Makeup', price: 2000, mins: 60 },
  ],
};

function load() {
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')); }
  catch { return { bookings: [], leads: [], stats: { booked: 0, saved: 0 } }; }
}
function save(db) { fs.writeFileSync(DB, JSON.stringify(db, null, 2)); }

const GREET = /^(hi|hey|hello|habari|niaje|sasa|mambo)/i;
const PRICE = /(bei|price|how much|gharama|cost)/i;
const BOOK = /(book|reserve|appointment|nafasi|slot|weka)/i;
const HOURS = /(hour|open|close|fungua|saa)/i;
const MPESA = /(pay|lip|mpesa|till|deposit)/i;
const HUMAN = /(human|owner|manager|call|mtu|mwenyewe)/i;

export function brain(text = '', from = 'guest') {
  const db = load();
  const t = text.trim();
  const low = t.toLowerCase();
  const priceList = SHOP.services.map(s => `• ${s.name} — KES ${s.price} (${s.mins}min)`).join('\n');

  // find lead
  let lead = db.leads.find(l => l.from === from);
  if (!lead) { lead = { from, step: 'new', service: null, created: Date.now() }; db.leads.push(lead); }

  let reply = '';

  if (GREET.test(low) && lead.step === 'new') {
    lead.step = 'greeted';
    reply = `Karibu ${SHOP.name}! 💈🔥\nI'm Nia, the AI receptionist — I book instantly, no waiting.\n\n${priceList}\n\nReply with the service name to book e.g. *Skin Fade*\nOpen: ${SHOP.hours}`;
  } else if (PRICE.test(low)) {
    reply = `Here are today's prices 💰:\n${priceList}\n\nWhich one should I book for you?`;
  } else if (HOURS.test(low)) {
    reply = `We're open ${SHOP.hours}. Want the next free slot today? Reply *BOOK*.`;
  } else if (MPESA.test(low)) {
    reply = `Pay easily via M-Pesa 👉 ${SHOP.mpesa}.\nPay 50% deposit to lock your slot, balance after service. Send me the M-Pesa code and I'll confirm instantly ✅`;
  } else if (HUMAN.test(low)) {
    reply = `No stress — I've alerted the owner, they'll call you in ~10 mins 🙏. Meanwhile I can still hold you a slot — which service?`;
  } else if (BOOK.test(low) || SHOP.services.some(s => low.includes(s.name.toLowerCase()) || low.includes(s.id))) {
    const svc = SHOP.services.find(s => low.includes(s.name.toLowerCase()) || low.includes(s.id)) || SHOP.services[0];
    lead.service = svc.id; lead.step = 'slot';
    const slot = nextSlot(db);
    reply = `Perfect — *${svc.name}* KES ${svc.price} (${svc.mins}min) 💈\nI have *${slot}* free. Shall I lock it for you?\nReply *YES ${slot}* to confirm, or *ANOTHER* for other times.`;
    lead.pendingSlot = slot;
  } else if (/^(yes|ndio|sawa|confirm|ok)/i.test(low) && lead.pendingSlot) {
    const svc = SHOP.services.find(s => s.id === lead.service) || SHOP.services[0];
    const booking = { id: 'B' + Date.now().toString(36).toUpperCase(), from, service: svc.name, price: svc.price, slot: lead.pendingSlot, at: Date.now() };
    db.bookings.push(booking); db.stats.booked++;
    lead.step = 'booked'; delete lead.pendingSlot;
    reply = `Locked in! ✅\n🎫 ${booking.id} — *${svc.name}* at *${booking.slot}*\nPay 50% to ${SHOP.mpesa} to secure it. Show this code on arrival.\nNeed to move it? Just say *RESCHEDULE*.`;
  } else if (/another|other/i.test(low)) {
    const slot = nextSlot(db, 1);
    lead.pendingSlot = slot;
    reply = `No problem — next option is *${slot}*. Reply *YES* to take it.`;
  } else if (/resched|cancel|move/i.test(low)) {
    const last = [...db.bookings].reverse().find(b => b.from === from);
    if (last) { last.slot = nextSlot(db, 2); db.stats.saved++; reply = `Done — moved ${last.id} to *${last.slot}* 🔄. See you then!`; }
    else reply = `You have no active booking with me. Reply *BOOK* and I'll sort you now.`;
  } else if (/asante|thanks|thank/i.test(low)) {
    reply = `Karibu sana! 🙏 Tell a friend — we reply in seconds, day & night. Need anything else?`;
  } else {
    reply = `Got you 👍 I can: 1) Show *PRICES* 2) *BOOK* a slot 3) Share *M-PESA* pay 4) Get *HUMAN*.\nWhat do you want? e.g. "book braids tomorrow 2pm"`;
  }

  save(db);
  return { reply, lead, stats: db.stats };
}

function nextSlot(db, offset = 0) {
  const days = ['Today', 'Tomorrow'];
  const hours = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];
  const idx = (db.bookings.length + offset) % (days.length * hours.length);
  return `${days[Math.floor(idx / hours.length)]} ${hours[idx % hours.length]}`;
}

export function getDashboard() {
  const db = load();
  const revenue = db.bookings.reduce((a, b) => a + (b.price || 0), 0);
  return { shop: SHOP, bookings: db.bookings.slice(-20).reverse(), leads: db.leads.length, stats: db.stats, revenue };
}
