"use server";

import prisma from "@/lib/db";

export async function getSalesAnalytics() {
    try {
        console.log('📈 [Analytics] Generating sales analytics...');
        // Fetch last 14 days of orders
        const orders = await prisma.order.findMany({
            orderBy: { date: 'asc' },
            take: 100 // Adjust as needed
        });
        console.log(`✅ [Analytics] Processing ${orders.length} orders for charts`);

        // Group by date
        const groupedData: Record<string, { date: string, cash: number, card: number, total: number }> = {};

        orders.forEach((order: any) => {
            const date = order.date; // Format YYYY-MM-DD
            if (!groupedData[date]) {
                groupedData[date] = { date, cash: 0, card: 0, total: 0 };
            }

            const amount = order.total;
            if (order.paymentMethod === 'Cash') {
                groupedData[date].cash += amount;
            } else {
                groupedData[date].card += amount;
            }
            groupedData[date].total += amount;
        });

        // Convert to array and sort by date
        const chartData = Object.values(groupedData)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-7); // Last 7 days

        return JSON.parse(JSON.stringify(chartData));
    } catch (error) {
        console.error('[Analytics] Fetch failed:', error);
        return [];
    }
}
