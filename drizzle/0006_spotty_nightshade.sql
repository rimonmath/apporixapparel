ALTER TABLE "orders" DROP CONSTRAINT "orders_shipping_address_id_user_addresses_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_billing_address_id_user_addresses_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "payment_history" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_address" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD COLUMN "email" varchar(99);--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "shipping_address_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "billing_address_id";