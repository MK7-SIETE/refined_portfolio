# 🚀 Deployment Guide v2
## Betsaleel Mukuba Portfolio — Complete Setup

---

## ARCHITECTURE OVERVIEW

```
OPTION A (Recommended) — Full Vercel Stack
  Frontend  → Vercel Static (HTML/CSS/JS)
  Backend   → Vercel Serverless (api/contact.js / Node.js)
  Email     → Gmail SMTP via Nodemailer
  Cost      → FREE

OPTION B — Vercel + Laravel on cPanel
  Frontend  → Vercel Static
  Backend   → cPanel Shared Hosting (PHP/Laravel)
  Email     → Gmail SMTP via Laravel Mailable
  Cost      → ~$3–5/month hosting
```

---

## OPTION A: VERCEL FULL STACK (Recommended)

### Step 1 — Get a Gmail App Password
> You CANNOT use your regular Gmail password. An App Password is required.

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (required)
3. Return to Security → scroll down → **App Passwords**
4. Select "Mail" + "Other (Custom name)" → type `Portfolio` → **Generate**
5. Copy the **16-character code** — you'll use this in Step 3

---

### Step 2 — Push code to GitHub

```bash
cd your-portfolio-folder
git init
git add .
git commit -m "Portfolio v2 — serverless email API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main
```

---

### Step 3 — Deploy to Vercel

1. Go to https://vercel.com → sign up/login with GitHub
2. Click **"Add New Project"** → import your portfolio repo
3. Leave all settings as-is → click **"Deploy"**
4. Your site is live in ~60 seconds 🎉

---

### Step 4 — Add Environment Variables (email won't work without this)

Vercel Dashboard → Your Project → **Settings → Environment Variables**

Add these three:

| Variable | Value |
|----------|-------|
| `GMAIL_USER` | `mukuba950@gmail.com` |
| `GMAIL_PASS` | your 16-char App Password from Step 1 |
| `OWNER_EMAIL` | `mukuba950@gmail.com` |

After saving → go to **Deployments** tab → click **Redeploy**

---

### Step 5 — Test the Contact Form

1. Visit your live Vercel URL
2. Fill out the contact form and submit
3. Check `mukuba950@gmail.com` — you should see a notification
4. The sender should receive a branded auto-reply email

---

### Step 6 — Custom Domain (Optional)

Vercel Dashboard → Settings → **Domains** → Add your domain

DNS records to add at your registrar:

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.19.61 |
| CNAME | www | cname.vercel-dns.com |

Propagation takes 1–48 hours.

---

## OPTION B: VERCEL FRONTEND + LARAVEL BACKEND (cPanel)

Use this if you want the full Laravel PHP backend on shared hosting.

### Requirements
- PHP 8.1+ with mod_rewrite
- Composer installed
- Gmail App Password (same as Option A Step 1)
- Shared hosting (Hostinger, InMotion, Bluehost, etc.)

---

### Step 1 — Install Laravel backend locally

```bash
cd laravel-backend/
composer install
cp .env.example .env
php artisan key:generate
```

---

### Step 2 — Configure .env for Gmail

Open `laravel-backend/.env` and set:

```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=mukuba950@gmail.com
MAIL_PASSWORD=your_16_char_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=mukuba950@gmail.com
MAIL_FROM_NAME="Betsaleel Mukuba"
OWNER_EMAIL=mukuba950@gmail.com
```

---

### Step 3 — Test locally

```bash
php artisan serve
# Visit: http://127.0.0.1:8000/api/health
```

---

### Step 4 — Upload to cPanel

1. Upload `laravel-backend/` contents via File Manager or FTP
2. Set Document Root to the `public/` subfolder in cPanel
3. Or add this to your root `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

4. Edit `.env` in File Manager with your real production values

---

### Step 5 — Point frontend to Laravel API

In `js/main.js`, find the fetch call and change the URL:

```js
// From:
const res = await fetch('/api/contact', {

// To your Laravel server URL:
const res = await fetch('https://your-hosting-domain.com/api/contact', {
```

---

### Step 6 — Enable CORS in Laravel

In `config/cors.php` add your Vercel URL:

```php
'allowed_origins' => ['https://your-portfolio.vercel.app'],
'allowed_methods' => ['POST', 'OPTIONS'],
```

---

## FILE STRUCTURE

```
portfolio/
├── index.html                  ← Main single-page site
├── css/style.css               ← All styles
├── js/main.js                  ← All JS (popups, admin, form, particles)
├── assets/                     ← Photos, CV PDF, favicons
├── api/
│   └── contact.js              ← Vercel Serverless API (Option A)
├── laravel-backend/            ← PHP/Laravel backend (Option B)
│   ├── app/Http/Controllers/ContactController.php
│   ├── app/Mail/ContactNotification.php
│   ├── app/Mail/ContactAutoReply.php
│   ├── resources/views/emails/
│   │   ├── contact-notification.blade.php
│   │   └── contact-autoreply.blade.php
│   ├── routes/api.php
│   └── .env.example
├── package.json                ← nodemailer dependency
├── vercel.json                 ← Routing + caching config
└── DEPLOYMENT.md               ← This file
```

---

## EMAIL FLOW

```
Visitor submits contact form
        ↓
POST /api/contact
        ↓
   ┌────┴─────────────────────┐
   ↓                          ↓
Notification email         Auto-reply email
→ mukuba950@gmail.com      → visitor's inbox
  (with Reply button)        (branded HTML template)
```

---

## ADMIN PANEL

Access: click **"Admin"** in the portfolio footer
Default password: `admin2026`
**Change this immediately** → Admin → Security tab

What you can manage:
- Name, bio, headline, rotating typed titles
- Profile photo (hero) + About photo
- CV/Resume PDF
- Email, phone, location
- All social links (GitHub, LinkedIn, Facebook, WhatsApp)
- Dark/Light theme
- EmailJS credentials (optional fallback)
- Admin password
- Full data reset

---

## UPDATING YOUR PORTFOLIO

### Content changes (no redeploy needed)
Use the Admin Panel — saves instantly to browser localStorage.

### Code changes (auto-deploys via GitHub)
```bash
git add .
git commit -m "Update"
git push
# Vercel redeploys automatically in ~30 seconds
```

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Email not sending | Confirm GMAIL_PASS is the App Password, not your account password |
| App Password option missing | You must enable 2-Step Verification on your Google account first |
| API 404 on Vercel | Check vercel.json has the /api/contact route, and api/contact.js exists |
| CORS error from Laravel | Add your Vercel URL to config/cors.php allowed_origins |
| Admin changes lost | Data is browser-local (localStorage) — re-enter on each new device |
| Popups not working | Check browser console — JS may have a load error |
| Fonts missing | Requires internet connection to load Google Fonts |
| Environment variables not working | Must be added in Vercel Dashboard, not in code |

---

## SECURITY CHECKLIST

- [ ] Change admin password from default `admin2026`
- [ ] Gmail App Password set (never commit your real password)
- [ ] `.env` is in `.gitignore` and NOT committed to GitHub
- [ ] Environment variables added in Vercel Dashboard only
- [ ] HTTPS is active (Vercel enables this automatically)

---

*Betsaleel Mukuba Portfolio — Deployment Guide v2 — 2026*
*Stack: HTML · CSS · JavaScript · Vercel Serverless (Node.js/Nodemailer) · Laravel (PHP/Gmail SMTP)*
