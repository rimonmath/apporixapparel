CREATE TABLE "carousels" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "carousels_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"url" varchar(100) DEFAULT '',
	"description" varchar(255) DEFAULT '',
	"link_text" varchar(100) DEFAULT '',
	"link_url" varchar(255) DEFAULT '',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupon_usages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "coupon_usages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"coupon_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"order_id" integer NOT NULL,
	"used_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupon_usage_unique" UNIQUE("coupon_id","customer_id","order_id")
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "coupons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"type" "coupon_type" NOT NULL,
	"discount" numeric(10, 2) NOT NULL,
	"min_purchase" numeric(10, 2),
	"max_discount" numeric(10, 2),
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"usage_limit" integer,
	"usage_per_user" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupon_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "delivery_options" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "delivery_options_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	"charge" numeric(10, 2) NOT NULL,
	"weight_limit" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"variation" varchar(255) NOT NULL,
	"image" varchar(255),
	"price" numeric(12, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_status_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_id" integer NOT NULL,
	"status" "order_status" NOT NULL,
	"note" varchar(255) DEFAULT '',
	"updated_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_number" varchar(50) NOT NULL,
	"user_id" integer NOT NULL,
	"shipping_address_id" integer NOT NULL,
	"billing_address_id" integer NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"transaction_id" varchar(150),
	"payment_meta" jsonb DEFAULT '{}',
	"customer_note" varchar(255) DEFAULT '',
	"admin_note" varchar(255) DEFAULT '',
	"subtotal" numeric(12, 2) NOT NULL,
	"coupon_id" integer,
	"coupon_discount" numeric(12, 2) DEFAULT '0',
	"tax_charge" numeric(12, 2) DEFAULT '0',
	"shipping_charge" numeric(12, 2) DEFAULT '0',
	"delivery_option" varchar(50) NOT NULL,
	"delivery_charge" numeric(12, 2) DEFAULT '0',
	"total" numeric(12, 2) NOT NULL,
	"payment_status" "payment_status" DEFAULT 'Pending' NOT NULL,
	"order_status" "order_status" DEFAULT 'Placed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text DEFAULT '',
	"image" varchar(256) DEFAULT '' NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_addresses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_addresses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"name" varchar(150) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"address_line_1" varchar(255) NOT NULL,
	"address_line_2" varchar(255),
	"city" varchar(100) NOT NULL,
	"postal_code" varchar(50),
	"country" varchar(100) DEFAULT 'Bangladesh' NOT NULL,
	"latitude" numeric(10, 7) DEFAULT '0.0',
	"longitude" numeric(10, 7) DEFAULT '0.0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_id_user_addresses_id_fk" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."user_addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_billing_address_id_user_addresses_id_fk" FOREIGN KEY ("billing_address_id") REFERENCES "public"."user_addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_status_history_order_idx" ON "order_status_history" USING btree ("order_id");