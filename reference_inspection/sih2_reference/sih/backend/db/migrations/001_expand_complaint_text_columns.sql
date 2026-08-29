-- Run once against the adhikar_ai PostgreSQL database.
-- Hibernate's ddl-auto=update does not reliably widen an existing VARCHAR
-- column after the Java entity is changed to TEXT.

ALTER TABLE complaints
    ALTER COLUMN evidence_image_url TYPE TEXT,
    ALTER COLUMN resolution_image_url TYPE TEXT,
    ALTER COLUMN device_info TYPE TEXT,
    ALTER COLUMN location TYPE TEXT;
