-- CreateEnum
CREATE TYPE "Format" AS ENUM ('CONFERENCE', 'LECTURE', 'WORKSHOP', 'FEST', 'OTHER');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('BUSINESS', 'POLITICS', 'PSYCHOLOGY', 'OTHER');

-- CreateEnum
CREATE TYPE "VisitorsVisibility" AS ENUM ('EVERYONE', 'VISITOR');

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "format" "Format" NOT NULL,
    "theme" "Theme" NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "ticket_price" DECIMAL(10,2) NOT NULL,
    "tickets_quantity" INTEGER NOT NULL,
    "poster" TEXT NOT NULL,
    "visitors_visibillity" "VisitorsVisibility" NOT NULL DEFAULT 'EVERYONE',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "publish_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "company_id" INTEGER NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
