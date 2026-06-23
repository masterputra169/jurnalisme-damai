-- Migration: Add RSS syndication support
-- Run this in Supabase SQL Editor

-- Add columns to Article table
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "sourceName" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "isSyndicated" BOOLEAN NOT NULL DEFAULT false;
