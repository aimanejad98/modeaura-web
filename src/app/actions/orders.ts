'use server';

import { getSession } from '@/lib/auth';
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendOrderReadyForPickupEmail, sendReceiptEmail } from '@/lib/mail';

export async function getOrders() {
    try {
        console.log('📜 [Orders] Fetching orders...');
        const orders = await prisma.order.findMany({
            orderBy: {
                date: 'desc'
            }
        });
        console.log(`✅ [Orders] Found ${orders.length} orders`);
        return JSON.parse(JSON.stringify(orders));
    } catch (error) {
        console.error('[Orders] Fetch failed:', error);
        return [];
    }
}

export async function getOrdersByCustomer(customerId: string) {
    try {
        const orders = await prisma.order.findMany({
            where: { customerId },
            orderBy: { createdAt: 'desc' }
        });
        return JSON.parse(JSON.stringify(orders));
    } catch (error) {
        console.error('[Orders] Customer fetch failed:', error);
        return [];
    }
}

export async function createOrder(data: {
    orderId: string;
    customer: string;
    customerId?: string;
    total: number;
    date: string;
    items: any;
    paymentMethod?: string;
    amountPaid?: number;
    change?: number;
    source?: string;
    status?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    shippingMethod?: string;
    discountCode?: string;
    discountAmount?: number;
    tax?: number;
    shippingCost?: number;
}) {
    try {
        const { paymentMethod, amountPaid, change, source, status, items, tax, shippingCost, ...rest } = data;

        // Ensure we only pass fields that exist in the schema
        const dbData: any = {
            orderId: rest.orderId,
            customer: rest.customer,
            customerId: rest.customerId || null,
            total: data.total,
            date: data.date,
            items: items,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            shippingMethod: data.shippingMethod,
            status: status || 'Pending',
            payment: paymentMethod === 'Stripe (Simulated)' ? 'Paid' : (paymentMethod || 'Paid'),
            paymentMethod: paymentMethod || 'Cash',
            amountPaid: amountPaid || null,
            change: change || null,
            source: source || 'WEBSITE',
            discountCode: data.discountCode || null,
            discountAmount: data.discountAmount || 0
        };

        const order = await prisma.$transaction(async (tx) => {
            // 1. Create Order
            const newOrder = await tx.order.create({
                data: dbData
            });

            // 2. Deduct Stock
            for (const item of items) {
                if (item.id) {
                    await tx.product.update({
                        where: { id: item.id },
                        data: { stock: { decrement: Number(item.qty || 1) } }
                    }).catch(err => {
                        console.error(`[Orders] Failed to deduct stock for ${item.name} (${item.id}):`, err);
                    });
                }
            }

            // 3. Update Customer Valuation
            if (rest.customerId) {
                await tx.customer.update({
                    where: { id: rest.customerId },
                    data: {
                        totalSpend: { increment: Number(data.total) },
                        lastVisit: new Date().toISOString()
                    }
                }).catch(err => console.error(`[Orders] Failed to update valuation for ${rest.customerId}:`, err));
            }

            return newOrder;
        });

        // 4. Send Confirmation Email (Only for Online/Website orders)
        // We do this after transaction to not block it, but inside the main function
        if (source === 'WEBSITE' && rest.customer.includes('@')) {
            try {
                const parts = rest.customer.split('|');
                const customerName = parts[0].trim();
                const email = parts.length > 1 ? parts[1].trim() : '';

                if (email) {
                    const orderDetails = {
                        orderId: rest.orderId,
                        date: data.date,
                        total: data.total,
                        subtotal: data.total - (tax || 0) - (shippingCost || 0) + (data.discountAmount || 0),
                        tax: tax || 0,
                        shippingCost: shippingCost || 0,
                        discountAmount: data.discountAmount || 0,
                        items: items,
                        customerName: customerName,
                        paymentMethod: paymentMethod,
                        shippingAddress: data.address && data.city ? `${data.address}, ${data.city}` : 'Store Pickup'
                    };

                    const { sendOrderConfirmationEmail } = await import('@/lib/mail');
                    await sendOrderConfirmationEmail(email, orderDetails);
                    console.log(`📧 [Orders] Sent confirmation email to ${email}`);
                }
            } catch (err) {
                console.error('⚠️ [Orders] Failed to send confirmation email:', err);
            }
        }

        return order;

        revalidatePath('/dashboard/pos');
        revalidatePath('/dashboard/orders');
        revalidatePath('/dashboard/receipts');
        revalidatePath('/dashboard/shipping');
        revalidatePath('/account');
        return JSON.parse(JSON.stringify(order));
    } catch (error) {
        console.error('[Orders] Create failed:', error);
        throw error;
    }
}

export async function updateOrderStatus(id: string, status: string) {
    try {
        const data: any = { status };

        // Auto-set shipping fields when marking as Shipped
        if (status === 'Shipped') {
            const today = new Date();
            data.shippedDate = today.toISOString().split('T')[0];
            data.shippingStatus = 'Shipped';
            // Default ETA: 5 business days from today
            const eta = new Date(today);
            let daysAdded = 0;
            while (daysAdded < 5) {
                eta.setDate(eta.getDate() + 1);
                if (eta.getDay() !== 0 && eta.getDay() !== 6) daysAdded++;
            }
            data.estimatedDeliveryDate = eta.toISOString().split('T')[0];
        }

        const order = await prisma.order.update({
            where: { id },
            data
        });

        // Trigger Email Notification for Pickup
        if (status === 'Ready for Pickup') {
            try {
                const parts = order.customer.split('|');
                if (parts.length > 1) {
                    const name = parts[0].trim();
                    const email = parts[1].trim();
                    // Use the imported function
                    await sendOrderReadyForPickupEmail(email, order.orderId, name);
                    console.log(`📧 [Orders] Sent pickup email to ${email}`);
                } else {
                    console.log('⚠️ [Orders] No email found in customer string for pickup notification');
                }
            } catch (err) {
                console.error('⚠️ [Orders] Failed to send pickup email:', err);
            }
        }

        revalidatePath('/dashboard/orders');
        revalidatePath('/dashboard/shipping');
        revalidatePath(`/api/orders/${order.orderId}`);
        return JSON.parse(JSON.stringify(order));
    } catch (error) {
        console.error('[Orders] Status update failed:', error);
        throw error;
    }
}

export async function updateTracking(id: string, trackingNumber: string, courier: string) {
    try {
        const today = new Date();
        const eta = new Date(today);
        let daysAdded = 0;
        while (daysAdded < 5) {
            eta.setDate(eta.getDate() + 1);
            if (eta.getDay() !== 0 && eta.getDay() !== 6) daysAdded++;
        }

        // 1. Update Database
        const order = await prisma.order.update({
            where: { id },
            data: {
                trackingNumber,
                courier,
                status: 'Shipped',
                shippedDate: today.toISOString().split('T')[0],
                shippingStatus: 'Shipped',
                estimatedDeliveryDate: eta.toISOString().split('T')[0]
            }
        });

        // 2. Send Shipping Email - DISABLED per user request
        // try {
        //     const parts = order.customer.split('|');
        //     if (parts.length > 1) {
        //         const name = parts[0].trim();
        //         const email = parts[1].trim();
        //         const { sendOrderShippedEmail } = await import('@/lib/mail');
        //         await sendOrderShippedEmail(email, order.orderId, name, trackingNumber, courier);
        //         console.log(`📧 [Orders] Sent shipping email to ${email}`);
        //     }
        // } catch (emailError) {
        //     console.error('⚠️ [Orders] Failed to send shipping email:', emailError);
        //     // Don't fail the request if email fails, just log it
        // }

        revalidatePath('/dashboard/orders');
        revalidatePath('/dashboard/shipping');
        revalidatePath(`/api/orders/${order.orderId}`);
        return JSON.parse(JSON.stringify(order));
    } catch (error) {
        console.error('[Orders] Update tracking failed:', error);
        throw error;
    }
}

export async function updateShippingStatus(id: string, shippingStatus: string) {
    try {
        const order = await prisma.order.update({
            where: { id },
            data: { shippingStatus }
        });
        revalidatePath('/dashboard/orders');
        revalidatePath('/dashboard/shipping');
        return JSON.parse(JSON.stringify(order));
    } catch (error) {
        console.error('[Orders] Shipping status update failed:', error);
        throw error;
    }
}

export async function updateEstimatedDelivery(id: string, estimatedDate: string) {
    try {
        const order = await prisma.order.update({
            where: { id },
            data: { estimatedDeliveryDate: estimatedDate }
        });
        revalidatePath('/dashboard/orders');
        revalidatePath('/dashboard/shipping');
        return JSON.parse(JSON.stringify(order));
    } catch (error) {
        console.error('[Orders] ETA update failed:', error);
        throw error;
    }
}

export async function trackOrder(orderId: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { orderId }
        });
        if (!order) return null;
        // Return limited public data only
        return {
            orderId: order.orderId,
            status: order.status,
            shippingStatus: order.shippingStatus || 'Processing',
            shippingMethod: order.shippingMethod,
            trackingNumber: order.trackingNumber,
            courier: order.courier,
            shippedDate: order.shippedDate,
            estimatedDeliveryDate: order.estimatedDeliveryDate,
            date: order.date,
            city: order.city,
            province: order.province
        };
    } catch (error) {
        console.error('[Orders] Track order failed:', error);
        return null;
    }
}

export async function deleteOrder(id: string) {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        await prisma.order.delete({
            where: { id }
        });
        revalidatePath('/dashboard/orders');
        return { success: true };
    } catch (error) {
        console.error('Delete order error:', error);
        return { success: false };
    }
}

export async function refundOrder(orderId: string, restock: boolean = true) {
    const session = await getSession();
    // if (!session) return { success: false, error: "Unauthorized" };
    if (!session) {
        console.warn(`⚠️ [Refund] Processing refund for ${orderId} without active session cookie.`);
    }

    try {
        console.log(`🔄 [Refund] Processing refund for order ${orderId} (Restock: ${restock})`);

        // 1. Get Order & Items
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) throw new Error("Order not found");

        // 2. Restock Logic
        if (restock) {
            const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items as string || '[]');

            for (const item of items) {
                if (item.id) {
                    await prisma.product.update({
                        where: { id: item.id },
                        data: {
                            stock: { increment: Number(item.quantity || 1) }
                        }
                    }).catch(err => console.error(`Failed to restock item ${item.name}:`, err));
                }
            }
            console.log(`✅ [Refund] Restocked items for ${order.orderId}`);
        }

        // 3. Update Order Status
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'Refunded',
                payment: 'Refunded',
                shippingStatus: 'Returned'
            }
        });

        revalidatePath('/dashboard/orders');
        revalidatePath('/dashboard/inventory');
        revalidatePath('/dashboard/financials');

        return { success: true, order: updatedOrder };

    } catch (error: any) {
        console.error('[Refund] Failed:', error);
        return { success: false, error: error.message };
    }
}

export async function emailReceipt(email: string, orderDetails: any) {
    try {
        const { sendReceiptEmail } = await import('@/lib/mail');
        const result = await sendReceiptEmail(email, orderDetails);
        return result;
    } catch (error: any) {
        console.error('Failed to email receipt:', error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function resendReceiptEmail(orderId: string, email: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) throw new Error("Order not found");

        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

        const orderDetails = {
            orderId: order.orderId,
            date: order.date,
            total: order.total,
            subtotal: order.total, // Approximated if not stored separates
            tax: 0, // Approximated
            items: items,
            customerName: order.customer.split('|')[0].trim(),
            paymentMethod: order.paymentMethod,
            shippingAddress: order.address ? `${order.address}, ${order.city}` : 'In-Store Pickup'
        };

        const { sendReceiptEmail } = await import('@/lib/mail');
        return await sendReceiptEmail(email, orderDetails);
    } catch (error: any) {
        console.error('[Orders] Resend receipt failed:', error);
        return { success: false, error: error.message };
    }
}
