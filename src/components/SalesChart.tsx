'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesChart({ data }: { data: any[] }) {
    if (data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-[var(--text-muted)] bg-[var(--mocha-bg)]/50 rounded-2xl border border-dashed border-[var(--mocha-border)]">
                No revenue records available for this period.
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--mocha-border)" opacity={0.3} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                        dy={10}
                        tickFormatter={(str: string) => new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1E1E1E',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px'
                        }}
                        itemStyle={{ color: 'var(--gold)' }}
                        labelStyle={{ color: '#aaa', marginBottom: '4px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="var(--gold)"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
