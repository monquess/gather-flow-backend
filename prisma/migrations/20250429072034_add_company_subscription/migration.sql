/*
  Warnings:

  - A unique constraint covering the columns `[code,event_id]` on the table `promocodes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "promocodes_code_key";

-- CreateTable
CREATE TABLE "company_subscriptions" (
    "user_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_subscriptions_pkey" PRIMARY KEY ("user_id","company_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promocodes_code_event_id_key" ON "promocodes"("code", "event_id");

-- AddForeignKey
ALTER TABLE "company_subscriptions" ADD CONSTRAINT "company_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_subscriptions" ADD CONSTRAINT "company_subscriptions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
