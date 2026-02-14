import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;
        const order = await prisma.order.findUnique({
            where: { orderId }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}
