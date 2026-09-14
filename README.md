# The Moonlit Haven — Luna Morvaine's Help Portal

A multi-page supernatural help-portal website built around an original character, Luna Morvaine. Built with vanilla HTML/CSS/JS on the frontend and Flask on the backend.

---

## Folder structure

```text
luna-morvaine/
├── frontend/
│   ├── index.html        Home page — Haven entrance, apparition, chat
│   ├── story.html        Origin story timeline
│   ├── powers.html       Interactive powers showcase
│   ├── mission.html      Mission statement
│   ├── help.html         How-it-works + FAQ
│   ├── privacy.html      Privacy Policy
│   ├── terms.html        Terms & Conditions
│   ├── style.css         Design system + page layouts
│   ├── animations.css    All magical power animations
│   ├── script.js         Shared nav/starfield/particles
│   ├── chatbot.js        Conversational chat flow + backend submission
│   ├── powers.js         Interactive powers-page logic
│   └── assets/hero/
│       ├── idle.png
│       ├── raisedhand.png
│       └── hearthlight.png
│
├── backend/
│   ├── app.py             Flask API (grievance submission + email)
│   ├── requirements.txt
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

## Running the frontend

The frontend is static HTML/CSS/JS — no build step required.

**Option A — quick preview:** open `frontend/index.html` directly in a browser. The chatbot will work, but the "Send" button will fail to submit to a backend unless one is running (see below).

**Option B — local server (recommended, avoids browser file:// restrictions):**

```bash
cd frontend
python -m http.server 5500
```

Then visit `http://localhost:5500`.

---

## Running the Flask backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env with real SMTP credentials
python app.py
```

The API runs on `http://localhost:5000` by default, exposing:

- `GET  /api/health` — health check
- `POST /api/grievance` — accepts `{ name, age, location, email, grievance }`, sends an email notification, and returns `{ success: true, submitted_at }` or an error.

The frontend chatbot (`chatbot.js`) calls this endpoint. If your backend runs somewhere other than `http://localhost:5000`, set `window.LUNA_API_BASE` before `chatbot.js` loads, e.g. add this line in each HTML file right before `<script src="chatbot.js"></script>`:

```html
<script>window.LUNA_API_BASE = 'https://your-deployed-backend.example.com';</script>
```

---

## Where to put the Luna images

Already placed at `frontend/assets/hero/idle.png`, `raisedhand.png`, and `hearthlight.png`. If you regenerate the project structure elsewhere, copy your three character PNGs into that same path — the HTML/CSS reference them by that relative path throughout.

---

## Configuring email environment variables

Edit `backend/.env` (copied from `.env.example`):

```text
EMAIL_HOST=smtp.example.com       # e.g. smtp.gmail.com, smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USERNAME=your-address@example.com
EMAIL_PASSWORD=your-app-password  # use an app password, not your main password
RECIPIENT_EMAIL=recipient@example.com
FRONTEND_ORIGIN=http://localhost:5500
```

Never commit a real `.env` file — it's already excluded in `.gitignore`. If email sending fails (bad credentials, network issue), the backend returns an error and the frontend shows an honest in-character error message rather than pretending the message was sent.

---

## How the chatbot works

- On `index.html`, the chat auto-opens ~1.6s after page load (after the veilwalking apparition plays), driven by `data-auto-open-chat="true"` on `<body>` and read by `chatbot.js`.
- On every other page, the conversation is closed by default and reopened via the persistent **Speak with Luna** button in the nav (and page-specific CTA buttons where present).
- The conversation is a simple state machine (`name → age → location → email → grievance → done`) rendered as chat bubbles inside a small floating panel — not a modal, not a separate page — so the Haven background stays visible throughout.
- On grievance submission, `chatbot.js` POSTs JSON to `/api/grievance`. On success, Luna says her two closing lines, a `luna:memory-ink-burst` custom event fires (available as a hook for further visual effects), and the panel minimizes automatically.
- Session data (name, age, etc.) lives only in an in-memory JS object — it resets on page reload, matching "remembers answers during the session."

---

## How the power animations work

`powers.html` holds one shared "stage" — a single Luna image plus an empty effects layer. `powers.js` swaps which image is shown and injects the appropriate effect markup into that layer:

- **Moonweaving** — an inline SVG with animated `<path>` elements using `stroke-dasharray`/`stroke-dashoffset` to "draw" glowing threads on a loop, using `raisedhand.png`.
- **Echo Listening** — CSS-only pulsing glow + expanding ripple rings layered over `idle.png`.
- **Memory Ink** — an SVG tracing of the Fehu rune (ᚠ) stroke-by-stroke via `stroke-dashoffset` animation, finishing with a soft pulsing glow, over `raisedhand.png`.
- **Hearthlight** — a flickering radial-gradient glow plus rising ember particles over `hearthlight.png`.
- **Veilwalking** — reuses the same shadow-apparition CSS animation (`.veil-stage`) used for Luna's entrance on the home page, replayed on demand.

All animations respect `prefers-reduced-motion: reduce` and fall back to a static, fully visible state.

---

## What needs to change before deployment

1. **Backend URL** — set `window.LUNA_API_BASE` in each HTML page (or template it during your build) to point at your deployed Flask API instead of `localhost:5000`.
2. **CORS** — set `FRONTEND_ORIGIN` in `.env` to your real deployed frontend origin instead of `*`/localhost.
3. **Real SMTP credentials** — configure a real transactional email provider (SendGrid, Mailgun, Amazon SES, or a Gmail app password) in `.env`. Never hardcode credentials in source.
4. **HTTPS** — serve both frontend and backend over HTTPS in production.
5. **Rate limiting / spam protection** — the `/api/grievance` endpoint has no rate limiting or CAPTCHA; add one before exposing this publicly.
6. **Legal placeholders** — `privacy.html` and `terms.html` contain bracketed placeholders (e.g. contact email, data retention specifics) that should be filled in with real details, and reviewed given this is a fictional project rather than a real service.
7. **Persistent storage (optional)** — grievances are currently only emailed, not stored in a database. Add persistence if you need a durable record beyond the notification email.
8. **Process manager** — run Flask behind a production WSGI server (e.g. gunicorn) rather than the Flask dev server, and disable `FLASK_DEBUG` in production.

---

## Design notes

Palette: near-black `#07070b`, midnight `#12121e`, deep violet `#241a3d`/`#4b3480`, glow violet `#8a6fd6`, silver `#c7c6d6`, lunar white `#f2f0f8`, warm gold accent `#cfa15c`. Display type is Cormorant Garamond (serif) for headings/quotes; Inter (sans) for UI and body copy.
