import { resend } from './resend';

const { SMTP_FROM, NEXT_PUBLIC_BASE_URL } = process.env;

/**
 * Robust email sender using Resend.
 * Replaces the old Nodemailer transport.
 */
export async function sendMailWithFallback(mailOptions: any, logTag: string) {
    console.log(`[Mail] Sending email via Resend: ${logTag}`);

    // Validate From Address
    // Resend free tier ONLY allows 'onboarding@resend.dev' or verified domains.
    // We use the environment variable, but fallback to safety if missing.
    const fromAddress = SMTP_FROM || 'onboarding@resend.dev';

    try {
        const data = await resend.emails.send({
            from: fromAddress,
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
        });

        if (data.error) {
            console.error(`[Mail] Resend Error:`, data.error);
            return { success: false, error: data.error.message };
        }

        console.log(`[Mail] Success! Id: ${data.data?.id}`);
        return { success: true };
    } catch (error: any) {
        console.error(`[Mail] Exception:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Sends a password reset code.
 */
export async function sendResetCode(email: string, code: string) {
    return sendMailWithFallback({
        to: email,
        subject: 'Your Password Reset Code - Mode AURA',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="https://modeaura.ca/logo.png" alt="Mode Aura" style="max-width: 150px; height: auto; display: block; margin: 0 auto;">
                </div>
                <h2 style="text-align: center; color: #1B2936; font-size: 18px; text-transform: uppercase; letter-spacing: 2px;">Reset Your Password</h2>
                <p style="text-align: center; color: #666; font-size: 14px; line-height: 1.6;">Use the code below to reset your password. It will expire in 15 minutes.</p>
                <div style="background: #f9f9f9; padding: 30px; text-align: center; margin: 20px 0; border-radius: 15px;">
                    <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #1B2936;">${code}</span>
                </div>
                <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
            </div>
        `,
    }, "RESET CODE");
}

/**
 * Sends a verification link to a new customer.
 */
export async function sendVerificationLink(email: string, token: string) {
    const baseUrl = NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

    return sendMailWithFallback({
        to: email,
        subject: 'Verify Your Identity - Mode AURA',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="https://modeaura.ca/logo.png" alt="Mode Aura" style="max-width: 150px; height: auto; display: block; margin: 0 auto;">
                    <p style="font-size: 10px; color: #ccc; text-transform: uppercase; letter-spacing: 3px; margin-top: 15px;">Where Fashion Meets Accessories</p>
                </div>
                <h2 style="text-align: center; color: #1B2936; font-size: 18px; text-transform: uppercase; letter-spacing: 2px;">Welcome to the Atelier</h2>
                <p style="text-align: center; color: #666; font-size: 14px; line-height: 1.6;">Click the button below to verify your email and activate your account.</p>
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${verifyUrl}" style="background: #1B2936; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">Verify Email</a>
                </div>
                <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">Link expires in 24 hours.</p>
            </div>
        `,
    }, "VERIFICATION LINK");
}

/**
 * Sends a "Ready for Pickup" notification.
 */
export async function sendOrderReadyForPickupEmail(email: string, orderId: string, customerName: string) {
    return sendMailWithFallback({
        to: email,
        subject: `Order #${orderId} is Ready for Pickup - Mode AURA`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="https://modeaura.ca/logo.png" alt="Mode Aura" style="max-width: 150px; height: auto; display: block; margin: 0 auto;">
                </div>
                <h2 style="text-align: center; color: #1B2936; font-size: 18px; text-transform: uppercase; letter-spacing: 2px;">Ready for Pickup</h2>
                <p style="text-align: center; color: #666; font-size: 14px; line-height: 1.6;">Good news, ${customerName}! Your order is packed and ready for collection.</p>
                
                <div style="background: #f9f9f9; padding: 30px; text-align: center; margin: 20px 0; border-radius: 15px;">
                    <div style="font-size: 14px; text-transform: uppercase; color: #999; letter-spacing: 2px; margin-bottom: 10px;">Order Number</div>
                    <span style="font-size: 32px; font-weight: 900; letter-spacing: 3px; color: #1B2936;">#${orderId}</span>
                </div>

                <div style="text-align: center; margin-bottom: 30px;">
                        <p style="font-size: 14px; font-weight: bold; color: #1B2936;">Pickup Location:</p>
                        <p style="color: #666;">Mode Aura Boutique<br>Windsor, Ontario<br>N8X 2S2</p>
                </div>

                <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">Please bring your Order ID and this email when you come to collect.</p>
            </div>
        `,
    }, "READY FOR PICKUP");
}

/**
 * Sends a "Order Shipped" notification with tracking.
 */
export async function sendOrderShippedEmail(email: string, orderId: string, customerName: string, trackingNumber: string, courier: string) {
    const trackingUrl = `https://modeaura.ca/track-order?orderId=${orderId}`;

    return sendMailWithFallback({
        to: email,
        subject: `Your Order #${orderId} has Shipped! - Mode AURA`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="https://modeaura.ca/logo.png" alt="Mode Aura" style="max-width: 150px; height: auto; display: block; margin: 0 auto;">
                </div>
                <h2 style="text-align: center; color: #1B2936; font-size: 18px; text-transform: uppercase; letter-spacing: 2px;">On Its Way</h2>
                <p style="text-align: center; color: #666; font-size: 14px; line-height: 1.6;">Great news, ${customerName}! Your order has left our boutique and is on its way to you.</p>
                
                <div style="background: #f9f9f9; padding: 30px; text-align: center; margin: 20px 0; border-radius: 15px;">
                    <div style="font-size: 14px; text-transform: uppercase; color: #999; letter-spacing: 2px; margin-bottom: 5px;">Tracking Number</div>
                    <span style="display: block; font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #1B2936; margin-bottom: 5px;">${trackingNumber}</span>
                    <span style="font-size: 12px; color: #666;">(${courier})</span>
                </div>

                <div style="text-align: center; margin: 40px 0;">
                    <a href="${trackingUrl}" style="background: #1B2936; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">Track Your Order</a>
                </div>

                <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">Please allow 24 hours for the tracking to update.</p>
            </div>
        `,
    }, "ORDER SHIPPED");
}

/**
 * Sends a digital receipt for a POS order.
 */
export async function sendReceiptEmail(email: string, orderDetails: any) {
    const itemsHtml = orderDetails.items.map((item: any) => `
        <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #eee; width: 60%;">
                <span style="display: block; font-weight: bold; color: #1B2936; font-size: 14px;">${item.name}</span>
                <span style="display: block; font-size: 11px; color: #666; margin-top: 4px;">
                    ${item.sku ? `SKU: ${item.sku} <br>` : ''}
                    ${item.variant ? item.variant : [item.size, item.color].filter(Boolean).join(' / ')}
                </span>
                <span style="display: block; font-size: 12px; color: #999; margin-top: 4px;">Qty: ${item.qty}</span>
            </td>
            <td style="padding: 15px 0; border-bottom: 1px solid #eee; text-align: right; vertical-align: top; font-weight: bold; color: #1B2936;">
                $${(item.price * item.qty).toFixed(2)}
            </td>
        </tr>
    `).join('');

    return sendMailWithFallback({
        to: email,
        subject: `Receipt for Order #${orderDetails.orderId}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #F8F9FB; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F8F9FB;">
                    <tr>
                        <td style="padding: 40px 10px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden;">
                                
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 40px 0; text-align: center; background-color: #1B2936;">
                                        <!-- Logo Image -->
                                        <img src="https://modeaura.ca/logo.png" alt="Mode Aura" style="max-width: 150px; height: auto; display: block; margin: 0 auto;">
                                        <!-- Fallback Text (Hidden if image loads, but good for accessibility) -->
                                        <div style="display: none; color: #ffffff; margin: 10px 0 0; font-size: 28px; letter-spacing: 2px;">MODE <span style="color: #D4AF37;">AURA</span></div>
                                        <p style="color: #8fa1b3; margin: 15px 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 3px;">Luxury Accessories</p>
                                    </td>
                                </tr>

                                <!-- Order Info -->
                                <tr>
                                    <td style="padding: 30px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                                        <h2 style="margin: 0 0 10px; color: #1B2936; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Receipt</h2>
                                        <p style="margin: 0; color: #666; font-size: 14px;">Order #${orderDetails.orderId}</p>
                                        <p style="margin: 5px 0 0; color: #999; font-size: 12px;">${new Date().toLocaleDateString()} &bull; ${new Date().toLocaleTimeString()}</p>
                                    </td>
                                </tr>

                                <!-- Items -->
                                <tr>
                                    <td style="padding: 10px 40px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            ${itemsHtml}
                                        </table>
                                    </td>
                                </tr>

                                <!-- Totals -->
                                <tr>
                                    <td style="padding: 20px 40px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding: 5px 0; color: #666; font-size: 14px;">Subtotal</td>
                                                <td style="padding: 5px 0; text-align: right; color: #1B2936; font-weight: bold;">$${orderDetails.subtotal.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 0; color: #666; font-size: 14px;">Tax</td>
                                                <td style="padding: 5px 0; text-align: right; color: #1B2936; font-weight: bold;">$${orderDetails.tax.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 15px; border-top: 2px solid #1B2936; color: #1B2936; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Total</td>
                                                <td style="padding-top: 15px; border-top: 2px solid #1B2936; text-align: right; color: #1B2936; font-size: 24px; font-weight: 900;">$${orderDetails.total.toFixed(2)}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 40px; background-color: #f8f9fb; text-align: center;">
                                        <p style="margin: 0; color: #1B2936; font-size: 14px; font-weight: bold;">Thank You for Shopping at Mode Aura</p>
                                        <p style="margin: 10px 0 20px; color: #999; font-size: 12px; line-height: 1.6;">
                                            Please retain this receipt for your records.<br>
                                            Visit <a href="https://modeaura.ca/policy" style="color: #D4AF37; text-decoration: none;">modeaura.ca/policy</a> for returns & exchanges.
                                        </p>
                                        <div style="font-size: 10px; color: #ccc; text-transform: uppercase; letter-spacing: 2px; margin-top: 20px;">
                                            Mode Aura Boutique &bull; Windsor, ON &bull; N8X 2S2
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
    }, "RECEIPT");
}
