import { PlannerTask } from '../src/lib/planner/types';
import { scoreTask, valuePerTime, deadlineUrgency } from '../src/lib/planner/scoring';
import { planDay } from '../src/lib/planner/engine';

const now = new Date('2025-11-14T09:00:00Z');

describe('scoring helpers', () => {
  const baseTask: PlannerTask = {
    id: 'task-1',
    title: 'Test Task',
    projectId: 'proj-1',
    status: 'ACTIVE',
    priority: 'P1',
    estimateMin: 60,
    energy: 2,
    dueAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2),
    dueStart: undefined,
    hardDeadline: false,
    blockedBy: [],
    score: 0,
    remainingMin: 60,
  };

  it('calculates value per time with diminishing returns', () => {
    const value = valuePerTime(baseTask);
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThanOrEqual(1);
  });

  it('returns urgency between 0 and 1', () => {
    const urgency = deadlineUrgency(baseTask, now);
    expect(urgency).toBeGreaterThan(0);
    expect(urgency).toBeLessThanOrEqual(1);
  });

  it('scores higher when priority and deadline align', () => {
    const highScore = scoreTask(baseTask, { slot: { id: 'slot', start: now, end: new Date(now.getTime() + 30 * 60000), energy: 'MED', type: 'focus', availableMinutes: 30 }, lastProject: null, now }, undefined);
    const lowScore = scoreTask({ ...baseTask, priority: 'P4', energy: 1, remainingMin: 1 }, { slot: { id: 'slot', start: now, end: new Date(now.getTime() + 15 * 60000), energy: 'LOW', type: 'focus', availableMinutes: 15 }, lastProject: 'proj-1', now }, undefined);
    expect(highScore).toBeGreaterThan(lowScore);
  });
});

describe('planner engine', () => {
  it('allocates tasks into focus slots', () => {
    const tasks: PlannerTask[] = [
      { ...baseTask },
      { ...baseTask, id: 'task-2', priority: 'P2', status: 'ACTIVE' },
    ];

    const plan = planDay('2025-11-14', { date: '2025-11-14', tasks, calendarBlocks: [], userSettings: { workStartHour: 8, workEndHour: 10, slotMinutes: 30 }, now });

    expect(plan.allocations.length).toBeGreaterThan(0);
    expect(plan.slots.some((slot) => slot.type === 'focus')).toBe(true);
  });
});
