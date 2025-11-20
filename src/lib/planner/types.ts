import { CalendarBlock, RoleCategory, Task, TaskStatus } from '@prisma/client';

export type EnergyWindow = 'HIGH' | 'MED' | 'LOW';

export interface EnergyWindowRange {
  start: number;
  end: number;
}

export type EnergyWindows = Record<EnergyWindow, EnergyWindowRange[]>;

export interface WorkingDayPreference {
  day: number; // 0 (Sonntag) - 6 (Samstag)
  startHour: number;
  endHour: number;
  enabled: boolean;
}

export interface UserSettings {
  workStartHour?: number;
  workEndHour?: number;
  slotMinutes?: number;
  bufferPct?: number;
  energyWindows?: EnergyWindows;
  wipProjectsMax?: number;
  workingDays?: WorkingDayPreference[];
  maxContinuousMinutes?: number;
  breakMinutes?: number;
}

export interface PlannerTask extends Pick<Task, 'id' | 'title' | 'projectId' | 'status' | 'priority' | 'estimateMin' | 'energy' | 'dueAt' | 'dueStart' | 'hardDeadline' | 'blockedBy' | 'score'> {
  remainingMin: number;
  okrAlignment?: number;
  projectCategory?: RoleCategory | null;
  assignedToUserId?: string | null;
}

export type SlotType = 'focus' | 'meeting' | 'buffer' | 'break' | 'blocked';

export interface Slot {
  id: string;
  start: Date;
  end: Date;
  energy: EnergyWindow;
  type: SlotType;
  availableMinutes: number;
  blockId?: string;
}

export interface Allocation {
  id: string;
  taskId: string;
  slotId: string;
  start: Date;
  end: Date;
  minutes: number;
  source: 'planner' | 'manual';
}

export interface ScoringWeights {
  priority: number;
  valuePerTime: number;
  deadline: number;
  areaFocus: number;
  energyMatch: number;
  hardDeadline: number;
  contextSwitch: number;
}

export interface ScoringConfig {
  weights: ScoringWeights;
}

export interface ScoreContext {
  slot: Slot;
  lastProject?: string | null;
  now: Date;
}

export interface PlanOptions {
  date: string;
  tasks: PlannerTask[];
  calendarBlocks?: CalendarBlock[];
  userSettings?: UserSettings;
  scoringConfig?: ScoringConfig;
  lastProject?: string | null;
  now?: Date;
}

export interface PlanResult {
  date: string;
  slots: Slot[];
  allocations: Allocation[];
  tasks: PlannerTask[];
}

export interface BlockedTaskLookup {
  [taskId: string]: boolean;
}
