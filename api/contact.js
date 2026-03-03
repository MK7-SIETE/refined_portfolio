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
  const iconReply = `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/gmail.svg" width="14" height="14" alt="Reply" style="vertical-align:middle;filter:invert(1);margin-right:6px;"/>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>New Portfolio Message</title>
</head>
<body style="margin:0;padding:0;background:#060E1F;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0F2460,#1344A8,#0369A1);border-radius:16px 16px 0 0;padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <div style="font-size:9px;color:rgba(255,255,255,0.45);letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">Portfolio Notification</div>
                    <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:2px;">BM<span style="color:#38BDF8;">.</span></div>
                  </td>
                  <td align="right">
                    <div style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:8px 14px;display:inline-block;">
                      <div style="font-size:10px;color:#BAE6FD;letter-spacing:1px;text-transform:uppercase;">New Message</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ALERT STRIP -->
          <tr>
            <td style="background:#1344A8;padding:10px 40px;text-align:center;">
              <span style="font-size:11px;color:#BFDBFE;letter-spacing:1px;">Someone just reached out through your portfolio contact form</span>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#0D1F45;padding:36px 40px;">

              <!-- Sender fields -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;">
                <tr>
                  <td style="padding-bottom:10px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="background:#0A1628;border:1px solid rgba(37,99,235,0.25);border-radius:10px;padding:14px 18px;">
                          <div style="font-size:9px;color:#38BDF8;text-transform:uppercase;letter-spacing:2px;margin-bottom:5px;">From</div>
                          <div style="font-size:16px;font-weight:700;color:#F1F5F9;">${name}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:10px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="background:#0A1628;border:1px solid rgba(37,99,235,0.25);border-radius:10px;padding:14px 18px;">
                          <div style="font-size:9px;color:#38BDF8;text-transform:uppercase;letter-spacing:2px;margin-bottom:5px;">Email</div>
                          <div style="font-size:15px;color:#60A5FA;"><a href="mailto:${email}" style="color:#60A5FA;text-decoration:none;">${email}</a></div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="background:#0A1628;border:1px solid rgba(37,99,235,0.25);border-radius:10px;padding:14px 18px;">
                          <div style="font-size:9px;color:#38BDF8;text-transform:uppercase;letter-spacing:2px;margin-bottom:5px;">Subject</div>
                          <div style="font-size:15px;font-weight:600;color:#F1F5F9;">${subject || 'General Enquiry'}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message block -->
              <div style="font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;">Message</div>
              <div style="background:#0A1628;border:1px solid rgba(37,99,235,0.25);border-left:3px solid #2563EB;border-radius:10px;padding:20px 20px;font-size:14px;color:#CBD5E1;line-height:1.8;white-space:pre-wrap;">${message}</div>

              <!-- Reply CTA -->
              <div style="margin-top:28px;">
                <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your enquiry')}"
                   style="display:inline-block;padding:13px 26px;background:linear-gradient(135deg,#1D4ED8,#0891B2);color:#ffffff;border-radius:9px;font-size:13px;font-weight:800;text-decoration:none;letter-spacing:0.5px;">
                  ${iconReply} Reply to ${name}
                </a>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#060E1F;border-radius:0 0 16px 16px;padding:18px 40px;border-top:1px solid rgba(255,255,255,0.04);text-align:center;">
              <p style="font-size:10px;color:#1E293B;margin:0;">
                Betsaleel Mukuba Portfolio &nbsp;&middot;&nbsp; Automated notification &nbsp;&middot;&nbsp; Do not forward
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ── Build auto-reply email HTML ── */
function buildAutoReplyEmail({ name, subject }) {
  /* Inline SVG icons — render in all email clients */
  const iconGithub = `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/github.svg" width="16" height="16" alt="GitHub" style="vertical-align:middle;filter:invert(1);margin-right:6px;"/>`;
  const iconLinkedin = `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linkedin.svg" width="16" height="16" alt="LinkedIn" style="vertical-align:middle;filter:invert(58%) sepia(98%) saturate(600%) hue-rotate(180deg);margin-right:6px;"/>`;
  const iconWhatsapp = `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/whatsapp.svg" width="16" height="16" alt="WhatsApp" style="vertical-align:middle;filter:invert(58%) sepia(60%) saturate(500%) hue-rotate(95deg);margin-right:6px;"/>`;
  const iconPin = `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/googlemaps.svg" width="12" height="12" alt="Location" style="vertical-align:middle;filter:invert(1);opacity:0.5;margin-right:4px;"/>`;
  const iconPhone = `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/signal.svg" width="12" height="12" alt="Phone" style="vertical-align:middle;filter:invert(1);opacity:0.5;margin-right:4px;"/>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Thanks for reaching out</title>
</head>
<body style="margin:0;padding:0;background:#060E1F;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- CARD -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;">

          <!-- ░░ HEADER ░░ -->
          <tr>
            <td style="background:linear-gradient(135deg,#0F2460 0%,#1344A8 50%,#0369A1 100%);border-radius:16px 16px 0 0;padding:44px 40px;text-align:center;">
              <!-- Logo wordmark -->
              <div style="font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:4px;text-transform:uppercase;margin-bottom:16px;">Portfolio</div>
              <div style="font-size:36px;font-weight:900;color:#ffffff;letter-spacing:3px;line-height:1;">BM<span style="color:#38BDF8;">.</span></div>
              <div style="margin-top:14px;display:inline-block;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:20px;padding:5px 16px;">
                <span style="font-size:11px;color:#BAE6FD;letter-spacing:2px;text-transform:uppercase;">Software Engineer &nbsp;&middot;&nbsp; Full Stack Developer</span>
              </div>
            </td>
          </tr>

          <!-- ░░ CONFIRMATION BANNER ░░ -->
          <tr>
            <td style="background:#0D1F45;padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:24px 20px;background:#0F2A5E;border-radius:0 0 12px 12px;text-align:center;border-bottom:3px solid #2563EB;">
                    <!-- Checkmark circle -->
                    <div style="width:52px;height:52px;background:linear-gradient(135deg,#16A34A,#15803D);border-radius:50%;margin:0 auto 12px;line-height:52px;text-align:center;">
                      <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/checkmarx.svg" width="24" height="24" alt="Sent" style="vertical-align:middle;filter:invert(1);margin-top:14px;"/>
                    </div>
                    <div style="font-size:18px;font-weight:800;color:#F0FDF4;margin-bottom:4px;">Message Received</div>
                    <div style="font-size:13px;color:#86EFAC;">Your enquiry has been successfully delivered</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ░░ BODY ░░ -->
          <tr>
            <td style="background:#0D1F45;padding:36px 40px;">

              <p style="font-size:22px;font-weight:800;color:#F1F5F9;margin:0 0 8px 0;">Hi ${name},</p>
              <p style="font-size:15px;color:#94A3B8;line-height:1.8;margin:0 0 16px 0;">
                Thank you for getting in touch. I have received your message regarding
                <span style="color:#60A5FA;font-weight:600;">&ldquo;${subject || 'your enquiry'}&rdquo;</span>
                and will personally review it shortly.
              </p>
              <p style="font-size:15px;color:#94A3B8;line-height:1.8;margin:0 0 28px 0;">
                You can expect a response within <span style="color:#F1F5F9;font-weight:700;">24&nbsp;hours</span>.
                In the meantime, feel free to explore my work below.
              </p>

              <!-- Response time badge -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#0A1628;border:1px solid rgba(37,99,235,0.35);border-radius:10px;padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td width="50%" style="border-right:1px solid rgba(255,255,255,0.07);padding-right:16px;text-align:center;">
                          <div style="font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Avg. Response</div>
                          <div style="font-size:20px;font-weight:900;color:#38BDF8;">24 hrs</div>
                        </td>
                        <td width="50%" style="padding-left:16px;text-align:center;">
                          <div style="font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Based In</div>
                          <div style="font-size:14px;font-weight:700;color:#F1F5F9;">Lusaka, Zambia</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Section label -->
              <div style="font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">Connect with me</div>

              <!-- Social buttons -->
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding-right:10px;padding-bottom:10px;">
                    <a href="https://github.com/MK7-SIETE" target="_blank"
                       style="display:inline-block;padding:11px 18px;background:#161B22;border:1px solid rgba(255,255,255,0.12);border-radius:8px;font-size:12px;font-weight:700;color:#e6edf3;text-decoration:none;white-space:nowrap;">
                      ${iconGithub} GitHub
                    </a>
                  </td>
                  <td style="padding-right:10px;padding-bottom:10px;">
                    <a href="https://linkedin.com/in/betsaleel-mukuba" target="_blank"
                       style="display:inline-block;padding:11px 18px;background:#0A66C2;border:1px solid rgba(255,255,255,0.12);border-radius:8px;font-size:12px;font-weight:700;color:#ffffff;text-decoration:none;white-space:nowrap;">
                      ${iconLinkedin} LinkedIn
                    </a>
                  </td>
                  <td style="padding-bottom:10px;">
                    <a href="https://wa.me/260969508654" target="_blank"
                       style="display:inline-block;padding:11px 18px;background:#128C7E;border:1px solid rgba(255,255,255,0.12);border-radius:8px;font-size:12px;font-weight:700;color:#ffffff;text-decoration:none;white-space:nowrap;">
                      ${iconWhatsapp} WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height:1px;background:linear-gradient(to right,transparent,rgba(37,99,235,0.4),transparent);margin:32px 0;"></div>

              <!-- Signature -->
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding-right:16px;vertical-align:middle;">
                    <div style="width:52px;height:52px;background:linear-gradient(135deg,#1D4ED8,#0891B2);border-radius:12px;text-align:center;line-height:52px;font-size:22px;font-weight:900;color:#ffffff;">B</div>
                  </td>
                  <td style="vertical-align:middle;">
                    <div style="font-size:16px;font-weight:800;color:#F1F5F9;margin-bottom:2px;">Betsaleel Mukuba</div>
                    <div style="font-size:12px;color:#38BDF8;margin-bottom:5px;">Software Engineer &nbsp;&middot;&nbsp; Full Stack Developer</div>
                    <div style="font-size:11px;color:#475569;">
                      ${iconPin} Lusaka, Zambia &nbsp;&nbsp;
                      ${iconPhone} +260 96 950 8654
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ░░ FOOTER ░░ -->
          <tr>
            <td style="background:#060E1F;border-radius:0 0 16px 16px;padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
              <p style="font-size:11px;color:#1E293B;margin:0 0 6px 0;">
                &copy; ${new Date().getFullYear()} Betsaleel Mukuba &nbsp;&middot;&nbsp; Lusaka, Zambia
              </p>
              <p style="font-size:10px;color:#1E293B;margin:0;">
                You received this automated reply because you submitted the contact form on my portfolio.<br/>Please do not reply to this email — use the social links above to get in touch.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
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
