-- CreateTable
CREATE TABLE "promocodes" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "discount" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promocodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promocodes_code_key" ON "promocodes"("code");

-- AddForeignKey
ALTER TABLE "promocodes" ADD CONSTRAINT "promocodes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
