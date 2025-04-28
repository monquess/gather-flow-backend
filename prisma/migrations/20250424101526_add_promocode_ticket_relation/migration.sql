/*
  Warnings:

  - You are about to drop the column `promocode_used` on the `tickets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "promocode_used",
ADD COLUMN     "promocode_id" INTEGER;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_promocode_id_fkey" FOREIGN KEY ("promocode_id") REFERENCES "promocodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
