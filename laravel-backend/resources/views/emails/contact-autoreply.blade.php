<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thanks for reaching out!</title>
</head>
<body style="margin:0;padding:0;background:#0A1628;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="100%" style="max-width:600px;background:#0E2040;border-radius:16px;border:1px solid rgba(37,99,235,0.3);overflow:hidden;" cellpadding="0" cellspacing="0">

        <!-- HEADER -->
        <tr><td style="background:linear-gradient(135deg,#1e3a8a,#0891b2);padding:44px 36px;text-align:center;">
          <div style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:3px;">
            BETSALEEL<span style="color:#60a5fa;">.</span>
          </div>
          <div style="font-size:11px;color:#bae6fd;margin-top:8px;letter-spacing:3px;text-transform:uppercase;">
            Software Engineer &middot; Full Stack Developer
          </div>
        </td></tr>

        <!-- BODY -->
        <tr><td style="padding:40px 36px;">
          <h1 style="font-size:22px;font-weight:800;color:#f8fafc;margin:0 0 14px;">
            Hi {{ $data['name'] }}! 👋
          </h1>
          <p style="font-size:15px;color:#94a3b8;line-height:1.8;margin:0 0 18px;">
            Thank you for reaching out. I've received your message about
            <strong style="color:#60a5fa;">"{{ $data['subject'] ?: 'your enquiry' }}"</strong>
            and I'll get back to you personally within <strong style="color:#f8fafc;">24 hours</strong>.
          </p>
          <p style="font-size:15px;color:#94a3b8;line-height:1.8;margin:0 0 32px;">
            While you wait, feel free to explore my work, check out my latest projects on GitHub,
            or connect with me on LinkedIn.
          </p>

          <!-- SOCIAL BUTTONS -->
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding-right:10px;">
                <a href="https://github.com/MK7-SIETE"
                   style="display:inline-block;padding:11px 18px;background:#152A52;color:#60a5fa;border:1px solid rgba(37,99,235,0.4);border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;">
                  ⚡ GitHub
                </a>
              </td>
              <td style="padding-right:10px;">
                <a href="https://linkedin.com/in/betsaleel-mukuba"
                   style="display:inline-block;padding:11px 18px;background:#152A52;color:#60a5fa;border:1px solid rgba(37,99,235,0.4);border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;">
                  💼 LinkedIn
                </a>
              </td>
              <td>
                <a href="https://wa.me/260969508654"
                   style="display:inline-block;padding:11px 18px;background:#152A52;color:#60a5fa;border:1px solid rgba(37,99,235,0.4);border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;">
                  💬 WhatsApp
                </a>
              </td>
            </tr>
          </table>

          <!-- DIVIDER -->
          <div style="height:1px;background:rgba(255,255,255,0.07);margin:36px 0;"></div>

          <!-- SIGNATURE -->
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding-right:18px;vertical-align:top;">
                <div style="width:52px;height:52px;background:linear-gradient(135deg,#2563EB,#06B6D4);border-radius:50%;text-align:center;line-height:52px;font-size:20px;font-weight:900;color:#ffffff;">B</div>
              </td>
              <td>
                <div style="font-size:16px;font-weight:800;color:#f8fafc;">Betsaleel Mukuba</div>
                <div style="font-size:12px;color:#60a5fa;margin-top:3px;">Software Engineer &middot; Full Stack Developer</div>
                <div style="font-size:11px;color:#475569;margin-top:6px;">📍 Lusaka, Zambia</div>
                <div style="font-size:11px;color:#475569;">📞 +260 96 950 8654</div>
                <div style="font-size:11px;color:#475569;">✉️ mukuba950@gmail.com</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="padding:16px 36px;background:#0A1628;border-top:1px solid rgba(255,255,255,0.06);">
          <div style="font-size:11px;color:#334155;text-align:center;">
            You received this because you contacted Betsaleel Mukuba via his portfolio website.
            Please do not reply to this email directly — your message has already been received.
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
