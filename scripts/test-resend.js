const dotenv = require('dotenv');
const { Resend } = require('resend');
const path = require('path');
const fs = require('fs');

// Load .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    console.log(`Loading .env from ${envPath}`);
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else {
    console.log('No .env file found!');
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
    console.log('--- Testing Resend Email ---');
    console.log(`API Key present: ${!!process.env.RESEND_API_KEY}`);
    console.log(`From Address: ${process.env.SMTP_FROM || 'onboarding@resend.dev'}`);

    // Extract email from "Name <email>" format if present, otherwise default
    const defaultTo = 'aimanejad98@gmail.com'; // Fallback for testing
    // Try to extract from SMTP_USER or use hardcoded if missing
    const userEmail = process.env.SMTP_USER || defaultTo;

    console.log(`Sending to: ${userEmail}`);

    try {
        const data = await resend.emails.send({
            from: process.env.SMTP_FROM || 'onboarding@resend.dev',
            to: userEmail,
            subject: 'Test Email via RESEND',
            html: '<p><strong>It works!</strong> This email was sent via Resend API (HTTP) bypassing the SMTP port block.</p>'
        });

        if (data.error) {
            console.error('❌ Resend Error:', data.error);
        } else {
            console.log('✅ Email Sent Successfully!');
            console.log('ID:', data.data.id);
        }
    } catch (e) {
        console.error('❌ Exception:', e);
    }
}

testResend();
