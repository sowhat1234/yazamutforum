import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with MVP categories...');

  // Create MVP-aligned categories for the forum system
  const categories = [
    {
      name: 'SaaS',
      slug: 'saas',
      description: 'Software as a Service ideas and projects',
      color: '#3b82f6',
    },
    {
      name: 'Mobile App',
      slug: 'mobile-app',
      description: 'Mobile application ideas for iOS and Android',
      color: '#10b981',
    },
    {
      name: 'Web App',
      slug: 'web-app',
      description: 'Web application and website ideas',
      color: '#f59e0b',
    },
    {
      name: 'Hardware',
      slug: 'hardware',
      description: 'Physical product and hardware ideas',
      color: '#ef4444',
    },
    {
      name: 'Service',
      slug: 'service',
      description: 'Service-based business ideas',
      color: '#8b5cf6',
    },
    {
      name: 'Other',
      slug: 'other',
      description: 'Other innovative ideas and projects',
      color: '#6b7280',
    },
  ];

  for (const category of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: category,
      });
      console.log(`✅ Created category: ${category.name}`);
    } else {
      console.log(`⏭️ Category already exists: ${category.name}`);
    }
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
