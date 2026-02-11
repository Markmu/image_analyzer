-- Migration: Add batch upload fields to images table
-- Story: 2-2 batch-upload

-- Add batch_id and upload_order columns to images table
ALTER TABLE images ADD COLUMN batch_id UUID;
ALTER TABLE images ADD COLUMN upload_order INTEGER;

-- Create index on batch_id for faster queries
CREATE INDEX IF NOT EXISTS images_batch_id_idx ON images(batch_id);

-- Add comment for documentation
COMMENT ON COLUMN images.batch_id IS '批次 ID，关联同批次上传的图片';
COMMENT ON COLUMN images.upload_order IS '上传顺序';
