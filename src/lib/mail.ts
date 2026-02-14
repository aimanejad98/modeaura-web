import nodemailer from 'nodemailer';

/**
 * Sends a password reset code to the user's email.
 */
export async function sendResetCode(email: string, code: string) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        console.log('--- DEVELOPMENT MAIL LOG: RESET CODE ---');
        console.log(`To: ${email}`);
        console.log(`Subject: Your Mode AURA Reset Code`);
        console.log(`Code: ${code}`);
        console.log('----------------------------------------');
        return { success: true, loggedToConsole: true };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT),
            secure: parseInt(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const mailOptions = {
            from: SMTP_FROM || `"Mode AURA" <${SMTP_USER}>`,
            to: email,
            subject: 'Your Password Reset Code - Mode AURA',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1B2936; margin: 0;">Mode <span style="color: #D4AF37;">AURA</span></h1>
                    </div>
                    <h2 style="text-align: center; color: #1B2936; font-size: 18px; text-transform: uppercase; letter-spacing: 2px;">Reset Your Password</h2>
                    <p style="text-align: center; color: #666; font-size: 14px; line-height: 1.6;">Use the code below to reset your password. It will expire in 15 minutes.</p>
                    <div style="background: #f9f9f9; padding: 30px; text-align: center; margin: 20px 0; border-radius: 15px;">
                        <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #1B2936;">${code}</span>
                    </div>
                    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email delivery failed:', error);
        throw new Error('Failed to send reset code.');
    }
}

/**
 * Sends a verification link to a new customer.
 */
export async function sendVerificationLink(email: string, token: string) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, NEXT_PUBLIC_BASE_URL } = process.env;
    const baseUrl = NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        console.log('--- DEVELOPMENT MAIL LOG: VERIFICATION LINK ---');
        console.log(`To: ${email}`);
        console.log(`Subject: Verify Your Mode AURA Account`);
        console.log(`Link: ${verifyUrl}`);
        console.log('-----------------------------------------------');
        return { success: true, loggedToConsole: true };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT),
            secure: parseInt(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        const mailOptions = {
            from: SMTP_FROM || `"Mode AURA" <${SMTP_USER}>`,
            to: email,
            subject: 'Verify Your Identity - Mode AURA',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1B2936; margin: 0;">Mode <span style="color: #D4AF37;">AURA</span></h1>
                        <p style="font-size: 10px; color: #ccc; text-transform: uppercase; letter-spacing: 3px;">Where Fashion Meets Accessories</p>
                    </div>
                    <h2 style="text-align: center; color: #1B2936; font-size: 18px; text-transform: uppercase; letter-spacing: 2px;">Welcome to the Atelier</h2>
                    <p style="text-align: center; color: #666; font-size: 14px; line-height: 1.6;">Click the button below to verify your email and activate your account.</p>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${verifyUrl}" style="background: #1B2936; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">Verify Email</a>
                    </div>
                    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">Link expires in 24 hours.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email delivery failed:', error);
        throw new Error('Failed to send verification link.');
    }
}

