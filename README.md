# 💈 Biashara-OS — WhatsApp AI Receptionist for Salons

Built by **nate2101**, 20yo focused founder. No distractions.

> An AI that lives on a salon's WhatsApp: answers in seconds (EN + Sheng), shows prices, books slots, takes M-Pesa deposit, follows up no-shows, and sends the owner a daily money summary.

## Why this wins
- Salon owners lose customers every night they don't reply. AI replies in 3 seconds, 24/7.
- They already pay 20-30k KES for a receptionist. This is 10-15k and never sleeps.
- WhatsApp + M-Pesa = the real OS of Kenyan business. No app to install.

## Run the 60-sec demo (take this to shops on your phone)
```bash
npm install
npm start
# open http://localhost:3001
```
Left = customer WhatsApp. Right = owner dashboard. Type: `hi` → `bei?` → `book fade` → `YES`.

## API (WhatsApp webhook-ready)
`POST /api/chat {from, text}` → `{reply, stats}`
`GET /api/dashboard` → bookings, revenue, leads
Plug real WhatsApp via Meta Cloud API / Twilio / your existing bot session — `brain()` is transport-agnostic.

## 7-day field plan (no code excuses)
1. Pick 1 street, 15 salons. Walk in: "Naeza kuonyesha kwa simu yako 30 sec?"
2. Show demo. Offer: "2 weeks free. 10+ bookings or I remove it."
3. Goal: 3 YES. Names + WhatsApp numbers.
4. Real wiring week 2: connect their real WhatsApp number + Google Calendar.
5. After 2 weeks: screenshot "AI booked 23" → charge 10k/mo.

Discipline > motivation. Ship daily.
