'use client'

import { useState, useEffect } from 'react'
import { getStaff } from '@/app/actions/staff'
import DashboardPageGuide from '@/components/DashboardPageGuide'

export default function PayrollPage() {
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedStaff, setSelectedStaff] = useState<any>(null)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    useEffect(() => {
        loadStaff()
        // Set default dates to current pay period (last 2 weeks)
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 14)
        setEndDate(end.toISOString().split('T')[0])
        setStartDate(start.toISOString().split('T')[0])
    }, [])

    async function loadStaff() {
        setLoading(true)
        const data = await getStaff()
        setStaff(data)
        setLoading(false)
    }

    function calculateEarnings(member: any) {
        if (!member.shifts) return { hours: 0, gross: 0 }

        const filteredShifts = member.shifts.filter((shift: any) => {
            const shiftDate = new Date(shift.date)
            return shiftDate >= new Date(startDate) && shiftDate <= new Date(endDate)
        })

        const hours = filteredShifts.reduce((sum: number, s: any) => sum + (s.totalHours || 0), 0)
        const gross = hours * (member.hourlyRate || 0)

        return { hours, gross, shifts: filteredShifts }
    }

    function generatePayStub(member: any) {
        const earnings = calculateEarnings(member)
        const payPeriod = `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`

        const printWindow = window.open('', '_blank', 'width=800,height=600')
        if (!printWindow) return

        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Statement of Earnings - ${member.name}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #f5f5f5; }
                .paystub { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #D4AF37; }
                .company { font-size: 28px; font-weight: 900; font-style: italic; color: #1a1a1a; }
                .company span { color: #D4AF37; }
                .title { font-size: 24px; font-weight: 300; color: #666; margin-top: 5px; }
                .meta { text-align: right; font-size: 14px; color: #666; }
                .meta strong { color: #333; }
                .employee-info { background: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                .employee-name { font-size: 20px; font-weight: 700; margin-bottom: 5px; }
                .employee-details { color: #666; font-size: 14px; }
                .section { margin-bottom: 30px; }
                .section-title { font-size: 14px; font-weight: 700; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
                table { width: 100%; border-collapse: collapse; }
                th { text-align: left; padding: 12px; background: #f9f9f9; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #666; border-bottom: 2px solid #eee; }
                td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
                .amount { text-align: right; font-weight: 600; }
                .total-row { background: #fafafa; }
                .total-row td { font-weight: 700; font-size: 16px; }
                .gross-total { background: linear-gradient(135deg, #D4AF37, #B8941F); color: white; }
                .gross-total td { font-size: 20px; font-weight: 900; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; display: flex; justify-content: space-between; font-size: 12px; color: #999; }
                @media print { body { padding: 0; background: white; } .paystub { box-shadow: none; } }
            </style>
        </head>
        <body>
            <div class="paystub">
                <div class="header">
                    <div>
                        <div class="company">MODE <span>AURA</span></div>
                        <div class="title">Statement of Earnings</div>
                    </div>
                    <div class="meta">
                        <div><strong>Pay Period:</strong> ${payPeriod}</div>
                        <div><strong>Pay Date:</strong> ${new Date().toLocaleDateString()}</div>
                        <div><strong>Document #:</strong> SOE-${Date.now().toString().slice(-6)}</div>
                    </div>
                </div>

                <div class="employee-info">
                    <div class="employee-name">${member.name}</div>
                    <div class="employee-details">
                        ${member.email} • ${member.role} • Hourly Rate: $${(member.hourlyRate || 0).toFixed(2)}/hr
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Earnings</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Hours</th>
                                <th>Rate</th>
                                <th class="amount">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Regular Hours</td>
                                <td>${earnings.hours.toFixed(2)}</td>
                                <td>$${(member.hourlyRate || 0).toFixed(2)}</td>
                                <td class="amount">$${earnings.gross.toFixed(2)}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="3">Total Earnings</td>
                                <td class="amount">$${earnings.gross.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <table>
                        <tbody>
                            <tr class="gross-total">
                                <td>Net Pay</td>
                                <td class="amount">$${earnings.gross.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    <div>Mode AURA • 785 Wyandotte St E, Windsor, ON N9A 3J5</div>
                    <div>Generated: ${new Date().toLocaleString()}</div>
                </div>
            </div>
            <script>setTimeout(() => window.print(), 500);</script>
        </body>
        </html>
        `)
        printWindow.document.close()
    }

    if (loading) {
        return <div className="p-8 text-[#D4AF37] font-bold animate-pulse">Loading payroll...</div>
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black italic text-gray-900">Payroll</h2>
                    <p className="text-gray-500 mt-1">Generate pay stubs and statements of earnings</p>
                </div>
            </div>

            {/* Pay Period Selection */}
            <div className="card p-6">
                <h3 className="font-bold text-lg mb-4">Pay Period</h3>
                <div className="flex gap-4 items-end">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="p-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-[#D4AF37]"
                        />
                    </div>
                </div>
            </div>

            {/* Staff Payroll Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {staff.map((member) => {
                    const earnings = calculateEarnings(member)
                    return (
                        <div key={member.id} className="card p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center text-white font-black text-xl">
                                    {member.name[0]}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{member.name}</h3>
                                    <p className="text-sm text-gray-400">{member.role} • ${(member.hourlyRate || 0).toFixed(2)}/hr</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-gray-500">Hours Worked</span>
                                    <span className="font-bold">{earnings.hours.toFixed(2)} hrs</span>
                                </div>
                                <div className="flex justify-between p-3 bg-[#D4AF37]/10 rounded-xl">
                                    <span className="text-[#B8941F] font-medium">Gross Earnings</span>
                                    <span className="font-black text-[#D4AF37]">${earnings.gross.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => generatePayStub(member)}
                                className="w-full gold-btn py-3"
                            >
                                📄 Generate Pay Stub
                            </button>
                        </div>
                    )
                })}
            </div>

            {staff.length === 0 && (
                <div className="card p-16 text-center text-gray-400">
                    <div className="text-4xl mb-4">👥</div>
                    <p className="font-bold">No staff members</p>
                    <p className="text-sm">Add staff members to generate pay stubs</p>
                </div>
            )}

            <DashboardPageGuide
                pageName={{ en: "Payroll Center", ar: "مركز الرواتب" }}
                steps={[
                    {
                        title: { en: "Period Selection", ar: "اختيار الفترة" },
                        description: {
                            en: "Select the pay period (month and year) to calculate wages based on logged working hours.",
                            ar: "اختر فترة الدفع (الشهر والسنة) لحساب الأجور بناءً على ساعات العمل المسجلة."
                        },
                        icon: "📅"
                    },
                    {
                        title: { en: "Earnings Breakdown", ar: "تفصيل الأرباح" },
                        description: {
                            en: "View calculated earnings for each staff member including total hours, hourly rate, and gross pay.",
                            ar: "عرض الأرباح المحسوبة لكل موظف بما في ذلك إجمالي الساعات ومعدل الساعة والراتب الإجمالي."
                        },
                        icon: "💵"
                    },
                    {
                        title: { en: "Pay Stub Generation", ar: "إنشاء قسيمة الراتب" },
                        description: {
                            en: "Generate and print professional pay stubs for each team member with detailed hour logs.",
                            ar: "إنشاء وطباعة قسائم رواتب احترافية لكل عضو في الفريق مع سجلات ساعات مفصلة."
                        },
                        icon: "🖨️"
                    }
                ]}
            />
        </div>
    )
}
