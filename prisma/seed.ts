import { PrismaClient, Priority, TaskStatus, EnergyProfile, ThreadRole, CalendarBlockType, AllocationSource } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@personal-planner.local' },
    update: {
      name: 'Demo Planner',
      tz: 'Europe/Berlin',
      energyProfile: EnergyProfile.MIXED,
    },
    create: {
      id: 'user-demo',
      email: 'demo@personal-planner.local',
      name: 'Demo Planner',
      tz: 'Europe/Berlin',
      energyProfile: EnergyProfile.MIXED,
    },
  });

  const contractor = await prisma.user.upsert({
    where: { email: 'contractor@personal-planner.local' },
    update: { name: 'Freelancer', energyProfile: EnergyProfile.MIXED },
    create: {
      id: 'user-contractor',
      email: 'contractor@personal-planner.local',
      name: 'Freelancer',
      tz: 'Europe/Berlin',
      energyProfile: EnergyProfile.MIXED,
    },
  });

  const areas = [
    { id: 'area-client', name: 'Kunden', color: '#6366F1', userId: demoUser.id },
    { id: 'area-product', name: 'Produkt', color: '#0EA5E9', userId: demoUser.id },
    { id: 'area-learning', name: 'Learning', color: '#F59E0B', userId: demoUser.id },
  ];

  for (const area of areas) {
    await prisma.area.upsert({
      where: { id: area.id },
      create: area,
      update: area,
    });
  }

  const projects = [
    {
      id: 'proj-client-a',
      name: 'Client A Website',
      goal: 'Launch customer-facing site with focus on conversions',
      areaId: 'area-client',
      userId: demoUser.id,
      dueAt: new Date('2026-01-15T17:00:00.000Z'),
    },
    {
      id: 'proj-own-product',
      name: 'Eigenes Produkt',
      goal: 'Validated MVP for the new planner companion',
      areaId: 'area-product',
      userId: demoUser.id,
      dueAt: new Date('2026-03-01T17:00:00.000Z'),
    },
    {
      id: 'proj-learning',
      name: 'Learning Block',
      goal: 'Sharpen skills with focused study & experiments',
      areaId: 'area-learning',
      userId: demoUser.id,
      dueAt: new Date('2026-01-05T17:00:00.000Z'),
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: project.id },
      create: project,
      update: project,
    });
  }

  const tasks = [
    {
      id: 'task-clientA-kickoff',
      projectId: 'proj-client-a',
      userId: demoUser.id,
      title: 'Kickoff & Scope mit Client A',
      status: TaskStatus.ACTIVE,
      priority: Priority.P1,
      estimateMin: 90,
      energy: 2,
      dueAt: new Date('2025-11-15T16:00:00.000Z'),
      hardDeadline: true,
      notes: 'Goals, Constraints und Stakeholder sammeln.',
    },
    {
      id: 'task-clientA-requirements',
      projectId: 'proj-client-a',
      userId: demoUser.id,
      title: 'Requirements-Dokument finalisieren',
      status: TaskStatus.ACTIVE,
      priority: Priority.P1,
      estimateMin: 120,
      energy: 3,
      dueAt: new Date('2025-11-18T12:00:00.000Z'),
      blockedBy: ['task-clientA-kickoff'],
      notes: 'WSJF bewerten und Stakeholder review einplanen.',
    },
    {
      id: 'task-clientA-design',
      projectId: 'proj-client-a',
      userId: demoUser.id,
      title: 'Design Figma & UI Kit',
      status: TaskStatus.ACTIVE,
      priority: Priority.P2,
      estimateMin: 150,
      energy: 3,
      dueAt: new Date('2025-11-22T17:00:00.000Z'),
      blockedBy: ['task-clientA-requirements'],
    },
    {
      id: 'task-clientA-dev',
      projectId: 'proj-client-a',
      userId: demoUser.id,
      title: 'Implementation Landing & Tracking',
      status: TaskStatus.ACTIVE,
      priority: Priority.P2,
      estimateMin: 240,
      energy: 2,
      dueAt: new Date('2025-11-28T17:00:00.000Z'),
      blockedBy: ['task-clientA-design'],
    },
    {
      id: 'task-clientA-review',
      projectId: 'proj-client-a',
      userId: demoUser.id,
      title: 'Review & Launch Ready Checklist',
      status: TaskStatus.ACTIVE,
      priority: Priority.P3,
      estimateMin: 60,
      energy: 1,
      dueAt: new Date('2025-12-01T12:00:00.000Z'),
      blockedBy: ['task-clientA-dev'],
    },
    {
      id: 'task-own-product-roadmap',
      projectId: 'proj-own-product',
      userId: demoUser.id,
      title: 'Roadmap + Milestones aktualisieren',
      status: TaskStatus.ACTIVE,
      priority: Priority.P1,
      estimateMin: 80,
      energy: 2,
      dueAt: new Date('2025-11-19T17:00:00.000Z'),
    },
    {
      id: 'task-own-product-landing',
      projectId: 'proj-own-product',
      userId: demoUser.id,
      title: 'Landing Page Copy + Funnel',
      status: TaskStatus.ACTIVE,
      priority: Priority.P2,
      estimateMin: 180,
      energy: 3,
      dueAt: new Date('2025-11-26T17:00:00.000Z'),
      blockedBy: ['task-own-product-roadmap'],
    },
    {
      id: 'task-own-product-analytics',
      projectId: 'proj-own-product',
      userId: demoUser.id,
      title: 'Analytics + Telemetry Essentials',
      status: TaskStatus.ACTIVE,
      priority: Priority.P3,
      estimateMin: 110,
      energy: 2,
      dueAt: new Date('2025-12-03T17:00:00.000Z'),
    },
    {
      id: 'task-own-product-revenue-model',
      projectId: 'proj-own-product',
      userId: demoUser.id,
      title: 'Cashflow & Pricing Hypothesen',
      status: TaskStatus.ACTIVE,
      priority: Priority.P2,
      estimateMin: 100,
      energy: 1,
      dueAt: new Date('2025-12-05T17:00:00.000Z'),
    },
    {
      id: 'task-own-product-launch-plan',
      projectId: 'proj-own-product',
      userId: demoUser.id,
      title: 'Launch-Playbook & OKRs',
      status: TaskStatus.ACTIVE,
      priority: Priority.P1,
      estimateMin: 140,
      energy: 2,
      dueAt: new Date('2025-12-10T17:00:00.000Z'),
      hardDeadline: true,
    },
    {
      id: 'task-learning-course',
      projectId: 'proj-learning',
      userId: demoUser.id,
      title: 'Kurs durcharbeiten (Deep Work)',
      status: TaskStatus.ACTIVE,
      priority: Priority.P2,
      estimateMin: 210,
      energy: 3,
      dueAt: new Date('2025-11-21T17:00:00.000Z'),
    },
    {
      id: 'task-learning-exercise',
      projectId: 'proj-learning',
      userId: demoUser.id,
      title: 'Hands-on Übungen + Checklisten',
      status: TaskStatus.ACTIVE,
      priority: Priority.P3,
      estimateMin: 120,
      energy: 2,
      dueAt: new Date('2025-11-23T17:00:00.000Z'),
      blockedBy: ['task-learning-course'],
    },
    {
      id: 'task-learning-project',
      projectId: 'proj-learning',
      userId: demoUser.id,
      title: 'Mini-Projekt & Notes Repo',
      status: TaskStatus.ACTIVE,
      priority: Priority.P3,
      estimateMin: 180,
      energy: 2,
      dueAt: new Date('2025-11-27T17:00:00.000Z'),
      blockedBy: ['task-learning-exercise'],
    },
    {
      id: 'task-learning-reflect',
      projectId: 'proj-learning',
      userId: demoUser.id,
      title: 'Retrospektive + Publish Learnings',
      status: TaskStatus.ACTIVE,
      priority: Priority.P4,
      estimateMin: 80,
      energy: 1,
      dueAt: new Date('2025-11-29T17:00:00.000Z'),
      blockedBy: ['task-learning-project'],
    },
    {
      id: 'task-learning-share',
      projectId: 'proj-learning',
      userId: demoUser.id,
      title: 'Community Sharing & Follow-ups',
      status: TaskStatus.ACTIVE,
      priority: Priority.P4,
      estimateMin: 100,
      energy: 1,
      dueAt: new Date('2025-12-01T17:00:00.000Z'),
      blockedBy: ['task-learning-reflect'],
    },
  ];

  for (const task of tasks) {
    const { id, ...rest } = task;
    await prisma.task.upsert({
      where: { id },
      create: { id, ...rest },
      update: rest,
    });
  }

  const tags = [
    { id: 'tag-client', name: 'Client', userId: demoUser.id },
    { id: 'tag-product', name: 'Produkt', userId: demoUser.id },
    { id: 'tag-learning', name: 'Learning', userId: demoUser.id },
    { id: 'tag-meeting', name: 'Meeting', userId: demoUser.id },
    { id: 'tag-focus', name: 'Focus', userId: demoUser.id },
    { id: 'tag-analytics', name: 'Analytics', userId: demoUser.id },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({ where: { id: tag.id }, create: tag, update: tag });
  }

  const tagAssignments: Record<string, string[]> = {
    'task-clientA-kickoff': ['tag-client', 'tag-focus'],
    'task-clientA-requirements': ['tag-client', 'tag-product'],
    'task-clientA-design': ['tag-client', 'tag-product'],
    'task-clientA-dev': ['tag-client', 'tag-product'],
    'task-clientA-review': ['tag-client'],
    'task-own-product-roadmap': ['tag-product', 'tag-focus'],
    'task-own-product-landing': ['tag-product'],
    'task-own-product-analytics': ['tag-product', 'tag-analytics'],
    'task-own-product-revenue-model': ['tag-product'],
    'task-own-product-launch-plan': ['tag-product', 'tag-focus'],
    'task-learning-course': ['tag-learning'],
    'task-learning-exercise': ['tag-learning'],
    'task-learning-project': ['tag-learning', 'tag-focus'],
    'task-learning-reflect': ['tag-learning'],
    'task-learning-share': ['tag-learning'],
  };

  const tagOnTask = [] as { taskId: string; tagId: string }[];
  for (const [taskId, tagIds] of Object.entries(tagAssignments)) {
    for (const tagId of tagIds) {
      tagOnTask.push({ taskId, tagId });
    }
  }

  if (tagOnTask.length) {
    await prisma.tagOnTask.createMany({ data: tagOnTask, skipDuplicates: true });
  }

  const allocations = [
    {
      id: 'alloc-clientA-design',
      taskId: 'task-clientA-design',
      start: new Date('2025-11-20T09:00:00.000Z'),
      end: new Date('2025-11-20T11:30:00.000Z'),
      source: AllocationSource.PLANNER,
    },
    {
      id: 'alloc-own-product-landing',
      taskId: 'task-own-product-landing',
      start: new Date('2025-11-21T13:00:00.000Z'),
      end: new Date('2025-11-21T16:00:00.000Z'),
      source: AllocationSource.PLANNER,
    },
    {
      id: 'alloc-learning-project',
      taskId: 'task-learning-project',
      start: new Date('2025-11-18T14:00:00.000Z'),
      end: new Date('2025-11-18T17:00:00.000Z'),
      source: AllocationSource.MANUAL,
    },
  ];

  for (const allocation of allocations) {
    const { id, ...rest } = allocation;
    await prisma.allocation.upsert({
      where: { id },
      create: { id, ...rest },
      update: rest,
    });
  }

  const calendarBlocks = [
    {
      id: 'block-standup',
      userId: demoUser.id,
      type: CalendarBlockType.MEETING,
      start: new Date('2025-11-13T09:00:00.000Z'),
      end: new Date('2025-11-13T09:30:00.000Z'),
      extId: 'gcal-standup-1',
    },
    {
      id: 'block-design-sync',
      userId: demoUser.id,
      type: CalendarBlockType.MEETING,
      start: new Date('2025-11-13T15:00:00.000Z'),
      end: new Date('2025-11-13T16:00:00.000Z'),
      extId: 'gcal-design-sync',
    },
    {
      id: 'block-retro',
      userId: demoUser.id,
      type: CalendarBlockType.MEETING,
      start: new Date('2025-11-14T10:00:00.000Z'),
      end: new Date('2025-11-14T11:00:00.000Z'),
      extId: 'gcal-retro-1',
    },
    {
      id: 'block-planning',
      userId: demoUser.id,
      type: CalendarBlockType.MEETING,
      start: new Date('2025-11-14T13:00:00.000Z'),
      end: new Date('2025-11-14T14:30:00.000Z'),
      extId: 'gcal-planning',
    },
    {
      id: 'block-cto',
      userId: demoUser.id,
      type: CalendarBlockType.MEETING,
      start: new Date('2025-11-15T11:00:00.000Z'),
      end: new Date('2025-11-15T12:00:00.000Z'),
      extId: 'gcal-cto',
    },
  ];

  for (const block of calendarBlocks) {
    const { id, ...rest } = block;
    await prisma.calendarBlock.upsert({
      where: { id },
      create: { id, ...rest },
      update: rest,
    });
  }

  const note = await prisma.note.upsert({
    where: { id: 'note-clientA-design' },
    create: {
      id: 'note-clientA-design',
      taskId: 'task-clientA-design',
      userId: demoUser.id,
      title: 'Design Inputs',
      contentMd: `- Fokus auf Klarheit
- Farben & Kontrast testen
- Rahmenbedingungen dokumentieren`,
    },
    update: {
      title: 'Design Inputs',
      contentMd: `- Fokus auf Klarheit
- Farben & Kontrast testen
- Rahmenbedingungen dokumentieren`,
    },
  });

  await prisma.attachment.upsert({
    where: { id: 'attachment-moodboard' },
    create: {
      id: 'attachment-moodboard',
      noteId: note.id,
      userId: demoUser.id,
      name: 'Moodboard.png',
      url: 'https://cdn.personal-planner.local/moodboard.png',
      sizeBytes: 48291,
      mime: 'image/png',
    },
    update: {
      noteId: note.id,
      userId: demoUser.id,
      name: 'Moodboard.png',
      url: 'https://cdn.personal-planner.local/moodboard.png',
      sizeBytes: 48291,
      mime: 'image/png',
    },
  });

  const thread = await prisma.thread.upsert({
    where: { id: 'thread-clientA-design' },
    create: {
      id: 'thread-clientA-design',
      projectId: 'proj-client-a',
      taskId: 'task-clientA-design',
    },
    update: {
      projectId: 'proj-client-a',
      taskId: 'task-clientA-design',
    },
  });

  const participants = [
    { threadId: thread.id, userId: demoUser.id, role: ThreadRole.OWNER },
    { threadId: thread.id, userId: contractor.id, role: ThreadRole.CONTRACTOR },
  ];

  for (const participant of participants) {
    await prisma.threadParticipant.upsert({
      where: {
        threadId_userId: {
          threadId: participant.threadId,
          userId: participant.userId,
        },
      },
      create: participant,
      update: participant,
    });
  }

  const message = await prisma.message.upsert({
    where: { id: 'message-clientA-design-1' },
    create: {
      id: 'message-clientA-design-1',
      threadId: thread.id,
      authorId: demoUser.id,
      bodyMd:
        'Context: Client expects early feedback. <br/> Bitte prüfe die Farbvarianten im Frame und gib eine Priorisierung für den Launch.',
    },
    update: {
      bodyMd:
        'Context: Client expects early feedback. <br/> Bitte prüfe die Farbvarianten im Frame und gib eine Priorisierung für den Launch.',
    },
  });

  await prisma.messageRead.upsert({
    where: {
      messageId_userId: {
        messageId: message.id,
        userId: contractor.id,
      },
    },
    create: {
      messageId: message.id,
      userId: contractor.id,
      readAt: new Date('2025-11-13T12:00:00.000Z'),
    },
    update: {
      readAt: new Date('2025-11-13T12:00:00.000Z'),
    },
  });

  await prisma.notification.upsert({
    where: { id: 'notif-message-mention' },
    create: {
      id: 'notif-message-mention',
      userId: contractor.id,
      type: 'mention',
      ref: message.id,
    },
    update: {
      userId: contractor.id,
      type: 'mention',
      ref: message.id,
    },
  });

  console.log('Seed script finished');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
