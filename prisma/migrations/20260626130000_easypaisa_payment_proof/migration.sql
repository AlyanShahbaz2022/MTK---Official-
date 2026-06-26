-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'EASYPAISA';

-- AlterTable
ALTER TABLE "Order"
  ADD COLUMN "paymentProofUrl" TEXT,
  ADD COLUMN "paymentProofId" TEXT,
  ADD COLUMN "paymentVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "paymentReviewedBy" TEXT,
  ADD COLUMN "paymentRejectReason" TEXT;
