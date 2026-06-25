import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:A",
    });

    const emails = (existing.data.values ?? []).flat().map((e) => e.toLowerCase());
    if (emails.includes(email.toLowerCase())) {
      return NextResponse.json({ error: "Already registered" }, { status: 409 });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:B",
      valueInputOption: "RAW",
      requestBody: {
        values: [[email, new Date().toISOString()]],
      },
    });

    await resend.emails.send({
      from: "darknyx <welcome@darknyx.trade>",
      to: email,
      subject: "You're on the DARKnyx waitlist",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Space Grotesk',system-ui,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

                    <!-- Card -->
                    <tr>
                      <td style="background:#0f0d15;border:1px solid rgba(255,255,255,0.08);border-top:3px solid #c99e55;border-radius:8px;padding:48px 40px;text-align:center;">

                        <p style="margin:0 0 16px;font-family:monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#c99e55;">
                          YOUR SPOT IS CONFIRMED
                        </p>

                        <h1 style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:-0.02em;color:#f3effc;line-height:1.2;">
                          You're on the waitlist
                        </h1>

                        <p style="margin:0 0 32px;font-size:14px;line-height:1.7;color:rgba(243,239,252,0.55);max-width:380px;margin-left:auto;margin-right:auto;">
                          Thank you for your interest in Darknyx.<br/>You've secured your spot for the private mainnet beta — the first confidential execution protocol on Solana.
                          <br /><br />
                          We'll reach out to <strong style="color:#f3effc;">${email}</strong> when your cohort opens. Early access is limited while we validate the protocol in production.
                        </p>

                        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0 0 28px;" />

                        <p style="margin:0;font-size:12px;color:rgba(243,239,252,0.3);line-height:1.6;">
                          This is a no-reply address. Follow us on
                          <a href="https://x.com/DarkNyxProtocol" style="color:#c99e55;text-decoration:none;">X @DarkNyxProtocol</a>
                          for updates.
                        </p>

                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding-top:24px;text-align:center;">
                        <p style="margin:0;font-size:11px;color:rgba(243,239,252,0.2);">
                          Darknyx Protocol &mdash; darknyx.trade
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
