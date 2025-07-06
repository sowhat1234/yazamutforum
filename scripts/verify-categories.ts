import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying MVP categories...');
  
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  
  console.log(`📊 Found ${categories.length} categories:`);
  categories.forEach(category => {
    console.log(`  ✅ ${category.name} (${category.slug}) - ${category.color}`);
  });
  
  console.log('\n📋 IdeaCategory enum values:');
  console.log('  - SAAS');
  console.log('  - MOBILE_APP');
  console.log('  - WEB_APP');
  console.log('  - HARDWARE');
  console.log('  - SERVICE');
  console.log('  - OTHER');
  
  console.log('\n✅ Categories verification complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
