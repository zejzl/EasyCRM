import { PrismaClient, UserRole, DealStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[START] Starting database seed...');

  // Create default pipeline stages
  const stages = [
    { name: 'Lead', order: 1, probability: 10, color: '#94a3b8' },
    { name: 'Qualified', order: 2, probability: 25, color: '#60a5fa' },
    { name: 'Proposal', order: 3, probability: 50, color: '#fbbf24' },
    { name: 'Negotiation', order: 4, probability: 75, color: '#fb923c' },
    { name: 'Closed Won', order: 5, probability: 100, color: '#22c55e' },
    { name: 'Closed Lost', order: 6, probability: 0, color: '#ef4444' },
  ];

  console.log('Creating pipeline stages...');
  for (const stage of stages) {
    await prisma.pipelineStage.upsert({
      where: { order: stage.order },
      update: {},
      create: stage,
    });
  }

  // Create a default team
  console.log('Creating default team...');
  const salesTeam = await prisma.team.upsert({
    where: { id: 'default-sales-team' },
    update: {},
    create: {
      id: 'default-sales-team',
      name: 'Sales Team',
      description: 'Main sales team',
    },
  });

  // Create admin user
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@crm.local' },
    update: {},
    create: {
      email: 'admin@crm.local',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
      teamId: salesTeam.id,
    },
  });

  // Create a sales rep
  console.log('Creating sales rep...');
  const salesRepPassword = await bcrypt.hash('sales123', 10);
  const salesRep = await prisma.user.upsert({
    where: { email: 'sales@crm.local' },
    update: {},
    create: {
      email: 'sales@crm.local',
      name: 'John Doe',
      password: salesRepPassword,
      role: UserRole.SALES_REP,
      teamId: salesTeam.id,
    },
  });

  // Create sample companies
  console.log('Creating sample companies...');
  const acmeCorp = await prisma.company.create({
    data: {
      name: 'Acme Corporation',
      domain: 'acme.example.com',
      industry: 'Technology',
      size: 'MEDIUM',
      revenue: 5000000,
      website: 'https://acme.example.com',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      tags: ['Enterprise', 'Tech'],
    },
  });

  const techInnovations = await prisma.company.create({
    data: {
      name: 'Tech Innovations Ltd',
      domain: 'techinnovations.example.com',
      industry: 'Software',
      size: 'SMALL',
      revenue: 1200000,
      website: 'https://techinnovations.example.com',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      tags: ['Startup', 'B2B'],
    },
  });

  // Create contacts
  console.log('Creating contacts...');
  const janeContact = await prisma.contact.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@acme.example.com',
      title: 'VP of Sales',
      department: 'Sales',
      isPrimary: true,
      companyId: acmeCorp.id,
      tags: ['Decision Maker'],
    },
  });

  const bobContact = await prisma.contact.create({
    data: {
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@techinnovations.example.com',
      title: 'CTO',
      department: 'Engineering',
      isPrimary: true,
      companyId: techInnovations.id,
      tags: ['Technical'],
    },
  });

  // Create sample deals
  console.log('Creating sample deals...');
  const leadStage = await prisma.pipelineStage.findFirst({ where: { order: 1 } });
  const proposalStage = await prisma.pipelineStage.findFirst({ where: { order: 3 } });

  if (leadStage && proposalStage) {
    await prisma.deal.create({
      data: {
        name: 'Enterprise License Deal',
        value: 50000,
        probability: 75,
        stageId: proposalStage.id,
        status: DealStatus.OPEN,
        companyId: acmeCorp.id,
        contactId: janeContact.id,
        ownerId: salesRep.id,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        source: 'Website',
        tags: ['High Value', 'Enterprise'],
      },
    });

    await prisma.deal.create({
      data: {
        name: 'Software Integration Project',
        value: 15000,
        probability: 25,
        stageId: leadStage.id,
        status: DealStatus.OPEN,
        companyId: techInnovations.id,
        contactId: bobContact.id,
        ownerId: salesRep.id,
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        source: 'Referral',
        tags: ['Technical'],
      },
    });
  }

  // Create sample activities
  console.log('Creating sample activities...');
  await prisma.activity.create({
    data: {
      type: 'CALL',
      subject: 'Discovery Call',
      description: 'Discussed requirements and timeline',
      duration: 45,
      completedAt: new Date(),
      createdById: salesRep.id,
      companyId: acmeCorp.id,
      contactId: janeContact.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: 'EMAIL',
      subject: 'Follow-up Email',
      description: 'Sent pricing proposal',
      emailFrom: 'sales@crm.local',
      emailTo: ['jane.smith@acme.example.com'],
      emailSubject: 'Pricing Proposal - Enterprise License',
      emailBody: 'Dear Jane, Please find attached our pricing proposal...',
      completedAt: new Date(),
      createdById: salesRep.id,
      companyId: acmeCorp.id,
      contactId: janeContact.id,
    },
  });

  // Create email template
  console.log('Creating email template...');
  await prisma.emailTemplate.create({
    data: {
      name: 'Initial Outreach',
      subject: 'Quick Introduction',
      body: `Hi {{firstName}},

I hope this email finds you well. I wanted to reach out to introduce our company and see if there might be an opportunity to work together.

Would you be open to a brief call next week?

Best regards,
{{senderName}}`,
      isShared: true,
      createdById: adminUser.id,
    },
  });

  console.log('[SUCCESS] Database seeded successfully!');
  console.log('\nDefault credentials:');
  console.log('Admin: admin@crm.local / admin123');
  console.log('Sales Rep: sales@crm.local / sales123');
}

main()
  .catch((e) => {
    console.error('[ERROR] Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
