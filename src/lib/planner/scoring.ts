import { Priority } from '@prisma/client';
import { PlannerTask, ScoreContext, ScoringConfig } from './types';

const PRIORITY_WEIGHT_MAP: Record<Priority, number> = {
  P1: 1,
  P2: 0.8,
  P3: 0.6,
  P4: 0.3,
};

const ENERGY_VALUE_MAP = {
  HIGH: 3,
  MED: 2,
  LOW: 1,
} as const;

export const DEFAULT_SCORING: ScoringConfig = {
  weights: {
    priority: 0.3,
    valuePerTime: 0.2,
    deadline: 0.25,
    areaFocus: 0.05,
    energyMatch: 0.1,
    hardDeadline: 0.05,
    contextSwitch: 0.05,
  },
};

export function priorityWeight(priority: Priority): number {
  return PRIORITY_WEIGHT_MAP[priority] ?? 0.4;
}

export function valuePerTime(task: PlannerTask): number {
  if (!task.estimateMin || task.estimateMin <= 0) return 0;
  const score = (priorityWeight(task.priority) * 60) / task.estimateMin;
  return Math.min(1, score);
}

export function deadlineUrgency(task: PlannerTask, now: Date): number {
  if (!task.dueAt) return 0;
  const diffMs = task.dueAt.getTime() - now.getTime();
  if (diffMs <= 0) return 1;
  const days = diffMs / (1000 * 60 * 60 * 24);
  return Math.min(1, Math.max(0, 1 - days / 7));
}

function energyMatch(task: PlannerTask, slotEnergy: ScoreContext['slot']['energy']): number {
  const taskEnergy = task.energy ?? ENERGY_VALUE_MAP.MED;
  const target = ENERGY_VALUE_MAP[slotEnergy];
  const diff = Math.abs(taskEnergy - target);
  return Math.max(0, 1 - diff / 3);
}

export function scoreTask(task: PlannerTask, context: ScoreContext, config: ScoringConfig = DEFAULT_SCORING): number {
  const { slot, lastProject, now } = context;
  const weights = config.weights;
  const priority = priorityWeight(task.priority);
  const perTime = valuePerTime(task);
  const deadlineScore = deadlineUrgency(task, now);
  const energyBoost = energyMatch(task, slot.energy);
  const areaFocusBoost = task.projectId && lastProject === task.projectId ? 0.05 : 0;
  const hardDeadlineBoost = task.hardDeadline ? weights.hardDeadline : 0;
  const contextPenalty = lastProject && lastProject !== task.projectId ? -weights.contextSwitch : 0;

  return (
    priority * weights.priority +
    perTime * weights.valuePerTime +
    deadlineScore * weights.deadline +
    areaFocusBoost * weights.areaFocus +
    energyBoost * weights.energyMatch +
    hardDeadlineBoost +
    contextPenalty
  );
}
