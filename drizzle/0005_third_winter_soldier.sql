CREATE TYPE "public"."payment_status_enum" AS ENUM('Unpaid', 'Pending', 'Partially Paid', 'Paid', 'Failed', 'Refund Requested', 'Partially Refunded', 'Refunded', 'Refund Cancelled');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DATA TYPE "public"."payment_status_enum" USING "payment_status"::text::"public"."payment_status_enum";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_status" SET DEFAULT 'Unpaid';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_history" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
DROP TYPE "public"."payment_status";