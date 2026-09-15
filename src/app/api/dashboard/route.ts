import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let totalEmployees = 345;
    let activeCount = 91;
    let onLeaveCount = 104;
    let totalRemote = 185;

    try {
      const count = await prisma.employee.count();
      if (count > 0) {
        totalEmployees = count;
        activeCount = Math.round(count * 0.85);
        onLeaveCount = Math.round(count * 0.08);
        totalRemote = Math.round(count * 0.35);
      }
    } catch (e) {
      console.warn('Using default metric aggregates');
    }

    const scheduleEvents = [
      {
        id: 'ev-1',
        time: '09:00 AM',
        title: 'Team Product Sync',
        category: 'Design',
        tagColor: '#F5C242',
        attendees: [
          { name: 'Valentino M.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80' },
          { name: 'Keiko T.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80' },
        ],
      },
      {
        id: 'ev-2',
        time: '11:30 AM',
        title: 'Salary Review & Promotion Q3',
        category: 'HR',
        tagColor: '#10B981',
        attendees: [
          { name: 'Amara O.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80' },
          { name: 'Elena R.', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&h=80&q=80' },
          { name: 'Lucas V.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80' },
        ],
      },
      {
        id: 'ev-3',
        time: '02:00 PM',
        title: '1-on-1 Performance Check',
        category: 'Review',
        tagColor: '#8B5CF6',
        attendees: [
          { name: 'Sophia C.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&h=80&q=80' },
        ],
      },
    ];

    const recentSalaries = [
      {
        id: 'sal-1',
        name: 'Valentino Morales',
        jobTitle: 'Lead Designer',
        netSalary: '$12,500',
        status: 'Paid',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80',
      },
      {
        id: 'sal-2',
        name: 'Keiko Tanaka',
        jobTitle: 'DevOps Specialist',
        netSalary: '$9,400',
        status: 'Paid',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80',
      },
      {
        id: 'sal-3',
        name: 'Elena Rostova',
        jobTitle: 'People Ops Lead',
        netSalary: '$8,200',
        status: 'Processing',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&h=80&q=80',
      },
    ];

    const salaryStatistics = [
      { month: 'Jan', current: 48000, previous: 42000, bonus: 5000 },
      { month: 'Feb', current: 52000, previous: 45000, bonus: 6200 },
      { month: 'Mar', current: 61000, previous: 49000, bonus: 7800 },
      { month: 'Apr', current: 58000, previous: 53000, bonus: 7100 },
      { month: 'May', current: 72000, previous: 60000, bonus: 9400 },
      { month: 'Jun', current: 84250, previous: 68000, bonus: 12500 },
      { month: 'Jul', current: 79000, previous: 71000, bonus: 11000 },
      { month: 'Aug', current: 92000, previous: 76000, bonus: 14200 },
      { month: 'Sep', current: 98500, previous: 82000, bonus: 16000 },
    ];

    const departmentComposition = [
      { name: 'Engineering', count: 155, percentage: 45, color: '#18181B' },
      { name: 'Product & Design', count: 86, percentage: 25, color: '#F5C242' },
      { name: 'Marketing & Sales', count: 62, percentage: 18, color: '#E2E8F0' },
      { name: 'Operations & HR', count: 42, percentage: 12, color: '#94A3B8' },
    ];

    return NextResponse.json({
      stats: {
        activeCount,
        onLeaveCount,
        totalRemote,
        totalEmployees,
      },
      scheduleEvents,
      recentSalaries,
      salaryStatistics,
      departmentComposition,
      attendance: {
        presentRate: 63,
        lateRate: 12,
        onLeaveRate: 25,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
