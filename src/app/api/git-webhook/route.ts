import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppTextMessage } from '@/lib/whatsappClient';
import { setLastCommitSummary } from '@/lib/gitActivity';

type WebhookCommit = {
  id?: string;
  message?: string;
  author?: { name?: string } | null;
};

type GitWebhookPayload = {
  ref?: string;
  branch?: string;
  repository?: { name?: string; full_name?: string } | string;
  commits?: WebhookCommit[];
};

const webhookSecret = process.env.GIT_WEBHOOK_SECRET;
const devTarget = process.env.WABA_DEV_TARGET;

const missingRouteVars = [
  !webhookSecret && 'GIT_WEBHOOK_SECRET',
  !devTarget && 'WABA_DEV_TARGET',
].filter(Boolean);

if (missingRouteVars.length > 0) {
  throw new Error(`Missing Git webhook env vars: ${missingRouteVars.join(', ')}`);
}

const resolvedDevTarget = devTarget as string;
const resolvedWebhookSecret = webhookSecret as string;

const normalizeBranch = (payload: GitWebhookPayload) => {
  if (payload.branch) return payload.branch;
  if (payload.ref?.startsWith('refs/heads/')) return payload.ref.replace('refs/heads/', '');
  return payload.ref ?? 'unbekannter-branch';
};

const normalizeRepository = (payload: GitWebhookPayload) => {
  if (typeof payload.repository === 'string') return payload.repository;
  if (payload.repository?.full_name) return payload.repository.full_name;
  if (payload.repository?.name) return payload.repository.name;
  return 'unbekanntes-repo';
};

const formatCommits = (commits: WebhookCommit[]) => {
  if (!Array.isArray(commits) || commits.length === 0) {
    return '• Keine Commits im Payload.';
  }

  return commits
    .map((commit) => {
      const sha = commit.id ? commit.id.slice(0, 7) : 'unknown';
      const title = (commit.message ?? '').split('\n')[0] || 'Kein Commit-Text';
      const author = commit.author?.name ?? 'unbekannt';
      return `• [${sha}] ${title} (${author})`;
    })
    .join('\n');
};

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-veluna-signature')?.trim();
  if (!signature || signature !== resolvedWebhookSecret) {
    console.warn('Git webhook rejected due to invalid signature');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: GitWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const branch = normalizeBranch(payload);
  const repository = normalizeRepository(payload);
  const commits = Array.isArray(payload.commits) ? payload.commits : [];

  const message = [
    `🚀 Veluna-Labs Planner – neue Commits auf ${branch}`,
    `Repo: ${repository}`,
    '',
    formatCommits(commits),
  ].join('\n');

  try {
    setLastCommitSummary({ message, branch, repository, commits });
    const result = await sendWhatsAppTextMessage(resolvedDevTarget, message);
    console.info('Git webhook dispatched WhatsApp notification', {
      branch,
      repository,
      commitCount: commits.length,
    });

    return NextResponse.json({
      delivered: true,
      branch,
      repository,
      result,
    });
  } catch (error) {
    console.error('Git webhook WhatsApp dispatch failed', error);
    return NextResponse.json(
      { error: (error as Error).message ?? 'WhatsApp dispatch failed' },
      { status: 500 },
    );
  }
}
