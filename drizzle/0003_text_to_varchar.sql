ALTER TABLE IF EXISTS "user"
  ALTER COLUMN "id" TYPE varchar(255),
  ALTER COLUMN "email" TYPE varchar(320),
  ALTER COLUMN "name" TYPE varchar(255),
  ALTER COLUMN "image" TYPE varchar(2048),
  ALTER COLUMN "subscription_tier" TYPE varchar(32);

ALTER TABLE IF EXISTS "account"
  ALTER COLUMN "userId" TYPE varchar(255),
  ALTER COLUMN "type" TYPE varchar(32),
  ALTER COLUMN "provider" TYPE varchar(64),
  ALTER COLUMN "providerAccountId" TYPE varchar(255),
  ALTER COLUMN "token_type" TYPE varchar(64),
  ALTER COLUMN "scope" TYPE varchar(1024),
  ALTER COLUMN "session_state" TYPE varchar(255);

ALTER TABLE IF EXISTS "session"
  ALTER COLUMN "sessionToken" TYPE varchar(255),
  ALTER COLUMN "userId" TYPE varchar(255);

ALTER TABLE IF EXISTS "verificationToken"
  ALTER COLUMN "identifier" TYPE varchar(320),
  ALTER COLUMN "token" TYPE varchar(255);

ALTER TABLE IF EXISTS "account_deletions"
  ALTER COLUMN "user_id" TYPE varchar(255),
  ALTER COLUMN "ip_address" TYPE varchar(45),
  ALTER COLUMN "user_agent" TYPE varchar(1024);

ALTER TABLE IF EXISTS "images"
  ALTER COLUMN "id" TYPE varchar(64),
  ALTER COLUMN "user_id" TYPE varchar(255),
  ALTER COLUMN "file_path" TYPE varchar(1024),
  ALTER COLUMN "file_format" TYPE varchar(32),
  ALTER COLUMN "upload_status" TYPE varchar(32);
