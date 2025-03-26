/*
  Warnings:

  - You are about to drop the column `addedBy` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `downloadCount` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `favoriteCount` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `Document` table. All the data in the column will be lost.
  - The `keywords` column on the `Document` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `userId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_addedBy_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "addedBy",
DROP COLUMN "downloadCount",
DROP COLUMN "favoriteCount",
DROP COLUMN "viewCount",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
DROP COLUMN "keywords",
ADD COLUMN     "keywords" TEXT[];

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "Document_isActive_idx" ON "Document"("isActive");

-- CreateIndex
CREATE INDEX "Document_isPublic_idx" ON "Document"("isPublic");

-- CreateIndex
CREATE INDEX "Document_city_idx" ON "Document"("city");

-- CreateIndex
CREATE INDEX "Document_keywords_idx" ON "Document"("keywords");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
