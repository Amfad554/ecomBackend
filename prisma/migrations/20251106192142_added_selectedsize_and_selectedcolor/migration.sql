/*
  Warnings:

  - Added the required column `quantity` to the `ProductCart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductCart" ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "selectedcolor" TEXT,
ADD COLUMN     "selectedsize" TEXT;
