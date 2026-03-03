/**
 * ═══════════════════════════════════════════════════════════
 * VERCEL SERVERLESS CONTACT API — api/contact.js
 * Betsaleel Mukuba Portfolio
 *
 * Features:
 *  - Receives contact form POST (JSON)
 *  - Sends email notification to portfolio owner (mukuba950@gmail.com)
 *  - Sends auto-reply to the visitor with branded HTML template
 *  - Rate limiting via in-memory store (per IP)
 *  - Input validation and sanitisation
 *
 * Setup: Set these in Vercel Dashboard → Settings → Environment Variables:
 *   GMAIL_USER     = mukuba950@gmail.com
 *   GMAIL_PASS     = your_gmail_app_password  (NOT your normal password)
 *   OWNER_EMAIL    = mukuba950@gmail.com
 *
 * FREE BACKEND ALTERNATIVES (if you need a persistent server):
 *   • Railway  (https://railway.app)  — FREE $5 credit/month, deploy Node.js in seconds
 *   • Render   (https://render.com)   — FREE tier, Node.js web service
 *   Both support environment variables and can run this same contact.js as an Express server
 *
 * To get a Gmail App Password:
 *   1. Google Account → Security → 2-Step Verification (enable)
 *   2. Google Account → Security → App Passwords
 *   3. Select "Mail" + "Other" → Generate → copy 16-char code
 * ═══════════════════════════════════════════════════════════
 */

const nodemailer = require('nodemailer');

/* ── Rate limiter (in-memory, resets on cold start) ── */
const rateLimitMap = new Map();
const RATE_LIMIT   = 3;   // max requests
const RATE_WINDOW  = 60 * 60 * 1000; // per hour (ms)

function isRateLimited(ip) {
  const now    = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_WINDOW };
  if (now > record.resetAt) { record.count = 0; record.resetAt = now + RATE_WINDOW; }
  record.count++;
  rateLimitMap.set(ip, record);
  return record.count > RATE_LIMIT;
}

/* ── Sanitise text (strip HTML tags) ── */
function sanitise(str = '') {
  return String(str).replace(/<[^>]*>/g, '').trim().substring(0, 2000);
}

/* ── Validate email format ── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ── Build owner notification email HTML ── */
function buildOwnerEmail({ name, email, subject, message }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0A1628;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="100%" style="max-width:580px;background:#0E2040;border-radius:16px;border:1px solid rgba(37,99,235,0.3);overflow:hidden;">
        <!-- HEADER -->
        <tr><td style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8);padding:28px 32px;">
          <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:1px;">BETSALEEL<span style="color:#60a5fa;">.</span></div>
          <div style="font-size:12px;color:#93c5fd;margin-top:4px;letter-spacing:2px;text-transform:uppercase;">Portfolio — New Message</div>
        </td></tr>
        <!-- BODY -->
        <tr><td style="padding:32px;">
          <div style="font-size:18px;font-weight:700;color:#f8fafc;margin-bottom:20px;">📬 New Contact Form Submission</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:10px 14px;background:#152A52;border-radius:8px;margin-bottom:10px;display:block;">
              <div style="font-size:10px;color:#60a5fa;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">From</div>
              <div style="font-size:15px;color:#f8fafc;font-weight:600;">${name}</div>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:10px 14px;background:#152A52;border-radius:8px;">
              <div style="font-size:10px;color:#60a5fa;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Email</div>
              <div style="font-size:15px;color:#f8fafc;"><a href="mailto:${email}" style="color:#60a5fa;">${email}</a></div>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:10px 14px;background:#152A52;border-radius:8px;">
              <div style="font-size:10px;color:#60a5fa;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Subject</div>
              <div style="font-size:15px;color:#f8fafc;">${subject || 'General Enquiry'}</div>
            </td></tr>
            <tr><td style="height:16px;"></td></tr>
            <tr><td style="padding:16px;background:#152A52;border-radius:8px;border-left:3px solid #2563EB;">
              <div style="font-size:10px;color:#60a5fa;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Message</div>
              <div style="font-size:14px;color:#e2e8f0;line-height:1.7;white-space:pre-wrap;">${message}</div>
            </td></tr>
          </table>
          <div style="margin-top:24px;">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your enquiry')}" style="display:inline-block;padding:12px 24px;background:#2563EB;color:#ffffff;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;">↩ Reply to ${name}</a>
          </div>
        </td></tr>
        <!-- FOOTER -->
        <tr><td style="padding:16px 32px;background:#0A1628;border-top:1px solid rgba(255,255,255,0.06);">
          <div style="font-size:11px;color:#475569;text-align:center;">Betsaleel Mukuba Portfolio · Lusaka, Zambia · Automated notification</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Build auto-reply email HTML ── */
function buildAutoReplyEmail({ name, subject }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0A1628;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="100%" style="max-width:580px;background:#0E2040;border-radius:16px;border:1px solid rgba(37,99,235,0.3);overflow:hidden;">
        <!-- HEADER BANNER -->
        <tr><td style="background:linear-gradient(135deg,#1e3a8a,#0891b2);padding:40px 32px;text-align:center;">
          <div style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:2px;">BETSALEEL<span style="color:#60a5fa;">.</span></div>
          <div style="font-size:12px;color:#bae6fd;margin-top:6px;letter-spacing:3px;text-transform:uppercase;">Software Engineer · Full Stack Developer</div>
        </td></tr>
        <!-- BODY -->
        <tr><td style="padding:36px 32px;">
          <h1 style="font-size:20px;font-weight:800;color:#f8fafc;margin:0 0 12px;">Hi ${name}! 👋</h1>
          <p style="font-size:15px;color:#94a3b8;line-height:1.75;margin:0 0 20px;">
            Thank you for reaching out. I've received your message about <strong style="color:#60a5fa;">"${subject || 'your enquiry'}"</strong> and I'll get back to you within <strong style="color:#f8fafc;">24 hours</strong>.
          </p>
          <p style="font-size:15px;color:#94a3b8;line-height:1.75;margin:0 0 28px;">
            While you wait, feel free to explore my work or connect with me on social media.
          </p>

          <!-- CTA BUTTONS -->
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:12px;">
                <a href="https://github.com/MK7-SIETE" style="display:inline-block;padding:11px 20px;background:#152A52;color:#60a5fa;border:1px solid rgba(37,99,235,0.4);border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;">⚡ GitHub</a>
              </td>
              <td style="padding-right:12px;">
                <a href="https://linkedin.com/in/betsaleel-mukuba" style="display:inline-block;padding:11px 20px;background:#152A52;color:#60a5fa;border:1px solid rgba(37,99,235,0.4);border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;">💼 LinkedIn</a>
              </td>
              <td>
                <a href="https://wa.me/260969508654" style="display:inline-block;padding:11px 20px;background:#152A52;color:#60a5fa;border:1px solid rgba(37,99,235,0.4);border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;">💬 WhatsApp</a>
              </td>
            </tr>
          </table>

          <!-- DIVIDER -->
          <div style="height:1px;background:rgba(255,255,255,0.06);margin:32px 0;"></div>

          <!-- SIGNATURE -->
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:16px;vertical-align:top;">
                <div style="width:48px;height:48px;background:linear-gradient(135deg,#2563EB,#06B6D4);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:white;text-align:center;line-height:48px;">B</div>
              </td>
              <td>
                <div style="font-size:15px;font-weight:700;color:#f8fafc;">Betsaleel Mukuba</div>
                <div style="font-size:12px;color:#60a5fa;margin-top:2px;">Software Engineer · Full Stack Developer</div>
                <div style="font-size:11px;color:#475569;margin-top:4px;">📍 Lusaka, Zambia · 📞 +260 96 950 8654</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="padding:16px 32px;background:#0A1628;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <div style="font-size:11px;color:#334155;">
            You received this because you contacted me via my portfolio. Please do not reply to this email directly.
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ══════════════════════════════════════
   MAIN HANDLER
══════════════════════════════════════ */
module.exports = async function handler(req, res) {
  /* CORS */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')  return res.status(405).json({ error: 'Method not allowed' });

  /* Rate limit */
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  /* Parse body */
  const { name, email, subject, message } = req.body || {};

  /* Validate */
  const cleanName    = sanitise(name);
  const cleanEmail   = sanitise(email);
  const cleanSubject = sanitise(subject);
  const cleanMessage = sanitise(message);

  if (!cleanName || cleanName.length < 2)        return res.status(400).json({ error: 'Please enter your full name.' });
  if (!cleanEmail || !isValidEmail(cleanEmail))   return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (!cleanMessage || cleanMessage.length < 10)  return res.status(400).json({ error: 'Message must be at least 10 characters.' });

  /* SMTP transporter — Gmail App Password */
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,  // Gmail App Password (16 chars)
    },
  });

  try {
    /* 1️⃣  Notify owner */
    await transporter.sendMail({
      from:    `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
      to:      process.env.OWNER_EMAIL || 'mukuba950@gmail.com',
      replyTo: cleanEmail,
      subject: `[Portfolio] ${cleanSubject || 'New Contact Message'} — from ${cleanName}`,
      html:    buildOwnerEmail({ name: cleanName, email: cleanEmail, subject: cleanSubject, message: cleanMessage }),
    });

    /* 2️⃣  Auto-reply to visitor */
    await transporter.sendMail({
      from:    `"Betsaleel Mukuba" <${process.env.GMAIL_USER}>`,
      to:      cleanEmail,
      subject: `Thanks for reaching out, ${cleanName}! 👋`,
      html:    buildAutoReplyEmail({ name: cleanName, subject: cleanSubject }),
    });

    return res.status(200).json({ success: true, message: 'Message sent! I\'ll reply within 24 hours.' });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send message. Please try emailing directly: mukuba950@gmail.com' });
  }
};
