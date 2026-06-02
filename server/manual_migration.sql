-- Manual migration for resumeText field
ALTER TABLE "User" ADD COLUMN "resumeText" TEXT;