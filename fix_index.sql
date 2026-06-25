DROP INDEX IF EXISTS "IX_Patients_ContactNumber";
CREATE UNIQUE INDEX "IX_Patients_ContactNumber" ON "Patients" ("ContactNumber");
