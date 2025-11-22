type GitSummary = {
  message: string;
  branch?: string;
  repository?: string;
  commits?: { id?: string; message?: string; author?: { name?: string } | null }[];
  timestamp: string;
};

let lastSummary: GitSummary | null = null;

export function setLastCommitSummary(summary: Omit<GitSummary, 'timestamp'>) {
  lastSummary = {
    ...summary,
    timestamp: new Date().toISOString(),
  };
}

export function getLastCommitSummary(): GitSummary {
  if (lastSummary) return lastSummary;
  return {
    message: 'Keine Push-Aktivität erfasst. Nutze den Composer, um eine Nachricht zu senden.',
    branch: undefined,
    repository: undefined,
    commits: [],
    timestamp: new Date().toISOString(),
  };
}
