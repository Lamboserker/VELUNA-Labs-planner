-- Add missing title column for calendar blocks (nullable to match Prisma schema)
ALTER TABLE "CalendarBlock" ADD COLUMN IF NOT EXISTS "title" TEXT;
