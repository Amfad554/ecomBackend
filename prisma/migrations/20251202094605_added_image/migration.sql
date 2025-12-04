/*
  Warnings:

  - Added the required column `image` to the `ReceiptItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReceiptItem" ADD COLUMN     "image" TEXT NOT NULL;
