-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "cloudinaryPublicId" TEXT,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mimeType" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "expiresAt" TIMESTAMP(3);
