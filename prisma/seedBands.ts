import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const INITIAL_SALARY_BANDS = [
  { payGrade: 'L1', currency: 'USD', minSalary: 35000, midpointSalary: 45000, maxSalary: 55000 },
  { payGrade: 'L2', currency: 'USD', minSalary: 50000, midpointSalary: 65000, maxSalary: 80000 },
  { payGrade: 'L3', currency: 'USD', minSalary: 70000, midpointSalary: 90000, maxSalary: 110000 },
  { payGrade: 'L4', currency: 'USD', minSalary: 90000, midpointSalary: 115000, maxSalary: 140000 },
  { payGrade: 'L5', currency: 'USD', minSalary: 120000, midpointSalary: 155000, maxSalary: 190000 },
  { payGrade: 'L6', currency: 'USD', minSalary: 160000, midpointSalary: 205000, maxSalary: 250000 },
  { payGrade: 'L7', currency: 'USD', minSalary: 210000, midpointSalary: 270000, maxSalary: 330000 },
  { payGrade: 'P1', currency: 'USD', minSalary: 40000, midpointSalary: 50000, maxSalary: 60000 },
  { payGrade: 'P2', currency: 'USD', minSalary: 55000, midpointSalary: 70000, maxSalary: 85000 },
  { payGrade: 'P3', currency: 'USD', minSalary: 70000, midpointSalary: 90000, maxSalary: 110000 },
  { payGrade: 'P4', currency: 'USD', minSalary: 90000, midpointSalary: 120000, maxSalary: 150000 },
  { payGrade: 'P5', currency: 'USD', minSalary: 120000, midpointSalary: 150000, maxSalary: 190000 },
];

export async function seedSalaryBands() {
  console.log('🌱 Seeding SalaryBands...');

  for (const band of INITIAL_SALARY_BANDS) {
    await prisma.salaryBand.upsert({
      where: {
        payGrade_currency: {
          payGrade: band.payGrade,
          currency: band.currency,
        },
      },
      update: {
        minSalary: band.minSalary,
        midpointSalary: band.midpointSalary,
        maxSalary: band.maxSalary,
      },
      create: band,
    });
  }

  console.log('✅ Successfully seeded salary bands!');
}

if (require.main === module) {
  seedSalaryBands()
    .catch((e) => {
      console.error('❌ Error seeding salary bands:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
