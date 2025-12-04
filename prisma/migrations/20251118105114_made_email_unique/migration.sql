/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Receipt` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Receipt_email_key" ON "Receipt"("email");
