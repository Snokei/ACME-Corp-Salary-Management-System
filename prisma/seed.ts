import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Sales',
  'Marketing',
  'Finance',
  'Human Resources',
  'Legal',
  'Operations',
];

const COUNTRIES_CONFIG: Record<string, { currency: string; rateToUSD: number; cities: string[] }> = {
  US: { currency: 'USD', rateToUSD: 1.0, cities: ['San Francisco', 'New York', 'Austin', 'Seattle', 'Chicago'] },
  UK: { currency: 'GBP', rateToUSD: 1.31, cities: ['London', 'Manchester', 'Edinburgh', 'Bristol'] },
  India: { currency: 'INR', rateToUSD: 0.012, cities: ['Bengaluru', 'Mumbai', 'Gurugram', 'Hyderabad', 'Pune'] },
  Germany: { currency: 'EUR', rateToUSD: 1.11, cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg'] },
  Japan: { currency: 'JPY', rateToUSD: 0.007, cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama'] },
  Australia: { currency: 'AUD', rateToUSD: 0.67, cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'] },
  Canada: { currency: 'CAD', rateToUSD: 0.74, cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary'] },
  Singapore: { currency: 'SGD', rateToUSD: 0.77, cities: ['Singapore'] },
  Brazil: { currency: 'BRL', rateToUSD: 0.18, cities: ['São Paulo', 'Rio de Janeiro', 'Brasília'] },
  France: { currency: 'EUR', rateToUSD: 1.11, cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse'] },
};

const PAY_GRADES = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];

const ROLES_BY_DEPT: Record<string, string[]> = {
  Engineering: ['Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Engineering Manager', 'DevOps Specialist', 'QA Engineer'],
  Product: ['Product Manager', 'Senior Product Manager', 'UI/UX Designer', 'Lead Designer', 'Data Analyst'],
  Sales: ['Account Executive', 'Sales Manager', 'Business Development Rep', 'Enterprise AE', 'Sales Director'],
  Marketing: ['Marketing Specialist', 'Content Strategist', 'Growth Lead', 'Brand Manager', 'SEO Specialist'],
  Finance: ['Financial Analyst', 'Senior Accountant', 'Finance Director', 'Payroll Manager'],
  'Human Resources': ['HR Generalist', 'Recruiter', 'People Ops Lead', 'HR Director', 'Talent Acquisition Partner'],
  Legal: ['Legal Counsel', 'Compliance Officer', 'Senior Paralegal', 'General Counsel'],
  Operations: ['Operations Associate', 'Supply Chain Analyst', 'Director of Operations', 'Logistics Coordinator'],
};

const GENDERS = ['Male', 'Female', 'Non-Binary'];

async function main() {
  console.log('🌱 Clearing existing database records...');
  await prisma.employee.deleteMany({});

  console.log('🚀 Generating 10,000 employee records...');
  const totalEmployees = 10000;
  const chunkSize = 1000;
  const countryKeys = Object.keys(COUNTRIES_CONFIG);

  let insertedCount = 0;

  for (let i = 0; i < totalEmployees; i += chunkSize) {
    const chunk = [];

    for (let j = 0; j < chunkSize; j++) {
      const idx = i + j + 1;
      const employeeId = `ACM-${String(idx).padStart(5, '0')}`;
      const country = faker.helpers.arrayElement(countryKeys);
      const countryInfo = COUNTRIES_CONFIG[country];
      const city = faker.helpers.arrayElement(countryInfo.cities);
      const department = faker.helpers.arrayElement(DEPARTMENTS);
      const role = faker.helpers.arrayElement(ROLES_BY_DEPT[department]);
      const payGrade = faker.helpers.arrayElement(PAY_GRADES);
      const gender = faker.helpers.arrayElement(GENDERS);

      // Salary generation based on pay grade
      const gradeMultiplier = PAY_GRADES.indexOf(payGrade) + 1; // 1 to 7
      const baseUSD = Math.round((45000 + gradeMultiplier * 22000 + faker.number.int({ min: -5000, max: 15000 })) / 100) * 100;
      const bonusUSD = Math.round((baseUSD * (0.05 + gradeMultiplier * 0.03 + faker.number.float({ min: 0, max: 0.05 }))) / 100) * 100;
      const baseSalaryLocal = Math.round(baseUSD / countryInfo.rateToUSD);

      const firstName = faker.person.firstName(gender === 'Male' ? 'male' : gender === 'Female' ? 'female' : undefined);
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName, provider: 'acme.com' }).toLowerCase() + idx;

      chunk.push({
        employeeId,
        firstName,
        lastName,
        email,
        department,
        role,
        country,
        city,
        currency: countryInfo.currency,
        baseSalary: baseSalaryLocal,
        baseSalaryUSD: baseUSD,
        bonusUSD,
        payGrade,
        gender,
        hireDate: faker.date.between({ from: '2018-01-01', to: '2026-08-01' }),
        performanceRating: faker.number.int({ min: 1, max: 5 }),
      });
    }

    await prisma.employee.createMany({
      data: chunk,
    });

    insertedCount += chunk.length;
    console.log(`   Progress: ${insertedCount} / ${totalEmployees} seeded...`);
  }

  console.log('✅ Successfully seeded 10,000 employees into SQLite database!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
