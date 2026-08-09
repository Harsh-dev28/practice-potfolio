const nodemailer = require('nodemailer');

/**
 * Creates and returns a configured Nodemailer transporter
 */
const createTransporter = () => {
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const rawPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

    if (!user || !rawPass) {
        return null;
    }

    const pass = rawPass.trim().replace(/\s+/g, ''); // automatically strip spaces from 16-digit Google App Passwords
    const service = process.env.EMAIL_SERVICE || (user && user.includes('@gmail.com') ? 'gmail' : 'gmail');
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
    const port = process.env.EMAIL_PORT || process.env.SMTP_PORT || 587;
    const secure = process.env.EMAIL_SECURE === 'true' || Number(port) === 465;

    if (host) {
        return nodemailer.createTransporter({
            host,
            port: Number(port),
            secure,
            auth: { user: user.trim(), pass },
            tls: { rejectUnauthorized: false }
        });
    }

    return nodemailer.createTransporter({
        service,
        auth: { user: user.trim(), pass },
        tls: { rejectUnauthorized: false }
    });
};

/**
 * Send an email notification to admin when someone sends a message
 * 
 * @param {Object} options
 * @param {string} options.toEmail - The recipient admin's email
 * @param {Object} options.contact - The contact message details { name, email, subject, message, createdAt }
 */
const sendNewMessageNotification = async ({ toEmail, contact }) => {
    try {
        if (!toEmail) {
            console.warn('[Mailer] No admin email specified. Skipping email notification.');
            return { success: false, reason: 'No admin email provided' };
        }

        const transporter = createTransporter();
        if (!transporter) {
            console.warn(
                '[Mailer] SMTP credentials not configured (EMAIL_USER & EMAIL_PASS). ' +
                'Skipping sending email to admin. To enable email notifications, configure EMAIL_USER and EMAIL_PASS in your .env file.'
            );
            return { success: false, reason: 'SMTP credentials missing' };
        }

        const senderUser = process.env.EMAIL_USER || process.env.SMTP_USER;
        const senderName = process.env.EMAIL_FROM_NAME || 'Portfolio Desk Notification';
        const formattedDate = contact.createdAt 
            ? new Date(contact.createdAt).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })
            : new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

        const mailSubject = `🔔 New Portfolio Message: "${contact.subject}" from ${contact.name}`;

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Message Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f4ed; color: #2d2418;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f4ed; padding: 40px 15px;">
            <tr>
              <td align="center">
                <!-- Main Container -->
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(45, 36, 24, 0.08); border: 1px solid #e0d6c5;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #2d2418; padding: 28px 32px; text-align: left;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
                        📌 Portfolio Desk Alert
                      </h1>
                      <p style="margin: 6px 0 0 0; color: #e0d6c5; font-size: 14px;">
                        Someone just sent you a new message from your portfolio contact form!
                      </p>
                    </td>
                  </tr>

                  <!-- Notification Banner -->
                  <tr>
                    <td style="padding: 24px 32px 10px 32px;">
                      <div style="background-color: #fff9e6; border-left: 4px solid #e74c3c; padding: 14px 18px; border-radius: 4px;">
                        <p style="margin: 0; font-size: 15px; font-weight: 600; color: #2d2418;">
                          ✉️ You have received a new contact note. Please check it below or log into your Admin Panel.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Contact Details Table -->
                  <tr>
                    <td style="padding: 15px 32px 25px 32px;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f0eae1; font-size: 13px; font-weight: bold; color: #7c6c57; width: 120px;">
                            Sender Name:
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f0eae1; font-size: 14px; font-weight: 600; color: #2d2418;">
                            ${contact.name}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f0eae1; font-size: 13px; font-weight: bold; color: #7c6c57;">
                            Sender Email:
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f0eae1; font-size: 14px; color: #e74c3c; font-weight: 600;">
                            <a href="mailto:${contact.email}" style="color: #e74c3c; text-decoration: none;">${contact.email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f0eae1; font-size: 13px; font-weight: bold; color: #7c6c57;">
                            Subject:
                          </td>
                          <td style="padding: 10px 0; border-bottom: 1px solid #f0eae1; font-size: 14px; font-weight: 700; color: #2d2418;">
                            ${contact.subject}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #7c6c57;">
                            Received Date:
                          </td>
                          <td style="padding: 10px 0; font-size: 13px; color: #666666;">
                            ${formattedDate}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Message Content Block -->
                  <tr>
                    <td style="padding: 0 32px 30px 32px;">
                      <div style="font-size: 13px; font-weight: bold; color: #7c6c57; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                        Message Content:
                      </div>
                      <div style="background-color: #faf8f5; border: 1px solid #e8e0d5; border-radius: 8px; padding: 20px; font-size: 14px; line-height: 1.6; color: #333333; white-space: pre-wrap;">
${contact.message}
                      </div>
                    </td>
                  </tr>

                  <!-- Action Buttons -->
                  <tr>
                    <td style="padding: 0 32px 35px 32px; text-align: center;">
                      <a href="mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}" style="display: inline-block; background-color: #e74c3c; color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 6px; margin: 0 6px 10px 6px;">
                        Reply Directly via Email
                      </a>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f5f0e8; padding: 20px 32px; text-align: center; border-top: 1px solid #e0d6c5; font-size: 12px; color: #7c6c57;">
                      <p style="margin: 0 0 4px 0;">This is an automated notification from your Portfolio Website.</p>
                      <p style="margin: 0;">Manage your contact notes in your Admin Panel.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `;

        const plainText = `
🔔 New Portfolio Message Received!
===================================
Someone sent you a message on your portfolio contact form.

Sender Name: ${contact.name}
Sender Email: ${contact.email}
Subject: ${contact.subject}
Date: ${formattedDate}

Message:
--------
${contact.message}

===================================
You can reply directly to: ${contact.email}
`;

        const mailOptions = {
            from: `"${senderName}" <${senderUser}>`,
            to: toEmail,
            subject: mailSubject,
            text: plainText,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Mailer] Message notification successfully sent to admin (${toEmail}):`, info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('[Mailer] Error sending email notification to admin:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendNewMessageNotification,
    createTransporter
};
