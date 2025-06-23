-- AlterTable
CREATE SEQUENCE twitter_group_subscribes_id_seq;
ALTER TABLE "twitter_group_subscribes" ALTER COLUMN "id" SET DEFAULT nextval('twitter_group_subscribes_id_seq');
ALTER SEQUENCE twitter_group_subscribes_id_seq OWNED BY "twitter_group_subscribes"."id";
