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

    try {
        console.log('Resolving DNS for smtp.gmail.com...');
        // Manually resolve to IPv4
        const addresses = await new Promise((resolve, reject) => {
            dns.resolve4('smtp.gmail.com', (err, addresses) => {
                if (err) reject(err);
                else resolve(addresses);
            });
        });

        if (!addresses || addresses.length === 0) {
            throw new Error('No IPv4 addresses found for smtp.gmail.com');
        }

        const ip = addresses[0];
        console.log(`✅ ID Resolved to: ${ip} (Using this to force IPv4)`);

        const transporter = nodemailer.createTransport({
            host: ip, // Use IP directly
            port: 587, // Try TLS port
            secure: false, // False for TLS
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false,
                // servername: 'smtp.gmail.com' // Required when using IP
            },
            connectionTimeout: 30000,
        });

        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection Successful!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER,
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
