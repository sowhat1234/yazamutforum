import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding sample ideas...');

  // Create a demo user first (you may need to create this user via auth first)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      username: 'demouser',
      skills: ['JavaScript', 'React', 'Node.js', 'Design'],
      bio: 'Full-stack developer passionate about building innovative products',
    },
  });

  const sampleIdeas = [
    {
      title: 'AI-Powered Code Review Assistant',
      description: 'A SaaS platform that uses AI to automatically review code, suggest improvements, and catch potential bugs before they make it to production. It would integrate with popular Git platforms and provide real-time feedback to developers.',
      category: 'SAAS' as const,
      tags: ['AI', 'Developer Tools', 'Code Review', 'Automation'],
      wantsTeam: true,
      neededSkills: ['Machine Learning', 'Python', 'JavaScript', 'DevOps'],
    },
    {
      title: 'Local Community Event Finder App',
      description: 'A mobile app that helps people discover local events, workshops, and meetups in their area. Users can filter by interests, get personalized recommendations, and connect with like-minded people.',
      category: 'MOBILE_APP' as const,
      tags: ['Community', 'Events', 'Social', 'Location-based'],
      wantsTeam: true,
      neededSkills: ['React Native', 'Flutter', 'Backend Development', 'UI/UX Design'],
    },
    {
      title: 'Smart Home Energy Optimizer',
      description: 'An IoT device that learns your energy usage patterns and automatically optimizes your home\'s energy consumption. It would control smart devices and provide insights to reduce electricity bills.',
      category: 'HARDWARE' as const,
      tags: ['IoT', 'Energy', 'Smart Home', 'Sustainability'],
      wantsTeam: true,
      neededSkills: ['IoT Development', 'Hardware Design', 'Mobile App Development', 'Data Analysis'],
    },
    {
      title: 'Freelancer Project Management Dashboard',
      description: 'A comprehensive web application for freelancers to manage multiple projects, track time, handle invoicing, and communicate with clients all in one place.',
      category: 'WEB_APP' as const,
      tags: ['Freelancing', 'Project Management', 'Productivity', 'Business'],
      wantsTeam: false,
      neededSkills: [],
    },
    {
      title: 'Mental Health Support Network',
      description: 'A platform connecting people with mental health challenges to peer support groups, professional counselors, and resources. Focus on creating a safe, anonymous, and supportive environment.',
      category: 'SERVICE' as const,
      tags: ['Mental Health', 'Support', 'Community', 'Wellness'],
      wantsTeam: true,
      neededSkills: ['Psychology', 'Web Development', 'Community Management', 'Security'],
    },
  ];

  for (const ideaData of sampleIdeas) {
    const idea = await prisma.idea.create({
      data: {
        ...ideaData,
        authorId: demoUser.id,
        upvotes: Math.floor(Math.random() * 20) + 1,
        downvotes: Math.floor(Math.random() * 3),
      },
    });

    console.log(`✅ Created idea: ${idea.title}`);

    // Add some sample votes
    const voteCount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < voteCount; i++) {
      try {
        await prisma.vote.create({
          data: {
            ideaId: idea.id,
            userId: demoUser.id,
            type: Math.random() > 0.2 ? 'UP' : 'DOWN',
          },
        });
      } catch (error) {
        // Ignore duplicate vote errors
      }
    }

    // Add some sample interests if the idea wants a team
    if (idea.wantsTeam) {
      try {
        await prisma.interest.create({
          data: {
            ideaId: idea.id,
            userId: demoUser.id,
            message: `I'm interested in contributing to this project! I have experience with ${ideaData.neededSkills.slice(0, 2).join(' and ')}.`,
          },
        });
      } catch (error) {
        // Ignore duplicate interest errors
      }
    }
  }

  console.log('🎉 Sample ideas seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding ideas:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
