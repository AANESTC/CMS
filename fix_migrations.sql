-- Remove fake history entries so EF won't re-run them
DELETE FROM "__EFMigrationsHistory" WHERE "MigrationId" IN ('20260611044959_InitialCreate','20260611051624_AddAuditAndSoftDelete','20260615065414_AddInvoiceTable');

-- Create Doctors table
CREATE TABLE IF NOT EXISTS "Doctors" (
    "DoctorId" uuid NOT NULL,
    "Name" text NOT NULL DEFAULT '',
    "Specialization" text NOT NULL DEFAULT '',
    "Email" text NOT NULL DEFAULT '',
    "UserId" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    CONSTRAINT "PK_Doctors" PRIMARY KEY ("DoctorId")
);

-- Create Patients table
CREATE TABLE IF NOT EXISTS "Patients" (
    "PatientId" uuid NOT NULL,
    "Name" text NOT NULL DEFAULT '',
    "Age" integer NOT NULL DEFAULT 0,
    "Gender" text NOT NULL DEFAULT '',
    "ContactNumber" text NOT NULL DEFAULT '',
    "WhatsAppNumber" text NOT NULL DEFAULT '',
    "Address" text NOT NULL DEFAULT '',
    "Email" text DEFAULT '',
    "QrCodeUrl" text DEFAULT '',
    "CreatedDate" timestamp with time zone NOT NULL DEFAULT now(),
    "CreatedBy" text DEFAULT '',
    "ModifiedBy" text DEFAULT '',
    "ModifiedDate" timestamp with time zone,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    CONSTRAINT "PK_Patients" PRIMARY KEY ("PatientId")
);

-- Create unique indexes on Patients
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Patients_ContactNumber" ON "Patients" ("ContactNumber") WHERE NOT "IsDeleted";
CREATE INDEX IF NOT EXISTS "IX_Patients_WhatsAppNumber" ON "Patients" ("WhatsAppNumber");

-- Create Appointments table
CREATE TABLE IF NOT EXISTS "Appointments" (
    "AppointmentId" uuid NOT NULL,
    "PatientId" uuid NOT NULL,
    "DoctorId" uuid NOT NULL,
    "AppointmentDate" timestamp with time zone NOT NULL,
    "Status" integer NOT NULL DEFAULT 0,
    "BookingLink" text DEFAULT '',
    "CreatedDate" timestamp with time zone NOT NULL DEFAULT now(),
    "CreatedBy" text DEFAULT '',
    "ModifiedBy" text DEFAULT '',
    "ModifiedDate" timestamp with time zone,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    CONSTRAINT "PK_Appointments" PRIMARY KEY ("AppointmentId"),
    CONSTRAINT "FK_Appointments_Patients_PatientId" FOREIGN KEY ("PatientId") REFERENCES "Patients" ("PatientId") ON DELETE CASCADE,
    CONSTRAINT "FK_Appointments_Doctors_DoctorId" FOREIGN KEY ("DoctorId") REFERENCES "Doctors" ("DoctorId") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_Appointments_PatientId" ON "Appointments" ("PatientId");
CREATE INDEX IF NOT EXISTS "IX_Appointments_DoctorId" ON "Appointments" ("DoctorId");

-- Create Documents table
CREATE TABLE IF NOT EXISTS "Documents" (
    "DocumentId" uuid NOT NULL,
    "PatientId" uuid NOT NULL,
    "FileUrl" text DEFAULT '',
    "FilePath" text DEFAULT '',
    "DocumentType" integer NOT NULL DEFAULT 0,
    "UploadedDate" timestamp with time zone NOT NULL DEFAULT now(),
    "UploadedBy" text DEFAULT 'Receptionist',
    "CreatedBy" text DEFAULT '',
    "ModifiedBy" text DEFAULT '',
    "ModifiedDate" timestamp with time zone,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    CONSTRAINT "PK_Documents" PRIMARY KEY ("DocumentId"),
    CONSTRAINT "FK_Documents_Patients_PatientId" FOREIGN KEY ("PatientId") REFERENCES "Patients" ("PatientId") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_Documents_PatientId" ON "Documents" ("PatientId");

-- Create Prescriptions table
CREATE TABLE IF NOT EXISTS "Prescriptions" (
    "PrescriptionId" uuid NOT NULL,
    "PatientId" uuid NOT NULL,
    "DoctorId" uuid NOT NULL,
    "Notes" text DEFAULT '',
    "PrescriptionType" integer NOT NULL DEFAULT 0,
    "CreatedDate" timestamp with time zone NOT NULL DEFAULT now(),
    "IsDeleted" boolean NOT NULL DEFAULT false,
    CONSTRAINT "PK_Prescriptions" PRIMARY KEY ("PrescriptionId"),
    CONSTRAINT "FK_Prescriptions_Patients_PatientId" FOREIGN KEY ("PatientId") REFERENCES "Patients" ("PatientId") ON DELETE CASCADE,
    CONSTRAINT "FK_Prescriptions_Doctors_DoctorId" FOREIGN KEY ("DoctorId") REFERENCES "Doctors" ("DoctorId") ON DELETE CASCADE
);

-- Create FollowUpReminders table
CREATE TABLE IF NOT EXISTS "FollowUpReminders" (
    "ReminderId" uuid NOT NULL,
    "PatientId" uuid NOT NULL,
    "ReminderDate" timestamp with time zone NOT NULL,
    "Message" text DEFAULT '',
    "Status" integer NOT NULL DEFAULT 0,
    CONSTRAINT "PK_FollowUpReminders" PRIMARY KEY ("ReminderId"),
    CONSTRAINT "FK_FollowUpReminders_Patients_PatientId" FOREIGN KEY ("PatientId") REFERENCES "Patients" ("PatientId") ON DELETE CASCADE
);

-- Create WhatsAppMessageLogs table
CREATE TABLE IF NOT EXISTS "WhatsAppMessageLogs" (
    "LogId" uuid NOT NULL,
    "PatientId" uuid NOT NULL,
    "Message" text DEFAULT '',
    "SentDate" timestamp with time zone NOT NULL DEFAULT now(),
    "Status" text DEFAULT '',
    CONSTRAINT "PK_WhatsAppMessageLogs" PRIMARY KEY ("LogId"),
    CONSTRAINT "FK_WhatsAppMessageLogs_Patients_PatientId" FOREIGN KEY ("PatientId") REFERENCES "Patients" ("PatientId") ON DELETE CASCADE
);

-- Create Invoices table
CREATE TABLE IF NOT EXISTS "Invoices" (
    "InvoiceId" uuid NOT NULL,
    "PatientId" uuid NOT NULL,
    "AppointmentId" uuid,
    "InvoiceNumber" text NOT NULL DEFAULT '',
    "TotalAmount" numeric NOT NULL DEFAULT 0,
    "PaidAmount" numeric NOT NULL DEFAULT 0,
    "Status" text NOT NULL DEFAULT 'Unpaid',
    "Notes" text NOT NULL DEFAULT '',
    "InvoiceDate" timestamp with time zone NOT NULL DEFAULT now(),
    "CreatedDate" timestamp with time zone NOT NULL DEFAULT now(),
    "CreatedBy" text NOT NULL DEFAULT '',
    "IsDeleted" boolean NOT NULL DEFAULT false,
    CONSTRAINT "PK_Invoices" PRIMARY KEY ("InvoiceId"),
    CONSTRAINT "FK_Invoices_Patients_PatientId" FOREIGN KEY ("PatientId") REFERENCES "Patients" ("PatientId") ON DELETE CASCADE,
    CONSTRAINT "FK_Invoices_Appointments_AppointmentId" FOREIGN KEY ("AppointmentId") REFERENCES "Appointments" ("AppointmentId")
);

CREATE INDEX IF NOT EXISTS "IX_Invoices_PatientId" ON "Invoices" ("PatientId");

-- Seed a default doctor
INSERT INTO "Doctors" ("DoctorId", "Name", "Specialization", "Email", "UserId")
SELECT '00000000-0000-0000-0000-000000000001', 'Dr. Smith', 'General Medicine', 'drsmith@clinic.com', '00000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM "Doctors" WHERE "DoctorId" = '00000000-0000-0000-0000-000000000001');

-- Mark all 3 migrations as applied
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT '20260611044959_InitialCreate', '10.0.9'
WHERE NOT EXISTS (SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260611044959_InitialCreate');

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT '20260611051624_AddAuditAndSoftDelete', '10.0.9'
WHERE NOT EXISTS (SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260611051624_AddAuditAndSoftDelete');

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT '20260615065414_AddInvoiceTable', '10.0.9'
WHERE NOT EXISTS (SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260615065414_AddInvoiceTable');

SELECT 'CMS Database setup complete!' as result;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
