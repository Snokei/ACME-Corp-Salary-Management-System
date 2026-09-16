import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEmployeesData } from '@/lib/employeeData';
import { createAuditLog } from '@/lib/auditLogService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || 'All';
    const role = searchParams.get('role') || 'All';
    const status = searchParams.get('status') || 'All';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    const result = await getEmployeesData({
      search,
      department,
      role,
      status,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newEmployee = await prisma.employee.create({
      data: {
        employeeId: `ACM-${Math.floor(10000 + Math.random() * 90000)}`,
        firstName: body.firstName || 'Jane',
        lastName: body.lastName || 'Doe',
        email: body.email || `jane.doe${Date.now()}@acme.com`,
        department: body.department || 'Engineering',
        role: body.role || 'Software Engineer',
        country: body.country || 'United States',
        city: body.city || 'San Francisco',
        currency: body.currency || 'USD',
        baseSalary: parseFloat(body.baseSalary) || 120000,
        baseSalaryUSD: parseFloat(body.baseSalaryUSD || body.baseSalary) || 120000,
        bonusUSD: parseFloat(body.bonusUSD) || 15000,
        payGrade: body.payGrade || 'L4',
        gender: body.gender || 'Female',
        hireDate: new Date(),
        performanceRating: 5,
      },
    });

    await createAuditLog({
      action: 'CREATE',
      entityType: 'EMPLOYEE',
      entityId: newEmployee.id,
      description: `Employee ${newEmployee.firstName} ${newEmployee.lastName} created (${newEmployee.department} - ${newEmployee.role})`,
      newData: newEmployee,
    });

    return NextResponse.json({ success: true, employee: newEmployee }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

