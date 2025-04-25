-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "rating" DECIMAL(2,1) NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "poster" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "reviews" (
    "author_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "stars" SMALLINT NOT NULL,
    "comment" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("author_id","company_id")
);

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
