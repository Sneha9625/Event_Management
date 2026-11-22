const nodemailer = require('nodemailer');

let transporter = null;

// Create the transporter lazily so the app still boots without email settings.
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password, not your normal password
      },
    });
  }
  return transporter;
};

const sendEmail = async (to, subject, html) => {
  // Dev fallback: without credentials we just log, so beginners can test
  // the whole flow before setting up Gmail.
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`📧 [email not configured] To: ${to} | Subject: ${subject}`);
    return;
  }

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

// ---------- HTML templates ----------

const layout = (content) => `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f3f4f6; padding:32px 16px;">
    <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden;">
      <div style="background:#4f46e5; color:#ffffff; padding:20px 24px; font-size:20px; font-weight:bold;">
        🎟️ EventHub
      </div>
      <div style="padding:24px; color:#1f2937; font-size:15px; line-height:1.6;">
        ${content}
      </div>
      <div style="padding:16px 24px; background:#f9fafb; color:#6b7280; font-size:12px;">
        You received this email because you have an account on EventHub.
      </div>
    </div>
  </div>`;

const otpEmailTemplate = (name, otp) =>
  layout(`
    <p>Hi ${name},</p>
    <p>Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
    <p style="font-size:32px; font-weight:bold; letter-spacing:8px; text-align:center;
              background:#eef2ff; color:#4f46e5; padding:16px; border-radius:8px;">
      ${otp}
    </p>
    <p>If you didn't create an account, you can safely ignore this email.</p>
  `);

const rsvpEmailTemplate = (name, event) =>
  layout(`
    <p>Hi ${name},</p>
    <p>You're registered for <strong>${event.title}</strong>! 🎉</p>
    <table style="width:100%; border-collapse:collapse; margin:16px 0;">
      <tr><td style="padding:6px 0; color:#6b7280;">📅 Date</td>
          <td style="padding:6px 0;">${new Date(event.date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</td></tr>
      <tr><td style="padding:6px 0; color:#6b7280;">📍 Venue</td>
          <td style="padding:6px 0;">${event.venue}</td></tr>
    </table>
    <p>See you there!</p>
  `);

module.exports = { sendEmail, otpEmailTemplate, rsvpEmailTemplate };
