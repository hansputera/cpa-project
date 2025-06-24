-- CreateTable
CREATE TABLE "twitter_group_subscribes" (
    "id" SERIAL NOT NULL,
    "group_jid" TEXT NOT NULL,
    "twitter_usn_subscribes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "twitter_group_subscribes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "twitter_group_subscribes_group_jid_key" ON "twitter_group_subscribes"("group_jid");
