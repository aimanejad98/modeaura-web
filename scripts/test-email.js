const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const dns = require('dns');

// Force IPv4
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

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

async function testEmail() {
    console.log('--- Email Configuration Test ---');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`Port: ${process.env.SMTP_PORT}`);
    console.log(`User: ${process.env.SMTP_USER}`);
    console.log(`Pass: ${process.env.SMTP_PASS ? '********' : 'MISSING'}`);
    console.log('--------------------------------');

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: parseInt(process.env.SMTP_PORT || '465') === 465, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        },
        lookup: (hostname, options, callback) => {
            dns.lookup(hostname, { family: 4, all: false }, (err, address, family) => {
                if (err) callback(err, null, 4);
                else callback(null, address, 4);
            });
        }
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection Successful!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Send to self
            subject: 'Test Email - Mode Aura',
            text: 'If you see this, email sending is WORKING!'
        });
        console.log('✅ Email Sent!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Connection Failed!');
        console.error(error);
    }
}

testEmail();
