-- Migration: Add receipts/documents to maintenance records
-- Description: Adds a receipts field to store receipt images and PDFs for maintenance records

-- Add receipts column to maintenance_records table
ALTER TABLE maintenance_records
ADD COLUMN IF NOT EXISTS receipts TEXT[];

-- Add comment to the column
COMMENT ON COLUMN maintenance_records.receipts IS 'Array of receipt/document URLs (images or PDFs)';
