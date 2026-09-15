import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding existing employee statuses...');
  
  const employees = await prisma.employee.findMany();
  let updatedCount = 0;
  
  const statuses = ['Active', 'Active', 'Active', 'On Leave', 'Full Time', 'Contract'];
  
  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    // Randomize status based on employeeId similar to the previous mock logic
    const empStatus = statuses[(i + emp.employeeId.charCodeAt(emp.employeeId.length - 1)) % statuses.length];
    
    // Only update if not already set (though default is Active, we want variation)
    await prisma.employee.update({
      where: { id: emp.id },
      data: { status: empStatus }
    });
    
    updatedCount++;
    if (updatedCount % 100 === 0) {
      console.log(`Updated ${updatedCount}/${employees.length} employees...`);
    }
  }
  
  console.log(`Seeding complete. Updated ${updatedCount} employees.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
