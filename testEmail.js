require('dotenv').config();
const { sendNewMessageNotification, createTransporter } = require('./utils/sendEmail');
const mongoose = require('mongoose');
const Admin = require('./models/admin');

async function testEmail() {
    console.log('--------------------------------------------------');
    console.log('📧 Testing Email Notification Service...');
    console.log('--------------------------------------------------');

    const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
    const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

    console.log('EMAIL_USER configured:', emailUser ? `✅ (${emailUser})` : '❌ Missing in .env');
    console.log('EMAIL_PASS configured:', emailPass ? '✅ (Configured)' : '❌ Missing in .env');

    if (!emailUser || !emailPass) {
        console.error('\n⚠️ Cannot send email: EMAIL_USER and EMAIL_PASS must be configured in server/.env');
        console.log('Example:');
        console.log('  EMAIL_USER=yourgmail@gmail.com');
        console.log('  EMAIL_PASS=your_16_digit_app_password\n');
        process.exit(1);
    }

    try {
        console.log('\nConnecting to database to get registered admin email...');
        await mongoose.connect(process.env.LIVE_URL || process.env.MONOGO_URL);
        const adminUser = await Admin.findOne().sort({ createdAt: 1 });
        const targetEmail = adminUser?.email || process.env.ADMIN_EMAIL || emailUser;
        console.log(`Target Admin Email: ${targetEmail}`);

        console.log('\nSending test message notification...');
        const result = await sendNewMessageNotification({
            toEmail: targetEmail,
            contact: {
                name: 'Test Visitor',
                email: 'visitor@example.com',
                subject: 'Test Portfolio Note Notification',
                message: 'Hello! This is a test email notification to verify your portfolio mailer configuration is working perfectly.',
                createdAt: new Date()
            }
        });

        if (result.success) {
            console.log('\n🎉 SUCCESS! Email notification delivered. Message ID:', result.messageId);
        } else {
            console.error('\n❌ FAILED to send email:', result.error || result.reason);
        }
    } catch (err) {
        console.error('\n❌ Unexpected error:', err.message || err);
    } finally {
        await mongoose.disconnect();
        console.log('--------------------------------------------------\n');
    }
}

testEmail();
