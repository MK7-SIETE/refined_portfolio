<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background:#0A1628;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="100%" style="max-width:600px;background:#0E2040;border-radius:16px;border:1px solid rgba(37,99,235,0.3);overflow:hidden;" cellpadding="0" cellspacing="0">

        <!-- HEADER -->
        <tr><td style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8);padding:28px 36px;">
          <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:2px;font-family:'Segoe UI',sans-serif;">
            BETSALEEL<span style="color:#60a5fa;">.</span>
          </div>
          <div style="font-size:11px;color:#93c5fd;margin-top:6px;letter-spacing:3px;text-transform:uppercase;">
            Portfolio — New Contact Message
          </div>
        </td></tr>

        <!-- BODY -->
        <tr><td style="padding:32px 36px;">
          <h2 style="font-size:18px;font-weight:700;color:#f8fafc;margin:0 0 24px;">
            📬 You have a new message
          </h2>

          <!-- FROM -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:12px 16px;background:#152A52;border-radius:8px;margin-bottom:10px;">
              <div style="font-size:10px;color:#60a5fa;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">From</div>
              <div style="font-size:15px;color:#f8fafc;font-weight:600;">{{ $data['name'] }}</div>
            </td></tr>
            <tr><td style="height:10px;"></td></tr>
            <!-- EMAIL -->
            <tr><td style="padding:12px 16px;background:#152A52;border-radius:8px;">
              <div style="font-size:10px;color:#60a5fa;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Email</div>
              <div style="font-size:15px;"><a href="mailto:{{ $data['email'] }}" style="color:#60a5fa;text-decoration:none;">{{ $data['email'] }}</a></div>
            </td></tr>
            <tr><td style="height:10px;"></td></tr>
            <!-- SUBJECT -->
            <tr><td style="padding:12px 16px;background:#152A52;border-radius:8px;">
              <div style="font-size:10px;color:#60a5fa;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Subject</div>
              <div style="font-size:15px;color:#f8fafc;">{{ $data['subject'] ?: 'General Enquiry' }}</div>
            </td></tr>
            <tr><td style="height:16px;"></td></tr>
            <!-- MESSAGE -->
            <tr><td style="padding:16px;background:#152A52;border-radius:8px;border-left:3px solid #2563EB;">
              <div style="font-size:10px;color:#60a5fa;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Message</div>
              <div style="font-size:14px;color:#e2e8f0;line-height:1.75;white-space:pre-wrap;">{{ $data['message'] }}</div>
            </td></tr>
          </table>

          <!-- REPLY BUTTON -->
          <div style="margin-top:28px;">
            <a href="mailto:{{ $data['email'] }}?subject=Re: {{ urlencode($data['subject'] ?: 'Your enquiry') }}"
               style="display:inline-block;padding:13px 26px;background:#2563EB;color:#ffffff;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">
              ↩ Reply to {{ $data['name'] }}
            </a>
          </div>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="padding:16px 36px;background:#0A1628;border-top:1px solid rgba(255,255,255,0.06);">
          <div style="font-size:11px;color:#475569;text-align:center;">
            Betsaleel Mukuba Portfolio &middot; Lusaka, Zambia &middot; Automated notification via Laravel
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
